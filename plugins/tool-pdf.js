const { cmd } = require('../command');
const PDFDocument = require('pdfkit');
const { Buffer } = require('buffer');

cmd({
    pattern: "topdf",
    alias: ["pdf", "topdf"],
    use: '.topdf',
    desc: "Convert provided text to a PDF file.",
    react: "📮",
    category: "utilities",
    filename: __filename
},
async (conn, mek, m, { from, quoted, q, reply }) => {
    try {
        if (!q) {
            return reply("Please provide the text you want to convert to PDF. *Eg* `.topdf Pakistan ZindaBad 🇵🇰` ");
        }

        // Create a new PDF document
        const doc = new PDFDocument();
        let buffers = [];

        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);
            
            // Send the generated PDF file
            await conn.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'Generated.pdf',
                caption: "*📄 PDF created successfully!\n\n> © Created By CHAMINDU 💜*"
            }, { quoted: mek });
        });

        // Add text to the PDF
        doc.text(q, { align: 'left' });
        
        // Finalize and close the PDF document
        doc.end();

    } catch (error) {
        console.error(error);
        reply(`Error: ${error.message}`);
    }
});
