// import express from "express";
// import { createOrder, getOrder, getOrders, getAllOrders } from "./../applications/order";
// import { isAuthenticated } from "./middleware/authentication-middleware";
// import { isAdmin } from "./middleware/authorization-middleware";

// export const orderRouter = express.Router();

// orderRouter.route("/").post(isAuthenticated, createOrder);
// orderRouter.route("/").get(isAuthenticated, getOrders);
// orderRouter.route("/:id").get(isAuthenticated, getOrder);
// orderRouter.route("/all").get(isAuthenticated, isAdmin, getAllOrders);

import express from "express";
import { createOrder, getOrder, getOrders, getAllOrders } from "./../applications/order";
import { isAuthenticated } from "./middleware/authentication-middleware";
import { isAdmin } from "./middleware/authorization-middleware";
import bodyParser from "body-parser";

export const orderRouter = express.Router();

orderRouter.use(bodyParser.json()); // Add this

orderRouter.route("/").post(isAuthenticated, createOrder);
orderRouter.route("/").get(isAuthenticated, getOrders);
orderRouter.route("/:id").get(isAuthenticated, getOrder);
orderRouter.route("/all").get(isAuthenticated, isAdmin, getAllOrders);