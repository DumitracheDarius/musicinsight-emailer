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
    console.log("📬 Received email report request");

    try {
        // Check if we already have base64 data from the frontend
        let spotontrackImageBase64 = data.spotontrack_image_base64;
        let mediaforestImageBase64 = data.mediaforest_image_base64;
        let tiktokCsvBase64 = data.tiktok_csv_base64;
        
        // Only fetch images if the frontend didn't provide base64 data
        if (!spotontrackImageBase64 || !mediaforestImageBase64 || !tiktokCsvBase64) {
            console.log("🔍 Some images missing, fetching from server...");
            
            // Prepare direct URLs as fallback
            const sanitizedSong = data.song_name.replace(/\s+/g, "_");
            const sanitizedArtist = data.artist.replace(/\s+/g, "_");
            
            // Only fetch what's missing
            if (!spotontrackImageBase64) {
                const spotontrackImageUrl = `https://expresserverjs.onrender.com/images/${sanitizedSong}_${sanitizedArtist}_spotontrack_spotify.png`;
                console.log(`📥 Fetching Spotontrack image from: ${spotontrackImageUrl}`);
                spotontrackImageBase64 = await urlToBase64(spotontrackImageUrl);
            }
            
            if (!mediaforestImageBase64) {
                const mediaforestImageUrl = `https://expresserverjs.onrender.com/images/${sanitizedSong}_${sanitizedArtist}_mediaforest.png`;
                console.log(`📥 Fetching Mediaforest image from: ${mediaforestImageUrl}`);
                mediaforestImageBase64 = await urlToBase64(mediaforestImageUrl);
            }
            
            if (!tiktokCsvBase64) {
                const csvUrl = `https://expresserverjs.onrender.com/download?song=${encodeURIComponent(data.song_name)}&artist=${encodeURIComponent(data.artist)}`;
                console.log(`📥 Fetching TikTok CSV from: ${csvUrl}`);
                tiktokCsvBase64 = await urlToBase64(csvUrl);
            }
        } else {
            console.log("✅ Using base64 image data provided by frontend");
        }

        // Log image data lengths to help with debugging
        console.log(`📊 Spotontrack image data length: ${spotontrackImageBase64?.length || 0}`);
        console.log(`📊 Mediaforest image data length: ${mediaforestImageBase64?.length || 0}`);
        console.log(`📊 TikTok CSV data length: ${tiktokCsvBase64?.length || 0}`);

        // Send the email
        await sendEmail({
            ...data,
            spotontrack_image_base64: spotontrackImageBase64 || "",
            mediaforest_image_base64: mediaforestImageBase64 || "",
            tiktok_csv_base64: tiktokCsvBase64 || "",
            // Extract TikTok lifetime statistics and add them explicitly
            totalTikTokVideos: data.totalTikTokVideos || "-",
            totalTikTokViews: data.totalTikTokViews || "-",
            totalTikTokLikes: data.totalTikTokLikes || "-",
            totalTikTokComments: data.totalTikTokComments || "-", 
            totalTikTokShares: data.totalTikTokShares || "-"
        });

        console.log("✅ Email sent successfully");
        res.json({ status: "ok" });
    } catch (err) {
        console.error("❌ Eroare la procesarea emailului:", err.message);
        res.status(500).send("Fail");
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Email backend running on port ${PORT}`);
});
