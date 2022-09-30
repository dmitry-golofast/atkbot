const sequelize = require('./db');
const UserModel = require('./models');
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const tokenApiTelegram = '5616040172:AAEvstXyXiOaqVm5cDSSe1Kl2WV9EOqSHTQ'
const tokenApiWeather = 'c49bc2fefcefafb437f5718dc01cb13e'
const bot = new TelegramBot(tokenApiTelegram, {polling: true});

const startApp = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Нет подключения к СУБД', e)
    }
    await bot.setMyCommands([
        {command: '/start', description: 'Start bot'},
    ])
    bot.on('message', async msg => {
        let text = msg.text;
        let chatId = msg.chat.id;
        let last_name = msg.chat.last_name;
        let first_name = msg.chat.first_name;
        let username = msg.chat.username;
        try {
            const sendButtons = async () => {
                await bot.sendMessage(chatId, 'Здравствуйте. Нажмите на любую интересующую Вас кнопку.', {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'Погода в Канаде', callback_data: 'Погода в Канаде'}],
                            [{text: 'Хочу почитать!', callback_data: 'Хочу почитать!'}],
                            [{text: 'Сделать рассылку', callback_data: 'Сделать рассылку'}],
                        ]
                    }
                })
            }

            const idChatBase = async () => {
                if (await UserModel.findOne({
                    where: {chatId: `${chatId}`}
                }) === null) {
                    return null;
                } else {
                    return Number((await UserModel.findOne({
                        where: {chatId: `${chatId}`}
                    })).dataValues.chatId);

                }
            }

            if (text === '/start') {
                if (await idChatBase() !== chatId || idChatBase() === null) {
                    await UserModel.create({chatId, last_name, first_name, username})
                    await sendButtons()
                } else {
                    await sendButtons()
                }
            }
        } catch(e) {
            await bot.sendMessage(chatId, 'Ошибка при запуске бота', e)
        }
    })
}
startApp()

const mainApp = async () => {
    bot.on('callback_query', async msg => {
        const weatherHtmlTemplate = (name, main, weather, wind, clouds) => (`
The weather in <b>${name}</b>:
<b>${weather.main}</b> - ${weather.description}
Temperature: <b>${main.temp} °C</b>
Pressure: <b>${main.pressure} hPa</b>
Humidity: <b>${main.humidity} %</b>
Wind: <b>${wind.speed} meter/sec</b>
Clouds: <b>${clouds.all} %</b>
`);
        const data = msg.data;
        const chatId = msg.message.chat.id;
        try {
            if (data === 'Погода в Канаде') {
                const codeCity = 6167865
                const weatherUrl = `http://api.openweathermap.org/data/2.5/weather?id=${codeCity}&units=metric&appid=${tokenApiWeather}`

                const cityWeather = () => {
                    axios.get(weatherUrl).then((resp) => {
                        const {
                            name,
                            main,
                            weather,
                            wind,
                            clouds
                        } = resp.data;
                        return bot.sendMessage(chatId, weatherHtmlTemplate(name, main, weather[0], wind, clouds), {
                            parse_mode: 'HTML'
                        })
                    }).catch(function (error) {
                        console.log(error);
                        return bot.sendMessage(chatId, 'Не удалось получить данные');
                    });
                }
                cityWeather();

            }
            const getBook = async () => {
                if (data === 'Хочу почитать!') {
                    const bookZip = ('./files/task.zip');
                    const urlPic = 'https://pythonist.ru/wp-content/uploads/2020/03/photo_2021-02-03_10-47-04-350x2000-1.jpg';
                    const title = 'Идеальный карманный справочник для быстрого ознакомления с особенностями работы разработчиков на Python. Вы найдете море краткой информации о типах и операторах в Python, именах специальных методов, встроенных функциях, исключениях и других часто используемых стандартных модулях.'
                    // const archiv = 'https://drive.google.com/file/d/1Xs_YjOLgigsuKl17mOnR_488MdEKloCD/view?usp=sharing'
                    const messageTemplate = (img, text) => (`${img} ${text}`)
                    await bot.sendMessage(chatId, messageTemplate(urlPic, title))
                    await bot.sendDocument(chatId, bookZip);
                }
            }
            getBook()

            if (data === 'Сделать рассылку') {
                await bot.sendMessage(chatId, `Вы выбрали рассылку всем пользователям. Вы уверен что хотите это сделать?`, {
                    reply_markup: {
                        inline_keyboard: [
                            [{text: 'Уверен', callback_data: 'Done'}, {text: 'Отмена', callback_data: 'Cancel'}],
                        ]
                    }
                });

            }
            if (data === 'Done') {
                await bot.sendMessage(chatId, 'Введите сообщение, которое хотите отправить всем пользователям.');
                const interMess = msg.message.text;
                console.log(interMess)
                if(interMess) {
                    const mailing = async () => {
                        bot.on('message', async msg => {
                            const textMail = msg.text;
                            const arrIdChatBase = (await UserModel.findAll({
                                attributes: ['chatId']
                            }));
                            for (let i = 0; i < arrIdChatBase.length; i++) {
                                const selectIdChat = Number((await UserModel.findAll({
                                    attributes: ['chatId']
                                }))[i].dataValues['chatId']);
                                await bot.sendMessage(selectIdChat, `${textMail}`)
                            }
                            await bot.sendMessage(chatId, 'Рассылка завершена')
                        })
                    }
                    await mailing()
                }
            }
            if (data === 'Cancel') {
                await bot.sendMessage(chatId, 'Диалог завершен')
            }
        } catch (e) {
            return bot.sendMessage(chatId,'Ошибка при выполнении операции', e)
        }
    })
}
mainApp()