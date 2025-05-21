import { NextFunction, Request, Response } from "express";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
import Product from "../infrastructure/schemas/Product";
import Address from "../infrastructure/schemas/Address";
import { CreateOrderDTO } from "../domain/dto/order";
import NotFoundError from "../domain/errors/not-found-error";

type ExpressHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

export const createOrder: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateOrderDTO.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError("Invalid order data");
    }

    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const address = await Address.create({
      ...result.data.shippingAddress,
    });

    const items = await Promise.all(
      result.data.items.map(async (item) => {
        const product = await Product.findById(item.product._id);
        if (!product) {
          throw new NotFoundError(`Product not found: ${item.product._id}`);
        }
        if (!product.stripePriceId) {
          throw new ValidationError(`Missing stripePriceId for product: ${item.product._id}`);
        }
        return {
          ...item,
          product: { ...item.product, stripePriceId: product.stripePriceId },
        };
      })
    );

    const order = await Order.create({
      userId,
      items,
      addressId: address._id,
      paymentStatus: "PENDING",
      orderStatus: "PENDING",
    });

    res.status(201).json({ orderId: order._id });
  } catch (error) {
    next(error);
  }
};

export const getOrder: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const order = await Order.findById(id)
      .populate({
        path: "addressId",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });
    if (!order) {
      throw new NotFoundError("Order not found");
    }
    console.log("Fetched order:", order);
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const getOrders: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      throw new ValidationError("User not authenticated");
    }

    const orders = await Order.find({ userId })
      .populate({
        path: "addressId",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAllOrders: ExpressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find({})
      .populate({ path: "addressId", model: "Address" })
      .populate({ path: "items.product", model: "Product" });

    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};