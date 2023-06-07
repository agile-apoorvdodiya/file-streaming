const express = require("express");
const { join } = require("path");
const fs = require("fs");
const { start } = require("repl");

const router = express.Router();

router.get("/test", (req, res) => res.send("testing video route"));

router.get("/list", (req, res) => {
  const dir = fs.readdirSync(join(__dirname, "../../", "public/videos"));
  res.send(dir);
});

router.get("/", (req, res) => {
  if (!req.headers.range) {
    res.status(400).send({ message: "please provide range" });
  } else if (!req.query.fileName) {
    res.status(400).send({ message: "please select a file" });
  }

  let contentType = 'video/mp4';
  if (req.query.fileName.match(/.*\.mkv$/)) contentType = 'video/mkv';
  const videoPath = `public/videos/${req.query.fileName}`;
  const videoSize = fs.statSync(join(__dirname, "../../", videoPath)).size;
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(req.headers.range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Access-range": "bytes",
    "content-length": contentLength,
    "content-type": contentType,
  };
  res.writeHead(206, headers);
  const videStream = fs.createReadStream(videoPath, { start, end });
  videStream.on('error', (err) => {
    console.log('STREAMING ERROR :: ', err)
  })
  videStream.pipe(res);
});

module.exports = router;
