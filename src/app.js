const koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');

// Mango setup
const PORT = 3000;


// Import routes
const router = require('./routes');

const app = new koa();

app.use(bodyParser());

app.use(router.routes()).use(router.allowedMethods());

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;

