const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(express.json());

// Load Twilio credentials from your .env file
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let client;
if (accountSid && authToken) {
    client = twilio(accountSid, authToken);
}

app.post('/api/whatsapp', async (req, res) => {
    console.log("\n📥 --- NEW REQUEST FROM PYTHON AI ---");
    
    // 1. Remove ALL spaces from the phone number automatically
    const rawPhone = req.body.phone || "";
    const cleanPhone = rawPhone.replace(/\s+/g, ''); 
    const { message, mediaUrl } = req.body;

    console.log(`Sending to: whatsapp:${cleanPhone}`);

    if (!cleanPhone) {
        return res.status(400).send("Missing phone number");
    }

    try {
        if (client) {
            const twilioRes = await client.messages.create({
                body: message,
                from: twilioWhatsAppNumber,
                to: `whatsapp:${cleanPhone}` // Uses the cleaned number
            });
            console.log("✅ Message sent via Twilio! SID:", twilioRes.sid);
            res.status(200).send("Success");
        } else {
            console.log(`⚠️ TWILIO KEYS NOT FOUND.`);
            res.status(200).send("Mock Success");
        }
    } catch (error) {
        // This stops the 500 error from crashing your bridge
        console.error("❌ Twilio Error:", error.message);
        res.status(400).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`🚀 Bridge API listening on port ${PORT}`);
});