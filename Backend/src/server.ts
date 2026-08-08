import "dotenv/config";
import app from "./app";
import { connectDB } from "./config/db";
import { connectRabbitMQ } from "./lib/rabbitmq";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDB();
    await connectRabbitMQ();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
