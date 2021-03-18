const TelegramBot = require('node-telegram-bot-api');
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';

const bot = new TelegramBot(token, {
    polling: true
});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome on TravelBot", {
        "reply_markup": {
            "keyboard": [
                ["Invia una città"],
                ["Visualizza le città"]
            ]
        }
    });
});