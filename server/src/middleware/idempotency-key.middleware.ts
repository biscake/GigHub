import { NextFunction, Request, Response, Send } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../errors/bad-request-error";
import { prisma } from "../lib/prisma";

export const idempotencyKey = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!idempotencyKey) {
      throw new BadRequestError("Missing idempotency key");
    };

    const idempotencyKeyRecord = await prisma.idempotencyKey.findUnique({
      where: {
        id: idempotencyKey
      }
    });

    if (idempotencyKeyRecord) {
      res.status(200).json(idempotencyKeyRecord.responseBody);
      return;
    } else {
      await prisma.idempotencyKey.create({
        data: {
          id: idempotencyKey
        }
      })
    }

    req.idempotencyKey = idempotencyKey;

    next();
  }
)
