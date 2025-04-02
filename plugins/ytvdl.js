const { cmd, commands } = require('../command');
 
const { BufferJSON, Browsers, WA_DEFAULT_EPHEMERAL, makeWASocket, generateWAMessageFromContent, proto, getBinaryNodeChildren, generateWAMessageContent, generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, useMultiFileAuthState, fetchLatestBaileysVersion, downloadContentFromMessage} = require('@whiskeysockets/baileys');
const yts = require('yt-search');
const config = require('../config.cjs')
let prefix = config.PREFIX;
const axios = require("axios");

// Download YouTube video as MP3

async function ytmp3(url,base, apikey) {
  try {
    if (!url) {
      throw new Error("URL parameter is required");
    }
    if (!apikey) {
      throw new Error("API key is required");
    }

    // Call the API using axios
    const response = await axios.get(`${base}/api/ytmp3`, {
      params: {
        url: url,
        apikey: apikey,
      },
    });

    const data = response.data;

    if (!data || data.status !== true) {
      throw new Error(data.message || "Failed to fetch data from the API");
    }

    return {
      status: true,
      Created_by: "CHAMINDU",
      dl_link: data.downloadLink,
    };
  } catch (error) {
    return { status: false, error: error.response?.data?.message || error.message };
  }
}


// Download YouTube video in specified format (e.g., MP4)


async function ytmp44(url,base, quality, apikey) {
  try {
    if (!url) {
      throw new Error("URL parameter is required");
    }
    if (!quality) {
      throw new Error("Quality parameter is required");
    }
    if (!apikey) {
      throw new Error("API key is required");
    }

    // Call the API using axios
    const response = await axios.get(`${base}/api/ytmp4`, {
      params: {
        url: url,
        quality: quality,
        apikey: apikey,
      },
    });

    const data = response.data;

    if (!data || data.status !== true) {
      throw new Error(data.message || "Failed to fetch data from the API");
    }

    return {
      status: true,
      Created_by: "CHAMINDU",
      quality: data.quality,
      dl_link: data.downloadLink,
    };
  } catch (error) {
    return { status: false, error: error.response?.data?.message || error.message };
  }
}

