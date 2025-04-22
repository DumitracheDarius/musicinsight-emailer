const axios = require("axios");

async function uploadToImgur(base64, mimeType = "image/png") {
    if (!base64 || base64.trim() === "") {
        console.warn("Empty base64 received for uploadToImgur");
        return ""; // Sau returnează un URL fallback, ex: "https://via.placeholder.com/1"
    }

    const response = await axios.post("https://api.imgur.com/3/image", {
        image: base64,
        type: "base64"
    }, {
        headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        }
    });

    return response.data.data.link;
}

module.exports = { uploadToImgur };
