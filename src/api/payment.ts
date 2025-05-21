import express from "express";
import { createCheckoutSession, retrieveSessionStatus, handleWebhook } from "../applications/payment";
import bodyParser from "body-parser";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const paymentsRouter = express.Router();

paymentsRouter.use(bodyParser.json());

paymentsRouter.route("/create-checkout-session").post(isAuthenticated, createCheckoutSession);
paymentsRouter.route("/session-status").get(isAuthenticated, retrieveSessionStatus);
paymentsRouter.post("/webhook", express.raw({ type: "application/json" }), handleWebhook);