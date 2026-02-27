const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();

app.use(express.json());

// Initialize WhatsApp Client with Local Authentication
const client = new Client({
    authStrategy: new LocalAuth()
});

// Generate QR Code for login
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above with your WhatsApp to log in.');
});

client.on('ready', () => {
    console.log('WhatsApp Bridge is Ready!');
});

// Activity 3.4: Endpoint for Flask to trigger messages
app.post('/send-alert', async (req, res) => {
    const { phone, message } = req.body;
    try {
        const chatId = phone.includes('@c.us') ? phone : `${phone}@c.us`;
        await client.sendMessage(chatId, message);
        res.status(200).json({ status: 'Success', message: 'WhatsApp alert sent' });
    } catch (error) {
        res.status(500).json({ status: 'Error', error: error.message });
    }
});

app.listen(6000, () => {
    console.log('Bridge API listening on port 6000');
});

client.initialize();