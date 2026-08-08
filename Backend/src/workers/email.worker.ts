import { getChannel } from "../lib/rabbitmq.ts";
import { sendEmail } from "../config/mailer.ts";

export const startEmailWorker = async () => {
  const channel = getChannel();

  channel.consume("email_queue", async (msg) => {
    if (!msg) return;

    const job = JSON.parse(msg.content.toString());

    try {
      if (job.type === "VERIFY_EMAIL") {
        await sendEmail(
          job.email,
          "Verify your email",
          `<p>Your verification code is <b>${job.otp}</b>.</p>`
        );
      }

      channel.ack(msg);
    } catch (err) {
      if (job.retries < 3) {
        job.retries++;

        channel.sendToQueue(
          "email_retry_queue",
          Buffer.from(JSON.stringify(job)),
          { persistent: true }
        );

        channel.ack(msg);
      } else {
        channel.nack(msg, false, false);
      }
    }
  });

  console.log("Email worker started");
};
