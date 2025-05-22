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

app.post("/send-report", async (req, res) => {
    const data = req.body;
    console.log("📬 Received email report request");

    try {
        // Check if direct URLs are provided
        const spotontrackDirectUrl = data.spotontrack_direct_url;
        const mediaforestDirectUrl = data.mediaforest_direct_url;
        const tiktokCsvDirectUrl = data.tiktok_csv_direct_url;
        
        // Debug information
        console.log({
            "spotontrackUrl": spotontrackDirectUrl || "missing",
            "mediaforestUrl": mediaforestDirectUrl || "missing",
            "tiktokCsvUrl": tiktokCsvDirectUrl || "missing"
        });
        
        // Generate URLs if not provided
        const sanitizedSong = data.song_name.replace(/\s+/g, "_");
        const sanitizedArtist = data.artist.replace(/\s+/g, "_");

        const finalSpotontrackUrl = spotontrackDirectUrl || 
            `https://expresserverjs.onrender.com/images/${sanitizedSong}_${sanitizedArtist}_spotontrack_spotify.png`;
        
        const finalMediaforestUrl = mediaforestDirectUrl || 
            `https://expresserverjs.onrender.com/images/${sanitizedSong}_${sanitizedArtist}_mediaforest.png`;
        
        const finalTiktokCsvUrl = tiktokCsvDirectUrl || 
            `https://expresserverjs.onrender.com/download?song=${encodeURIComponent(data.song_name)}&artist=${encodeURIComponent(data.artist)}`;

        // Verify that the URLs are accessible
        async function checkUrl(url) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                return response.ok;
            } catch (error) {
                console.error(`❌ Could not reach URL: ${url}`, error.message);
                return false;
            }
        }

        const spotontrackOk = await checkUrl(finalSpotontrackUrl);
        const mediaforestOk = await checkUrl(finalMediaforestUrl);
        
        if (!spotontrackOk || !mediaforestOk) {
            console.warn("⚠️ Some image URLs are not accessible:");
            console.warn(`- Spotontrack URL: ${finalSpotontrackUrl} - ${spotontrackOk ? 'OK' : 'Not accessible'}`);
            console.warn(`- Mediaforest URL: ${finalMediaforestUrl} - ${mediaforestOk ? 'OK' : 'Not accessible'}`);
        }

        // Send the email with the direct URLs
        await sendEmail({
            ...data,
            spotontrack_direct_url: finalSpotontrackUrl,
            mediaforest_direct_url: finalMediaforestUrl,
            tiktok_csv_direct_url: finalTiktokCsvUrl
        });

        console.log("✅ Email sent successfully with direct image URLs");
        res.json({ status: "ok" });
    } catch (err) {
        console.error("❌ Error processing email:", err.message);
        res.status(500).send("Fail: " + err.message);
    }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Email backend running on port ${PORT}`);
});
