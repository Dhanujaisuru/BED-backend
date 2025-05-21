import { Request, Response } from "express";
import util from "util";
import mongoose from "mongoose";
import Order from "../infrastructure/schemas/Order";
import stripe from "../infrastructure/stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;
const FRONTEND_URL = process.env.FRONTEND_URL as string;

async function fulfillCheckout(sessionId: string) {
  console.log("Fulfilling Checkout Session:", sessionId);

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  console.log("Stripe Session:", util.inspect(checkoutSession, false, null, true));

  const orderId = checkoutSession.metadata?.orderId;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid or missing order ID in metadata");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  if (order.paymentStatus !== "PENDING" || order.orderStatus !== "PENDING") {
    console.log("Order already fulfilled or not pending:", order._id);
    return;
  }

  if (checkoutSession.payment_status === "paid") {
    const updatedOrder = await Order.findByIdAndUpdate(order._id, {
      paymentStatus: "PAID",
      orderStatus: "CONFIRMED",
    }, { new: true });

    console.log("Order updated:", updatedOrder);
  } else {
    console.warn("Payment not completed:", checkoutSession.payment_status);
  }
}

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    console.log("Webhook event type:", event.type);

    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const sessionId = event.data.object.id;
      console.log("Triggering fulfillment for session:", sessionId);

      try {
        await fulfillCheckout(sessionId);
        res.status(200).send();
      } catch (error) {
        console.error("Fulfillment error:", error);
        res.status(500).send("Error fulfilling order");
      }
      return;
    }

    res.status(200).send(); // Respond to all other event types
  } catch (err: any) {
    console.error("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  const orderId = req.body.orderId;
  console.log("Creating checkout session for order:", orderId);

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    line_items: order.items.map((item) => ({
      price: item.product.stripePriceId,
      quantity: item.quantity,
    })),
    mode: "payment",
    return_url: `${FRONTEND_URL}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
    metadata: {
      orderId: order._id.toString(),
    },
  });

  res.send({ clientSecret: session.client_secret });
};

export const retrieveSessionStatus = async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;

  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const orderId = checkoutSession.metadata?.orderId;

  if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid or missing order ID in metadata");
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error("Order not found");
  }

  res.status(200).json({
    orderId: order._id,
    status: checkoutSession.status,
    customer_email: checkoutSession.customer_details?.email,
    orderStatus: order.orderStatus,
    paymentStatus: order.paymentStatus,
  });
};
