const express = require("express");
const { join } = require("path");
const fs = require("fs");
const { start } = require("repl");

const router = express.Router();

router.get("/test", (req, res) => res.send("testing video route"));

router.get("/list", (req, res) => {
  const dir = fs.readdirSync(join(__dirname, "../../", "public/videos"));
  res.send(dir.filter((f) => f.match(/.*\.mkv|.mp4$/)));
});

router.get("/", (req, res) => {
  if (!req.headers.range) {
    res.status(400).send({ message: "please provide range" });
  } else if (!req.query.fileName) {
    res.status(400).send({ message: "please select a file" });
  }

  let contentType = "video/mp4";
  if (req.query.fileName.match(/.*\.mkv$/)) contentType = "video/mkv";
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
  videStream.on("error", (err) => {
    console.log("STREAMING ERROR :: ", err);
  });
  videStream.pipe(res);
});

router.post("/upload/:fileName", (req, res) => {
  req.on("data", (data) => {
    const ws = fs.createWriteStream(
      join(__dirname, "../../public/videos", req.params.fileName),
      { flags: "a" }
    );
    ws.write(data);
    req.pipe(ws);
  });
  req.on("end", (e) => {
    res.status(201).send();
  });
});

router.delete("/:fileName", (req, res) => {
  if (!req.params.fileName) {
    return res.status(400).send({ message: "please select a file " });
  }
  fs.unlinkSync(join(__dirname, "../../public/videos", req.params.fileName));
  res.status(200).send({ message: "file deleted successfully" });
});
module.exports = router;
