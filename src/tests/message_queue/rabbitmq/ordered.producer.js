"use strict";
const amqp = require("amqplib");

async function consumerOrderedMessage() {
  const connection = await amqp.connect("amqp://guest:letronghiep1@localhost");
  const channel = await connection.createChannel();
  const queueName = "ordered-queue";
  await channel.assertQueue(queueName, {
    durable: true,
  });

  for (let i = 0; i < 10; i++) {
    const message = `ordered-queue-message::${i}`;
    console.log(message);
    channel.sendToQueue(queueName, Buffer.from(message), {
      persistent: true,
    });
  }
  setTimeout(() => {
    connection.close();
  }, 1000);
}
consumerOrderedMessage().catch((err) => {
  console.log(err);
});
