import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { CreateGigInDatabaseInput } from "../types/gig";

export const createGigInDatabase = async (gig: CreateGigInDatabaseInput) => {
  try {
    const result = await prisma.gig.create({
      data: {
        imgKey: gig.imgKey,
        title: gig.title,
        price: gig.price,
        description: gig.description,
        authorId: gig.authorId,
      }
    });
  
    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to create gig in database");
  }
}

export const deleletGigFromDatabase = async ({ gigId }: { gigId: number; }) => {
  try {
    const result = await prisma.gig.delete({
      where: {
        id: gigId 
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to delete gig from database");
  }
}