// .song command
cmd({
    pattern: "song",
    desc: "To download songs.",
    react: "🎵",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, quoted, apikey,baseurl, body, args, q, isGroup,pushname, reply }) => {
    try {
            if (!q) return reply("Please give me a URL or title.");
            q = convertYouTubeLink(q);
            const search = await yts(q);
            const data = search.videos[0];
            const url = data.url;
    
            let desc = `
    ⫷⦁[ * '-'_꩜ ☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗 𝙎𝙊𝙉𝙂 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍 ꩜_'-' * ]⦁⫸
    
    🎵 *Song Found!* 
    
    ➥ *Title:* ${data.title} 
    ➥ *Duration:* ${data.timestamp} 
    ➥ *Views:* ${data.views} 
    ➥ *Uploaded On:* ${data.ago} 
    ➥ *Link:* ${data.url} 
    
    🎧 *Enjoy the music brought to you by* *Chama Mb Bot*! 
    
    🔽 *To download send:*
    
    1. *Audio File* 🎶
    2. *Document File* 📂
    
    > *Created with ❤️ by CHAMINDU* 
    
    > * © ☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗 💚    
    `;
    let info = `
    🎥 *MP3 Download Found!* 
    
    ➥ *Title:* ${data.title} 
    ➥ *Duration:* ${data.timestamp} 
    ➥ *Views:* ${data.views} 
    ➥ *Uploaded On:* ${data.ago} 
    ➥ *Link:* ${data.url} 
    
    🎬 *Enjoy the video brought to you by Queen Anju Bot!* 
    `
    
    
            // Send the initial message and store the message ID
            const sentMsg = await conn.sendMessage(from, {
                image: { url: data.thumbnail}, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                caption: desc,
                contextInfo: {
                    mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                    groupMentions: [],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363395257960673@newsletter',
                        newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                        serverMessageId: 999
                    },
                    externalAdReply: {
                        title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                        body: ' ©𝐌𝐑 𝙲𝙷𝙰𝙼𝙸𝙽𝙳𝚄� 𝐎𝐅𝐂 💚',
                        mediaType: 1,
                        sourceUrl: "https://github.com",
                        thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
              });
    
            // Add a reply tracker for the sent message
            conn.addReplyTracker(sentMsg.key.id, async (replyMek, messageType) => {
                const choice = messageType.trim();
            
                if (choice === '1' || choice === '2') {
                    // React to the user's reply (⬇️: download starting)
                    await conn.sendMessage(from, {
                        react: { text: '⬇️', key: replyMek.key }
                    });
            
                    try {
                        // Fetch download URL
                        const down = await ytmp3(`${url}`,baseurl,`${apikey}`);
                        const downloadUrl = down;
            
                        // React to the upload starting (⬆️)
                        await conn.sendMessage(from, {
                            react: { text: '⬆️', key: replyMek.key }
                        });
            
                        if (choice === '1') {
                            // Handle option 1 (Audio File)
                            await conn.sendMessage(from, {
                                audio: { url: downloadUrl },
                                mimetype: "audio/mpeg",
                                contextInfo: {
                                    externalAdReply: {
                                        title: data.title,
                                        body: data.videoId,
                                        mediaType: 1,
                                        sourceUrl: data.url,
                                        thumbnailUrl: data.thumbnail, // Ensure this URL is correct
                                        renderLargerThumbnail: true,
                                        showAdAttribution: true
                                    }
                                }
                            }, { quoted: replyMek });
                        } else if (choice === '2') {
                            // Handle option 2 (Document File)
                            await conn.sendMessage(from, {
                                document: { url: downloadUrl },
                                mimetype: "audio/mp3",
                                fileName: `${data.title}.mp3`,
                                caption: info,
                                contextInfo: {
                                    mentionedJid: ['94783314361@s.whatsapp.net'],
                                    externalAdReply: {
                                        title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                                        body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                                        mediaType: 1,
                                        sourceUrl: "https://github.com/Cʜɪɴᴅᴜ ",
                                        thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg',
                                        renderLargerThumbnail: false,
                                        showAdAttribution: true
                                    }
                                }
                            }, { quoted: replyMek });
                        }
            
                        // React to the successful completion of the task (✅)
                        await conn.sendMessage(from, {
                            react: { text: '✅', key: replyMek.key }
                        });
            
                    } catch (error) {
                        // Handle any errors during the process
                        console.error("Error during file processing:", error);
                        await conn.sendMessage(from, { text: "An error occurred while processing your request. Please try again." }, { quoted: replyMek });
                    }
                } else {
                    // React to invalid input
                    await conn.sendMessage(from, {
                        react: { text: '❌', key: replyMek.key }
                    });
                    await conn.sendMessage(from, { text: "Invalid option. Please reply with 1 or 2." }, { quoted: replyMek });
                }
            });
            
        } catch (e) {
            console.error(e);
            reply(`${e}`);
        }
});


