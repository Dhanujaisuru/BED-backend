import express from "express";
import { createOrder, getOrder, getOrders } from "./../applications/order";
import { isAuthenticated } from "./middleware/authentication-middleware";

export const orderRouter = express.Router();

orderRouter.route("/").post(isAuthenticated, createOrder);  
orderRouter.route("/").get(isAuthenticated, getOrders);   
orderRouter.route("/:id").get(isAuthenticated, getOrder);