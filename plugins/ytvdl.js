const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd({
  pattern: "song",
  alias: ["mp4", "ytmp4"],
  react: '🎬',
  desc: "Download video from YouTube",
  category: "music",
  use: ".song <video name>",
  filename: __filename
}, async (conn, mek, msg, { from, args, reply, location, userTime, pushname }) => {
  try {
    if (!args.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("Please provide a video name. Example: .song Moye Moye");
    }

    await conn.sendMessage(from, { react: { text: '🎬', key: mek.key } });

    // Search for the video on YouTube
    const query = args.join(" ");
    const searchResults = await yts(query);
    if (!searchResults.videos.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ No results found.");
    }

    const video = searchResults.videos[0];
    const videoUrl = video.url;
    const thumbnail = video.thumbnail;
    const title = video.title;
    const duration = video.timestamp;
    const channel = video.author.name;

    // Fetch MP4 download link using the API
    const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || !response.data.result.download_url) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ Failed to fetch the MP4 file.");
    }

    const mp4Url = response.data.result.download_url;

    // Send video details with thumbnail
    const captionText = `🎬 *Video Details:*

`
      + `👋 *HELLO* ${pushname}
`
      + `🌍 *Your Location:* _${location}_
`
      + `⏰ *Current Time:* _${userTime}_
`
      + `📌 *Title:* ${title}
`
      + `⏳ *Duration:* ${duration}
`
      + `📺 *Channel:* ${channel}
`
      + `🔗 *YouTube Link:* ${videoUrl}
\n\n`;

    // Send Image with details
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: captionText
    }, { quoted: mek });

    // Short message
    const shortMessage = `Here's your video, *${title}* 🎬 Enjoy!`;

    // Send MP4 video file
    await conn.sendMessage(from, {
      video: { url: mp4Url },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`,
      caption: shortMessage
    });

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    // Notify user without error details
    reply("❌ Sorry, an error occurred while processing your request. Please try again later.");

    // Send the error to bot owner (94783314361)
    const errorMessage = `🚨 *Bot Error Alert!*\n\n`
      + `📌 *Command:* .song\n`
      + `👤 *User:* ${pushname}\n`
      + `📍 *Group/Chat:* ${from}\n`
      + `⏳ *Time:* ${new Date().toLocaleString()}\n\n`
      + `💢 *Error:* ${error.message}\n`
      + `📜 *Stack Trace:* ${error.stack ? error.stack.split("\n")[0] : "N/A"}`;

    await conn.sendMessage("94783314361@s.whatsapp.net", { text: errorMessage });
  }
});
