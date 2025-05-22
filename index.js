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
app.use(bodyParser.json({ limit: "50mb" })); // Increase limit for larger base64 images

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
        // Check payload size
        const payloadSize = JSON.stringify(data).length;
        console.log(`📦 Request payload size: ${(payloadSize / 1024 / 1024).toFixed(2)} MB`);

        if (payloadSize > 20 * 1024 * 1024) {
            console.error("❌ Payload too large");
            return res.status(413).send("Payload too large");
        }

        // Check if we already have base64 data from the frontend
        let spotontrackImageBase64 = data.spotontrack_image_base64;
        let mediaforestImageBase64 = data.mediaforest_image_base64;
        let tiktokCsvBase64 = data.tiktok_csv_base64;
        let testImageBase64 = data.test_image_base64;
        
        // Debug information
        console.log({
            "spotontractBase64Length": spotontrackImageBase64?.length || 0,
            "mediaforestBase64Length": mediaforestImageBase64?.length || 0,
            "testImageBase64Length": testImageBase64?.length || 0,
            "tiktokCsvBase64Length": tiktokCsvBase64?.length || 0
        });
        
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

        // If test image wasn't provided, use a known working base64 image
        if (!testImageBase64) {
            console.log("🔍 No test image, using default");
            // This is a tiny red dot image
            testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==";
        }

        // Log image data lengths to help with debugging
        console.log(`📊 Spotontrack image data length: ${spotontrackImageBase64?.length || 0}`);
        console.log(`📊 Mediaforest image data length: ${mediaforestImageBase64?.length || 0}`);
        console.log(`📊 TikTok CSV data length: ${tiktokCsvBase64?.length || 0}`);
        console.log(`📊 Test image data length: ${testImageBase64?.length || 0}`);

        // Check if base64 data starts with data:image prefix and remove it if needed
        const cleanBase64 = (base64Data) => {
            if (base64Data && base64Data.startsWith('data:image')) {
                console.log("🔍 Found data:image prefix, cleaning...");
                return base64Data.split(',')[1];
            }
            return base64Data;
        };

        spotontrackImageBase64 = cleanBase64(spotontrackImageBase64);
        mediaforestImageBase64 = cleanBase64(mediaforestImageBase64);
        testImageBase64 = cleanBase64(testImageBase64);

        // Send the email
        await sendEmail({
            ...data,
            spotontrack_image_base64: spotontrackImageBase64 || "",
            mediaforest_image_base64: mediaforestImageBase64 || "",
            tiktok_csv_base64: tiktokCsvBase64 || "",
            test_image_base64: testImageBase64 || "",
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
        res.status(500).send("Fail: " + err.message);
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Email backend running on port ${PORT}`);
});
