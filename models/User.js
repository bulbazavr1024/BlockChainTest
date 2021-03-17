const {Schema, model} = require('mongoose')

const userSchema = new Schema({
    publicKey: {
        type: String,
        required: true,
        unique: true
    },
    vETH: {
        type: Number
    },
    nonce: {
        type: Number
    },
    lastRequestDate: {
        type: Date , default: Date.now
    },
    lastTransactionProof: {
        type: String
    }

})

module.exports = model('users', userSchema)