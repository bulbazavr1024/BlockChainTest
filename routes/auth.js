const express = require('express');
const router = express.Router();
const controller = require('../controllers/auth')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/register', controller.register)

router.get('/info', authMiddleware, controller.getInfo)

router.patch('/submit', controller.submit)
router.patch('/faucet', controller.faucet)



module.exports = router
