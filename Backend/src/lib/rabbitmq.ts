import amqp from "amqplib";

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  const connection = await amqp.connect(process.env.RABBITMQ_URL!);

  channel = await connection.createChannel();

  channel.prefetch(10);

  await channel.assertExchange("email_dlx", "direct", {
    durable: true,
  });

  await channel.assertQueue("email_dlq", {
    durable: true,
  });

  await channel.bindQueue(
    "email_dlq",
    "email_dlx",
    "failed"
  );

  await channel.assertQueue("email_queue", {
    durable: true,
    deadLetterExchange: "email_dlx",
    deadLetterRoutingKey: "failed",
  });

  await channel.assertQueue("email_retry_queue", {
    durable: true,
    messageTtl: 30000,
    deadLetterExchange: "",
    deadLetterRoutingKey: "email_queue",
  });

  console.log("RabbitMQ connected");
};

export const getChannel = () => channel;
