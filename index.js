const express = require("express");
const { firefox } = require("playwright");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// パスワードをここで直接指定
const PASSWORD = "Uradasuyo""12";

// 静的ファイル（画像など）を使えるように
app.use("/static", express.static(path.join(__dirname, "static")));
app.use(bodyParser.urlencoded({ extended: true }));

// パスワード入力画面
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CaptchaCloak</title>
        <style>
          body {
            font-family: sans-serif;
            text-align: center;
            margin-top: 100px;
          }
          input[type=password], input[type=submit] {
            padding: 10px;
            margin: 10px;
            font-size: 16px;
          }
          img {
            max-width: 300px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <img src="/static/logo.png" alt="CaptchaCloak Logo" />
        <form method="POST" action="/auth">
          <input type="password" name="password" placeholder="パスワードを入力" />
          <br />
          <input type="submit" value="認証する" />
        </form>
      </body>
    </html>
  `);
});

// パスワードチェック
app.post("/auth", (req, res) => {
  const { password } = req.body;
  if (password === PASSWORD) {
    res.redirect("/browse");
  } else {
    res.send("パスワードが間違っています。<a href='/'>戻る</a>");
  }
});

// URL入力 → プロキシ表示
app.get("/browse", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CaptchaCloak - ブラウズ</title>
        <style>
          body { font-family: sans-serif; text-align: center; margin-top: 100px; }
          input[type=text] {
            width: 60%;
            padding: 10px;
            font-size: 16px;
          }
          input[type=submit] {
            padding: 10px 20px;
            font-size: 16px;
          }
        </style>
      </head>
      <body>
        <h1>CaptchaCloak</h1>
        <form method="POST" action="/render">
          <input type="text" name="url" placeholder="https://example.com" />
          <input type="submit" value="表示する" />
        </form>
      </body>
    </html>
  `);
});

// Playwright でレンダリング
app.post("/render", async (req, res) => {
  const { url } = req.body;

  if (!url || !url.startsWith("http")) {
    return res.send("正しい URL を入力してください。<a href='/browse'>戻る</a>");
  }

  try {
    const browser = await firefox.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const content = await page.content();
    await browser.close();

    res.send(content);
  } catch (err) {
    res.send(`ページの読み込み中にエラーが発生しました: ${err}`);
  }
});

app.listen(PORT, () => {
  console.log(`CaptchaCloak is running on http://localhost:${PORT}`);
});
