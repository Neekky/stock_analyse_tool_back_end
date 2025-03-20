const { SuccessModel, ErrorModel } = require("../models/resModel");
const iconv = require("iconv-lite");
const { crawlPath } = require("../config");
const axios = require("axios");
const dayjs = require("dayjs");

// 辅助方法，用于请求金十快讯数据
const jin10FlashNewsRequest = async (ctx, maxTime = "") => {
  try {
    const { hot = "热,沸,爆", channel = "1,5" } = ctx.query;
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

    if (response.data?.status === 200) {
      const data = response?.data?.data || [];
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
    return filterRes;
  } catch (error) {
    console.log("请求金十数据报错", error);
    return [];
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
              "hxmPid=adm_wapzxdingbubanner_394400;v=AzzX37KsdVEgM0EN8mJYwBBTC9HrNeBfYtn0Ixa9SCcK4dLPPkWw77LpxLpl;_ga=GA1.1.634807058.1722318186;_ga_KQBDS1VPQF=GS1.1.1732081176.2.1.1732081200.0.0.0",
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
              "hxmPid=adm_wapzxdingbubanner_394400;v=AzzX37KsdVEgM0EN8mJYwBBTC9HrNeBfYtn0Ixa9SCcK4dLPPkWw77LpxLpl;_ga=GA1.1.634807058.1722318186;_ga_KQBDS1VPQF=GS1.1.1732081176.2.1.1732081200.0.0.0",
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
        msg: "查询成功",
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
      let res1 = [];
      let res2 = [];
      // 第一次请求
      res1 = await jin10FlashNewsRequest(ctx);

      if (res1.length > 0) {
        const time = res1[res1.length - 1]?.time;
        res2 = await jin10FlashNewsRequest(ctx, time);
      }

      const results = [...res1, ...res2];
      ctx.body = new SuccessModel({
        data: results,
        msg: "查询成功",
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
