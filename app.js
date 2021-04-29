process.env.NTBA_FIX_319 = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';
const bot = new TelegramBot(token, { polling: true });
const db = require('better-sqlite3')('./TravelBot.db', { verbose: console.log });
const express = require('express');
const ejs = require('ejs');
const fs = require("fs");
var cities = new Array;

//#region Default message
var WelcomeMsg, HelpMsg, View, Position, Send, SendC, Search, SearchC, SearchCity, Searching, SearchingAct, SearchingCity, SendPosition, Errore, ErroreC, ErroreA, ErroreCord, ErroreIata;
//#endregion
GetMsg();
//#region API
var Amadeus = require('amadeus');
const { default: booking } = require('amadeus/lib/amadeus/namespaces/booking');
var amadeus = new Amadeus({
    clientId: 'mhxawUm5tmcun1zoSB9kq9mk1YIIzCsV',
    clientSecret: 'dnFHZ9Lh7UYvrROT'
});
//#endregion

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
    })
    .post("/", function(req, res) {
        ResetMsg();
        res.redirect("/");
    });

app.post("/message", function(req, res) {
    if (req.body.WelcomeMsg) {
        let q1 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='WelcomeMsg'");
        q1.run(req.body.WelcomeMsg.toString());
    }
    if (req.body.HelpMsg) {
        let q2 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='HelpMsg'");
        q2.run(req.body.HelpMsg.toString());
    }
    if (req.body.View) {
        let q3 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='View'");
        q3.run(req.body.View.toString());
    }
    if (req.body.Position) {
        let q4 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='Position'");
        q4.run(req.body.Position.toString());
    }
    if (req.body.Send) {
        let q5 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='Send'");
        q5.run(req.body.Send.toString());
    }
    if (req.body.SendC) {
        let q6 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='SendC'");
        q6.run(req.body.SendC.toString());
    }
    if (req.body.Search) {
        let q7 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='Search'");
        q7.run(req.body.Search.toString());
    }
    if (req.body.SearchC) {
        let q8 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='SearchC'");
        q8.run(req.body.SearchC.toString());
    }
    if (req.body.SearchCity) {
        let q9 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='SearchCity'");
        q9.run(req.body.SearchCity.toString());
    }
    if (req.body.Searching) {
        let q10 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='Searching'");
        q10.run(req.body.Searching.toString());
    }
    if (req.body.SearchingAct) {
        let q11 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='SearchingAct'");
        q11.run(req.body.SearchingAct.toString());
    }
    if (req.body.SearchingCity) {
        let q12 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='SearchingCity'");
        q12.run(req.body.SearchingCity.toString());
    }
    if (req.body.SendPosition) {
        let q13 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='SendPosition'");
        q13.run(req.body.SendPosition.toString());
    }
    if (req.body.Errore) {
        let q14 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='Errore'");
        q14.run(req.body.Errore.toString());
    }
    if (req.body.ErroreC) {
        let q15 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='ErroreC'");
        q15.run(req.body.ErroreC.toString());
    }
    if (req.body.ErroreA) {
        let q16 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='ErroreA'");
        q16.run(req.body.ErroreA.toString());
    }
    if (req.body.ErroreCord) {
        let q17 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='ErroreCord'");
        q17.run(req.body.ErroreCord.toString());
    }
    if (req.body.ErroreIata) {
        let q18 = db.prepare("UPDATE Message SET Msg = ? WHERE Nome='ErroreIata'");
        q18.run(req.body.ErroreIata.toString());
    }
    GetMsg();
    res.redirect("/");
});
app.listen(port, () => console.log(`WebInterface on port ${port}`));
//#endregion

//#region command
bot.onText(/\/start$/, msg => {
    bot.sendMessage(msg.chat.id, WelcomeMsg + msg.from.first_name);
});

bot.onText(/\/help$/, msg => {
    bot.sendMessage(msg.chat.id, HelpMsg);
});

bot.onText(/\/dataset$/, msg => {
    bot.sendMessage(msg.chat.id, View);
    bot.sendDocument(msg.chat.id, './Dataset.txt');
});

