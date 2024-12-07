import express from "express";
import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "../applications/category.js";

export const categoryRouter =  express.Router()

categoryRouter.route('/').get(getCategories).post(createCategory)
categoryRouter.route('/:id').get(getCategory).delete(deleteCategory).patch(updateCategory)