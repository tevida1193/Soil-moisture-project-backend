const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 3000;
app.use(express.json());

// Array to store moisture history [{ moisture: 40, timestamp: "12:30" }]
let moistureHistory = [];

// --- ROUTE 1: ESP32 sends data here ---
app.post('/api/moisture', (req, res) => {
    const { sensor_id, moisture } = req.body;

    if (moisture === undefined) {
        return res.status(400).json({ error: "Missing moisture value." });
    }

    const newReading = {
        moisture: Number(moisture),
        timestamp: new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
    };

    // Add to history
    moistureHistory.push(newReading);

    // Keep memory clean: cap history at last 100 readings
    if (moistureHistory.length > 100) {
        moistureHistory.shift();
    }

    console.log(`[DATA] Received: ${moisture}%`);
    res.status(200).json({ status: "Success" });
});

// --- ROUTE 2: API Endpoint for your Frontend to fetch the data array ---
app.get('/api/data', (req, res) => {
    res.json(moistureHistory);
});

// --- ROUTE 3: Serves your custom HTML frontend page ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
