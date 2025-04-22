// emailer/index.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const { uploadToImgur } = require("./uploadToImgur");
const { sendEmail } = require("./sendEmail");

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));

app.post("/send-report", async (req, res) => {
    const data = req.body;

    try {
        // Upload images + CSV
        const spotonImg = await uploadToImgur(data.spotontrack_image_base64);
        const mediaforestImg = await uploadToImgur(data.mediaforest_image_base64);
        const fs = require("fs");
        const path = require("path");

        const sanitizedSong = data.song_name.replace(/\s+/g, "_");
        const sanitizedArtist = data.artist.replace(/\s+/g, "_");
        const csvPath = path.join("C:/Users/dumit/Desktop/Records Scrapers", `${sanitizedSong}_${sanitizedArtist}_tiktok.csv`);
        const tiktokCsvBase64 = fs.existsSync(csvPath)
            ? fs.readFileSync(csvPath, { encoding: "base64" })
            : "";


        await sendEmail({
            ...data,
            spotontrack_image_url: spotonImg,
            mediaforest_image_url: mediaforestImg,
            tiktok_csv_url: tiktokCsvBase64
        });

        res.json({ status: "ok" });
    } catch (err) {
        console.error("Eroare la procesarea emailului:", err);
        res.status(500).send("Fail");
    }
});

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Email backend running on http://localhost:${PORT}`);
});
