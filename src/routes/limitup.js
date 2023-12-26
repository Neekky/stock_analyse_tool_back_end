const router = require('koa-router')()
const limitup = require('../controllers/limitup')

router.prefix('/limitup')

router.get('/', limitup.getLimit)

router.get('/by-num', limitup.getLimitByNum)

router.get('/winners-list', limitup.getWinnersList)

router.get('/early-limit-list', limitup.getEarlyLimit)




module.exports = router