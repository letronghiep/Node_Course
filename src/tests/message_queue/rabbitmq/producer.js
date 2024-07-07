const amqp = require("amqplib");
const message = "hello rabbit MQ for me";
const runProducer = async () => {
  try {
    // const connection = await amqp.connect("amqp://localhost");
    const connection = await amqp.connect("amqp://guest:letronghiep1@localhost");

    const channel = await connection.createChannel();
    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });
    // send message to consumer channel
    channel.sendToQueue(queueName, Buffer.from(message));
    console.log(`message sent: `, message);
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500)
  } catch (error) {
    console.log(error);
  }
};

runProducer().catch((error) => {
  console.log(error);
});
