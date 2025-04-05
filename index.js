const express = require("express");
const { firefox } = require("playwright");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const PASSWORD = process.env.PROXY_PASSWORD || "secret123";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index", { error: null });
});

app.post("/browse", async (req, res) => {
  const { password, url } = req.body;

  if (password !== PASSWORD) {
    return res.render("index", { error: "パスワードが違います。" });
  }

  try {
    const browser = await firefox.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle" });

    const content = await page.content();
    await browser.close();

    res.send(content);
  } catch (err) {
    res.status(500).send("読み込みに失敗しました: " + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
