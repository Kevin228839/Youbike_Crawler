const axios = require('axios');
const amqp = require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(error0, connection) {
  if (error0) {
    throw error0;
  }
  connection.createChannel(function(error1, channel) {
    if (error1) {
      throw error1;
    }
    const queue = 'crawler1';
    channel.assertQueue(queue, {
      durable: false
    });
    setInterval(() => {
      axios.get('https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json')
      .then((response) => {
        for(let i=0; i<Object.values(response.data.retVal).length; i++) {
          const msg = JSON.stringify(Object.values(response.data.retVal)[i]);
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log(JSON.parse(msg));
        }
      }).catch(error => {
        console.log(error);
      });
    },60000);
  });
});

