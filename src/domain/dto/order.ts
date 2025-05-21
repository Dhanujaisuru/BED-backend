import { z } from "zod";

export const CreateOrderDTO = z.object({
  items: z
    .object({
      product: z.object({
        _id: z.string().min(1, "Product ID is required"),
        name: z.string().min(1, "Product name is required"),
        price: z.number().min(0, "Price must be non-negative"),
        image: z.string().min(1, "Product image is required"),
        description: z.string().min(1, "Product description is required"),
        stripePriceId: z.string().optional(),
      }),
      quantity: z.number().int().min(1, "Quantity must be at least 1"),
    })
    .array()
    .min(1, "At least one item is required"),
  shippingAddress: z.object({
    line_1: z.string().min(1, "Address line 1 is required"),
    line_2: z.string().optional(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zip_code: z.string().min(1, "Zip code is required"),
    phone: z.string().min(1, "Phone number is required"),
  }),
});