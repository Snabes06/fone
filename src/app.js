const Koa = require('koa');
const serve = require('koa-static'); // used for serving static files later
const websocket = require('koa-websocket');
const handlers = require('./src/handlers');
const state = require('./src/state');

const app = websocket(new Koa());

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
    } else if (message.type == '/join') {
      
    } else if (message.type == '/quit') {

    } else {
      console.warn('Unknown command type:', message.type);
    }
  });

  // Handle connection close
  ctx.websocket.on('close', () => {
    console.log('Chat client disconnected');
    handlers.quit(ctx);
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

