import { z } from "zod";

export const ProductDTO = z.object({
  name: z.string(),
});