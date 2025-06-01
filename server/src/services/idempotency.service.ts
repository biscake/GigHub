import { Prisma } from "@prisma/client";
import { BadRequestError } from "../errors/bad-request-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { StoreResponseInput } from "../types/idempotency";

export const storeResponse = async ({responseBody, idempotencyKey}: StoreResponseInput) => {
  try {
    if (!idempotencyKey) {
      throw new BadRequestError("Idempotency key missing");
    }

    await prisma.idempotencyKey.update({
      where: {
        id: idempotencyKey
      },
      data: {
        responseBody: responseBody
      }
    })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return;
    }

    throw new ServiceError("Prisma", "Failed to create idempotency record");
  }
}