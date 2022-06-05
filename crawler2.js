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
    const queue = 'crawler2';
    channel.assertQueue(queue, {
      durable: false
    });
    setInterval(() => {
      axios.get('https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json')
      .then((response) => {
        for(let i=0; i<response.data.length; i++) {
          const msg = JSON.stringify(response.data[i]);
          channel.sendToQueue(queue, Buffer.from(msg));
          console.log(JSON.parse(msg));
        }
      }).catch(error => {
        console.log(error);
      });
    },60000);
  });
});

