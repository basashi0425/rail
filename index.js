const express = require("express");
const { firefox } = require("playwright");

const app = express();
const PORT = process.env.PORT || 3000;

// フロントエンドのHTML
const HTML_UI = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CaptchaCloak</title>
    <style>
        body {
            text-align: center;
            padding: 20px;
            background-color: #121212;
            color: white;
        }
        .logo {
            width: 80%;
            max-width: 300px;
            margin-bottom: 20px;
        }
        input, button {
            width: 80%;
            padding: 10px;
            font-size: 18px;
            margin: 5px 0;
            border: none;
            border-radius: 5px;
        }
        input {
            background: white;
            color: black;
        }
        button {
            background: #007BFF;
            color: white;
            cursor: pointer;
        }
        button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <img src="/logo.png" alt="CaptchaCloak" class="logo">
    <input type="text" id="url" placeholder="URL を入力">
    <button onclick="browse()">開く</button>

    <script>
        function browse() {
            const url = document.getElementById("url").value;
            if (url) {
                window.location.href = "/proxy?url=" + encodeURIComponent(url);
            }
        }
    </script>
</body>
</html>
`;

// フロントエンドの提供
app.get("/", (req, res) => {
    res.send(HTML_UI);
});

// 画像の提供
app.use("/logo.png", express.static(__dirname + "/logo.png"));

// Playwright を使ったプロキシ処理
app.get("/proxy", async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).send("URL が必要です");
    }

    const browser = await firefox.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
        const content = await page.content();
        res.send(content);
    } catch (error) {
        res.status(500).send("ページの取得に失敗しました");
    } finally {
        await browser.close();
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
