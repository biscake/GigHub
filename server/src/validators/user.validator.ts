import { body } from "express-validator";

export const createReviewValidators = [
  body("comment")
    .isString()
    .withMessage("Comment must be a string")
    .isLength({ min: 3 })
    .withMessage("Comment must be at least 3 characters long"),

  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
];