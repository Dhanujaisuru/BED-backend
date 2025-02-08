import express from "express";
import { createOrder } from "../applications/order";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const orderRouter = express.Router();

orderRouter.route("/").post(createOrder);
// orderRouter
//   .route("/:id")
//   .get(getProduct)
//   .delete(deleteProduct)
//   .patch(updateProduct);