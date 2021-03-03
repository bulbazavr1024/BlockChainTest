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
    }

})

module.exports = model('users', userSchema)