const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/twilio/inbound', (req, res) => {
    console.log('Incoming call from Twilio:', req.body);

    res.set('Content-Type', 'text/xml');
    res.send(`
        <Response>
            <Say voice="alice">Hello! Connecting you to AI agent soon.</Say>
        </Response>
    `);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
