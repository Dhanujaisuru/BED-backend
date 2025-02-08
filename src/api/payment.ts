import express from "express";
import { handleWebhook } from "../applications/payment";

export const paymentsRouter = express.Router();

paymentsRouter.route("/webhook").post(handleWebhook);