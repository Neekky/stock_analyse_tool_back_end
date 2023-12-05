const router = require('koa-router')()
const limitup = require('../controllers/limitup')

router.prefix('/limitup')

router.get('/', limitup.getLimit)

router.get('/by-num', limitup.getLimitByNum)

router.get('/winners-list', limitup.getWinnersList)

module.exports = router