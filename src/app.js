const os = require('os');
const Koa = require('koa');
const websocket = require('koa-websocket');
const handlers = require('./handlers');
const state = require('./state');
const serve = require('koa-static');
const path = require('path');

const ogKoa = new Koa();
const app = websocket(ogKoa);
ogKoa.use(serve(path.join(__dirname, '/static'), { index: 'index.html' })) // Serve static files from static/

// List users in the same room
function list(ctx) {
  const info = state.clients.get(ctx);
  const room = info.room || "lobby";
  const users = [];

  // Iterate over clients in the room
  if (state.rooms.has(room)) {
    for (const client of state.rooms.get(room)) {
      const cinfo = state.clients.get(client) || {};
      users.push(cinfo.username || "Anonymous");
    }
  }

  // Send user list to requester
  ctx.websocket.send(JSON.stringify({
    type: 'list',
    users,                // array of usernames
    count: users.length,  // number of users
    room                  // which room this is
  }));
}

// Handle user quitting
function quit(ctx) {
  const info = state.clients.get(ctx) || {};
  const room = info.room;

  // Notify if user is not in a room
  if (!room || !state.rooms.has(room)) {
    ctx.websocket.send(JSON.stringify({
      type: 'error',
      message: 'You are not in a room'
    }));
    return;
  }

  // Notify the leaving user
  ctx.websocket.send(JSON.stringify({
    type: 'system',
    message: `You have left the room: ${room}`
  }));

  // Remove client from the room
  state.rooms.get(room).delete(ctx);

  // Clean up if room is empty
  if (state.rooms.get(room).size === 0) {
    state.rooms.delete(room);
  }

  // Broadcast to remaining clients
  for (const client of state.rooms.get(room) || []) {
    client.websocket.send(JSON.stringify({
      type: 'system',
      message: `${info.username || "Anonymous"} has left the room`
    }));
  }

  // Update client state (still connected, just no room)
  info.room = null;
  state.clients.set(ctx, info);
}

// WebSocket route
app.ws.use((ctx) => {
  console.log('Chat client connected!');
  state.clients.set(ctx, { username: "Anonymous", room: "lobby" });

  // Listen for incoming messages
  ctx.websocket.on('message', (messageJSON) => {
    let message;
    try {
      message = JSON.parse(messageJSON);
    } catch (e) {
      console.error('Invalid JSON received:', messageJSON);
      ctx.websocket.send('Error: Message could not be parsed');
      return;
    }

    const handler = handlers[message.type];

    // Handles operations based on command type
    if (handler) {
      handler(ctx, message); // Call the appropriate handler in handlers/
    } else if (message.type == 'list') {
      list(ctx);
    } else if (message.type == 'quit') {
      quit(ctx);
    } else {
      console.warn('Unknown command type:', message.type);
    }
  });

  // Handle connection close
  ctx.websocket.on('close', () => {
    console.log('Chat client disconnected');
    try {
      state.clients.delete(ctx);
    } catch (e) {
      console.error('Error disconnecting client:', e);
      return;
    }
  });
});

// Start server
const PORT = 3000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);

  // Detect LAN IPv4 addresses
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal (127.0.0.1) and non-IPv4
      if (net.family === 'IPv4' && !net.internal) {
        console.log(`  http://${net.address}:${PORT}   (LAN)`);
      }
    }
  }
});

module.exports = app;

