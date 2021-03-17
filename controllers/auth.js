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
        const ip = await getClientAddress(req)
        const token = jwt.sign({
            ip: ip
        }, keys.jwt, {expiresIn: '24h'})
        const tokenHash = sha256(token)

        const candidate = await User.findOne({publicKey: tokenHash})

        if (candidate) {
            if (candidate.publicKey === tokenHash) {
                res.status(409).json({message: 'Такой пользователь уже существует'})
            }
        } else {
            const user = new User({
                publicKey: tokenHash,
                vETH: 1,
                nonce: 1,
                lastRequestDate: null,
                lastTransactionProof: null
            })
            await user.save()
            res.status(201).json({message: `Пользователь был успешно зарегистрирован. Вам начислен 1 vETH . Ваш privateKey = ${token}`})
        }

    } catch (e) {
        res.status(400).json({message: 'Такой пользователь уже существует'})

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


// Url для получения текущей задачи с сервера
module.exports.url = function (req, res) {
    try {
        res.status(200).json(randomTask)
    } catch (e) {
        console.log(e);
    }
}

// Url для проверки решенной задачи на клиенте и начисления vETH за правильное решение
module.exports.url2 = async function (req, res) {
    const privateK = sha256(req.body.privateKey)
    const {result} = req.body
    // console.log(result)
    let summ = randomTask + result
    let verify = sha256(String(summ))

    console.log(verify);
    try {


        if ((verify[verify.length - 1] == 0) && (verify[verify.length - 2] == 0) && (verify[verify.length - 3] == 0) && (verify[verify.length - 4] == 0)) {
            const user = await User.findOneAndUpdate(
                {publicKey: privateK},
                {$inc: {vETH: 1}},
                {new: true}
            )

            res.status(200).json({message: `Поздарвляем! Вы добыли 1 vETH`})
            return randomTask = randomInteger(1, 1000)
        } else {
            res.status(400).json({message: 'не получилось подобрать'})
        }
    } catch (e) {
        console.log(e);
    }
}

// Аналог AirDrop для получения vETH раз в 10 минут
module.exports.faucet = async function (req, res) {
    try {
        let currentDate = new Date()
        const getTimeDifference = (user) => {
            return currentDate - user.lastRequestDate
        }

        const privateK = sha256(req.body.privateKey)
        const user = await User.findOne({publicKey: privateK})
        const ProofSum = user.publicKey + user.nonce
        const ProofSumHash = sha256(ProofSum)
// Если разница во времени с последнего запроса больше 10 минут , то выполняется функция...
        if (getTimeDifference(user) >= 600000) {
            let setDate = new Date()
            const user = await User.findOneAndUpdate(
                {publicKey: privateK},
                {$set: {lastRequestDate: setDate, lastTransactionProof: ProofSumHash}, $inc: {vETH: 1, nonce: 1}},
                {new: true}
            )
            res.status(200).json({message: `Поздравляем! Вы добыли 1 vETH. Данный запрос можно делать 1 раз в 10 минут , иначе с вашего счёта будет списано 0.05 vETH`})
            return currentDate = new Date()

        } else {
            if (user.vETH > 0.05) {
                const user = await User.findOneAndUpdate(
                    {publicKey: privateK},
                    {$inc: {vETH: -0.05, nonce: 1}},
                    {new: true}
                )
                res.status(200).json({message: `Данный запрос можно отправлять один раз в 10 минут. С вашего счёта списали 0.05 vETH`})
                return currentDate = new Date()
            }
            else {
                res.status(200).json({message: 'Подождите 10 минут, чтобы снова получить AirDrop'})
            }
        }


    } catch (e) {
        console.log(e);
    }
}

