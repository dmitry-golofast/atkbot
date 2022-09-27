const express = require('express')
const userRouter = require('./routes/user.routes')

const TelegramApi = require('node-telegram-bot-api')
const token = '5616040172:AAEvstXyXiOaqVm5cDSSe1Kl2WV9EOqSHTQ'
const tokenApiWeather = 'c49bc2fefcefafb437f5718dc01cb13e'

const url1 = `http://api.openweathermap.org/data/2.5/weather?id=6167865&units=metric&appid=${tokenApiWeather}`
const url2 = `http://api.openweathermap.org/data/2.5/weather?id=6094578&units=metric&appid=${tokenApiWeather}`
const url3 = `http://api.openweathermap.org/data/2.5/weather?id=6101645&units=metric&appid=${tokenApiWeather}`
const bot = new TelegramApi(token, {polling: true})

const PORT = process.env.PORT || 8080
const app = express()
app.use(express.json())
app.use('/api', userRouter)
app.listen(PORT, () => console.log(`server started on port ${PORT}`))



// const buttons = {
//     replay_markup: {
//         inline_keyboard: [
//             [{text: 'Погода в Канаде', callback_data: 'OK'}],
//             [{text: 'Погода в Канаде', callback_data: 'OK'}],
//             [{text: 'Погода в Канаде', callback_data: 'OK'}]
//         ]
//     }
// }

const startApp = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Start bot'}
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            console.log('Start!')
            console.log(url)
            return bot.sendMessage(chatId, 'Здравствуйте. Нажмите на любую интересующую Вас кнопку.', {reply_markup: {
                    inline_keyboard: [
                        [{text: 'Погода в Канаде', callback_data: 'OK'}],
                        [{text: 'Хочу почитать!”', callback_data: 'OK'}],
                        [{text: 'Сделать рассылку', callback_data: 'OK'}],
                    ]
                }
            });
        }
        return bot.sendMessage(chatId, 'Не удалось распознать команду. Попробуйте еще раз.', buttons)
    })

}

startApp()