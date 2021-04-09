process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';
const bot = new TelegramBot(token, { polling: true });
const db = require('better-sqlite3')('./TravelBot.db', { verbose: console.log });
const emoji = require('node-emoji');
const express = require('express')

const WelcomeMsg = 'Benvenuto in  TravelBot, ';
const HelpMsg = 'La ricerca degli hotel va in base al codice IATA, il codice aereoportuale.';
const View = 'Ecco il dataset con le città';
const Send = 'Invia il codice di una città';
const Search = 'Invia il nome di una città per verificare se contenuta del database';

var Amadeus = require('amadeus');
var amadeus = new Amadeus({
    clientId: 'mhxawUm5tmcun1zoSB9kq9mk1YIIzCsV',
    clientSecret: 'dnFHZ9Lh7UYvrROT'
});

bot.onText(/\/start/, msg => {
    bot.sendMessage(msg.chat.id, WelcomeMsg + msg.from.first_name);
});

bot.onText(/\/help/, msg => {
    bot.sendMessage(msg.chat.id, HelpMsg);
});

bot.onText(/\/view/, msg => {
    bot.sendMessage(msg.chat.id, View);
    bot.sendDocument(msg.chat.id, './City.txt');
});

bot.onText(/\/search/, msg => {
    bot.sendMessage(msg.chat.id, Search).then(() => {
        bot.on('message', (msg) => {
            const row = db.prepare('SELECT * FROM City WHERE City.City LIKE ?').all(msg.text.toString());
            let ans = "";
            if (row.length != 0) {
                row.forEach(x => ans += (x.City + ' - ' + x.Code + '\n'));
                bot.sendMessage(msg.chat.id, ans);
            } else
                bot.sendMessage(msg.chat.id, "Nessuna città trovata");
            return;
        });
    });
});

bot.onText(/\/send/, msg => {
    let json = new Array;
    bot.sendMessage(msg.chat.id, Send).then(() => {
        bot.on('message', (msg) => {
            bot.sendMessage(msg.chat.id, "Sto cercando i migliori hotel...");
            let city = msg.text.toString();
            console.log(amadeus.shopping.hotelOffers.get({
                cityCode: city
            }).then(function(response) {
                json.push(response.data);
                return amadeus.next(response);
            }).then(function(nextResponse) {
                json.push(nextResponse.data);
            }).catch(function(error) {
                console.log(error.code);
            }));
            let flag = setTimeout(bot.sendMessage(msg.chat.id, GetName(json).toString()), 2000);
            return;
        });
    });
});

function GetName(json) {
    let data = new String;
    json.forEach(x => {
        x.forEach(y => {
            data += y.hotel.name.toString() + '\n';
        })
    });
    return data;
}