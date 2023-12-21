// config.js 或者 db.js

const dotenv = require('dotenv');
const path = require('path');

// 根据 NODE_ENV 来决定加载哪个 .env 文件
const envPath = path.join(__dirname, `.env.${process.env.NODE_ENV}`);
dotenv.config({ path: envPath });

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

module.exports = dbConfig;
