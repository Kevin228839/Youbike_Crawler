const axios = require("axios");
const amqp = require("amqplib/callback_api");
const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqUrl = `amqp://${rabbitmqHost}:5672`;

async function start() {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    const queue = "crawler2";
    await channel.assertQueue(queue, { durable: false });
    setInterval(async () => {
      try {
        const response = await axios.get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        );
        for (let i = 0; i < response.data.length; i++) {
          const msg = JSON.stringify(response.data[i]);
          channel.sendToQueue(queue, Buffer.from(msg));
        }
      } catch (error) {
        console.log(error);
      }
    }, 10000);
  } catch (error) {
    console.error("Error in start function:", error);
    throw error;
  }
}

module.exports = { start };
