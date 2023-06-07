const express = require("express");
const { join } = require("path");

const router = express();

router.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../../", "front-end/index.html"));
});

router.get("/video", (req, res) => {
  res.sendFile(join(__dirname, "../../", "front-end/video.html"));
});

router.get("*", (req, res) => {
  res.redirect('/app')
});

module.exports = router;
