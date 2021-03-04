const jwt = require('jsonwebtoken')
const keys = require('../config/keys')
const sha256 = require('js-sha256')
const User = require('../Models/User')


// Получаем IP пользователя для регистрации
const getClientAddress = (req) => {
    return (req.headers['x-forwarded-for'] || '').split(',')[0]
        || req.connection.remoteAddress;
}

const randomInteger = function (min, max) {
    // случайное число от min до (max+1)
    let rand = min + Math.random() * (max + 1 - min);
    return Math.floor(rand);
}

let randomTask = randomInteger(1, 1000)


module.exports.register = async function (req, res) {
    try {
        const lastRequestDate = new Date()
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
            nonce: 1,
            lastRequestDate: lastRequestDate,
        })
        await user.save()
        res.status(201).json({message: `Пользователь был успешно зарегистрирован. Вам начислен 1 vETH . Ваш privateKey = ${token}`})
        //}

    } catch (e) {
        console.log(e);
    }
}

module.exports.getInfo = async function (req, res) {
    try {
        const privateK = sha256(req.body.privateKey)
        const user = await User.findOne({publicKey: privateK})
        if (user) {
            res.status(200).json({message: `Ваш баланс составляет ${user.vETH} vETH. Nonce = ${user.nonce}. Текущая задача для майнинга: ${randomTask}`})
        } else {
            res.status(400).json({message: `Некорректный privateKey.`})
        }
    } catch (e) {
        console.log(e);
    }
}

module.exports.submit = async function (req, res) {
    const privateK = sha256(req.body.privateKey)

    try {

        for (let i = 0; ; i++) {
            let summ = randomTask + i
            let verifiable = sha256(String(summ))
            // Нахождение 4х последних символов строки
            if ((verifiable[verifiable.length - 1] == 0) && (verifiable[verifiable.length - 2] == 0) && (verifiable[verifiable.length - 3] == 0) && (verifiable[verifiable.length - 4] == 0)) {
                const user = await User.findOneAndUpdate(
                    {publicKey: privateK},
                    {$inc: {vETH: 1}},
                    {new: true}
                )

                res.status(200).json({message: `Поздарвляем! Вы добыли 1 vETH`})
                return randomTask = randomInteger(1, 1000)
                break;
            }
        }

    } catch (e) {
        console.log(e);
    }
}

module.exports.faucet = async function (req, res) {
    try {
        let currentDate = new Date()
        const getTimeDifference = (user) => {
            return currentDate - user.lastRequestDate
        }

        const privateK = sha256(req.body.privateKey)
        const user = await User.findOne({publicKey: privateK})
// Если разница во времени с последнего запроса больше 10 минут , то выполняется функция...
        if (getTimeDifference(user) >= 600000) {
            let setDate = new Date()
            const user = await User.findOneAndUpdate(
                {publicKey: privateK},
                {$inc: {vETH: 1}, $set: {lastRequestDate: setDate}},
                {new: true}
            )
            res.status(200).json({message: `Поздравляем! Вы добыли 1 vETH`})
            return currentDate = new Date()

        } else {
            const user = await User.findOneAndUpdate(
                {publicKey: privateK},
                {$inc: {vETH: -0.05}},
                {new: true}
            )
            res.status(200).json({message: `Данный запрос можно отправлять один раз в 10 минут. С вашего счёта сняли 0.05 vETH`})
            return currentDate = new Date()
        }


    } catch (e) {
        console.log(e);
    }
}

