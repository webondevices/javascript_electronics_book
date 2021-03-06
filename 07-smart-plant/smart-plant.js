const five = require("johnny-five");
const Twit = require("twit");

// ADD IN YOUR DETAILS HERE
const T = new Twit({
    consumer_key: "consumer_key_here",
    consumer_secret: "consumer_secret_here",
    access_token: "access_token_here",
    access_token_secret: "access_token_secret_here"
});

// ADD IN YOUR DETAILS HERE
const Twilio = require("twilio")("account_sid_here", "auth_token_here");

const arduino = new five.Board();

let celsius = 0;
let light = 0;
let moisture = 0;

const sentAlertThisPeriod = {
    temperature: false,
    light: false,
    moisture: false
};

function sendAlert(message, type) {

    // Text message
    // ADD IN YOUR DETAILS HERE
    Twilio.messages.create({
        to: "a-verified-phone-number",
        from: "your-special-twilio-phone-number",
        body: message

        // Handle error messages
    }, error => {
        console.log(error ? JSON.stringify(error) : "SMS sent!");
    });


    // Tweet message
    T.post("statuses/update", {
        status: message

        // Handle error messages
    }, error => {
        console.log(error ? JSON.stringify(error) : "Tweet sent!");
    });

    // Disable alerts for the sensor type
    sentAlertThisPeriod[type] = true;

    // Enable alerts after timeout
    setTimeout(() => {
        sentAlertThisPeriod[type] = false;
    }, 60 * 60 * 1000);
}

arduino.on("ready", function () {

    const thermometer = new five.Thermometer({
        controller: "LM35",
        pin: "A0",
        freq: 1000
    });

    const lightSensor = new five.Sensor({
        pin: "A1",
        freq: 1000
    });

    const moistureSensor = new five.Sensor({
        pin: "A2",
        freq: 1000
    });

    thermometer.on("data", function () {
        celsius = this.celsius;

        console.log(`Temperature: ${celsius}`);

        // If no alert was sent this hour
        if (!sentAlertThisPeriod.temperature) {
            if (celsius > 25) sendAlert(`It's really hot in here: ${celsius}°C`, "temperature");
            if (celsius < 15) sendAlert(`It's freezing cold in here: ${celsius}°C`, "temperature");
        }
    });

    lightSensor.on("change", function () {
        const now = new Date();
        const currentHour = now.getHours();

        // Convert to percentage
        light = (this.value / 1024) * 100;

        console.log(`Light: ${light}`);

        // If no alert was sent this hour
        // And time is between 6am and 8pm to prevent alerts at night
        if (!sentAlertThisPeriod.light && currentHour < 20 && currentHour > 6) {
            if (light < 40) sendAlert(`It's way too dark in here: ${light}%`, "light");
        }
    });

    moistureSensor.on("change", function () {
        // Convert to percentage and invert
        moisture = ((1024 - this.value) / 1024) * 100;

        console.log(`Moisture: ${moisture}`);

        // If no alert was sent this hour
        if (!sentAlertThisPeriod.moisture) {
            if (moisture < 25) sendAlert(`Water me please! My soil is really dry: ${moisture}%`, "Moisture");
        }
    });
});
