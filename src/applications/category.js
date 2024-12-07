// 

import NotFoundError from "../domain/errors/not-found-error.js";

const categories = [
    {
        categoryId: "1",
        name: "Headphones",
        image: "/assets/products/quietcomfort.png",
    },
    {
        categoryId: "2",
        name: "Earbuds",
        image: "/assets/products/pixel-buds.png",
    },
    {
        categoryId: "3",
        name: "Speakers",
        image: "/assets/products/echo-dot.png",
    },
    {
        categoryId: "4",
        name: "Mobile Phones",
        image: "/assets/products/iphone-15.png",
    },
    {
        categoryId: "5",
        name: "Smart Watches",
        image: "/assets/products/apple-watch.png",
    },
];

// Get all categories
export const getCategories = (req, res, next) => {
    try {
        return res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

// Create a new category
export const createCategory = (req, res, next) => {
    try {
        const newCategory = req.body;
        categories.push(newCategory);
        return res.status(201).json(newCategory); // Return the created category
    } catch (error) {
        next(error);
    }
};

// Get a single category by ID
export const getCategory = (req, res, next) => {
    try {
        const id = req.params.id;
        const category = categories.find((cat) => cat.categoryId === id); // Use categoryId
        if (!category) {
            throw new NotFoundError("Category not found");
        }
        return res.status(200).json(category); // Return the correct variable
    } catch (error) {
        next(error);
    }
};

// Delete a category by ID
export const deleteCategory = (req, res, next) => {
    try {
        const id = req.params.id;
        const index = categories.findIndex((cat) => cat.categoryId === id); // Use categoryId

        if (index === -1) {
            throw new NotFoundError("Category not found");
        }
        categories.splice(index, 1); // Remove the category
        return res.status(204).send(); // No content response
    } catch (error) {
        next(error);
    }
};

// Update a category by ID
export const updateCategory = (req, res, next) => {
    try {
        const id = req.params.id;
        const category = categories.find((cat) => cat.categoryId === id); // Use categoryId

        if (!category) {
            throw new NotFoundError("Category not found");
        }

        category.name = req.body.name; // Update the category name
        return res.status(200).json(category); // Return the updated category
    } catch (error) {
        next(error);
    }
};
