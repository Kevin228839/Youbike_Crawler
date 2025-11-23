const amqp = require("amqplib/callback_api");
const { MongoClient } = require("mongodb");
const rabbitmqHost = process.env.RABBITMQ_HOST || "localhost";
const rabbitmqUrl = `amqp://${rabbitmqHost}:5672`;
const mongodbHost = process.env.MONGODB_HOST || "localhost";
const mongodbUrl = `mongodb://${mongodbHost}:27017`;

async function start() {
  try {
    const client = new MongoClient(mongodbUrl);
    await client.connect();
    const database = client.db("demo");
    const youbike = database.collection("youbike");
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();
    const queue = "crawler2";
    await channel.assertQueue(queue, { durable: false });
    channel.consume(
      queue,
      async function (msg) {
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
        try {
          await youbike.insertOne(finalMsg);
        } catch (error) {
          console.error("Error inserting document:", error);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("Error in start function:", error);
    throw error;
  }
}

module.exports = { start };
