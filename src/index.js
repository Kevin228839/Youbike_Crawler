require("./crawler");
require("./receiver");
const { getData } = require("./util");
const express = require("express");
const app = express();
const port = 30005;
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", async (req, res) => {
  const version = "v2";
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const response = await getData(version, lng, lat);
  res.status(200).json({ response });
});
app.get("/test", async (req, res) => {
  res.status(200).json({ message: "test succeeded" });
});
app.listen(port, () => {
  console.log(`App listening at port ${port}`);
});
