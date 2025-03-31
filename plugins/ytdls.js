const { cmd } = require("../command");
const yts = require("yt-search");
const axios = require("axios");

cmd({
  pattern: "song",
  alias: ["mp3", "ytmp3","s"],
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
      + `👋 *HELLO* ${pushname}\n`;
      + `🌍 *Your Location:* _${location}_\n`
      + `⏰ *Current Time:* _${userTime}_\n`
      + `📌 *Title:* ${title}\n`
      + `⏳ *Duration:* ${duration}\n`
      + `📺 *Channel:* ${channel}\n`
      + `🔗 *YouTube Link:* ${videoUrl}\n\n`

    // Send Image with details
    await conn.sendMessage(from, {
      image: { url: thumbnail },
      caption: captionText
    }, { quoted: mek });

    // Send both MP3 and Document separately (audio file)
    await conn.sendMessage(from, {
      audio: { url: mp3Url },
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${title}.mp3`
    });

    // Send the MP3 as a document
    await conn.sendMessage(from, {
      document: { url: mp3Url },
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    });

    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

  } catch (error) {
    console.error("Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });

    // Send the error message without "Song Command Error Logs"
    const errorMessage = `
*Error Message:* ${error.message}
*Stack Trace:* ${error.stack || "Not available"}
*Timestamp:* ${new Date().toISOString()}
`;

    await conn.sendMessage(from, { text: errorMessage }, { quoted: mek });
  }
});
