const axios = require("axios");
const { cmd } = require("../command");

cmd({
  pattern: "fb",
  alias: ["facebook", "fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename,
  use: "<Facebook URL>",
}, async (conn, m, store, { from, args, q, reply }) => {
  try {
    // Check if a URL is provided
    if (!q || !q.startsWith("http")) {
      return reply("*`Need a valid Facebook URL`*\n\nExample: `.fb https://www.facebook.com/...`");
    }

    // Add a loading react
    await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

    // Fetch video URL from the API
    const apiUrl = `https://www.velyn.biz.id/api/downloader/facebookdl?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    // Check if the API response is valid
    if (!data.status || !data.data || !data.data.url) {
      return reply("❌ Failed to fetch the video. Please try another link.");
    }

    // Send the video to the user
    const videoUrl = data.data.url;
    const videoTitle = "Facebook Video"; // You can modify this as needed
    const captionText = "📥 *Facebook Video Downloaded*\n\n- Powered By CHAMINDU ✅";

    // Send the video as normal
    await conn.sendMessage(from, {
      video: { url: videoUrl },
      caption: captionText,
      mimetype: 'video/mp4',
    }, { quoted: m });

    // Send the video as a downloadable document
    await conn.sendMessage(from, {
      document: { url: videoUrl },
      mimetype: 'video/mp4',
      fileName: `${videoTitle}.mp4`,
      caption: captionText,
    });

    await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    reply("❌ Error fetching the video. Please try again.");
  }
});
