process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';
const bot = new TelegramBot(token, { polling: true });
const db = require('better-sqlite3')('./TravelBot.db', { verbose: console.log });
const request = require('request');
const express = require('express');
const ejs = require('ejs');

//admin: modifica delle stringhe
var WelcomeMsg = 'Benvenuto in TravelBot, ';
var HelpMsg = 'La ricerca degli hotel va in base al codice IATA, il codice aereoportuale.';
var View = 'Ecco il dataset con le città 😃';
var Position = 'Ecco il metodo per inviare la propria posizione 🙃';
var Send = 'Invia il codice di una città 🔢';
var SendC = 'Invia le coordinate di una città 🌐';
var Search = 'Invia il nome di una città per verificare se contenuta del database ✔️';
var SearchC = 'Invia il nome di una città 🌆';
var SearchCity = 'Invia il nome o le iniziali di una città 🌆';
var Searching = 'Stiamo cercando i migliori hotel... 🔄';
var SearchingAct = 'Stiamo cercando le migliori attività... 🔄';
var SearchingCity = 'Stiamo cercando le città... 🔄';
var SendPosition = 'Invia la posizione. Se non sai come fare, digita /sendPosition'
var Errore = 'Purtroppo non è stato trovato nessun hotel... ci dispiace 😭';
var ErroreC = 'Purtroppo non è stata trovata nessuna città... ci dispiace 😭';
var ErroreA = 'Purtroppo non è stata trovata nessuna attività... ci dispiace 😭';
var ErroreCord = 'Errore di inserimento nelle coordinate, riprovare ❌';
var ErroreIata = 'Errore nell\'inserimento del codice, deve essere di tre caratteri e non può contenere numeri, riprovare ❌';

//#region WebInterface
const app = express();
const port = process.env.PORT || 3000;
app.set("view engine", "ejs");
app.use(express.urlencoded({
    extended: true
}));

app.get("/", function(req, res) {
    res.render("index", {
        welcomeMsg: WelcomeMsg,
        HelpMsg: HelpMsg,
        View: View,
        Position: Position,
        Send: Send,
        SendC: SendC,
        Search: Search,
        SearchC: SearchC,
        SearchCity: SearchCity,
        Searching: Searching,
        SearchingAct: SearchingAct,
        SearchingCity: SearchingCity,
        SendPosition: SendPosition,
        Errore: Errore,
        ErroreC: ErroreC,
        ErroreA: ErroreA,
        ErroreCord: ErroreCord,
        ErroreIata: ErroreIata
    });
});

app.post("/message", function(req, res) {
    WelcomeMsg = req.body.WelcomeMsg;
    HelpMsg = req.body.HelpMsg;
    View = req.body.View;
    Position = req.body.Position;
    Send = req.body.Send;
    SendC = req.body.SendC;
    Search = req.body.Search;
    SearchC = req.body.SearchC;
    SearchCity = req.body.SearchCity;
    Searching = req.body.Searching;
    SearchingAct = req.body.SearchingAct;
    SearchingCity = req.body.SearchingCity;
    SendPosition = req.body.SendPosition;
    Errore = req.body.Errore;
    ErroreC = req.body.ErroreC;
    ErroreA = req.body.ErroreA;
    ErroreCord = req.body.ErroreCord;
    ErroreIata = req.body.ErroreIata;
    res.redirect("/");
});
app.listen(port, () => console.log(`WebInterface on port ${port}`));
//#endregion

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
    bot.sendMessage(msg.chat.id, "Puoi controllare il tuo codice qui: https://www.iata.org/en/publications/directories/code-search/");
});

