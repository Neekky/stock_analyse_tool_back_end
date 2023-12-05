const {
  SuccessModel,
  ErrorModel
} = require("../models/resModel");
const csv = require("csvtojson");
const iconv = require('iconv-lite');
const {
  crawlPath
} = require("../config")
const axios = require('axios');

class LimitupCtl {
  async getLimit(ctx) {
    try {
      const {
        date = ''
      } = ctx.query;

      if (!date) {
        ctx.body = new ErrorModel({
          msg: "需要传交易日期",
          code: 404,
        });
      }

      // todo 后期这里的baseurl可以改为配置项，axios加拦截器
      const response = await axios.get('http://127.0.0.1:8000/get_limitup_rank?start_date=' + date);

      const data = response.data

      data.forEach(ele => {
        // 根据请求时间替换数据

        ele[`涨停封单额`] = ele[`涨停封单额[${date}]`];
        ele[`涨停封单量`] = ele[`涨停封单量[${date}]`];
        ele[`连续涨停天数`] = ele[`连续涨停天数[${date}]`];
        ele[`几天几板`] = ele[`几天几板[${date}]`];
        ele[`涨停开板次数`] = ele[`涨停开板次数[${date}]`];
        ele[`最终涨停时间`] = ele[`最终涨停时间[${date}]`];
        ele[`涨停原因类别`] = ele[`涨停原因类别[${date}]`];
        ele[`最终涨停时间`] = ele[`最终涨停时间[${date}]`];
        ele[`首次涨停时间`] = ele[`首次涨停时间[${date}]`];

        delete ele[`涨停封单额[${date}]`];
        delete ele[`涨停封单量[${date}]`];
        delete ele[`连续涨停天数[${date}]`];
        delete ele[`几天几板[${date}]`];
        delete ele[`涨停开板次数[${date}]`];
        delete ele[`最终涨停时间[${date}]`];
        delete ele[`涨停原因类别[${date}]`];
        delete ele[`最终涨停时间[${date}]`];
        delete ele[`首次涨停时间[${date}]`];
      })

      ctx.body = new SuccessModel({
        data: data,
        msg: "查询成功",
      });
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error
      };
    }
  }

  async getLimitByNum(ctx) {
    try {
      const {
        date = '', num = 0
      } = ctx.query;

      if (!date) {
        ctx.body = new ErrorModel({
          msg: "需要传交易日期",
          code: 404,
        });
      }

      let queryNum = '';

      switch (num) {
        case '1':
          queryNum = '1板';
          break;

        case '2':
          queryNum = '2板';
          break;

        case '3':
          queryNum = '3板';
          break;

        case '4':
          queryNum = '4板';
          break;

        default:
          queryNum = '今日涨停';
          break;
      }

      if (!queryNum) {
        ctx.body = {
          code: 500,
          msg: '没传递num参数'
        };
      }

      const reqPath = `${crawlPath}/每日涨停/${date}/${queryNum}.csv`

      // 加载本地csv数据
      const jsonArray = await csv().fromFile(reqPath, {
        encoding: 'binary',
        start: 0 // 16
      });

      //binary和fromFile中的文件读取方式要一致
      const buf = new Buffer(JSON.stringify(jsonArray), 'binary'); //第一个参数格式是字符串
      let str = iconv.decode(buf, 'UTF-8'); //原文编码我这是GBK
      str = JSON.parse(JSON.stringify(str)) //解码后为字符串，需要先转成json字符串
      const data = eval(str)

      data.forEach(ele => {
        // 根据请求时间替换数据

        ele[`涨停封单额`] = ele[`涨停封单额[${date}]`];
        ele[`涨停封单量`] = ele[`涨停封单量[${date}]`];
        ele[`连续涨停天数`] = ele[`连续涨停天数[${date}]`];
        ele[`几天几板`] = ele[`几天几板[${date}]`];
        ele[`涨停开板次数`] = ele[`涨停开板次数[${date}]`];
        ele[`涨停原因类别`] = ele[`涨停原因类别[${date}]`];
        ele[`最终涨停时间`] = ele[`最终涨停时间[${date}]`];
        ele[`首次涨停时间`] = ele[`首次涨停时间[${date}]`];

        delete ele[`涨停封单额[${date}]`];
        delete ele[`涨停封单量[${date}]`];
        delete ele[`连续涨停天数[${date}]`];
        delete ele[`几天几板[${date}]`];
        delete ele[`涨停开板次数[${date}]`];
        delete ele[`涨停原因类别[${date}]`];
        delete ele[`最终涨停时间[${date}]`];
        delete ele[`首次涨停时间[${date}]`];
      })

      ctx.body = new SuccessModel({
        data: data,
        msg: "查询成功",
      });
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error
      };
    }
  }

  async getWinnersList(ctx) {
    try {
      let {
        start_date = '',
          end_date = ''
      } = ctx.query;

      if (!start_date) {
        ctx.body = new ErrorModel({
          msg: "需要传交易日期",
          code: 404,
        });
      }

      if (!end_date) {
        end_date = start_date
      }
      console.log(start_date)
      // todo 后期这里的baseurl可以改为配置项，axios加拦截器
      const response = await axios.get(`http://127.0.0.1:8000/get_winners_list?start_date=${start_date}&end_date=${end_date}`);

      const data = response.data;

      ctx.body = new SuccessModel({
        data: data,
        msg: "查询成功",
      });
    } catch (error) {
      ctx.body = {
        code: 500,
        msg: error
      };
    }
  }

}

module.exports = new LimitupCtl();