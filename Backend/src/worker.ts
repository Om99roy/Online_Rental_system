import { connectRabbitMQ } from "./lib/rabbitmq.ts";
import { startEmailWorker } from "./workers/email.worker.ts";

await connectRabbitMQ();
await startEmailWorker();
