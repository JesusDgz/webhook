// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// ====== CONFIG: URL DE TU APP PHP LOCAL ======
const LOCAL_ENDPOINT = "https://childrens-symposium-spectrum-values.trycloudflare.com/ProAutekAdmin/whatsapp/receiver.php";


// ========= GET VERIFICATION FROM META =========
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const token = req.query['hub.verify_token'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge); // Meta needs this exact response
  } else {
    res.status(403).end();
  }
});


// ========= POST WEBHOOK EVENT FROM WHATSAPP =========
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // Log del webhook en Render
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  // ====== REENVIAR A TU APP PHP LOCAL ======
  try {
    const forwardResponse = await fetch(LOCAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    console.log(`Forwarded to PHP local → HTTP ${forwardResponse.status}`);
  } catch (err) {
    console.error("ERROR forwarding to PHP local:", err.message);
  }

  // Respond to Meta ASAP
  res.status(200).end();
});


// ========= START SERVER =========
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
