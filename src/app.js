const Koa = require('koa');
const serve = require('koa-static'); // used for serving static files later
const websockify = require('koa-websocket');


const app = websockify(new Koa());

// WebSocket route
app.ws.use((ctx) => {
  console.log('Connected!');

  // Send welcome message
  ctx.websocket.send('Welcome to the chatroom');

  // Listen for incoming messages
  ctx.websocket.on('message', (messageJSON) => {
    let message;
    try {
      message = JSON.parse(messageJSON);
    } catch (e) {
      console.error('Invalid JSON received:', messageJSON);
      ctx.websocket.send('Error: Invalid JSON format');
      return;
    }

    const sender = message.sender;
    const content = message.content;
    const type = message.type; // commands like join, leave, etc.
    
    // Echo back to users with sender info
    ctx.websocket.send(`${sender}: ${content}`);
  });

  // Handle connection close
  ctx.websocket.on('close', () => {
    console.log('Chat client disconnected');
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

