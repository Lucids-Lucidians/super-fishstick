const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const localtunnel = require('localtunnel');
const openurl = require('openurl');
const axios = require('axios');
const app = express();
const port = 3000;

// Fake data for the activity feed
const activityFeed = [
  {
    id: 1000,
    title: 'New Photo Uploaded',
    body: 'Alice uploaded a new photo to her album.'
  },
  {
    id: 2000,
    title: 'Comment on Post',
    body: "Bob commented on Charlie's post."
  },
  {
    id: 13,
    title: 'Status Update',
    body: 'Charlie updated their status: "Excited about the new project!"'
  }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/feed', (req, res) => {
  res.json(activityFeed);
});

app.listen(port, async () => {
  console.log(`Server running on port ${port}`);

  // Fetch and log the public IP to use as the tunnel password
  try {
    const [ltRes, icanhazipRes] = await Promise.all([
      axios.get('https://localtunnel.me/ip').catch(() => ({ data: null })),
      axios.get('https://ipv4.icanhazip.com').catch(() => ({ data: null }))
    ]);

    const ltIp = ltRes.data ? ltRes.data.ip : null;
    const icanIp = icanhazipRes.data ? String(icanhazipRes.data).trim() : null;
    const ip = ltIp || icanIp || 'Error fetching IP';

    // Start the tunnel to get a stealth URL
    const tunnel = await localtunnel({ port: port, password: ip });

    // Save the URL to a file
    fs.writeFileSync(path.join(__dirname, 'tunnel_url.txt'), tunnel.url);

    console.log('\n' + '='.repeat(60));
    console.log(`>>> STEALTH URL:     \x1b[1;4;35m${tunnel.url}\x1b[0m`);
    console.log(`>>> TUNNEL PASSWORD: \x1b[1;33m${ip}\x1b[0m`);
    if (icanIp && icanIp !== ip) {
      console.log(`>>> ALT PASSWORD:    \x1b[1;33m${icanIp}\x1b[0m`);
    }
    console.log('='.repeat(60) + '\n');

    // Open the URL in the default browser
    // openurl.open(tunnel.url);

    tunnel.on('close', () => {
      console.log('Tunnel closed');
    });
  } catch (err) {
    console.error('Error fetching public IP:', err);
  }
});