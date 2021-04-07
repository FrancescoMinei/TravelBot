const { Telegraf } = require('telegraf')
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';
const db = require('better-sqlite3')('./TravelBot.db', { verbose: console.log });
const express = require('express')
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu')
const bot = new Telegraf(token);
const WelcomeMsg = 'Benvenuto in  TravelBot, ';
const HelpMsg = 'La ricerca degli hotel va in base al codice IATA';
const View = 'Visualizza le città';
const Send = 'Invia una città';
const Search = 'Cerca una città';
const session = Telegraf.session;
var Amadeus = require('amadeus');

var amadeus = new Amadeus({
    clientId: 'mhxawUm5tmcun1zoSB9kq9mk1YIIzCsV',
    clientSecret: 'dnFHZ9Lh7UYvrROT'
});

bot.start((ctx) => {
    console.log(ctx.from);
    console.log(ctx.chat);
    console.log(ctx.message);
    if (ctx.from.first_name)
        ctx.reply(WelcomeMsg + ctx.from.first_name, {
            "reply_markup": {
                "keyboard": [
                    [View],
                    [Send],
                    [Search]
                ]
            }
        });


});
bot.help((ctx) => ctx.reply(HelpMsg));

bot.command('winform', (ctx) => {
    ctx.reply('Prof mi metta 10 sulla fiducia')
});

bot.hears(View, (ctx) => {
    ctx.telegram.sendDocument(ctx.from.id, {
        source: "./City.txt",
        filename: "./City.txt"
    }).catch(function(err) { console.log(err) });
});

bot.hears(Search, (ctx) => {
    ctx.reply("Inviare il nome di una città per verificare se contenuta nel database(in inglese)");
    bot.on('text', (ctx) => {
        const row = db.prepare('SELECT * FROM City WHERE City.City LIKE ?').all(ctx.message.text);
        let msg = "";
        if (row.length != 0) {
            row.forEach(x => msg += (x.City + ' - ' + x.Code + '\n'));
            ctx.reply(msg);
        } else
            ctx.reply('Nessuna città trovata');
        return;
    });

})
bot.hears(Send, (ctx => {
    ctx.reply(amadeus.shopping.hotelOffers.get({
        cityCode: 'RME'
    }))
}));
bot.launch();