bot.onText(/\/iataSearch$/, msg => {
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

bot.onText(/\/coordinatesearch$/, msg => {
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

bot.onText(/\/positionsearch$/, msg => {
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

bot.onText(/\/sendposition$/, msg => {
    bot.sendMessage(msg.chat.id, Position);
    bot.sendVideo(msg.chat.id, './positionINFO.mp4');
});

bot.onText(/\/activitiesearch$/, msg => {
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

bot.onText(/\/activitiespositionsearch$/, msg => {
    bot.sendMessage(msg.chat.id, SendPosition).then(() => {
        let handler = (msg) => {
            let lat = parseFloat(msg.location.latitude).toFixed(1);
            let lon = parseFloat(msg.location.longitude).toFixed(2);
            console.log(lat, lon);
            let json = new Array;
            bot.sendMessage(msg.chat.id, SearchingAct).then(() => {
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
            });
            bot.removeListener("location", handler);
        };
        bot.on('location', handler);
    });
});

bot.onText(/\/codesearch$/, msg => {
    bot.sendMessage(msg.chat.id, Search).then(() => {
        let handler = (msg) => {
            const row = db.prepare('SELECT * FROM CityCode WHERE CityCode.City LIKE ?').all(msg.text.toString());
            let ans = "";
            if (row.length != 0) {
                row.forEach(x => {
                    if (x.City != undefined) {
                        ans += x.City.toString() + " 🏙️\n";
                    }
                    if (x.Code != undefined) {
                        ans += x.Code.toString() + " 🔢\n";
                    }
                    ans += "---------------------" + "\n";
                });
                bot.sendMessage(msg.chat.id, ans);
            } else
                bot.sendMessage(msg.chat.id, "Nessuna città trovata");
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
    bot.sendMessage(msg.chat.id, "Puoi controllare il tuo codice qui: https://www.iata.org/en/publications/directories/code-search/");
});

bot.onText(/\/apisearch$/, msg => {
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

bot.onText(/\/coordinatesearch$/, msg => {
    bot.sendMessage(msg.chat.id, SearchC).then(() => {
        let handler = (msg) => {
            let city = msg.text.toString();
            GetCityCoordinate(city, msg.chat.id)
            bot.removeListener("message", handler);
        }
        bot.on('message', handler);
    });
});
//#endregion

//#region function
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

function GetCityCoordinate(cityName, id) {
    let cities = readJson();
    let str = cityName.toString().toLowerCase();
    let arr = cities.filter(x => x.city.toLowerCase() == str);
    let city = new String;
    if (arr.length != 0) {
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
        bot.sendMessage(id, city.toString());
    } else
        bot.sendMessage(id, ErroreC);
}

function readJson() {
    try {
        let rawdata = fs.readFileSync('./worldcities.json');
        cities = JSON.parse(rawdata);
    } catch (err) {
        console.log(err);
    }
    return cities;
}

function GetMsg() {
    const row = db.prepare('SELECT Msg FROM Message').all();
    if (row.length != 0) {
        WelcomeMsg = row[0].Msg;
        HelpMsg = row[1].Msg;
        View = row[2].Msg;
        Position = row[3].Msg;
        Send = row[4].Msg;
        SendC = row[5].Msg;
        Search = row[6].Msg;
        SearchC = row[7].Msg;
        SearchCity = row[8].Msg;
        Searching = row[9].Msg;
        SearchingAct = row[10].Msg;
        SearchingCity = row[11].Msg;
        SendPosition = row[12].Msg;
        Errore = row[13].Msg;
        ErroreC = row[14].Msg;
        ErroreA = row[15].Msg;
        ErroreCord = row[16].Msg;
        ErroreIata = row[17].Msg;
    }
}

function ResetMsg() {
    const row = db.prepare('SELECT Msg FROM MessageBackup').all();
    if (row.length != 0) {
        WelcomeMsg = row[0].Msg;
        HelpMsg = row[1].Msg;
        View = row[2].Msg;
        Position = row[3].Msg;
        Send = row[4].Msg;
        SendC = row[5].Msg;
        Search = row[6].Msg;
        SearchC = row[7].Msg;
        SearchCity = row[8].Msg;
        Searching = row[9].Msg;
        SearchingAct = row[10].Msg;
        SearchingCity = row[11].Msg;
        SendPosition = row[12].Msg;
        Errore = row[13].Msg;
        ErroreC = row[14].Msg;
        ErroreA = row[15].Msg;
        ErroreCord = row[16].Msg;
        ErroreIata = row[17].Msg;
    }
    const reset = db.prepare('INSERT INTO Message SELECT * FROM MessageBackup');
    reset.run();
}
//#endregion