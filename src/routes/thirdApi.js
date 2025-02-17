const router = require('koa-router')()
const thirdApi = require('../controllers/thirdApi')

router.prefix('/thirdApi')

router.get('/inflow_plate', thirdApi.getInflowPlate)

router.get('/zf_plate', thirdApi.getZFPlate)

router.get('/interest_rate', thirdApi.getInterestRate)

router.get('/flash_news', thirdApi.getJin10News)

module.exports = router