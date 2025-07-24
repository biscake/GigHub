import { GigApplication, Prisma, Status } from "@prisma/client";
import { BadRequestError } from "../errors/bad-request-error";
import { ServiceError } from "../errors/service-error";
import { prisma } from "../lib/prisma";
import { AcceptGigByIdParams, CreateGigInDatabaseParams, DeleteGigFromDatabaseParams, GetGigFromDatabaseByIdParams, GetGigsFromDatabaseParams, UpdateApplicationStatusByIdParams } from "../types/gig";
import { AppError } from "../errors/app-error";
import { NotFoundError } from "../errors/not-found-error";

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
console.log(err)
    throw new ServiceError("Prisma", "Failed to create gig in database");
  }
}

export const deleteGigFromDatabase = async ({ id }: DeleteGigFromDatabaseParams) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const incomingApplications = await tx.gigApplication.findMany({
        where: {
          gigId: id
        }
      })

      const deleted = await tx.gig.delete({
        where: {
          id
        }
      })

      await tx.applicationStats.updateMany({
        where: {
          userId: {
            in: incomingApplications.map(a => a.userId),
          }
        },
        data: {
          sent: {
            decrement: 1
          }
        }
      })

      await tx.applicationStats.update({
        where: {
          userId: deleted.authorId
        },
        data: {
          received: {
            decrement: incomingApplications.length
          }
        }
      })

      return deleted;
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
      skip: (page - 1) * NUMBER_OF_GIGS,
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
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

export const createGigApplicationById = async ({ gig, userId, message }: AcceptGigByIdParams) => {
  try {
    const isExist = await prisma.gigApplication.findFirst({
      where: {
        gigId: gig.id,
        userId,
        status: {
          in: [Status.PENDING, Status.ACCEPTED]
        }
      }
    });

    if (isExist) throw new BadRequestError("Already applied for this gig.");

    const result = await prisma.$transaction([
      prisma.gigApplication.create({
        data: {
          gigId: gig.id,
          userId: userId,
          message
        }
      }),
      prisma.applicationStats.upsert({
        where: {
          userId,
        },
        update: {
          sent: {
            increment: 1
          }
        },
        create: {
          userId
        }
      }),
      prisma.applicationStats.upsert({
        where: {
          userId: gig.authorId
        },
        update: {
          received: {
            increment: 1
          }
        },
        create: {
          userId: gig.authorId
        }
      })
    ])

    return result[0];
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to create gig application");
  }
}

export const acceptGigApplicationById = async ({ applicationId }: UpdateApplicationStatusByIdParams) => {
  try {
    const application = await prisma.gigApplication.findFirst({
      where: {
        id: applicationId
      },
      include: {
        gig: true
      }
    });

    if (!application) throw new NotFoundError("Gig application");

    await prisma.$transaction([
      prisma.gigApplication.update({
        where: {
          id: applicationId
        },
        data: {
          status: Status.ACCEPTED
        },
        include: {
          gig: true
        }
      }),
      prisma.applicationStats.update({
        where: {
          userId: application.userId,
        },
        data: {
          sent: {
            decrement: 1
          }
        }
      }),
      prisma.applicationStats.update({
        where: {
          userId: application.gig.authorId
        },
        data: {
          received: {
            decrement: 1
          }
        }
      })
    ])
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Prisma", "Failed to update status of application in database");
  }
}

export const rejectGigApplicationById = async ({ applicationId }: UpdateApplicationStatusByIdParams) => {
  try {
    const application = await prisma.gigApplication.findFirst({
      where: {
        id: applicationId
      },
      include: {
        gig: true
      }
    });

    if (!application) throw new NotFoundError("Gig application");

    await prisma.$transaction([
      prisma.gigApplication.update({
        where: {
          id: applicationId
        },
        data: {
          status: Status.REJECTED
        },
        include: {
          gig: true
        }
      }),
      prisma.applicationStats.update({
        where: {
          userId: application.userId,
        },
        data: {
          sent: {
            decrement: 1
          }
        }
      }),
      prisma.applicationStats.update({
        where: {
          userId: application.gig.authorId
        },
        data: {
          received: {
            decrement: 1
          }
        }
      })
    ])
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

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

export const deleteApplicationByApplicationId = async ({ application }: { application: GigApplication; }) => {
  try {
    const gig = await prisma.gig.findUnique({
      where: { 
        id: application.gigId
      }
    })

    if (!gig) throw new NotFoundError("Gig");;

    await prisma.$transaction([
      prisma.gigApplication.delete({
        where: {
          id: application.id
        }
      }),
      prisma.applicationStats.update({
        where: {
          userId: application.userId,
        },
        data: {
          sent: {
            decrement: 1
          }
        }
      }),
      prisma.applicationStats.update({
        where: {
          userId: gig.authorId
        },
        data: {
          received: {
            decrement: 1
          }
        }
      })
    ])
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

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
            author: {
              select: {
                username: true
              }
            },
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
      },
      include: {
        GigApplication: {
          where: {
            status: Status.ACCEPTED
          },
          include: {
            user: {
              select: {
                username: true,
                id: true
              }
            },
          }
        },
        author: {
          select: {
            username: true
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

export const getAcceptedApplicationsByGigId = async ({ gigId }: { gigId: number }) => {
  try {
    const applications = await prisma.gigApplication.findMany({
      where: {
        gigId,
        status: Status.ACCEPTED
      }
    })

    return applications;
  } catch (err) {
    throw new ServiceError("Prisma", "Failed to get accepted applications");
  }
}
