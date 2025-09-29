const Router = require("koa-router");
const router = new Router();

// Example route
router.get("/", async (ctx) => {
    ctx.body = "Hello World from Koa!";
});

module.exports = router;