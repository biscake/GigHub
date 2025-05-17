import { body } from 'express-validator';
import { prisma } from '../lib/prisma';

const validateFormPassword = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .matches(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,16}$/)
    .withMessage(
      'Password must be 8–16 characters and include uppercase, lowercase, number, and special character',
    )
    .escape(),
];

const validateFormDuplicates = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .toLowerCase()
    .matches(/^[a-zA-Z0-9]+$/)
    .withMessage('Only alphanumeric usernames allowed')
    .isLength({ min: 4 })
    .withMessage('Username must be at least 4 characters')
    .custom(async (value: string) => {
      const user = await prisma.user.findUnique({
        where: {
          username: value,
        },
      });

      if (user) throw new Error('Username is already taken');
    })
    .escape(),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .trim()
    .toLowerCase()
    .matches(/^((?!\.)[\w\-_.]*[^.])(@\w+)(\.\w+(\.\w+)?[^.\W])$/)
    .withMessage('Invalid email format')
    .custom(async (value: string) => {
      const user = await prisma.user.findUnique({
        where: {
          email: value,
        },
      });

      if (user) throw new Error('Email is already in use');
    })
    .escape(),
];

// ✅ Flatten validators into one array for middleware use
export const validateForm = [
  ...validateFormPassword,
  ...validateFormDuplicates,
];
