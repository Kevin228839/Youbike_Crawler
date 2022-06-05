const amqp = require('amqplib/callback_api');
const { MongoClient } = require("mongodb");

amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
        throw error0;
    }
    connection.createChannel(async function(error1, channel) {
        if (error1) {
            throw error1;
        }
        // mongodb connection
        const uri = "mongodb://localhost:2717,localhost:2727,localhost:2737/?replicaSet=myReplicaSet&readPreference=secondary";
        const client = new MongoClient(uri);
        await client.connect();
        const database = client.db("demo");
        const youbike = database.collection("youbike");
        console.log("Connected successfully to db server, start writing youbike1 data");
        // rabbitmq 
        const queue = 'crawler1';
        channel.assertQueue(queue, {
            durable: false
        });
        console.log('Waiting for messages in %s. To exit press CTRL+C', queue);

        channel.consume(queue, async function(msg) {
            channel.ack(msg);
            const receiveMsg = JSON.parse(msg.content.toString());
            const datatime = receiveMsg.mday.substring(0,4) + '-' + receiveMsg.mday.substring(4,6) + '-' + receiveMsg.mday.substring(6,8) + ' ' + receiveMsg.mday.substring(8,10) + ':' + receiveMsg.mday.substring(10,12) + ':' + receiveMsg.mday.substring(12,14);
            const finalMsg = {
                'station': receiveMsg.sna,
                'version': 'v1',
                'available': parseInt(receiveMsg.sbi),
                'location': {'type': 'Point', 'coordinates': [parseFloat(receiveMsg.lng), parseFloat(receiveMsg.lat)]},
                'datatime': datatime,
            };
            await youbike.insertOne(finalMsg);
            console.log(finalMsg);
        }, {
            noAck: false
        });
    });
});

