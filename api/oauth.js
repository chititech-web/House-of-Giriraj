export default async function handler(req, res) {
  const { code, provider } = req.query;

  if (provider !== "github") {
    return res.status(400).json({ error: "Unsupported provider" });
  }

  if (!code) {
    const redirectUri = `${process.env.VERCEL_URL || req.headers.host}/api/oauth?provider=github`;
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "GITHUB_CLIENT_ID not configured" });
    }
    return res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=repo,user&response_type=code`
    );
  }

  try {
    const tokenResp = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenResp.json();

    if (data.error) {
      return res.status(400).json({ error: data.error_description || data.error });
    }

    res.setHeader("Content-Type", "text/html");
    res.end(`
      <html>
      <body>
        <script>
          (function() {
            function receiveMessage(message) {
              window.opener.postMessage(
                'authorization:github:${data.access_token}:${data.scope || ""}',
                message.origin
              );
              window.close();
            }
            window.addEventListener("message", receiveMessage, false);
            window.opener.postMessage("authorizing:github", "*");
          })();
        </script>
      </body>
      </html>
    `);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
