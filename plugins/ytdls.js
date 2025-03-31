const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd({
  pattern: "song",
  alias: ["mp3", "ytmp3"],
  react: '🎧',
  desc: "Download audio from YouTube",
  category: "music",
  use: ".song <song name>",
  filename: __filename
}, async (conn, mek, msg, { from, args, reply, location, userTime, pushname }) => {
  try {
    if (!args.length) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("Please provide a song name. Example: .song Moye Moye");
    }

    await conn.sendMessage(from, { react: { text: '🎧', key: mek.key } });

    // Search for the song on YouTube
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

    // Fetch MP3 download link using the API
    const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
    const response = await axios.get(apiUrl);

    if (!response.data.success || !response.data.result.download_url) {
      await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
      return reply("❌ Failed to fetch the MP3 file.");
    }

    const mp3Url = response.data.result.download_url;

    // Send song details with thumbnail
    const captionText = `🎵 *Song Details:*\n\n`
      + `👋 *HELLO* ${pushname}\n`
      + `🌍 *Your Location:* _${location}_\n`
      + `⏰ *Current Time:* _${userTime}_\n`
      + `📌 *Title:* ${title}\n`
      + `⏳ *Duration:* ${duration}\n`
      + `📺 *Channel:* ${channel}\n`
      + `🔗 *YouTube Link:* ${videoUrl}\n\n`;

    // Send Image with details
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: captionText
    }, { quoted: mek });

    // Short message
    const shortMessage = `Here's your song, *${title}* 🎶 Enjoy!`;

    // 1. Send MP3 as a standard audio message
    await conn.sendMessage(from, {
      audio: { url: mp3Url },
      mimetype: 'audio/mpeg',
      ptt: false,  // Standard audio message
      fileName: `${title}.mp3`,
      caption: shortMessage
    });

    // 2. Send MP3 as a voice note (ptt: true for voice note)
    await conn.sendMessage(from, {
      audio: { url: mp3Url },
      mimetype: 'audio/mpeg',
      ptt: true,   // This makes it a voice note
      fileName: `${title}.mp3`,
      caption: shortMessage
    });

    // 3. Send the MP3 as a document (downloadable file)
    await conn.sendMessage(from, {
      document: { url: mp3Url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`,
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
