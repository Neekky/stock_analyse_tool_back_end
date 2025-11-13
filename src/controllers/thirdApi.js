const { SuccessModel, ErrorModel } = require("../models/resModel");
const iconv = require("iconv-lite");
const { crawlPath } = require("../config");
const axios = require("axios");
const dayjs = require("dayjs");
const fs = require("fs");
const path = require("path");

// 辅助方法，用于请求金十快讯数据
const jin10FlashNewsRequest = async (ctx, maxTime = "") => {
  try {
    const { hot = "火,热,沸,爆", channel = "1,5" } = ctx.query;
    const results = [];
    let filterRes = [];
    const timestamp = Date.now() + "";

    // 小参数
    const smallParams = {
      hot: hot.split(","),
      channel: channel.split(",").map(Number),
    };

    if (maxTime) {
      smallParams.max_time = maxTime;
    }
    const response = await axios.get(
      "https://3318fc142ea545eab931e22a61ec6e5c.z3c.jin10.com/flash",
      {
        params: {
          params: JSON.stringify(smallParams),
          t: timestamp,
        },
        headers: {
          Accept: "*/*",
          "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Origin: "https://www.jin10.com",
          Referer: "https://www.jin10.com/",
          "x-app-id": "bVBF4FyRTn5NJF5n",
          "x-version": "1.0",
        },
        timeout: 10000,
      }
    );

    const data = response?.data?.data || [];

    if (response.data?.status === 200) {
      // 转换数据
      data?.forEach((ele) => {
        const create_time = ele.create_time;
        if (
          ele.important === 1 &&
          ele.type === 0 &&
          dayjs(create_time).isSame(dayjs(), "day") &&
          ele?.data?.content
        ) {
          results.push(sanitizeHTMLText(ele?.data?.content || ""));
        }
      });

      // 过滤非必要数据，例如未来事件列表
      filterRes = results.filter((ele) => {
        // 去除内容包含 今日重点关注的财经数据与事件 的数据
        if (ele.includes("今日重点关注的财经数据与事件")) {
          return false;
        }
        return true;
      });
    }
    return {
      time: data[data.length - 1]?.time || "",
      data: filterRes,
    };
  } catch (error) {
    console.log("请求金十数据报错", error);
    return {
      time: "",
      data: [],
    };
  }
}

