const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', controller.register)

router.get('/info', authMiddleware, controller.getInfo)
router.get('/url',  controller.url)
router.post('/url2', authMiddleware, controller.url2)

router.patch('/faucet', controller.faucet)



module.exports = router
