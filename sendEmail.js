const nodemailer = require("nodemailer");

function sendEmail({
                       song_name,
                       artist,
                       youtube_title,
                       youtube_views,
                       youtube_diff,
                       youtube_daily_avg,
                       youtube_weekly_avg,
                       spotify_title,
                       spotify_streams,
                       spotify_diff,
                       spotify_daily_avg,
                       spotify_weekly_avg,
                       shazam_title,
                       shazam_count,
                       shazam_diff,
                       shazam_daily_avg,
                       shazam_weekly_avg,
                       chartex_stats,
                       totalTikTokVideos,
                       totalTikTokViews,
                       totalTikTokLikes,
                       totalTikTokComments,
                       totalTikTokShares,
                       spotontrack_image_url,
                       mediaforest_image_url,
                       tiktok_csv_url,
                       spotontrack_image_base64,
                       mediaforest_image_base64,
                       tiktok_csv_base64
                   }) {
    console.log("📧 Preparing email with:");
    console.log(`- Spotify image data: ${spotontrack_image_base64 ? (spotontrack_image_base64.length + ' chars') : 'missing'}`);
    console.log(`- Mediaforest image data: ${mediaforest_image_base64 ? (mediaforest_image_base64.length + ' chars') : 'missing'}`);
    console.log(`- TikTok CSV data: ${tiktok_csv_base64 ? (tiktok_csv_base64.length + ' chars') : 'missing'}`);

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    });

    // Ensure we have valid base64 data for images
    const validSpotifyImg = spotontrack_image_base64 && spotontrack_image_base64.length > 100;
    const validMediaforestImg = mediaforest_image_base64 && mediaforest_image_base64.length > 100;
    const validTikTokCsv = tiktok_csv_base64 && tiktok_csv_base64.length > 0;

    const html = `
    <div style="font-family: Arial; padding: 20px;">
      <h2 style="color:#4a90e2;">🎵 Track Analysis Report</h2>
      <p><strong>Song:</strong> ${song_name}<br/>
         <strong>Artist:</strong> ${artist}</p>

      <h3>🎧 DSP Performance</h3>
      
      <div style="margin-bottom:20px; padding:15px; background:#f8f9fa; border-radius:8px;">
        <h4 style="color:#4a90e2; margin-top:0;">YouTube</h4>
        <p><strong>Title:</strong> ${youtube_title || "-"}<br/>
           <strong>Views:</strong> ${youtube_views || "-"}<br/>
           <strong>Difference since last check:</strong> ${youtube_diff || "-"}<br/>
           <strong>Daily average (today):</strong> ${youtube_daily_avg || "-"}<br/>
           <strong>Weekly average (last 7 days):</strong> ${youtube_weekly_avg || "-"}</p>
      </div>
      
      <div style="margin-bottom:20px; padding:15px; background:#f8f9fa; border-radius:8px;">
        <h4 style="color:#4a90e2; margin-top:0;">Spotify</h4>
        <p><strong>Title:</strong> ${spotify_title || "-"}<br/>
           <strong>Streams:</strong> ${spotify_streams || "-"}<br/>
           <strong>Difference since last check:</strong> ${spotify_diff || "-"}<br/>
           <strong>Daily average (today):</strong> ${spotify_daily_avg || "-"}<br/>
           <strong>Weekly average (last 7 days):</strong> ${spotify_weekly_avg || "-"}</p>
      </div>
      
      <div style="margin-bottom:20px; padding:15px; background:#f8f9fa; border-radius:8px;">
        <h4 style="color:#4a90e2; margin-top:0;">Shazam</h4>
        <p><strong>Title:</strong> ${shazam_title || "-"}<br/>
           <strong>Count:</strong> ${shazam_count || "-"}<br/>
           <strong>Difference since last check:</strong> ${shazam_diff || "-"}<br/>
           <strong>Daily average (today):</strong> ${shazam_daily_avg || "-"}<br/>
           <strong>Weekly average (last 7 days):</strong> ${shazam_weekly_avg || "-"}</p>
      </div>
      
      ${validSpotifyImg ? `
      <div style="margin-bottom:20px;">
        <h4 style="color:#4a90e2; margin-top:10px;">Spotontrack</h4>
        <img src="data:image/png;base64,${spotontrack_image_base64}" style="max-width:600px; border-radius: 8px;" alt="Spotontrack Image" />
      </div>
      ` : '<p><em>Spotontrack image not available</em></p>'}

      <h3>📱 TikTok Performance</h3>
      <p>${chartex_stats}</p>
      
      <div style="margin-bottom:20px; padding:15px; background:#f8f9fa; border-radius:8px;">
        <h4 style="color:#4a90e2; margin-top:0;">TikTok Lifetime Statistics</h4>
        <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; margin-bottom:10px;">
          <div style="padding:10px; background:#e9ecef; border-radius:6px;">
            <span style="display:block; font-size:12px; color:#6c757d;">Total Videos</span>
            <span style="font-size:18px; font-weight:500;">${totalTikTokVideos || "-"}</span>
          </div>
          <div style="padding:10px; background:#e9ecef; border-radius:6px;">
            <span style="display:block; font-size:12px; color:#6c757d;">Total Views</span>
            <span style="font-size:18px; font-weight:500;">${totalTikTokViews || "-"}</span>
          </div>
          <div style="padding:10px; background:#e9ecef; border-radius:6px;">
            <span style="display:block; font-size:12px; color:#6c757d;">Total Likes</span>
            <span style="font-size:18px; font-weight:500;">${totalTikTokLikes || "-"}</span>
          </div>
          <div style="padding:10px; background:#e9ecef; border-radius:6px;">
            <span style="display:block; font-size:12px; color:#6c757d;">Total Comments</span>
            <span style="font-size:18px; font-weight:500;">${totalTikTokComments || "-"}</span>
          </div>
        </div>
        <div style="padding:10px; background:#e9ecef; border-radius:6px;">
          <span style="display:block; font-size:12px; color:#6c757d;">Total Shares</span>
          <span style="font-size:18px; font-weight:500;">${totalTikTokShares || "-"}</span>
        </div>
      </div>
      
      ${validTikTokCsv ? `
      <a href="data:text/csv;base64,${tiktok_csv_base64}" download="TikTokPerformance.csv" style="display:inline-block;margin-top:8px;padding:8px 16px;background:#4a90e2;color:white;border-radius:6px;text-decoration:none;">
            Download TikTok CSV
      </a>
      ` : '<p><em>TikTok CSV not available</em></p>'}

      <h3>📻 Radio Performance</h3>
      ${validMediaforestImg ? `
      <img src="data:image/png;base64,${mediaforest_image_base64}" style="max-width:600px; border-radius: 8px;" alt="Mediaforest Image" />
      ` : '<p><em>Mediaforest chart not available</em></p>'}

      <p style="margin-top:30px;color:#999;font-size:12px;">Generated by SongScape AI</p>
    </div>
  `;

    return transporter.sendMail({
        from: `"SongScape AI" <${process.env.MAIL_USER}>`,
        to: process.env.MAIL_TO,
        subject: `${song_name} Analysis Report`,
        html
    });
}

module.exports = { sendEmail };
