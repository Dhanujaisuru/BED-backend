import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

import { productRouter } from './api/product';
import { categoryRouter } from './api/category';
import { connectDB } from './infrastructure/db';
import globalErrorHandlingMiddleware from './api/middleware/global-error-handling-middleware';
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { orderRouter } from "./api/order";
import { paymentsRouter } from "./api/payment";

app.use(express.json()); // For parsing JSON requests
app.use(clerkMiddleware());
app.use(cors({ origin: "https://fed-storefront-frontend-dhanuja.netlify.app" }));

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);

app.use(globalErrorHandlingMiddleware);

connectDB();
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));