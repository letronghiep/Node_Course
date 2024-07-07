const amqp = require("amqplib");
const runConsumer = async () => {
  try {
    const connection = await amqp.connect("amqp://guest:letronghiep1@localhost");
    const channel = await connection.createChannel();
    const queueName = "test-topic";
    await channel.assertQueue(queueName, {
      durable: true,
    });
    // send message to consumer channel
    channel.consume(
      queueName,
      (message) => {
        console.log(`Received ${message.content.toString()} message`);
      },
      {
        noAck: true,
      }
    );
    // console.log(`message sent: `, message);
  } catch (error) {
    console.log(error);
  }
};

runConsumer().catch((error) => {
  console.log(error);
});
