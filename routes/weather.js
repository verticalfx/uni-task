const request = require('request')
// Create a new router
const express = require("express")
const {
    route
} = require('./books')
const router = express.Router()

// Handle our routes
router.get('/londonnow', function (req, res, next) {
    let apiKey = "c0d22790379b280b2322fe9e630d9d37"
    let city = 'london'
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`


    request(url, function (err, response, body) {
        if (err) {
            next(err)
        } else {
            var weather = JSON.parse(body)
            // console.log(weather)
            // var wmsg = 'It is ' + weather.main.temp +
            //     ' degrees in ' + weather.name +
            //     '! <br> The humidity now is: ' +
            //     weather.main.humidity;
            // res.send(wmsg);
            res.send(weather)
        }
    });
})

router.get('/weather', function (req, res, next) {
    res.render('weather.ejs')
})

router.post('/weather', function (req, res, next) {

    let city = req.sanitize(req.body.city);
    let apiKey = "c0d22790379b280b2322fe9e630d9d37";
    let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    request(url, function (err, response, body) {
        if (err) {
            return next(err);
        }

        try {
            const weather = JSON.parse(body);
            console.log(weather);
            if (weather !== undefined && weather.main !== undefined) {
                const sunrise = new Date(weather.sys.sunrise * 1000).toLocaleTimeString();
                const sunset = new Date(weather.sys.sunset * 1000).toLocaleTimeString();

                const weatherMessage = `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <h2 style="color: #4A90E2;">Weather in ${weather.name}</h2>
                    <p><strong>Description:</strong> ${weather.weather[0].description}</p>
                    <p><strong>Temperature:</strong> ${weather.main.temp}°C (feels like ${weather.main.feels_like}°C)</p>
                    <p><strong>Humidity:</strong> ${weather.main.humidity}%</p>
                    <p><strong>Wind:</strong> ${weather.wind.speed} m/s, direction ${weather.wind.deg}°</p>
                    <p><strong>Cloudiness:</strong> ${weather.clouds.all}%</p>
                    <p><strong>Sunrise:</strong> ${sunrise}</p>
                    <p><strong>Sunset:</strong> ${sunset}</p>
                </div>
            `;

                res.send(weatherMessage);
            } else {
                res.send("No data found");
            }
        } catch (error) {
            next(error);
        }
    });
});



// Export the router object so index.js can access it
module.exports = router