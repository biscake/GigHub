import { body } from 'express-validator';
import { ServiceError } from '../errors/service-error';
import { prisma } from '../lib/prisma';
import { ConflictError } from '../errors/conflict-error';

export const validateFormPassword = [
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .trim()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,16}$/)
    .withMessage(
      'Password must be 8–16 characters and include uppercase, lowercase, number and a special character.',
    )
    .escape(),

  body('cpassword')
    .notEmpty()
    .withMessage('Confirm password required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
    .escape(),
];

export const validateFormDuplicates = [
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
      try {
        const user = await prisma.user.findUnique({
          where: {
            username: value,
          },
        });

        if (user) throw new ConflictError('Username is already taken');
      } catch (err) {
        if (err instanceof ConflictError) {
          throw err;
        }

        throw new ServiceError("Prisma", "Failed to query user in database");
      }
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
      try {
        const user = await prisma.user.findUnique({
          where: {
            email: value,
          },
        });

        if (user) throw new ConflictError('Email is already in use');
      } catch (err) {
        if (err instanceof ConflictError) {
          throw err;
        }

        throw new ServiceError("Prisma", "Failed to query user in database");
      }
    })
    .escape(),
];

