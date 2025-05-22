import { Prisma } from "@prisma/client";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { CreateGigInDatabaseInput, GetGigsFromDatabaseInput } from "../types/gig";

export const createGigInDatabase = async (gig: CreateGigInDatabaseInput) => {
  try {
    const result = await prisma.gig.create({
      data: {
        imgKey: gig.imgKey,
        title: gig.title,
        price: new Prisma.Decimal(gig.price).toFixed(2),
        description: gig.description,
        authorId: gig.authorId,
        ...(gig.category && { category: gig.category })
      }
    });
  
    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to create gig in database");
  }
}

export const deleteGigFromDatabase = async ({ gigId }: { gigId: number; }) => {
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

export const getGigsFromDatabase = async (params: GetGigsFromDatabaseInput) => {
  try {
    const NUMBER_OF_GIGS: number = 20;

    const { category, minPrice, maxPrice, search, page = 1 } = params;

    const result = await prisma.gig.findMany({
      where: {
        ...(category && { category }),
        ...(search && {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        }),
        ...(minPrice || maxPrice ? {
          price: {
            ...(minPrice && { gte: minPrice }),
            ...(maxPrice && { lte: maxPrice })
          }
        } : {}),
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: NUMBER_OF_GIGS,
      skip: (page - 1) * 20
    })

    const gigsWithImgUrl = result.map(gig => ({
      ...gig,
      imgUrl: `${process.env.R2_PUBLIC_ENDPOINT}/${gig.imgKey}`
    }))

    return gigsWithImgUrl;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to fetch gigs from database");
  }
}