const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const { sendEmail } = require("./sendEmail");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

// Funcție ca să descarci un fișier și să-l convertești în Base64
async function urlToBase64(url) {
    try {
        const response = await fetch(url);
        const buffer = await response.buffer();
        return buffer.toString("base64");
    } catch (error) {
        console.error(`❌ Failed to fetch from ${url}:`, error.message);
        return "";
    }
}

app.post("/send-report", async (req, res) => {
    const data = req.body;

    try {
        // Pregătim linkurile directe
        const sanitizedSong = data.song_name.replace(/\s+/g, "_");
        const sanitizedArtist = data.artist.replace(/\s+/g, "_");

        const spotontrackImageUrl = `https://expresserverjs.onrender.com/images/${sanitizedSong}_${sanitizedArtist}_spotontrack_spotify.png`;
        const mediaforestImageUrl = `https://expresserverjs.onrender.com/images/${sanitizedSong}_${sanitizedArtist}_mediaforest.png`;
        const csvUrl = `https://expresserverjs.onrender.com/download?song=${encodeURIComponent(data.song_name)}&artist=${encodeURIComponent(data.artist)}`;

        // Convertim imaginile și CSV-ul în base64
        const spotontrackImageBase64 = await urlToBase64(spotontrackImageUrl);
        const mediaforestImageBase64 = await urlToBase64(mediaforestImageUrl);
        const tiktokCsvBase64 = await urlToBase64(csvUrl);

        // Trimitem emailul
        await sendEmail({
            ...data,
            spotontrack_image_base64: spotontrackImageBase64,
            mediaforest_image_base64: mediaforestImageBase64,
            tiktok_csv_base64: tiktokCsvBase64,
        });

        res.json({ status: "ok" });
    } catch (err) {
        console.error("Eroare la procesarea emailului:", err.message);
        res.status(500).send("Fail");
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Email backend running on port ${PORT}`);
});
