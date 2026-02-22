/**
 * RabbitMQ consumer for payment gateway queue.
 * Consumes messages (Paystack event payloads) and POSTs them to the app webhook.
 * Run: npm run payment:consumer (requires RABBITMQ_URL, APP_URL; optional WEBHOOK_PAYMENT_SECRET)
 */
import "dotenv/config";
import amqp from "amqplib";

const RABBITMQ_URL = process.env.RABBITMQ_URL;
const QUEUE_NAME = process.env.PAYMENT_QUEUE_NAME ?? "prisma_app_payments";
const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(
  /\/$/,
  ""
);
const WEBHOOK_URL = `${APP_URL}/api/webhooks/payment`;
const WEBHOOK_SECRET = process.env.WEBHOOK_PAYMENT_SECRET;

async function run() {
  if (!RABBITMQ_URL?.trim()) {
    console.error("RABBITMQ_URL is required");
    process.exit(1);
  }

  const conn = await amqp.connect(RABBITMQ_URL);
  const channel = await conn.createChannel();
  await channel.assertQueue(QUEUE_NAME, { durable: true });

  channel.consume(
    QUEUE_NAME,
    async (msg) => {
      if (!msg) return;
      const raw = msg.content.toString("utf8");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (WEBHOOK_SECRET) {
        headers["X-Webhook-Signature"] = WEBHOOK_SECRET;
      }
      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers,
          body: raw,
        });
        if (res.ok || res.status === 400) {
          channel.ack(msg);
        } else {
          channel.nack(msg, false, true);
        }
      } catch (err) {
        console.error("Webhook request failed:", err);
        channel.nack(msg, false, true);
      }
    },
    { noAck: false }
  );

  console.log(`Consuming queue: ${QUEUE_NAME}, posting to: ${WEBHOOK_URL}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
