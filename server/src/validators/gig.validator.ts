import { body } from "express-validator";

export const createGigValidators = [
  body("title")
    .isString()
    .withMessage("Title must be a string")
    .isLength({ min: 3 })
    .withMessage("Title must be at least 3 characters long"),

  body("description")
    .isString()
    .withMessage("Description must be a string")
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters long"),

  body("price")
    .isFloat({ gt: 0 })
    .withMessage("Price must be a positive number"),
];