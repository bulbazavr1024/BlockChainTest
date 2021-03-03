const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const sha256 = require('js-sha256')
const User = require('../Models/User')

const getClientAddress = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
}



module.exports.login = function (req, res) {
    try {
        res.status(200).json({
            user: {
                username: req.body.username,
                vETH: 1
            }
        })

        // const candidate = await User.findOne({username: req.body.username})
        //
        // if (candidate) {
        //     const candidateResult = bcrypt.compareSync(req.body.username, candidate.username)
        // }
        //
    } catch (e) {
        console.log(e);
    }
}

module.exports.register = async function (req, res) {
    try {
        // const candidate = await User.findOne({username: req.body.username})
        // if (candidate) {
        // if (bcrypt.compareSync(req.body.username, candidate.username)) {
        //     res.status(409).json({message: 'Такой пользователь уже существует'})
        //     }
        // } else {


        const ip = await getClientAddress(req)
        const token = jwt.sign({
            ip: ip
        }, keys.jwt, {expiresIn: '24h'})
        const tokenHash = sha256(token)

        // const candidate = await User.findOne({publicKey: tokenHash})
        //
        // if (candidate) {
        //      if (candidate.publicKey === tokenHash) {
        //     res.status(409).json({message: 'Такой пользователь уже существует'})}
        // } else {
        const user = new User({
            publicKey: tokenHash,
            vETH: 1,
            nonce: 1
        })
        await user.save()
        res.status(201).json({message: `Пользователь был успешно зарегистрирован. Вам начислен 1 vETH . Ваш privateKey = ${token}`})
        //}
        //}

    } catch (e) {
        console.log(e);
    }
}

module.exports.getInfo = async function (req, res) {
    try {
        const private = sha256(req.body.privateKey)
        const user = await User.findOne({publicKey: private})
        if (user) {
            res.status(200).json({message: `Ваш баланс составляет ${user.vETH} vETH. Nonce = ${user.nonce}` })
        } else {
            res.status(400).json({message: 'Некорректный privateKey'})
        }
    } catch (e) {
        console.log(e);
    }
}

