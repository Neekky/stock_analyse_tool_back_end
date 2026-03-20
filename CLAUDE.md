# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供本代码仓库的工作指导。

## 命令

```bash
pnpm dev        # 开发模式，使用 nodemon 自动重启（端口 8200）
pnpm start      # 生产模式，通过 node 启动
pnpm prd        # 生产模式，通过 PM2 启动（进程名：stock_analyse_end_server）
```

## 架构

这是一个用于中国股票分析工具的 **Koa 2 BFF（Backend for Frontend）**。它聚合多个数据源的数据，并为前端 `mfuture.fun` 提供服务。

### 请求流程

```
前端 (mfuture.fun:8100)
  → Koa 服务器 (端口 8200)
      → /limitup/*      → 本地 Python 服务（端口 8000）通过 axios
      → /limitup/by-num → 本地 CSV 文件位于 ../../stock_analyse_tool_data_crawl/database/
      → /thirdApi/interest_rate → src/data/ JSON 缓存，或金十数据 API
      → /thirdApi/flash_news   → 金十数据快讯 API
      → /thirdApi/*_plate      → 同花顺（10jqka.com.cn）数据爬取
```

### 关键文件

- `app.js` — Koa 应用工厂：挂载中间件栈和所有路由
- `src/config.js` — 同级数据目录的文件系统路径（`rootPath`、`crawlPath`）
- `src/routes/` — 路由定义（limitup.js、thirdApi.js）
- `src/controllers/` — 业务逻辑（limitup.js、thirdApi.js）
- `src/models/resModel.js` — 所有控制器使用的 `SuccessModel` / `ErrorModel` 响应包装器
- `src/data/` — 中国宏观经济指标（CPI/PPI/PMI）的本地缓存 JSON；通过 git 提交手动更新

### CORS 白名单

在 `app.js` 中配置：`http://127.0.0.1:8100`、`https://www.mfuture.fun`、`https://mfuture.fun`。

### 外部依赖

- **端口 8000 的 Python 服务** — `/limitup/` 端点必须运行（`/limitup/by-num` 除外）
- **同级目录** `../../stock_analyse_tool_data_crawl/database/` — `getLimitByNum` 读取的 CSV 股票数据文件
- **同花顺数据爬取** — 使用 `src/controllers/thirdApi.js` 中硬编码的 `Cookie` 请求头，该 Cookie 会过期

### 响应规范

所有 API 响应都使用 `src/models/resModel.js` 中的 `SuccessModel` / `ErrorModel`：
```js
{ errno: 0, data: ..., msg: 'success' }   // SuccessModel
{ errno: -1, msg: '...' }                 // ErrorModel
```

### 部署

推送到 `master` → GitHub Actions 通过 SSH 登录服务器 → `git pull && pnpm install && pm2 restart stock_analyse_end_server`。
