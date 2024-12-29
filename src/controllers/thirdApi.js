const {
    SuccessModel,
    ErrorModel
  } = require("../models/resModel");
  const iconv = require('iconv-lite');
  const {
    crawlPath
  } = require("../config")
  const axios = require('axios');
  
  class ThirdApiCtl {
    async getInflowPlate(ctx) {
        try {
          const response = await axios.get('https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/recent_hot_block?type=con&field=zljlr&days=1', {
            headers: {
              'Cookie': 'hxmPid=adm_wapzxdingbubanner_394400;v=AzzX37KsdVEgM0EN8mJYwBBTC9HrNeBfYtn0Ixa9SCcK4dLPPkWw77LpxLpl;_ga=GA1.1.634807058.1722318186;_ga_KQBDS1VPQF=GS1.1.1732081176.2.1.1732081200.0.0.0'
            }
          });
          const data = response.data
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
          const response = await axios.get('https://eq.10jqka.com.cn/pick/block/block_hotspot/hotspot/v1/recent_hot_block?type=con&field=zf&days=1', {
            headers: {
              'Cookie': 'hxmPid=adm_wapzxdingbubanner_394400;v=AzzX37KsdVEgM0EN8mJYwBBTC9HrNeBfYtn0Ixa9SCcK4dLPPkWw77LpxLpl;_ga=GA1.1.634807058.1722318186;_ga_KQBDS1VPQF=GS1.1.1732081176.2.1.1732081200.0.0.0'
            }
          });
          const data = response.data
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
  }
  
  module.exports = new ThirdApiCtl();
  