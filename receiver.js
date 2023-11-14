const amqp = require('amqplib/callback_api');
const { MongoClient } = require("mongodb");

module.exports = amqp.connect('amqp://my-rabbitmq', function(error, connection) {
    if (error) {
        console.log(error);
    }
    connection.createChannel(async function(error, channel) {
        if (error) {
            console.log(error);
        }
        // mongodb connection
        const uri = "mongodb://my-mongodb:27017";
        const client = new MongoClient(uri);
        await client.connect();
        const database = client.db("demo");
        const youbike = database.collection("youbike");
        // rabbitmq 
        const queue = 'crawler2';
        channel.assertQueue(queue, {
            durable: false
        });
        channel.consume(queue, function(msg) {
            channel.ack(msg);
            const receiveMsg = JSON.parse(msg.content.toString());
            const finalMsg = {
                'station': receiveMsg.sna,
                'version': 'v2',
                'available': parseInt(receiveMsg.sbi),
                'location': {'type': 'Point', 'coordinates': [parseFloat(receiveMsg.lng), parseFloat(receiveMsg.lat)]},
                'datatime': receiveMsg.mday,
            };
            youbike.insertOne(finalMsg);
        }, {
            noAck: false
        });
    });
});

