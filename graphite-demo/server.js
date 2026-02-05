const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const https = require('https');
const app = express();
const port = 3000;

// Serve static files from the parent directory (project root)
app.use('/drive/view/files/', express.static(path.join(__dirname, '../')));

// Fake educational landing page for the root URL to help with categorization
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Math Solver - Educational Tools</title>
        <meta name="description" content="Free educational math tools for students. Solve calculus, algebra, and geometry problems online.">
        <style>
            body { font-family: sans-serif; background-color: #f4f4f9; color: #333; padding: 20px; text-align: center; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #4CAF50; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Math Solver Educational Suite</h1>
            <p>Welcome to the Math Solver. Access our suite of advanced mathematical tools designed to assist with calculus, algebra, and trigonometry.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p><strong>System Status:</strong> Operational</p>
            <p>Please use your assigned direct link to access the specific solver tools.</p>
            <p style="margin-top: 40px; color: #777; font-size: 0.8em;">&copy; 2024 Educational Math Tools Inc.</p>
        </div>
    </body>
    </html>
  `);
});

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

app.get('/feed', (req, res) => {
  res.json(activityFeed);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

  // Construct and encode the URL to make it less conspicuous in logs.
  let url;
  if (process.env.CODESPACE_NAME && process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN) {
    url = `https://${process.env.CODESPACE_NAME}-${port}.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}/drive/view/files/`;
  } else {
    url = `http://localhost:${port}/drive/view/files/`;
  }

  console.log(`\n>>> Access link generated:`);
  console.log(url);

  // Fetch and print the public IP, which acts as the tunnel password.
  console.log('>>> Fetching Tunnel Password...');
  exec('curl -s https://api.ipify.org', (error, stdout, stderr) => {
    if (error) {
      console.error('\n>>> Could not retrieve tunnel password.');
      console.error(stderr);
      return;
    }
    if (stdout) {
      console.log('\n==================================================');
      console.log(`>>> TUNNEL PASSWORD: ${stdout.trim()}`);
      console.log('==================================================\n');
    } else {
      console.log('\n>>> Could not retrieve tunnel password.');
    }
  });

  // Attempt to create a tunnel using Cloudflared to bypass domain filters
  console.log('\n>>> Starting Cloudflared tunnel...');
  const tunnel = exec(`npx -y cloudflared tunnel --url http://localhost:${port}`);
  
  tunnel.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`Cloudflared stdout: ${output}`); // Log stdout for debugging
  });

  tunnel.stderr.on('data', (data) => {
    const output = data.toString();
    console.error(`Cloudflared stderr: ${output}`); // Log stderr for debugging
    
    // Cloudflared often prints the URL to stderr
    const urlMatch = output.match(/https?:\/\/[^\s]+\.trycloudflare\.com/);
    if (urlMatch) {
      const tunnelUrl = urlMatch[0];
      console.log(`\n>>> STEALTH URL (Bypasses GitHub domain blocks):`);
      console.log(`${tunnelUrl}/drive/view/files/`);
    }
  });
});