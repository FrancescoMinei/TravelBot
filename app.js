process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';
const bot = new TelegramBot(token, { polling: true });
const db = require('better-sqlite3')('./TravelBot.db', { verbose: console.log });
const emoji = require('node-emoji');
const rp = require('request-promise');
const express = require('express');


const WelcomeMsg = 'Benvenuto in TravelBot, ';
const HelpMsg = 'La ricerca degli hotel va in base al codice IATA, il codice aereoportuale.';
const View = 'Ecco il dataset con le città';
const Send = 'Invia il codice di una città';
const SendC = 'Invia le coordinate di una città ';
const Search = 'Invia il nome di una città per verificare se contenuta del database';
const Errore = 'Purtroppo non è stato trovato nessun hotel... ci dispiace';
const SearchC = 'Invia il nome di una città';

var Amadeus = require('amadeus');
const { default: booking } = require('amadeus/lib/amadeus/namespaces/booking');
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
        let handler = (msg) => {
            const row = db.prepare('SELECT * FROM City WHERE City.City LIKE ?').all(msg.text.toString());
            let ans = "";
            if (row.length != 0) {
                row.forEach(x => ans += (x.City + ' - ' + x.Code + '\n'));
                bot.sendMessage(msg.chat.id, ans);
            } else
                bot.sendMessage(msg.chat.id, "Nessuna città trovata");
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/code/, msg => {
    bot.sendMessage(msg.chat.id, Send).then(() => {
        let handler = (msg) => {
            let city = msg.text.toString();
            if (CheckIataCode(city)) {
                bot.sendMessage(msg.chat.id, "Sto cercando i migliori hotel...");
                GetHotelJsonIata(city, msg.chat.id);
            } else {
                bot.sendMessage(msg.chat.id, "Errore nell'inserimento del codice, deve essere di tre caratteri e non può contenere numeri");
            }
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/coordinates/, msg => {
    bot.sendMessage(msg.chat.id, SendC).then(() => {
        let handler = (msg) => {
            let coord = msg.text.toString().split(' ');
            let lat = coord[0];
            let lon = coord[1];
            if (CheckCoordinate(lat) && CheckCoordinate(lon)) {
                bot.sendMessage(msg.chat.id, "Sto cercando i migliori hotel...");
                GetHotelJsonCoordinates(lon, lat, msg.chat.id);
            } else {
                bot.sendMessage(msg.chat.id, "Errore nell'inserimento delle coordinate");
            }
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/GetCoordinate/, msg => {
    bot.sendMessage(msg.chat.id, SearchC).then(() => {
        let handler = (msg) => {
            let city = msg.text.toString();
            GetCityCoordinate(city, msg.chat.id)
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
    //console.log(GetCityCoordinate("Paris"));
});

bot.onText(/\/test/, msg => {
    GetCoordinate(msg.chat.id);
});

function CheckCoordinate(coord) {
    if (/^[-+]?\d*\.?\d*$/.test(coord))
        return true;
    else
        return false;
}

function CheckIataCode(code) {
    if (code.length == 3 && /^[a-zA-Z]+$/.test(code))
        return true;
    else
        return false;
}

function GetName(json) {
    console.log(json)
    let data = new String;
    json.forEach(x => {
        x.forEach(y => {
            data += y.hotel.name.toString() + '\n';
        })
    });
    return data;
}

async function GetHotelJsonIata(city, id) {
    return Promise.resolve('a').then(async function() {
        let json = new Array;
        await amadeus.shopping.hotelOffers.get({
            cityCode: city
        }).then(function(response) {
            json.push(response.data);
            return amadeus.next(response);
        }).then(function(nextResponse) {
            json.push(nextResponse.data);
        }).catch(function(error) {
            console.log(error.code);
        });
        let result = GetName(json);
        console.log(result.toString());
        if (result.length != 0)
            bot.sendMessage(id, result.toString());
        else
            bot.sendMessage(id, Errore);
    });
}

async function GetHotelJsonCoordinates(lon, lat, id) {
    return Promise.resolve('a').then(async function() {
        let json = new Array;
        await amadeus.shopping.hotelOffers.get({
            latitude: lat,
            longitude: lon
        }).then(function(response) {
            json.push(response.data);
            return amadeus.next(response);
        }).then(function(nextResponse) {
            json.push(nextResponse.data);
        }).catch(function(error) {
            console.log(error.code);
        });
        let result = GetName(json);
        console.log(result.toString());
        if (result.length != 0)
            bot.sendMessage(id, result.toString());
        else
            bot.sendMessage(id, Errore);
    });
}

async function GetRestaurantJsonData(city, id) {
    return Promise.resolve('a').then(async function() {
        //await amadeus.shopping.
    });
}

function GetIataCode(msg) {
    do {
        //TODO
        let city = msg.text.toString();
    } while (CheckIataCode(city))
    return city;
}

function GetCoordinate(id) {
    let data = new Array;
    bot.sendMessage(id, "Inserire la latitudine");
    let handler = (msg) => {
        let lat = parseFloat(msg.text);
        if (lat != NaN) {
            data.push(lat);
            bot.removeListener("message", handler);
            bot.sendMessage(id, "Inserire la longitudine");
            let handler2 = (msg2) => {
                let lon = parseFloat(msg2.text);
                if (lon != NaN) {
                    data.push(lon);
                    bot.sendMessage(id, "Sto cercando i migliori hotel...");
                    let json = new Array;
                    amadeus.shopping.hotelOffers.get({
                        latitude: lat,
                        longitude: lon
                    }).then(function(response) {
                        json.push(response.data);
                        return amadeus.next(response);
                    }).then(function(nextResponse) {
                        json.push(nextResponse.data);
                        let result = GetName(json);
                        console.log(result.toString());
                        if (result.length != 0)
                            bot.sendMessage(id, result.toString());
                    }).catch(function(error) {
                        console.log(error.code);
                        bot.sendMessage(id, Errore);
                    });
                    bot.removeListener("message", handler2);
                }
            }
            bot.on('message', handler2);
        }
    }
    bot.on('message', handler);
}

function GetCityCoordinate(city, id) {
    return Promise.resolve('a').then(async function() {
                let url = "http://localhost:9090/city?CityName=" + city;
                let arr = new Array; <<
                << << < HEAD
                await rp(url, function(err, res, body) {
                    arr = JSON.parse(body);
                }).then(function() {
                    if (body.length != 0)
                        bot.sendMessage(id, JSON.parse(arr)); ===
                    === =
                    request(url, function(err, res, body) {
                        let city = new String;
                        arr = JSON.parse(body);
                        arr.forEach(x => {
                            city += x.city + ' ' + x.country + ' ' + x.lat + ' ' + x.lng + '\n';
                        });
                        if (arr.length != 0)
                            bot.sendMessage(id, city.toString()); >>>
                        >>> > f1c477ec89cdd1334cf76340972c2e3b7634200d
                        else
                            bot.sendMessage(id, Errore);
                    });
                });
            }