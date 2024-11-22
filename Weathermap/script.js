const API_KEY = "bd5e378503939ddaee76f12ad7a97608";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";
let weatherChart = null;
document.getElementById("searchButton").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    if (city) {
        fetchWeatherData(city);
    }
});

function fetchWeatherData(city) {
    const url = `${BASE_URL}weather?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then((response) => {
            if (!response.ok) throw new Error("City not found");
            return response.json();
        })
        .then((data) => {
            displayWeatherDetails(data);
            fetchForecast(city);
        })
        .catch((error) => {
            alert(error.message);
        });
}

function fetchForecast(city) {
    const url = `${BASE_URL}forecast?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            displayChart(data);
            displayWeeklyWeather(data);
        });
}

function displayWeatherDetails(data) {
    const details = `
        <h2>${data.name}</h2>
        <p>Temperature: ${data.main.temp}°C</p>
        <p>Weather: ${data.weather[0].description}</p>
    `;
    document.getElementById("weatherDetails").innerHTML = details;
}

function displayChart(data) {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    const dailyData = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
    const labels = dailyData.map((item) =>
        new Date(item.dt_txt).toLocaleDateString("en-us", {
            weekday: "short",
            month: "short",
            day: "numeric",
        })
    );
    const temps = dailyData.map((item) => item.main.temp);
    if (weatherChart) {
        weatherChart.destroy();
    }
    weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Temperature (°C)",
                    data: temps,
                    borderColor: "blue",
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
            },
        },
    });
}

function displayWeeklyWeather(data) {
    const forecastContainer = document.getElementById("weeklyWeather");
    const dailyData = data.list.filter((item) => item.dt_txt.includes("12:00:00"));
    forecastContainer.innerHTML = '';
    dailyData.forEach(item => {
        const date = new Date(item.dt_txt);
        const dayOfWeek = date.toLocaleString('en-us', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString();

        const weatherDescription = item.weather[0].description;
        const iconId = item.weather[0].icon;
        const iconURL = `http://openweathermap.org/img/wn/${iconId}.png`;

        const weatherHTML = `
            <div class="weather-day">
                <p><strong>${dayOfWeek}</strong></p>
                <p>${formattedDate}</p>
                <img src="${iconURL}" alt="${weatherDescription}" />
                <p>${weatherDescription}</p>
                <p>Temp: ${item.main.temp}°C</p>
            </div>
        `;
        forecastContainer.innerHTML += weatherHTML;
    });
}
