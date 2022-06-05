const Youbike = require('./util');
const express = require("express");
const app = express();
const port = 3000;
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.get("/", async (req, res) => {
  const version = req.query.version;
  const lng = parseFloat(req.query.lng);
  const lat = parseFloat(req.query.lat);
  const response = await Youbike.read(version, lng, lat);
  res.status(200).json({ response });
});
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});