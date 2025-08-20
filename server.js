const express = require('express');
const bodyParser = require('body-parser');
const { WebSocket } = require('ws');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Twilio inbound webhook
app.post('/twilio/inbound', (req, res) => {
  console.log('Incoming call from Twilio:', req.body);

  // Respond with TwiML to open a Media Stream
  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Connect>
        <Stream url="wss://your-server.com/twilio-media" />
      </Connect>
    </Response>
  `);
});

// Handle Twilio <Stream> websocket
app.ws('/twilio-media', (ws, req) => {
  console.log('🔗 Twilio call connected to media stream');

  // Connect to ElevenLabs Realtime API
  const elevenWs = new WebSocket("wss://api.elevenlabs.io/v1/stream", {
    headers: {
      "Authorization": "Bearer YOUR_ELEVENLABS_API_KEY",
      "Agent-ID": "YOUR_AGENT_ID"
    }
  });

  // Forward audio Twilio → ElevenLabs
  ws.on("message", (msg) => {
    elevenWs.send(msg);
  });

  // Forward audio ElevenLabs → Twilio
  elevenWs.on("message", (msg) => {
    ws.send(msg);
  });

  ws.on("close", () => {
    console.log("❌ Twilio stream closed");
    elevenWs.close();
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
