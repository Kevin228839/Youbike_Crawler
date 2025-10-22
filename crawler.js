const axios = require("axios");
const amqp = require("amqplib/callback_api");
const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqUrl = `amqp://${rabbitmqHost}:5672`;

module.exports = amqp.connect(rabbitmqUrl, function (error, connection) {
  if (error) {
    console.log(error);
  }
  connection.createChannel(function (error, channel) {
    if (error) {
      console.log(error);
    }
    const queue = "crawler2";
    channel.assertQueue(queue, {
      durable: false,
    });
    setInterval(() => {
      axios
        .get(
          "https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json"
        )
        .then((response) => {
          for (let i = 0; i < response.data.length; i++) {
            const msg = JSON.stringify(response.data[i]);
            channel.sendToQueue(queue, Buffer.from(msg));
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }, 10000);
  });
});
