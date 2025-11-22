const amqp = require("amqplib/callback_api");
const { MongoClient } = require("mongodb");
const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqUrl = `amqp://${rabbitmqHost}:5672`;
const mongodbHost = process.env.MONGODB_HOST || "localhost";
const mongodbUrl = `mongodb://${mongodbHost}:27017`;

module.exports = amqp.connect(rabbitmqUrl, function (error, connection) {
  if (error) {
    console.log(error);
  }
  connection.createChannel(async function (error, channel) {
    if (error) {
      console.log(error);
    }
    // mongodb connection
    const client = new MongoClient(mongodbUrl);
    await client.connect();
    const database = client.db("demo");
    const youbike = database.collection("youbike");
    // rabbitmq
    const queue = "crawler2";
    channel.assertQueue(queue, {
      durable: false,
    });
    channel.consume(
      queue,
      function (msg) {
        channel.ack(msg);
        const receiveMsg = JSON.parse(msg.content.toString());
        const finalMsg = {
          station: receiveMsg.sna,
          version: "v2",
          available: parseInt(receiveMsg.available_rent_bikes),
          location: {
            type: "Point",
            coordinates: [
              parseFloat(receiveMsg.longitude),
              parseFloat(receiveMsg.latitude),
            ],
          },
          datatime: receiveMsg.mday,
        };
        youbike.insertOne(finalMsg);
      },
      {
        noAck: false,
      }
    );
  });
});
