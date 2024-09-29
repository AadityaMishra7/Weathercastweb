const express = require('express');
const https = require('https');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index', { weather: null });
});

app.get('/get-weather', (req, res) => {
    const cityName = req.query.city;
    const apiKey = "767654676dffcc3e94230d7283ee15e3";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`;

    https.get(url, (response) => {
        let dataChunks = []; // Initialize an array to store data chunks

        response.on("data", (chunk) => {
            dataChunks.push(chunk); // Collect the chunks
        });

        response.on("end", () => {
            try {
                const data = Buffer.concat(dataChunks); // Concatenate the chunks
                const weatherData = JSON.parse(data); // Parse the concatenated buffer

                if (weatherData.cod !== 200) {
                    // Handle API errors
                    console.error(`API error: ${weatherData.message}`);
                    return res.render('index', { weather: null });
                }

                const weather = {
                    location: weatherData.name,
                    temperature: weatherData.main.temp,
                    humidity: weatherData.main.humidity,
                    description: weatherData.weather[0].description
                };

                res.render('index', { weather: weather });
            } catch (error) {
                console.error(`Error parsing weather data: ${error.message}`);
                res.render('index', { weather: null });
            }
        });

    }).on('error', (e) => {
        console.error(`Got error: ${e.message}`);
        res.render('index', { weather: null });
    });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
