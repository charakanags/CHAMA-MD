const config = require('../config');
const { cmd } = require('../command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js');

// video download

cmd({ 
    pattern: "mp4", 
    alias: ["video""v"], 
    react: "🎥", 
    desc: "Download YouTube video", 
    category: "main", 
    use: '.song < Yt url or Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, prefix, quoted, q, reply, pushname, location, userTime }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube URL or song name.");
        
        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");
        
        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.download_url) {
            return reply("Failed to fetch the video. Please try again later.");
        }

        // New Song/Video Details Message
        let ytmsg = `╭━━━〔 CHAMA-MD 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ VIDEO DOWNLOADER
┃▸└───────────···๏
╰────────────────┈⊷
╭━━❐━⪼
┇๏ *HELLO* ${pushname}
┇๏ *Your Location:* _${location}_
┇๏ *Current Time:* _${userTime}_
┇๏ *Title:* ${yts.title}
┇๏ *Duration:* ${yts.timestamp}
┇๏ *Views:* ${yts.views}
┇๏ *Channel:* ${yts.author.name}
┇๏ *Link:* ${yts.url}
╰━━❑━⪼
> Powered by CHAMA-AI`;

        // Send video details and thumbnail
        await conn.sendMessage(from, { image: { url: data.result.thumbnail || '' }, caption: ytmsg }, { quoted: mek });
        
        // Send video file
        await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: "video/mp4" }, { quoted: mek });
        
        // Send document file (optional)
        await conn.sendMessage(from, { 
            document: { url: data.result.download_url }, 
            mimetype: "video/mp4", 
            fileName: `${data.result.title}.mp4`, 
            caption: `> ${yts.title}\n> Powered by CHAMA-AI`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});  
       
// song download

cmd({ 
    pattern: "song", 
    alias: ["ytdl3", "play","s"], 
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

        // New Song/Video Details Message
        let ytmsg = `╭━━━〔 CHAMA-MD 〕━━━┈⊷
┃▸╭───────────
┃▸┃๏ MUSIC DOWNLOADER
┃▸└───────────···๏
╰────────────────┈⊷
╭━━❐━⪼
┇๏ *HELLO* ${pushname}
┇๏ *Your Location:* _${location}_
┇๏ *Current Time:* _${userTime}_
┇๏ *Title:* ${yts.title}
┇๏ *Duration:* ${yts.timestamp}
┇๏ *Views:* ${yts.views}
┇๏ *Channel:* ${yts.author.name} 
┇๏ *Link:* ${yts.url}
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
