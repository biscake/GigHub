import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response, Send } from "express";
import asyncHandler from "express-async-handler";
import { BadRequestError } from "../errors/bad-request-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";

export const idempotencyKey = asyncHandler(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const idempotencyKey = req.headers["idempotency-key"] as string;

    if (!idempotencyKey) {
      throw new BadRequestError("Missing idempotency key");
    };

    let idempotencyKeyRecord;

    try {
      idempotencyKeyRecord = await prisma.idempotencyKey.findUnique({
        where: {
          id: idempotencyKey
        }
      });
    } catch (err) {
      throw new ServiceError("Prisma", "Failed to get idempotency key record from database");
    }


    if (idempotencyKeyRecord) {
      res.status(200).json(idempotencyKeyRecord.responseBody);
      return;
    } else {
      try {
        await prisma.idempotencyKey.create({
          data: {
            id: idempotencyKey
          }
        })        
      } catch (err) {
        // to catch race condition where two identical request with same idempotency key arrive at the same time
        // where both may pass the .findUnique check but cause a unique constraint violation in .create
        if ((err as Prisma.PrismaClientKnownRequestError).code === 'P2002') {
          try {
            const existingRecord = await prisma.idempotencyKey.findUnique({
              where: { id: idempotencyKey }
            });

            res.status(200).json(existingRecord?.responseBody ?? {});
            return;
          } catch (err) {
            throw new ServiceError("Prisma", "Failed to get idempotency key record from database");
          }
        }
      }
    }

    req.idempotencyKey = idempotencyKey;

    next();
  }
)
