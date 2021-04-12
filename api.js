const express = require('express');
const app = express();
const PORT = process.env.PORT || 9090;
const HOSTNAME = process.env.HOST || 'localhost';
const fs = require('fs');
var cities = new Array;
var city = new Array;

StartJson();

app.route('/city')
    .get(function(req, res) {
        if (req.query.CityName) {
            let str = req.query.CityName.toString().toLowerCase();
            let arr = cities.filter(x => x.city.toLowerCase() == str);
            arr.forEach(x => {
                city.push({
                    "city": x.city,
                    "country": x.country,
                    "lat": x.lat,
                    "lng": x.lng
                });
            });
            res.send(city);
        } else
            res.send("Elemento non trovato!");
    });

function StartJson() {
    try {
        let rawdata = fs.readFileSync('./worldcities.json');
        cities = JSON.parse(rawdata);
    } catch (err) {
        console.log(err);
    }

}

app.listen(PORT, HOSTNAME, function() {
    console.log("Server attivo sull'Hostname " + HOSTNAME);
    console.log('Server attivo sulla porta ' + PORT);
});