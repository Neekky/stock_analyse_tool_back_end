const path = require("path");

const rootPath = path.join(__dirname, '../../stock_data_base/data')

const crawlPath = path.join(__dirname, '../../stock_analyse_tool_data_crawl/database');

module.exports = {
    rootPath,
    crawlPath
}
