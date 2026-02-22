const PASSWORD = 'bridge';
const COOKIE_NAME = 'musd_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function unauthorizedResponse(error) {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>mUSD Tutorial - Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0e17;
      color: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .login-box {
      background: #1a2235;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 40px;
      max-width: 380px;
      width: 90%;
      text-align: center;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      background: linear-gradient(135deg, #06b6d4, #8b5cf6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 8px;
    }
    .subtitle {
      color: #64748b;
      font-size: 14px;
      margin-bottom: 24px;
    }
    .error {
      color: #ef4444;
      font-size: 13px;
      margin-bottom: 12px;
    }
    input {
      width: 100%;
      padding: 12px 16px;
      background: #0a0e17;
      border: 1px solid #334155;
      border-radius: 8px;
      color: #e2e8f0;
      font-size: 15px;
      margin-bottom: 12px;
      outline: none;
    }
    input:focus { border-color: #06b6d4; }
    button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #06b6d4, #3b82f6);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover { transform: translateY(-1px); }
  </style>
</head>
<body>
  <div class="login-box">
    <h1>mUSD Tutorial</h1>
    <p class="subtitle">Enter password to continue</p>
    ${error ? '<p class="error">Wrong password</p>' : ''}
    <form method="POST">
      <input type="password" name="password" placeholder="Password" autofocus required>
      <button type="submit">Enter</button>
    </form>
  </div>
</body>
</html>`;

  return new Response(html, {
    status: 401,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export default async function middleware(request) {
  const url = new URL(request.url);

  // Allow favicon and static assets through
  if (url.pathname.match(/\.(ico|png|jpg|svg|css|js)$/)) {
    return;
  }

  // Handle POST (password submission)
  if (request.method === 'POST') {
    const formData = await request.formData();
    const password = formData.get('password');

    if (password === PASSWORD) {
      const response = new Response(null, {
        status: 302,
        headers: { Location: url.pathname || '/' },
      });
      response.headers.append(
        'Set-Cookie',
        `${COOKIE_NAME}=authenticated; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`
      );
      return response;
    }
    return unauthorizedResponse(true);
  }

  // Check cookie on GET
  const cookie = request.headers.get('cookie') || '';
  if (cookie.includes(`${COOKIE_NAME}=authenticated`)) {
    return;
  }

  return unauthorizedResponse(false);
}

export const config = {
  matcher: ['/', '/((?!_next|favicon).*)'],
};
