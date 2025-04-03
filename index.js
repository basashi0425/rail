const express = require('express');
const puppeteer = require('puppeteer');
const basicAuth = require('express-basic-auth');  // 基本認証を使う

const app = express();
const PORT = process.env.PORT || 3000;

// パスワードの設定
const password = 'secretpassword';  // パスワード（共有用）

// パスワード認証を適用（ユーザー名は空）
app.use(basicAuth({
    users: { '': password },  // ユーザー名は空、パスワードだけで認証
    challenge: true,
    realm: 'Protected Area'  // 認証ダイアログの表示名
}));

// メインのページ（URLフォームを提供）
app.get("/", (req, res) => {
    res.send(`
    <html>
    <head>
    <title>プロキシページ</title>
    </head>
    <body>
    <h1>URLを指定してプロキシを利用</h1>
    <form action="/proxy" method="get">
    <label for="url">URLを入力:</label>
    <input type="text" id="url" name="url" required>
    <button type="submit">プロキシを実行</button>
    </form>
    </body>
    </html>
    `);
});

// プロキシ機能
app.get("/proxy", async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send("URL パラメータが必要です");

    try {
        const browser = await puppeteer.launch({
            headless: true, // ヘッドレスモード（ブラウザを表示しない）
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // サーバー環境用
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' });

        // CAPTCHA回避（例: reCAPTCHAをクリックで回避）
        await page.evaluate(() => {
            const captcha = document.querySelector('.g-recaptcha');
            if (captcha) {
                const iframe = captcha.querySelector('iframe');
                if (iframe) {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const checkbox = iframeDoc.querySelector('.recaptcha-checkbox');
                    if (checkbox) {
                        checkbox.click();
                    }
                }
            }
        });

        const content = await page.content(); // ページのHTMLを取得
        await browser.close();

        res.send(content); // HTMLをレスポンスとして返す
    } catch (error) {
        res.status(500).send('エラー: ' + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
