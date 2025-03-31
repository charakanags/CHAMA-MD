const { cmd } = require('../command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

// song download

cmd({ 
    pattern: "song", 
    alias: ["ytdl3", "play"], 
    react: "🎶", 
    desc: "Download YouTube song", 
    category: "main", 
    use: '.song < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply, pushname, location, userTime }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to fetch the audio. Please try again later.");
        }

        // Song Details Message with location and current time
        let ytmsg = `╭━━━〔 *CHAMA-MD* 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ *MUSIC DOWNLOADER*
┃▸└───────────···๏
╰────────────────┈⊷
╭━━❐━⪼
┇๏ 👋 *Hello* ${pushname}
┇๏ 🌍 *Your Location:* _${location || "Unknown"}_
┇๏ ⏰ *Current Time:* _${userTime || "Not available"}_
┇๏ 📌 *Title:* ${yts.title}
┇๏ ⏳ *Duration:* ${yts.timestamp}
┇๏ 📺 *Channel:* ${yts.author.name}
┇๏ 🔗 *YouTube Link:* ${yts.url}
╰━━❑━⪼
> Powered by CHAMA-AI`;

        // Send song details and thumbnail
        await conn.sendMessage(from, { image: { url: data.result.image || '' }, caption: ytmsg }, { quoted: mek });
        
        // Send audio file as standard message
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
        
        // Send audio file as voice note
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg", ptt: true }, { quoted: mek });
        
        // Send document file (optional)
        await conn.sendMessage(from, { 
            document: { url: data.result.downloadUrl }, 
            mimetype: "audio/mpeg", 
            fileName: `${data.result.title}.mp3`, 
            caption: `> ${yts.title}\n> Powered by CHAMA-AI`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});
