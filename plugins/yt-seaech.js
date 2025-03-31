const config = require('../config')
const l = console.log
const { cmd, commands } = require('../command')
const fs = require('fs-extra')
const yts = require('yt-search');
const { getBuffer } = require('../lib/functions')

cmd({
    pattern: "yts",
    alias: ["ytsearch"],
    use: '.yts jawad',
    react: "🔎",
    desc: "Search and get details from YouTube.",
    category: "search",
    filename: __filename
},

async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return reply('*Please provide search keywords*');
        
        let searchResults;
        try {
            searchResults = await yts(q);
        } catch (e) {
            l(e);
            return await conn.sendMessage(from, { text: '*Error !!*' }, { quoted: mek });
        }

        let mesaj = '';
        let media = [];
        for (let video of searchResults.all.slice(0, 5)) { // Limit to 5 results
            mesaj += `🖲️ *${video.title}*
⏳ Duration: ${video.timestamp}
🔗 [Watch Now](${video.url})\n\n`;
            let buffer = await getBuffer(video.thumbnail);
            media.push({ image: buffer, caption: `🖲️ *${video.title}*\n⏳ Duration: ${video.timestamp}\n🔗 [Watch Now](${video.url})` });
        }
        
        if (media.length > 0) {
            for (let item of media) {
                await conn.sendMessage(from, item, { quoted: mek });
            }
        } else {
            await conn.sendMessage(from, { text: '*No results found!*' }, { quoted: mek });
        }
    } catch (e) {
        l(e);
        reply('*Error !!*');
    }
});
