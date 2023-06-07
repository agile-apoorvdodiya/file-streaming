const express = require("express");
const { join } = require("path");
const app = express();
const videoRoutes = require("./src/routes/video");
const frontEndRoutes = require("./src/routes/front-end");

app.use("/app", [frontEndRoutes]);

app.use("/video", [videoRoutes]);

app.use("*", (req, res) => {
  res.status(404).send({ message: "You were stubbled on a wrong way!" });
});

const port = 3131;
app.listen(port, () => {
  console.log("server listing on port ", port);
});
