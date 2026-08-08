import { getChannel } from "../../lib/rabbitmq.ts";

type EmailJob =
  | {
      type: "VERIFY_EMAIL";
      email: string;
      otp: string;
    }
  | {
      type: "RESET_PASSWORD";
      email: string;
      resetUrl: string;
    };

export const queueEmail = async (job: EmailJob) => {
  const channel = getChannel();

  channel.sendToQueue(
    "email_queue",
    Buffer.from(
      JSON.stringify({
        ...job,
        retries: 0,
      })
    ),
    { persistent: true }
  );
};
