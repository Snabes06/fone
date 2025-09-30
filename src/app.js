const Koa = require('koa');
const websocket = require('koa-websocket');
const handlers = require('./handlers'); // correct
const state = require('./state');
//const serve = require('koa-static'); // used for serving static files later
//const path = require('path'); // used for serving static files later

const ogKoa = new Koa();
const app = websocket(ogKoa);
//ogKoa.use(serve(path.join(__dirname, '/static'), { index: 'temp.html' })) // Serve static files from the 'static' directory

// List users in the same room
function list(ctx) {
  const info = state.clients.get(ctx);
  const room = info.room || "lobby";
  const users = [];

  if (state.rooms.has(room)) {
    // Iterate over clients in the room and collect usernames
    for (const client of state.rooms.get(room)) {
      const cinfo = state.clients.get(client) || {};
      users.push(cinfo.username || "Anonymous");
    }
  }

  // Send the list of users back to the requester
  ctx.websocket.send(JSON.stringify({ type: "list", message: users.join(", ") }));
}

// Handle user quitting
function quit(ctx) {
  const info = state.clients.get(ctx) || {};
  const room = info.room;

  if (room && state.rooms.has(room)) {
    state.rooms.get(room).delete(ctx);
    if (state.rooms.get(room).size === 0) {
      state.rooms.delete(room);
    }
  }

  state.clients.delete(ctx);
  ctx.websocket.close();
}



// WebSocket route
app.ws.use((ctx) => {
  console.log('Connected!');
  state.clients.set(ctx, { username: "Snabes", room: "lobby" });

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

    if (handler) {
      handler(ctx, message);
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
      handlers.quit(ctx);
    } catch (e) {
      console.error('Error disconnecting client:', e);
      return;
    }
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

