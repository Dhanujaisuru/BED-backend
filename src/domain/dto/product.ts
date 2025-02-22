import { z } from "zod";

export const CreateProductDTO = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().min(0.00, "Price must be a positive number"),
  description: z.string().min(1, "Description is required"),
  category: z.string().min(1, "Category is required"),
  image: z.string().min(1, "Image path is required"), 
  stock: z.number().int().min(0, "Stock must be a non-negative integer"),
});