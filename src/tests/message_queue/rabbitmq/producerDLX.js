const amqp = require("amqplib");
const message = "hello rabbit MQ for me";
const log= console.log;
console.log = function() {
  log.apply(console, [new Date()].concat(arguments))
}

const runProducer = async () => {
  try {
    // const connection = await amqp.connect("amqp://localhost");
    const connection = await amqp.connect(
      "amqp://guest:letronghiep1@localhost"
    );

    const channel = await connection.createChannel();

    const notificationExchange = "notificationEx";
    const notifyQueue = "notificationQueueProcess";
    const notificationExchangeDLX = "notificationExDLX";
    const notificationRoutingKeyDLX = "notificationRoutingKeyDLX";
    // 1 create exchange
    await channel.assertExchange(notificationExchange, "direct", {
      durable: true,
    });

    // 2 create queue
    const queueResult = await channel.assertQueue(notifyQueue, {
      exclusive: false, // cho phep cac ket noi truy cap vao cung 1 luc hang doi
      deadLetterExchange: notificationExchangeDLX,
      deadLetterRoutingKey: notificationRoutingKeyDLX,
    });

    // 3 bind queue to exchange
    await channel.bindQueue(queueResult.queue, notificationExchange);

    // 4 send message
    const message = "send a notification...";
    console.log(`producer msg::`, message);
    await channel.sendToQueue(queueResult.queue, Buffer.from(message), {
      expiration: "10000",
    });

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.log(error);
  }
};

runProducer().catch((error) => {
  console.log(error);
});
