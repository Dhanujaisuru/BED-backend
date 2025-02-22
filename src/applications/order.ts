import { NextFunction, Request, Response } from "express";
import ValidationError from "../domain/errors/validation-error";
import Order from "../infrastructure/schemas/Order";
import Product from "../infrastructure/schemas/Product";
import { getAuth } from "@clerk/express";
import NotFoundError from "../domain/errors/not-found-error";
import Address from "../infrastructure/schemas/Address";
import { CreateOrderDTO } from "../domain/dto/order";

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

    const userId = req.auth.userId;

    for (const item of result.data.items) {
      const product = await Product.findById(item.product);
      if (!product) {
          throw new NotFoundError(`Product ${item.product} not found`);
      }
      if (product.stock < item.quantity) {
          throw new ValidationError(`Not enough stock for product ${product.name}`);
      }
      product.stock -= item.quantity;
      await product.save();
  }

    const address = await Address.create({
      ...result.data.shippingAddress,
    });

    await Order.create({
      userId,
      items: result.data.items,
      addressId: address._id,
    });

    res.status(201).send();
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
      res.status(401).json({ error: "Unauthorized" });
      return;
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