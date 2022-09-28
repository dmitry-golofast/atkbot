const express = require('express')
// const userRouter = require('./routes/user.routes')

const TelegramBot = require('node-telegram-bot-api')
const axios = require('axios')

const PORT = process.env.PORT || 8080
const app = express()
// app.use(express.json())
// app.use('/api', userRouter)
app.listen(PORT, () => console.log(`server started on port ${PORT}`))

const codeCity = 6167865
const tokenApiTelegram = '5616040172:AAEvstXyXiOaqVm5cDSSe1Kl2WV9EOqSHTQ'
const tokenApiWeather = 'c49bc2fefcefafb437f5718dc01cb13e'
const bot = new TelegramBot(tokenApiTelegram, {polling: true})
const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?id=${codeCity}&units=metric&appid=${tokenApiWeather}`

const menuApp = () => {
    bot.setMyCommands([
        {command: '/start', description: 'Start bot'}
    ])
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        if (text === '/start') {
            return bot.sendMessage(chatId, 'Здравствуйте. Нажмите на любую интересующую Вас кнопку.', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Погода в Канаде', callback_data: 'Погода в Канаде'}],
                        [{text: 'Хочу почитать!', callback_data: 'Хочу почитать!'}],
                        [{text: 'Сделать рассылку', callback_data: 'Сделать рассылку'}],
                    ]
                }
            });
        }
        return bot.sendMessage(chatId, 'Не удалось распознать команду. Попробуйте еще раз.')
    })
}
menuApp()

const mainApp = () => {
    const weatherHtmlTemplate = (name, main, weather, wind, clouds) => (
`The weather in <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Temperature: <b>${main.temp} °C</b>
Pressure: <b>${main.pressure} hPa</b>
Humidity: <b>${main.humidity} %</b>
Wind: <b>${wind.speed} meter/sec</b>
Clouds: <b>${clouds.all} %</b>
`);
    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === 'Погода в Канаде') {
            const cityWeather = () => {
                axios.get(weatherUrl).then((resp) => {
                    const {
                        name,
                        main,
                        weather,
                        wind,
                        clouds
                    } = resp.data;
                    bot.sendMessage(chatId, weatherHtmlTemplate(name, main, weather[0], wind, clouds), {
                        parse_mode: "HTML"
                    })
                }).catch(function (error) {
                    console.log(error);
                    bot.sendMessage(chatId, 'Не удалось получить данные');
                });

            }
            cityWeather();
        }

        if(data === 'Хочу почитать!') {
            const urlPic = 'https://pythonist.ru/wp-content/uploads/2020/03/photo_2021-02-03_10-47-04-350x2000-1.jpg';
            const title = 'Идеальный карманный справочник для быстрого ознакомления с особенностями работы разработчиков на Python. Вы найдете море краткой информации о типах и операторах в Python, именах специальных методов, встроенных функциях, исключениях и других часто используемых стандартных модулях.'
            const archiv = 'https://drive.google.com/file/d/1Xs_YjOLgigsuKl17mOnR_488MdEKloCD/view?usp=sharing'
            const messageTemplate = (pic, text) => {
                return (`
                ${pic} ${text}
                `);
            }
            await bot.sendMessage(chatId, messageTemplate(urlPic, title));
            await bot.sendMessage(chatId, archiv);
        }

        if (data === 'Сделать рассылку') {
            return bot.sendMessage(chatId, `Вы выбрали рассылку всем пользователям. Вы уверен что хотите это сделать?`, {reply_markup: {
                    inline_keyboard: [
                        [{text: 'Уверен', callback_data: 'Done'}, {text: 'Отмена', callback_data: 'Cancel'}],
                    ]
                }
            });
        }
        if (data === 'Done') {
            return bot.sendMessage(chatId, 'Введите сообщение, которое хотите отправить всем пользователям.');
        }
        if (data === 'Cancel') {
            return bot.sendMessage(chatId, 'Диалог завершен');
        }

    })

}
mainApp()

