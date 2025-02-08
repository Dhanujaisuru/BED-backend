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
app.use(cors({ origin: "http://localhost:5173" }));

// app.use((req, res, next) => {
//     console.log("Request Recieved");
//     console.log(req.method, req.url);
// })

app.use("/api/products", productRouter);
app.use("/api/categories", categoryRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentsRouter);
app.use(globalErrorHandlingMiddleware);

connectDB();

app.listen(8000, () => console.log(`Server running on port ${8000}`));