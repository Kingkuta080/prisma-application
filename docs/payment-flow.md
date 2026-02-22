# Payment flow (Naira / Paystack via gateway)

Payment is in **Naira (NGN)**. The app uses an external payment gateway that integrates with Paystack. Flow: user clicks Pay → app calls the gateway to initialize → gateway returns a checkout URL and reference → app stores the reference on a PENDING payment → user completes payment on Paystack → status is updated via redirect and/or a RabbitMQ consumer.

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GATEWAY_PUBLIC_URL` | Yes (for real payments) | Base URL of the payment gateway (e.g. `https://gateway.example.com`). Used for initialize and validate. |
| `APP_URL` | Yes | App base URL (e.g. `http://localhost:3000`). Used for `redirectUrl` and for the consumer webhook URL. |
| `WEBHOOK_PAYMENT_SECRET` | Optional | Secret for webhook signature validation. If set, requests to `/api/webhooks/payment` must send `X-Webhook-Signature` with this value. |
| `RABBITMQ_URL` | Optional (for consumer) | RabbitMQ connection URL. Required only when running the payment queue consumer. |
| `PAYMENT_QUEUE_NAME` | Optional | Queue name passed to the gateway on initialize and consumed by the script. Default: `prisma_app_payments`. |

## Flow

1. **Initialize**  
   User clicks Pay on an application. The app calls the gateway `POST {GATEWAY_PUBLIC_URL}/api/v1/paystack/initialize` with `email`, `amount` (Naira), `redirectUrl` (`{APP_URL}/payment/result`), and optional `queueName`. The app updates the existing PENDING payment with the returned `reference` and redirects the user to `authorizationUrl` (Paystack checkout).

2. **Redirect (result page)**  
   After payment, the gateway redirects the user to `{APP_URL}/payment/result?status=success|failed&reference=...`. The result page optionally calls the gateway `POST .../validate` with the reference, then finds the Payment by `reference` and updates it (PENDING → COMPLETED or FAILED) and, on success, sets the Application to PAID. Updates are idempotent (only from PENDING).

3. **Webhook (by reference)**  
   The gateway receives Paystack webhooks and can publish events to RabbitMQ. The app’s webhook `POST /api/webhooks/payment` accepts the full Paystack event shape: `event` and `data.reference`, `data.status`. It finds the Payment by `data.reference` and updates status (idempotent). This supports both the legacy payload (`paymentId`/`applicationId` + `status`) and the gateway/Paystack payload.

4. **RabbitMQ consumer (optional)**  
   Run the consumer so that events published by the gateway are forwarded to the app webhook:

   ```bash
   npm run payment:consumer
   ```

   Requires `RABBITMQ_URL` and `APP_URL`. The script consumes the queue named `PAYMENT_QUEUE_NAME` (default `prisma_app_payments`) and POSTs each message body to `{APP_URL}/api/webhooks/payment`. If `WEBHOOK_PAYMENT_SECRET` is set, the script sends it as `X-Webhook-Signature`. Run this process separately (e.g. PM2, Docker, or systemd) so it stays running.

## Idempotency

Both the result page (redirect) and the webhook (called by the consumer or directly) can update the same payment by reference. The app only transitions a payment from PENDING to COMPLETED or FAILED, so duplicate deliveries do not cause inconsistent state.

## Currency

All amounts are in **Naira (NGN)**. The gateway expects amount in major units (Naira); it converts to kobo when calling Paystack. The `Payment` model has an optional `currency` field (default `"NGN"`).
