import { CreateProductDTO } from "./../domain/dto/product";
import NotFoundError from "./../domain/errors/not-found-error";
import ValidationError from "./../domain/errors/validation-error";
import Product from "./../infrastructure/schemas/Product";
import Category from "./../infrastructure/schemas/Category";
import { Request, Response, NextFunction } from "express";
import stripe from "./../infrastructure/stripe";
import mongoose from "mongoose";

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = CreateProductDTO.safeParse(req.body);
    if (!result.success) {
      console.error("DTO validation failed:", result.error.format());
      throw new ValidationError("Invalid product data");
    }

    const category = await Category.findOne({ name: result.data.category });
    if (!category) {
      console.error("Category not found:", result.data.category);
      throw new ValidationError(`Category '${result.data.category}' not found`);
    }

    const productData = {
      name: result.data.name,
      categoryId: category._id,
      image: result.data.image,
      price: result.data.price,
      description: result.data.description,
      stock: result.data.stock,
    };

    const stripeProduct = await stripe.products.create({
      name: productData.name,
      description: productData.description,
      default_price_data: {
        currency: "usd",
        unit_amount: productData.price * 100,
      },
    });

    const product = await Product.create({
      ...productData,
      stripePriceId: stripeProduct.default_price,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error in createProduct:", {
      message: (error as any).message,
      stack: (error as any).stack,
      data: req.body,
    });
    next(error);
  }
};

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.query;

    if (categoryId && !mongoose.Types.ObjectId.isValid(categoryId as string)) {
      throw new ValidationError("Invalid categoryId");
    }

    const data = await Product.find(categoryId ? { categoryId } : {});
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id).populate("categoryId");
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;
    const product = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!product) {
      throw new NotFoundError("Product not found");
    }
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};