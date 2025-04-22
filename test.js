require("dotenv").config();
const { sendEmail } = require("./sendEmail");

sendEmail({
    song_name: "Test Song",
    artist: "Test Artist",
    youtube_title: "YT Title",
    youtube_views: "12345",
    spotify_title: "SP Title",
    spotify_streams: "54321",
    shazam_count: "123",
    chartex_stats: "Chartex test",
    spotontrack_image_url: "https://i.imgur.com/OzZUNMM.png",
    mediaforest_image_url: "https://i.imgur.com/1q1bLzy.png",
    tiktok_csv_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
}).then(() => console.log("SUCCESS")).catch(console.error);