bot.onText(/\/code/, msg => {
    bot.sendMessage(msg.chat.id, Send).then(() => {
        let handler = (msg) => {
            let city = msg.text.toString();
            if (CheckIataCode(city)) {
                bot.sendMessage(msg.chat.id, Searching);
                GetHotelJsonIata(city, msg.chat.id);
            } else {
                bot.sendMessage(msg.chat.id, ErroreIata);
            }
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/coordinates/, msg => {
    bot.sendMessage(msg.chat.id, SendC).then(() => {
        bot.sendMessage(msg.chat.id, "Inserire la latitudine");
        let handler = (msg) => {
            let lat = parseFloat(msg.text);
            if (CheckCoordinate(lat)) {
                bot.removeListener("message", handler);
                bot.sendMessage(msg.chat.id, "Inserire la longitudine");
                let handler2 = (msg2) => {
                    let lon = parseFloat(msg2.text);
                    if (CheckCoordinate(lon)) {
                        bot.sendMessage(msg.chat.id, Searching);
                        let json = new Array;
                        amadeus.shopping.hotelOffers.get({
                            latitude: lat,
                            longitude: lon
                        }).then(function(response) {
                            json.push(response.data);
                            return amadeus.next(response);
                        }).then(function(nextResponse) {
                            if (json.nextResponse != null)
                                json.push(nextResponse.data);
                            let result = GetName(json);
                            console.log(result.toString());
                            if (result.length != 0)
                                bot.sendMessage(msg.chat.id, result.toString());
                        }).catch(function(error) {
                            console.log(error.code);
                            bot.sendMessage(msg.chat.id, Errore);
                        });
                        bot.removeListener("message", handler2);
                    } else {
                        bot.sendMessage(msg.chat.id, ErroreCord);
                    }
                }
                bot.on('message', handler2);
            } else {
                bot.sendMessage(msg.chat.id, ErroreCord);
            }
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/position/, msg => {
    bot.sendMessage(msg.chat.id, SendPosition).then(() => {
        let handler = (msg) => {
            let lat = parseFloat(msg.location.latitude).toFixed(1);
            let lon = parseFloat(msg.location.longitude).toFixed(2);
            console.log(lat, lon);
            let json = new Array;
            bot.sendMessage(msg.chat.id, Searching).then(() => {
                amadeus.shopping.hotelOffers.get({
                    latitude: lat,
                    longitude: lon
                }).then(function(response) {
                    json.push(response.data);
                    return amadeus.next(response);
                }).then(function(nextResponse) {
                    if (json.nextResponse != null)
                        json.push(nextResponse.data);
                    let result = GetName(json);
                    if (result.length != 0)
                        bot.sendMessage(msg.chat.id, result.toString());
                }).catch(function(error) {
                    console.log(error);
                    bot.sendMessage(msg.chat.id, Errore);
                });
            });
            bot.removeListener("location", handler);
        };
        bot.on('location', handler);
    });
});

bot.onText(/\/sendPosition/, msg => {
    bot.sendMessage(msg.chat.id, Position);
    bot.sendVideo(msg.chat.id, './positionINFO.mp4');
});

bot.onText(/\/activities/, msg => {
    bot.sendMessage(msg.chat.id, SendC).then(() => {
        bot.sendMessage(msg.chat.id, "Inserire la latitudine");
        let handler = (msg) => {
            let lat = parseFloat(msg.text);
            if (CheckCoordinate(lat)) {
                bot.removeListener("message", handler);
                bot.sendMessage(msg.chat.id, "Inserire la longitudine");
                let handler2 = (msg2) => {
                    let lon = parseFloat(msg2.text);
                    if (CheckCoordinate(lon)) {
                        bot.sendMessage(msg.chat.id, SearchingAct);
                        let json = new Array;
                        amadeus.shopping.activities.get({
                            latitude: lon,
                            longitude: lat,
                            radius: 20
                        }).then(function(response) {
                            console.log(response.data);
                            json.push(response.data);
                            return amadeus.next(response);
                        }).then(function(nextResponse) {
                            if (nextResponse != null) {
                                json.push(nextResponse.data);
                                console.log(nextResponse.data);
                            }
                            let result = GetActivities(json);
                            if (result.length != 0)
                                bot.sendMessage(msg.chat.id, result.toString());
                        }).catch(function(error) {
                            console.log(error);
                            bot.sendMessage(msg.chat.id, ErroreA);
                        });
                        bot.removeListener("message", handler2);
                    } else {
                        bot.sendMessage(msg.chat.id, ErroreCord);
                    }
                }
                bot.on('message', handler2);
            } else {
                bot.sendMessage(msg.chat.id, ErroreCord);
            }
        }
        bot.on('message', handler);
    });


});

bot.onText(/\/CitySearch$/, msg => {
    bot.sendMessage(msg.chat.id, SearchCity).then(() => {
        let handler = (msg) => {
            let json = new Array;
            let start = msg.text.toString();
            bot.sendMessage(msg.chat.id, SearchingCity);
            amadeus.referenceData.locations.get({
                subType: "CITY",
                keyword: start
            }).then(function(response) {
                json.push(response.data);
                return amadeus.next(response);
            }).then(function(nextResponse) {
                if (json.nextResponse != null)
                    json.push(nextResponse.data);
                let result = GetCity(json);
                if (result.length != 0)
                    bot.sendMessage(msg.chat.id, result.toString());
            }).catch(function(error) {
                console.log(error.code);
                bot.sendMessage(msg.chat.id, ErroreC);
            });
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/CitySearchV2/, msg => {
    bot.sendMessage(msg.chat.id, SearchC).then(() => {
        let handler = (msg) => {
            let city = msg.text.toString();
            GetCityCoordinate(city, msg.chat.id)
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});

bot.onText(/\/test/, msg => {
    let json = new Array;
    amadeus.referenceData.locations.get({
        subType: "CITY",
        keyword: "Barcelona"
    }).then(function(response) {
        json.push(response.data);
        return amadeus.next(response);
    }).then(function(nextResponse) {
        if (json.nextResponse != null)
            json.push(nextResponse.data);
        let result = GetCity(json);
        if (result.length != 0)
            bot.sendMessage(msg.chat.id, result.toString());
    });
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
    let data = new String;
    //fs.writeFileSync("arr.json", JSON.stringify(json, null, 4));
    json.forEach(x => {
        x.forEach(y => {
            if (y.hotel.name != undefined) {
                data += y.hotel.name.toString() + " 🏨\n";
            }
            if (y.hotel.address.lines[0] != undefined) {
                data += y.hotel.address.lines[0] + " 🚄\n";
            }
            if (y.hotel.contact != undefined) {
                data += y.hotel.contact.phone + " 📱\n";
            }
            if (y.hotel.rating != undefined) {
                data += "Valutazione: " + y.hotel.rating + " ⭐\n";
            }
            data += "---------------------" + "\n";
        });
    });
    return data;
}

function GetActivities(json) {
    let data = new String;
    json.forEach(x => {
        x.forEach(y => {
            if (y.name != undefined) {
                data += y.name.toString() + " 🏃‍♂️\n";
            }
            if (y.bookingLink != undefined) {
                data += "Link: " + y.bookingLink + " 🔗\n";
            }
            if (y.price != undefined) {
                data += y.price.amount + "€ 💵\n";
            }
            if (y.rating != undefined) {
                data += "Valutazione: " + Math.round(y.rating).toString() + " ⭐\n";
            }
            data += "---------------------" + "\n";
        });
    });
    return data;
}

function GetCity(json) {
    let data = new String;
    json.forEach(x => {
        x.forEach(y => {
            if (y.name != undefined) {
                data += y.name.toString() + " 🏙️\n";
            }
            if (y.iataCode != undefined) {
                data += y.iataCode.toString() + " 🔢\n";
            }
            if (y.geoCode != undefined) {
                data += "Latitudine: " + y.geoCode.latitude.toString() + "🌐\nLongitudine: " + y.geoCode.longitude.toString() + "🌐\n";
            }
            data += "---------------------" + "\n";
        });
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
            if (json.nextResponse != null)
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

function GetCityCoordinate(city, id) {
    return Promise.resolve('a').then(async function() {
        let url = "http://localhost:9090/city?CityName=" + city;
        let arr = new Array;
        request(url, function(err, res, body) {
            let city = new String;
            arr = JSON.parse(body);
            arr.forEach(x => {
                if (x.city != null) {
                    city += x.city.toString() + " 🏙️\n";
                }
                if (x.country != null) {
                    city += x.country.toString() + " 🚩\n";
                }
                if (x.lat != null && x.lng != null) {
                    city += "Latitudine: " + x.lat.toString() + "🌐\nLongitudine: " + x.lng.toString() + "🌐\n";
                }
                city += "---------------------" + "\n";
            });
            if (arr.length != 0)
                bot.sendMessage(id, city.toString());
            else
                bot.sendMessage(id, ErroreC);
        });
    });
}