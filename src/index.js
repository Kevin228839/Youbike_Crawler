const { start: startCrawler } = require("./crawler");
const { start: startReceiver } = require("./receiver");
const { getData } = require("./util");
const express = require("express");

async function main() {
  try {
    // Start receiver first to listen on queue, then start crawler
    await startReceiver();
    await startCrawler();

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

    const server = app.listen(port, () => {
      console.log(`App listening at port ${port}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      console.log("Shutting down gracefully");
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (error) {
    console.error("Error starting application:", error);
    process.exit(1);
  }
}

main();