class ThirdApiCtl {
  async getInflowPlate(ctx) {
    try {
      const response = await axios.get(
        "https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/recent_hot_block?type=con&field=zljlr&days=1",
        {
          headers: {
            Cookie:
              "__utma=156575163.862681556.1735481875.1735481875.1735481875.1; Hm_lvt_722143063e4892925903024537075d0d=1735138891,1735484336,1736170188; Hm_lvt_929f8b362150b1f77b477230541dbbc2=1735138891,1735484336,1736170188; Hm_lvt_78c58f01938e4d85eaf619eae71b4ed1=1735481875,1736170188; v=AzrVWst3Cchc7YUkNSMlS5IFjWtZ677FMG8yaUQz5k2YN9TVLHsO1QD_glEX",
            Referer: "https://eq.10jqka.com.cn/",
            Host: "eq.10jqka.com.cn",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );
      const data = response.data;
      ctx.body = new SuccessModel({
        data: data,
        msg: "查询成功",
      });
    } catch (error) {
      ctx.body = new ErrorModel({
        msg: error || "查询失败",
        code: 500,
      });
    }
  }

  async getZFPlate(ctx) {
    try {
      const response = await axios.get(
        "https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/recent_hot_block?type=con&field=zf&days=1",
        {
          headers: {
            Cookie:
              "__utma=156575163.862681556.1735481875.1735481875.1735481875.1; Hm_lvt_722143063e4892925903024537075d0d=1735138891,1735484336,1736170188; Hm_lvt_929f8b362150b1f77b477230541dbbc2=1735138891,1735484336,1736170188; Hm_lvt_78c58f01938e4d85eaf619eae71b4ed1=1735481875,1736170188; v=AzrVWst3Cchc7YUkNSMlS5IFjWtZ677FMG8yaUQz5k2YN9TVLHsO1QD_glEX",
            Referer: "https://eq.10jqka.com.cn/",
            Host: "eq.10jqka.com.cn",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );
      const data = response.data;
      ctx.body = new SuccessModel({
        data: data,
        msg: "查询成功",
      });
    } catch (error) {
      ctx.body = new ErrorModel({
        msg: error || "查询失败",
        code: 500,
      });
    }
  }

  async getInterestRate(ctx) {
    try {
      const { attr_id = "24", name = "利率" } = ctx.query;
      
      // 定义名称到文件的映射关系
      const nameToFileMap = {
        "中国CPI年率": "中国CPI年率interestRate.json",
        "中国CPI月率": "中国CPI月率interestRate.json", 
        "中国PPI年率": "中国PPI年率interestRate.json",
        "中国制造业PMI": "中国制造业PMIinterestRate.json"
      };
      
      // 优先从本地文件获取数据
      if (nameToFileMap[name]) {
        const fileName = nameToFileMap[name];
        const filePath = path.join(__dirname, '../data', fileName);
        
        try {
          // 检查文件是否存在
          if (fs.existsSync(filePath)) {
            const fileData = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(fileData);
            
            // 按日期排序
            const sortedResults = jsonData.sort(
              (a, b) => new Date(a.日期) - new Date(b.日期)
            );
            
            ctx.body = new SuccessModel({
              data: sortedResults,
              msg: "从本地文件查询成功",
              source: "local"
            });
            return;
          }
        } catch (fileError) {
          console.warn(`读取本地文件失败，将使用API查询: ${fileError.message}`);
          // 文件读取失败，继续使用API查询
        }
      }
      
      // 如果本地文件不存在或读取失败，使用API查询
      const results = [];
      let maxDate = "";

      while (true) {
        const timestamp = Date.now() + "";
        const response = await axios.get(
          "https://datacenter-api.jin10.com/reports/list_v2",
          {
            params: {
              max_date: maxDate,
              category: "ec",
              attr_id: attr_id,
              _: timestamp,
            },
            headers: {
              Accept: "*/*",
              "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Origin: "https://datacenter.jin10.com",
              Referer: "https://datacenter.jin10.com/",
              "x-app-id": "rU6QIu7JHe2gOUeR",
              "x-version": "1.0.0",
            },
            timeout: 10000,
          }
        );

        const data = response.data;

        if (!data.data?.values || data.data.values.length === 0) {
          break;
        }

        results.push(
          ...data.data.values.map((item) => ({
            商品: name,
            日期: item[0],
            今值: parseFloat(item[1]) || null,
            预测值: parseFloat(item[2]) || null,
            前值: parseFloat(item[3]) || null,
          }))
        );

        const lastDate = data.data.values[data.data.values.length - 1][0];
        maxDate = dayjs(lastDate).subtract(1, "day").format("YYYY-MM-DD");
      }

      const sortedResults = results.sort(
        (a, b) => new Date(a.日期) - new Date(b.日期)
      );

      ctx.body = new SuccessModel({
        data: sortedResults,
        msg: "从API查询成功",
        source: "api"
      });
    } catch (error) {
      console.error("Interest Rate API Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      ctx.body = new ErrorModel({
        msg: error.response?.data || error.message || "查询失败",
        code: error.response?.status || 500,
      });
    }
  }

  async getJin10News(ctx) {
    try {
      const { maxQueryCount = 3 } = ctx.query; // 默认最多查询3次
      const maxCount = parseInt(maxQueryCount, 10);
      
      let allResults = [];
      let lastTime = "";
      let queryCount = 0;
      let hasMoreData = true;
      
      // 循环查询，直到没有更多数据或达到最大查询次数
      while (hasMoreData && queryCount < maxCount) {
        // 使用上一次请求返回的时间作为下一次请求的参数
        const response = await jin10FlashNewsRequest(ctx, lastTime);
        queryCount++;
        // 合并数据
        if (response?.data?.length > 0) {
          allResults = [...allResults, ...response.data];
          lastTime = response.time; // 更新时间戳用于下一次请求
        } else {
          hasMoreData = false; // 没有更多数据，退出循环
        }
        
        // 如果没有返回时间或时间为空，也认为没有更多数据
        if (!lastTime) {
          hasMoreData = false;
        }
      }
      
      ctx.body = new SuccessModel({
        data: allResults,
        msg: "查询成功，实际查询次数：" + queryCount,
      });
    } catch (error) {
      console.error("Jin10 News API Error:", { // 修正错误日志信息
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      ctx.body = new ErrorModel({
        msg: error.response?.data || error.message || "查询失败",
        code: error.response?.status || 500,
      });
    }
  }
}

function sanitizeHTMLText(htmlString) {
  // 分步处理策略
  return htmlString
    .replace(/<br\s*\/?>/gi, "") // 保留换行结构
    .replace(/<b>/gi, "【") // 处理加粗标签开头
    .replace(/<\/b>/gi, "】") // 处理加粗标签结尾
    .replace(/<span[^>]*>/gi, "") // 去除span开始标签
    .replace(/<\/span>/gi, "") // 去除span结束标签
    .replace(/<[^>]+>/g, "") // 去除所有剩余HTML标签
    .replace(/\n+/g, "") // 合并连续换行
    .replace(/^\s+|\s+$/g, "") // 去除首尾空白
    .replace(/(\n)\s+/g, "$1") // 去除行首空白
    .replace(/\s{2,}/g, " ") // 合并多个空格
    .replace(/(\d)\.(\d)/g, "$1。$2"); // 防止小数点被误替换（可选）
}

module.exports = new ThirdApiCtl();
