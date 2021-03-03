const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const express = require('express')
const authRoutes = require('./routes/auth')


const app = express();

app.use(express.json())
app.use('/api/auth', authRoutes)

const start = async () => {
    try {
        await mongoose.connect('mongodb+srv://qwerty:qwerty123@cluster0.mpofz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority')
        app.listen(PORT, () => {
            console.log(`Server has been started on ${PORT}`)
        })
    } catch (e) {
        console.log(e)
    }
}

start()

