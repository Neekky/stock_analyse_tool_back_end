const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const cors = require("koa2-cors");

const index = require("./src/routes/index");
const users = require("./src/routes/users");
const limitup = require("./src/routes/limitup");
const thirdApi = require("./src/routes/thirdApi");

// 处理CORS
app.use(
  cors({
    origin: (ctx) => {
      const allowedOrigins = [
        "http://127.0.0.1:8100",
        "https://www.mfuture.fun",
        "https://mfuture.fun",
      ];
      const requestOrigin = ctx.get("Origin");

      // 允许的域名直接返回，否则返回 false（禁止）
      return allowedOrigins.includes(requestOrigin) ? requestOrigin : false;
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposeHeaders: ["Content-Length", "Authorization"], // 允许客户端读取的响应头
  })
);

// 显式处理 OPTIONS 预检请求
app.use(async (ctx, next) => {
  if (ctx.method === "OPTIONS") {
    ctx.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    ctx.set("Access-Control-Max-Age", "86400"); // 预检结果缓存 24 小时
    ctx.status = 204; // 空响应
  } else {
    await next();
  }
});

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "ejs",
  })
);

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());
app.use(limitup.routes(), limitup.allowedMethods());
app.use(thirdApi.routes(), thirdApi.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
