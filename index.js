const express = require("express");
const { chromium } = require("playwright");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;
const PASSWORD = process.env.PROXY_PASSWORD || "secret123"; // 環境変数で設定推奨

app.use(express.urlencoded({ extended: true }));

// GUIページ
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CaptchaCloak</title>
        <style>
          body {
            font-family: "Arial", sans-serif;
            background-color: #121212;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 2rem;
          }
          h1 {
            font-family: "SmartFontUI", sans-serif;
            font-size: 3rem;
          }
          form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            width: 300px;
          }
          input, button {
            padding: 0.5rem;
            font-size: 1rem;
          }
          img.logo {
            width: 300px;
            margin-bottom: 1rem;
          }
        </style>
      </head>
      <body>
        <img src="/logo" alt="CaptchaCloak" class="logo" />
        <h1>CaptchaCloak</h1>
        <form action="/browse" method="POST">
          <input type="password" name="password" placeholder="パスワード" required />
          <input type="text" name="url" placeholder="アクセスしたいURL" required />
          <button type="submit">アクセス</button>
        </form>
      </body>
    </html>
  `);
});

// ロゴ画像（AI生成画像を返す）
app.get("/logo", (req, res) => {
  res.sendFile(path.join(__dirname, "captcha-cloak.png")); // 画像ファイル名に合わせて変更
});

// URL取得処理
app.post("/browse", async (req, res) => {
  const { url, password } = req.body;

  if (password !== PASSWORD) {
    return res.status(401).send("パスワードが間違っています。");
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    const content = await page.content();
    await browser.close();
    res.send(content);
  } catch (err) {
    console.error("エラー:", err);
    res.status(500).send("ページの取得中にエラーが発生しました。URLが正しいか確認してください。");
  }
});

app.listen(port, () => {
  console.log(`CaptchaCloak is running at http://localhost:${port}`);
});
