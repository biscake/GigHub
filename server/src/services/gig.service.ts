import { prisma } from "../lib/prisma";
import { CreateGigInDatabaseInput } from "../types/gig";

export const createGigInDatabase = async (gig: CreateGigInDatabaseInput) => {
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
}