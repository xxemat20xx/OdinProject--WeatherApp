import icons from "./weatherIcons";
export class Weather {
    constructor(apiKey, baseUrl) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;

        // DOM Elements
        this.currentWeatherContainer = document.querySelector('.current-weather-display');
        this.humidityInfo = document.querySelector('.humidity-text');
        this.windSpeedInfo = document.querySelector('.windspeed-text');
        this.weatherCards = document.querySelector('#weather-cards');
        this.weatherDays = document.querySelector('.weather-15days-content table');
        this.dragContainer = document.querySelectorAll('.draggable-container');
        this.imgElement = document.querySelector('#weather-icon');
        this.currentFeelslike = document.querySelector('.current-feelslike-text');
        this.currentPressure = document.querySelector('.current-pressure-text');
        this.searchInput = document.querySelector('#search-input');
        this.searchButton = document.querySelector('#search-button');

        // icons
        this.iconMap = icons;

        // Drag container event listeners
        this.dragContainer.forEach(container => {
            let isDragging = false;
            let startX;
            let scrollLeft;

            container.addEventListener('mousedown', e => {
                isDragging = true;
                container.classList.add('dragging');
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            });
            container.addEventListener('mouseleave', () => {
                isDragging = false;
                container.classList.remove('dragging');
            });
            container.addEventListener('mouseup', () => {
                isDragging = false;
                container.classList.remove('dragging');
            });
            container.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2; // Adjust scroll speed
                container.scrollLeft = scrollLeft - walk;
            });

        });

        // Bind Event listener
        this.searchButton.addEventListener('click', this.searchHandler.bind(this));

        // init setup
        this.init();
    }

    async fetchWeatherData(location) {
        try {
            const response = await fetch(`${this.baseUrl}/${location}?unitGroup=metric&key=${this.apiKey}`);
            if (!response.ok) throw new Error('Failed to fetch');
            return response.json();
        } catch (error) {
            console.error(error);
            alert('Error fetching weather data. Please try again.');
        }
    }
    async init() {
        const defaultLocation = 'Manila';
        const weatherData = await this.fetchWeatherData(defaultLocation);
        const weatherAddress = weatherData.resolvedAddress;
        const weatherTemp = weatherData.currentConditions.temp;
        const weatherStats = weatherData.currentConditions.conditions;
        const weatherFeelsLike = weatherData.currentConditions.feelslike;
        const weatherDescription = weatherData.description;
        const weatherHumidText = weatherData.currentConditions.humidity;
        const weatherDew = weatherData.currentConditions.dew;
        const windSpeedText = weatherData.currentConditions.windspeed;
        const windGusText = weatherData.currentConditions.windgust;
        const windDirText = weatherData.currentConditions.winddir;
        const pressure = weatherData.currentConditions.pressure;
        const iconKey = weatherData.currentConditions.icon;
        const iconUrl = this.iconMap[iconKey] || './default-icon.png';
        if (weatherData) {
            this.displayCurrentStatus(weatherAddress, weatherTemp,
                iconUrl, weatherStats, weatherDescription); // render current city and temp headder
            this.renderWeatherHour(weatherData.days[0].hours) // render 24hrs weather
            this.renderWeatherDays(weatherData.days) // render 15days weather
            this.evalCurrentFeelsLike(weatherFeelsLike); // render feels like card
            this.renderHumidity(weatherHumidText, weatherDew); // render humidity info
            this.renderWindSpeed(windSpeedText, windGusText, windDirText); // render wind info
            this.renderPressure(pressure);
            console.log(weatherData) // for testing and accessing API Data's

        }
    }
    displayCurrentStatus(city, temp, icon, condition, description) {

        const currentWeather = document.createElement('div');
        currentWeather.className = 'currentWeatherDisplay'
        currentWeather.innerHTML = `
            <h1>${city}</h1>
            <div class="weather-currentText">
            <img src='${icon}' id='currentTempIcon'> 
            <h2 id="currentTemp">${temp}°C</h2>
            <h3>${condition}</h3>
            <sub>${description}</sub>
            </div>
        `;
        this.currentWeatherContainer.appendChild(currentWeather);

    }
    renderWeatherHour(hourlyData) {
        this.weatherCards.innerHTML = '';
        const now = new Date();

        hourlyData.slice(0, 24).forEach((hour, index) => {
            const card = document.createElement('div');
            card.className = 'weather-card';

            // card time for the next 24 hours, incremented by 2 hours
            const cardTime = new Date(now.getTime() + index * 60 * 60 * 2000);

            // Format time with AM/PM
            let time = cardTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                hour12: true
            });

            const temperature = `${hour.temp}°C`;
            const condition = `${hour.conditions}`;

            //icon key from the weather API data
            const iconKey = hour.icon;
            const iconUrl = this.iconMap[iconKey] || 'icons/default.png';
            if (index === 0) {
                time = 'Now';
            }
            card.innerHTML = `
                <h2>${time}</h2>
                <img src="${iconUrl}" alt="${condition}" />
                <span>${condition}</span>
                <h3>${temperature}</h3>
                
            `;
            this.weatherCards.appendChild(card);
        });
    }
    // render 15 days weather
    renderWeatherDays(days) {
        this.weatherDays.innerHTML = '';
        days.slice(0, 15).forEach((day, index) => {
            const table = document.createElement('tr');
            // card.className = 'weather-card';

            const date = new Date(day.datetime);
            let dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

            if (index === 0) {
                dayName = 'Today';
            }

            const temp = `${day.temp}°C`;
            const condition = day.conditions;
            const iconKey = day.icon;
            const iconUrl = this.iconMap[iconKey] || 'icons/default.png';

            table.innerHTML = `
                                    <tbody>
                                    <tr>
                                        <td>${dayName}</td>
                                        <td>${condition}</td>
                                        <td><img src="${iconUrl}"></td>
                                        <td>${temp}</td>
                                       
                                    </tr>
                                    </tbody>
            `;
            this.weatherDays.appendChild(table);
        });
    }
    // Render current feels like
    evalCurrentFeelsLike(feelsLikeTemp) {
        this.currentFeelslike.innerHTML = '';
        const feelsLikeDetails = document.createElement('div');
        const difference = feelsLikeTemp;
        feelsLikeDetails.className = 'feels-like-text';
        feelsLikeDetails.innerHTML = `
            <h1>
                ${feelsLikeTemp} °C
            </h1>
            <p>
                ${difference <= -10 ? "Freezing! Stay indoors and bundle up!" : ""}
                ${difference < 0 ? "Chilly! Wear a jacket or sweater." : ""}
                ${difference === 0 ? "Perfect! Ideal weather conditions!" : ""}
                ${difference > 0 && difference <= 5 ? "Comfortable! This is a pleasant and mild day" : ""}
                ${difference > 20 && difference <= 27 ? "Comfortable! This is a pleasant and mild day" : ""}
                ${difference > 27 && difference <= 32 ? "Warm! This is typical for the Philippines. Stay hydrated and wear light clothing." : ""}
                ${difference > 32 && difference <= 37 ? "Hot! It's a scorching day. Avoid outdoor activities during midday and drink plenty of water." : ""}
                ${difference > 37 ? "🥵 Extreme Heat! Heat levels are dangerous. Stay indoors, use fans or air conditioning, and keep hydrated!" : ""}
            </p>
        `;
        this.currentFeelslike.appendChild(feelsLikeDetails);
        console.log(difference)
    }
    // render humidity
    renderHumidity(humidity, dew) {
        this.humidityInfo.innerHTML = '';
        const humidText = document.createElement('div');
        humidText.innerHTML = `<h1>${humidity}%</h1>
                                <span>The dew point is ${dew}° right now.</span>`;
        this.humidityInfo.appendChild(humidText);
    }
    // render windspeed
    renderWindSpeed(windSpeed, windGus, winDir) {
        this.windSpeedInfo.innerHTML = '';
        const windSpeedText = document.createElement('div');
        windSpeedText.innerHTML = `<p><strong> Wind:</strong> ${windSpeed} km\h</p>
                                   <p><strong> Gusts:</strong> ${windGus} km\h</p>
                                   <p><strong> Direction: </strong>${winDir} km\h</p>
        `;
        this.windSpeedInfo.appendChild(windSpeedText);
    }
    renderPressure(pressure) {
        this.currentPressure.innerHTML = '';
        this.currentPressure.innerHTML = `<h3>${pressure} hPA</h3>`
    }

    async searchHandler() {
        try {
            this.currentWeatherContainer.innerHTML = "";
            const inputLoc = this.searchInput.value.trim();
            if (!inputLoc) {
                alert('Please enter a location...')
                return;
            }
            const weatherData = await this.fetchWeatherData(inputLoc);
            const weatherAddress = weatherData.resolvedAddress;
            const weatherTemp = weatherData.currentConditions.temp;
            const weatherStats = weatherData.currentConditions.conditions;
            const weatherDescription = weatherData.description;
            const weatherFeelsLike = weatherData.currentConditions.feelslike;
            const weatherHumidText = weatherData.currentConditions.humidity;
            const windSpeedText = weatherData.currentConditions.windspeed;
            const windGusText = weatherData.currentConditions.windgust;
            const weatherDew = weatherData.currentConditions.dew;
            const windDirText = weatherData.currentConditions.winddir;
            const pressure = weatherData.currentConditions.pressure;
            const iconKey = weatherData.currentConditions.icon;
            const iconUrl = this.iconMap[iconKey]
            if (weatherData) {

                this.displayCurrentStatus(weatherAddress, weatherTemp, iconUrl, weatherStats, weatherDescription);
                this.renderWeatherHour(weatherData.days[0].hours);
                this.renderWeatherDays(weatherData.days)
                this.evalCurrentFeelsLike(weatherFeelsLike);
                this.renderHumidity(weatherHumidText, weatherDew); // render humidity info
                this.renderWindSpeed(windSpeedText, windGusText, windDirText); // render wind info
                this.renderPressure(pressure)
                console.log(weatherData)
            }
            return this;
        } catch (error) {
            return console.error(error)
        }
    }
}
const apiKey = process.env.API_KEY;
const baseUrl = process.env.BASE_URL;
const weatherApp = new Weather(apiKey, baseUrl);

