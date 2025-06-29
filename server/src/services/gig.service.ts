import { Prisma, Status } from "@prisma/client";
import { BadRequestError } from "../errors/bad-request-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { AcceptGigByIdParams, CreateGigInDatabaseParams, DeleteGigFromDatabaseParams, GetGigFromDatabaseByIdParams, GetGigsFromDatabaseParams, UpdateApplicationStatusByIdParams } from "../types/gig";

export const createGigInDatabase = async (gig: CreateGigInDatabaseParams) => {
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
    if (err instanceof BadRequestError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to create gig in database");
  }
}

export const deleteGigFromDatabase = async ({ id }: DeleteGigFromDatabaseParams) => {
  try {
    const result = await prisma.gig.delete({
      where: {
        id: id
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to delete gig from database");
  }
}

export const getGigsFromDatabase = async (params: GetGigsFromDatabaseParams) => {
  try {
    const { category, minPrice, maxPrice, search, page = 1, NUMBER_OF_GIGS } = params;

    const filters = {
      ...(category && { category }),
      ...(search && {
        title: {
          contains: search,
          mode: 'insensitive' as const
        }
      }),
      ...(minPrice || maxPrice ? {
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice })
        }
      } : {}),
    };

    const result = await prisma.gig.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc',
      },
      take: NUMBER_OF_GIGS,
      skip: (page - 1) * NUMBER_OF_GIGS
    });

    const totalGigs = await prisma.gig.count({
      where: filters,
    });

    const gigsWithImgUrl = result.map(gig => ({
      ...gig,
      imgUrl: `${process.env.R2_PUBLIC_ENDPOINT}/${gig.imgKey}`,
      price: gig.price.toFixed(2),
    }))

    return { gigs: gigsWithImgUrl, totalCount: totalGigs };
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to fetch gigs from database");
  }
}

export const getGigFromDatabaseById = async ({ id }: GetGigFromDatabaseByIdParams) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: {
        id: id
      },
      include: {
        GigApplication: true
      }
    })

    return gig;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to fetch gig from database");
  }
}

export const createGigApplicationById = async ({ gigId, userId }: AcceptGigByIdParams) => {
  try {
    const application = await prisma.gigApplication.create({
      data: {
        gigId: gigId,
        userId: userId
      }
    })

    return application;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to create gig application");
  }
}

export const acceptGigApplicationById = async ({ applicationId }: UpdateApplicationStatusByIdParams) => {
  try {
    await prisma.gigApplication.update({
      where: {
        id: applicationId
      },
      data: {
        status: Status.ACCEPTED
      }
    })
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to update status of application in database");
  }
}

export const rejectGigApplicationById = async ({ applicationId }: UpdateApplicationStatusByIdParams) => {
  try {
    await prisma.gigApplication.update({
      where: {
        id: applicationId
      },
      data: {
        status: Status.REJECTED
      }
    })
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to update status of application in database");
  }
}

export const getSentApplicationsByUserId = async ({ userId, page = 1, COUNT }: { userId: number; page: number; COUNT: number; }) => {
  try {
    const result = await prisma.gigApplication.findMany({
      where: {
        userId,
        status: Status.PENDING
      },
      take: COUNT,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * COUNT,
      include: {
        user: {
          include: {
            applicationStats: true
          }
        },
        gig: {
          include: {
            author: true
          }
        }
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get user's sent applications from database");
  }
}

export const getReceivedApplicationsByUserId = async ({ userId, page = 1, COUNT }: { userId: number; page: number; COUNT: number; }) => {
  try {
    const result = await prisma.gigApplication.findMany({
      where: {
        gig: {
          authorId: userId
        },
        status: Status.PENDING
      },
      take: COUNT,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * COUNT,
      include: {
        user: {
          include: {
            applicationStats: true
          }
        },
        gig: {
          include: {
            author: true,
          }
        }
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get user's received applications from database");
  }
}

export const getApplicationByApplicationId = async ({ applicationId }: { applicationId: number }) => {
  try {
    const result = await prisma.gigApplication.findUnique({
      where: {
        id: applicationId
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get gig application from database");
  }
} 

export const getApplicationStatByUserId = async ({ userId }: { userId: number; }) => {
  try {
    const result = await prisma.applicationStats.findUnique({
      where: {
        userId
      }
    })

    return result;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get user's application stats from database");
  }
}

export const deleteApplicationByApplicationId = async ({ applicationId }: { applicationId: number; }) => {
  try {
    await prisma.gigApplication.delete({
      where: {
        id: applicationId
      }
    })
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to delete application from database");
  }
}

export const updateApplicationMessageById = async ({ message, applicationId }: { message: string; applicationId: number }) => {
  try {
    await prisma.gigApplication.update({
      where: {
        id: applicationId,
      },
      data: {
        message
      }
    })
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to update application message in database");
  }
}

export const getAcceptedApplicationsByUserId = async ({ userId, page = 1, COUNT }: { userId: number; page: number; COUNT: number; }) => {
  try {
    const result = await prisma.gigApplication.findMany({
      where: {
        userId,
        status: Status.ACCEPTED
      },
      take: COUNT,
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * COUNT,
      include: {
        gig: {
          include: {
            author: true,
          }
        }
      }
    })

    const totalGigs = await prisma.gigApplication.count({
      where: {
        userId,
        status: Status.ACCEPTED
      },
    });

    return { applications: result, totalCount: totalGigs};
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get user's received applications from database");
  }
}

export const getPostedGigsWithApplications = async ({ userId, page = 1, COUNT }: { userId: number; page: number; COUNT: number; }) => {
  try {
    const result = await prisma.gig.findMany({
      where: {
        authorId: userId,
        GigApplication: {
          some: {
            status: Status.ACCEPTED
          }
        }
      },
      include: {
        GigApplication: {
          where: {
            status: Status.ACCEPTED
          },
          include: {
            user: true
          }
        }
      },
      skip: (page - 1) * COUNT,
      take: COUNT,
      orderBy: {
        createdAt: 'desc'
      },
    })

    const totalGigs = await prisma.gig.count({
      where: {
        authorId: userId,
        GigApplication: {
          some: {
            status: Status.ACCEPTED
          }
        }
      },
    });

    return { gigs: result, totalCount: totalGigs};
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get user's posted gigs from database");
  }
}