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
  console.log("range === ", req.headers.range);
  if (!req.headers.range) {
    res.status(400).send({ message: "please provide range" });
  }
  const videoPath = "public/videos/file_example_MP4_480_1_5MG.mp4";
  console.log(videoPath);
  const start = Number(req.headers.range.replace(/\D/g, ""));
  const videoSize = fs.statSync(join(__dirname, "../../", videoPath)).size;
  console.log("vide size", videoSize);
  const CHUNK_SIZE = 10 ** 6; // 1KB
  console.log("CHUNK_SIZE", CHUNK_SIZE);
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  console.log("end", end);
  console.log("start", start);

  console.log(">>> ", `bytes ${start}-${end}/${videoSize}`);
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Access-range": "bytes",
    "content-length": end - start + 1,
    "content-type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videStream = fs.createReadStream(videoPath, { start, end });
  videStream.pipe(res);
});

module.exports = router;