cmd({
    pattern: "video",
    desc: "To download videos.",
    react: "🎥",
    category: "download",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup,apikey,baseurl, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
   
    try {
            if (!q) return reply("Please give me a URL or title.");
    
            q = convertYouTubeLink(q);
            const search = await yts(q);
            const data = search.videos[0];
            const url = data.url;
    
            let desc = `
    ⫷⦁[ * '-'_꩜ ☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗 𝙑𝙄𝘿𝙀𝙊 𝘿𝙊𝙒𝙉𝙇𝙊𝘼𝘿𝙀𝙍 ꩜_'-' * ]⦁⫸ 
    
    🎥 *Video Found!* 
    
    ➥ *Title:* ${data.title} 
    ➥ *Duration:* ${data.timestamp} 
    ➥ *Views:* ${data.views} 
    ➥ *Uploaded On:* ${data.ago} 
    ➥ *Link:* ${data.url} 
    
    🎬 *Enjoy the video brought to you by* *Chama Md Bot*! 
    
    🔽 *To download send:*
    
     *Video File* 🎶
       1.1 *360*
       1.2 *480*
       1.3 *720*
       1.4 *1080*
     *Document File* 📂
       2.1 *360*
       2.2 *480*
       2.3 *720*
       2.4 *1080*
    
    > *Created with ❤️ by Janith Rashmika* 
    
    > *CHAMA - MD*  
    `;
    let info = `
    🎥 *MP4 Download Found!* 
    
    ➥ *Title:* ${data.title} 
    ➥ *Duration:* ${data.timestamp} 
    ➥ *Views:* ${data.views} 
    ➥ *Uploaded On:* ${data.ago} 
    ➥ *Link:* ${data.url} 
    
    🎬 *Enjoy the video brought to you by Chama Md !* 
    `
    
    
            // Send the initial message and store the message ID
            const sentMsg = await conn.sendMessage(from, {
                image: { url: data.thumbnail}, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                caption: desc,
                contextInfo: {
                    mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                    groupMentions: [],
                    forwardingScore: 999,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: '120363395257960673@newsletter',
                        newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                        serverMessageId: 999
                    },
                    externalAdReply: {
                        title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                        body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                        mediaType: 1,
                        sourceUrl: "https://github.com/",
                        thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
              });
                    const messageID = sentMsg.key.id; // Save the message ID for later reference
    
    
            // Listen for the user's response
            conn.addReplyTracker(messageID, async (mek, messageType) => {
                if (!mek.message) return;
                const from = mek.key.remoteJid;
                const sender = mek.key.participant || mek.key.remoteJid;
    
                // React to the user's reply (the "1" or "2" message)
                await conn.sendMessage(from, { react: { text: '⬇️', key: mek.key } });
    
                    if (messageType === '1.1') {
                        const down = await ytmp44(`${url}`,baseurl,"360p",`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        await conn.sendMessage(from, {
                    video: { url: downloadUrl}, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                    caption: info,
                    contextInfo: {
                        mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                        groupMentions: [],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363395257960673@newsletter',
                            newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                            serverMessageId: 999
                        },
                        externalAdReply: {
                            title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                            body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                            mediaType: 1,
                            sourceUrl: "https://github.com/",
                            thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                  });
                    }else if (messageType === '1.2') {
                        const down = await ytmp44(`${url}`,baseurl,`480`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        await conn.sendMessage(from, {
                    video: { url: downloadUrl}, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                    caption: info,
                    contextInfo: {
                        mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                        groupMentions: [],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363395257960673@newsletter',
                            newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                            serverMessageId: 999
                        },
                        externalAdReply: {
                            title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                            body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                            mediaType: 1,
                            sourceUrl: "https://github.com/",
                            thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                  });
                    }else if (messageType === '1.3') {
                        const down = await ytmp44(`${url}`,baseurl,`720`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        await conn.sendMessage(from, {
                    video: { url: downloadUrl}, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                    caption: info,
                    contextInfo: {
                        mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                        groupMentions: [],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363395257960673@newsletter',
                            newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                            serverMessageId: 999
                        },
                        externalAdReply: {
                            title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                            body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                            mediaType: 1,
                            sourceUrl: "https://github.com/",
                            thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                  });
                    }else if (messageType === '1.4') {
                        const down = await ytmp44(`${url}`,baseurl,`1080`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        await conn.sendMessage(from, {
                    video: { url: downloadUrl}, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                    caption: info,
                    contextInfo: {
                        mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                        groupMentions: [],
                        forwardingScore: 999,
                        isForwarded: true,
                        forwardedNewsletterMessageInfo: {
                            newsletterJid: '120363395257960673@newsletter',
                            newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                            serverMessageId: 999
                        },
                        externalAdReply: {
                            title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                            body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                            mediaType: 1,
                            sourceUrl: "https://github.com/",
                            thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                  });
                    }else if (messageType === '2.1') {
                        const down = await ytmp44(`${url}`,baseurl,`360`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        // Handle option 2 (Document File)
                        await conn.sendMessage(from, {
                            document: { url: downloadUrl},
                            mimetype: "video/mp4",
                            fileName: `${data.title}.mp4`, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                            caption: info,
                            contextInfo: {
                                mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                                groupMentions: [],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363395257960673@newsletter',
                                    newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                                    serverMessageId: 999
                                },
                                externalAdReply: {
                                    title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                                    body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                                    mediaType: 1,
                                    sourceUrl: "https://github.com/",
                                    thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            }
                          });
                    }else if (messageType === '2.2') {
                        const down = await ytmp44(`${url}`,baseurl,`480`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        // Handle option 2 (Document File)
                        await conn.sendMessage(from, {
                            document: { url: downloadUrl},
                            mimetype: "video/mp4",
                            fileName: `${data.title}.mp4`, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                            caption: info,
                            contextInfo: {
                                mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                                groupMentions: [],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363395257960673@newsletter',
                                    newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                                    serverMessageId: 999
                                },
                                externalAdReply: {
                                    title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                                    body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                                    mediaType: 1,
                                    sourceUrl: "https://github.com/",
                                    thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            }
                          });
                    }else if (messageType === '2.3') {
                        const down = await ytmp44(`${url}`,baseurl,`720`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        // Handle option 2 (Document File)
                        await conn.sendMessage(from, {
                            document: { url: downloadUrl},
                            mimetype: "video/mp4",
                            fileName: `${data.title}.mp4`, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                            caption: info,
                            contextInfo: {
                                mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                                groupMentions: [],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363395257960673@newsletter',
                                    newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                                    serverMessageId: 999
                                },
                                externalAdReply: {
                                    title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                                    body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                                    mediaType: 1,
                                    sourceUrl: "https://github.com/",
                                    thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            }
                          });
                    }else if (messageType === '2.4') {
                        const down = await ytmp44(`${url}`,baseurl,`1080`,`${apikey}`)                     
                        const downloadUrl = down;
                        // React to the upload (sending the file)
                        await conn.sendMessage(from, { react: { text: '⬆️', key: mek.key } });
                        // Handle option 1 (Audio File)
                        // Handle option 2 (Document File)
                        await conn.sendMessage(from, {
                            document: { url: downloadUrl},
                            mimetype: "video/mp4",
                            fileName: `${data.title}.mp4`, // Ensure `img.allmenu` is a valid image URL or base64 encoded image
                            caption: info,
                            contextInfo: {
                                mentionedJid: ['94783314361@s.whatsapp.net'], // specify mentioned JID(s) if any
                                groupMentions: [],
                                forwardingScore: 999,
                                isForwarded: true,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: '120363395257960673@newsletter',
                                    newsletterName: "☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗",
                                    serverMessageId: 999
                                },
                                externalAdReply: {
                                    title: '☈☟𝗖𝗛𝗔𝗠𝗔 𝗠𝗗',
                                    body: ' ©𝐌𝐑 Cʜɪɴᴅᴜ  𝐎𝐅𝐂 💚',
                                    mediaType: 1,
                                    sourceUrl: "https://github.com/",
                                    thumbnailUrl: 'https://i.ibb.co/KxYGBGdf/8947.jpg', // This should match the image URL provided above
                                    renderLargerThumbnail: false,
                                    showAdAttribution: true
                                }
                            }
                          });} 
            
                    // React to the successful completion of the task
                await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    
                console.log("Response sent successfully");
            });
    
        } catch (e) {
            console.log(e);
            reply(`${e}`);
        }
});
