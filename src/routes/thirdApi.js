const router = require('koa-router')()
const thirdApi = require('../controllers/thirdApi')

router.prefix('/thirdApi')

router.get('/inflow_plate', thirdApi.getInflowPlate)

router.get('/zf_plate', thirdApi.getZFPlate)

module.exports = router