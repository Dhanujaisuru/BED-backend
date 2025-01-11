import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

import { productRouter } from './api/product.js';
import { categoryRouter } from './api/category.js';
import { connectDB } from './infrastructure/db.js';
import globalErrorHandlingMiddleware from './api/middleware/global-error-handling-middleware.js';
import cors from "cors";

app.use(express.json()); // For parsing JSON requests
app.use(cors({ origin: "http://localhost:5173" }));

// app.use((req, res, next) => {
//     console.log("Request Recieved");
//     console.log(req.method, req.url);
// })

app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use(globalErrorHandlingMiddleware);

connectDB();

app.listen(8000, () => console.log(`Server running on port ${8000}`));