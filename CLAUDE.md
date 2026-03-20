# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev        # development with nodemon auto-restart (port 8200)
pnpm start      # production start via node
pnpm prd        # production start via PM2 (process name: stock_analyse_end_server)
```

## Architecture

This is a **Koa 2 BFF (Backend for Frontend)** for a Chinese stock analysis tool. It aggregates data from multiple sources and serves the frontend at `mfuture.fun`.

### Request Flow

```
Frontend (mfuture.fun:8100)
  → Koa server (port 8200)
      → /limitup/*      → local Python service (port 8000) via axios
      → /limitup/by-num → local CSV files at ../../stock_analyse_tool_data_crawl/database/
      → /thirdApi/interest_rate → src/data/ JSON cache, or Jin10 API
      → /thirdApi/flash_news   → Jin10 flash news API
      → /thirdApi/*_plate      → Tonghuashun (10jqka.com.cn) scraping
```

### Key Files

- `app.js` — Koa app factory: mounts middleware stack and all routers
- `src/config.js` — filesystem paths for sibling data directories (`rootPath`, `crawlPath`)
- `src/routes/` — route definitions (limitup.js, thirdApi.js)
- `src/controllers/` — business logic (limitup.js, thirdApi.js)
- `src/models/resModel.js` — `SuccessModel` / `ErrorModel` response wrappers used by all controllers
- `src/data/` — locally cached JSON for Chinese macro indicators (CPI/PPI/PMI); updated manually via git commits

### CORS Whitelist

Configured in `app.js`: `http://127.0.0.1:8100`, `https://www.mfuture.fun`, `https://mfuture.fun`.

### External Dependencies

- **Python service on port 8000** — must be running for `/limitup/` endpoints (except `/limitup/by-num`)
- **Sibling directory** `../../stock_analyse_tool_data_crawl/database/` — CSV stock data files read by `getLimitByNum`
- **Tonghuashun scraping** — uses a hardcoded `Cookie` header in `src/controllers/thirdApi.js` that will expire

### Response Conventions

All API responses use `SuccessModel` / `ErrorModel` from `src/models/resModel.js`:
```js
{ errno: 0, data: ..., msg: 'success' }   // SuccessModel
{ errno: -1, msg: '...' }                 // ErrorModel
```

### Deployment

Push to `master` → GitHub Actions SSHs into server → `git pull && pnpm install && pm2 restart stock_analyse_end_server`.
