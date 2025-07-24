import { createId } from '@paralleldrive/cuid2';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequestError } from '../errors/bad-request-error';
import { acceptGigApplicationById, createGigApplicationById, createGigInDatabase, deleteApplicationByApplicationId, deleteGigFromDatabase, getAcceptedApplicationsByUserId, getApplicationStatByUserId, getGigsFromDatabase, getPostedGigsWithApplications, getReceivedApplicationsByUserId, getSentApplicationsByUserId, rejectGigApplicationById, updateApplicationMessageById, updateCompletedById } from '../services/gig.service';
import { storeResponse } from '../services/idempotency.service';
import { deleteSingleImageFromR2, uploadSingleImageToR2 } from '../services/r2.service';
import { CreateGigInDatabaseParams } from '../types/gig';
import { updateNumberCompletedByApplicationId, updateNumberPostedGigByUsername } from '../services/user.service';

export const createGig = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const idempotencyKey = req.idempotencyKey;

  const key = file
    ? `gigs/${createId()}-${file.originalname}`
    : "default/default.jpg";

  const gigDetails: CreateGigInDatabaseParams = {
    ...req.body,
    price: parseFloat(req.body.price),
    authorId: parseInt(req.body.authorId, 10),
    imgKey: key
  };

  const gig = await createGigInDatabase(gigDetails);
  await updateNumberPostedGigByUsername({ id: req.user.id, value: 1 });
  
  if (file) {
    await uploadSingleImageToR2({
      fileBuffer: file.buffer,
      key: key,
      contentType: file.mimetype
    })
  }

  const responseBody = {
    success: true,
    message: "Gig successfully created",
    data: gig
  };

  await storeResponse({ responseBody, idempotencyKey });
  
  res.status(201).location(`gigs/${gig.id}`).json(responseBody);
})

export const deleteGig = asyncHandler(async (req: Request, res: Response) => {
  const gig = req.gig;
  const idempotencyKey = req.idempotencyKey;

  const deletedGig = await deleteGigFromDatabase({ id: gig.id });
  await updateNumberPostedGigByUsername({ id: req.user.id, value: -1 });

  if (deletedGig.imgKey !== "default/default.jpg") {
    await deleteSingleImageFromR2({ key: deletedGig.imgKey });
  }

  const responseBody = {
    success: true,
    message: "Gig successfully deleted"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const completeGig = asyncHandler(async (req: Request, res: Response) => {
  const appId = parseInt(req.params.applicationId);
  const idempotencyKey = req.idempotencyKey;

  await updateCompletedById({ applicationId: appId });
  await updateNumberCompletedByApplicationId({ applicationId: appId });

  const responseBody = {
    success: true,
    message: "Gig completed successfully"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const getGigs = asyncHandler(async (req: Request, res: Response) => {
  const NUMBER_OF_GIGS = 48;

  const result = await getGigsFromDatabase({ ...req.query, NUMBER_OF_GIGS });

  const totalPages = Math.ceil(result.totalCount / NUMBER_OF_GIGS);

  res.status(200).json({
    success: true,
    message: "Get gigs successfully",
    gigs: result.gigs,
    totalPages: totalPages
  })
})

export const getGigWithId = asyncHandler(async (req: Request, res: Response) => {
  const gig = req.gig;

  res.status(200).json({
    success: true,
    message: "Get gig successfully",
    gig: gig
  })
})

export const postGigApplication = asyncHandler(async (req: Request, res: Response) => {
  const gig = req.gig;

  const { message } = req.body;
  const userId = req.user.id;
  const idempotencyKey = req.idempotencyKey;

  const application = await createGigApplicationById({ gig, userId, message });

  const responseBody = {
    success: true,
    message: "Gig application successfully created",
    application
  };

  await storeResponse({ responseBody, idempotencyKey });

  res.status(201).json(responseBody);
})

export const getUserSentApplications = asyncHandler(async (req: Request, res: Response) => {
  const COUNT = 8;
  const { id } = req.user;
  const page = parseInt(req.query.page as string) || 1;

  if (!page) {
    throw new BadRequestError("Invalid page");
  }

  const applications = await getSentApplicationsByUserId({ userId: id, page, COUNT });
  const sanitizedApplications = applications.map(({ user, gig, ...rest }) => ({
    ...rest,
    user: {
      username: user.username
    },
    gig: {
      ...gig,
      imgUrl: `${process.env.R2_PUBLIC_ENDPOINT}/${gig.imgKey}`,
      author: { username: gig.author.username }
    }
  }));

  const responseBody = {
    success: true,
    message: "Get gig applications successfully",
    applications: sanitizedApplications,
    pageSize: COUNT,
    page,
    totalPages: 1,
    total: 0
  }

  if (applications.length > 0) {
    const stats = applications[0].user.applicationStats;

    const totalPages = stats?.sent === 0 || !stats
      ? 1
      : Math.ceil((stats.sent ?? 1) / COUNT);
    
    responseBody.totalPages = totalPages;
    responseBody.total = stats?.sent ?? 0;
  }

  res.status(200).json(responseBody);
})

export const getUserReceivedApplications = asyncHandler(async (req: Request, res: Response) => {
  const COUNT = 8;
  const { id } = req.user;
  const page = parseInt(req.query.page as string) || 1;

  const applications = await getReceivedApplicationsByUserId({ userId: id, page, COUNT });
  const sanitizedApplications = applications.map(({ user, gig, ...rest }) => ({
    ...rest,
    user: {
      username: user.username
    },
    gig: {
      ...gig,
      imgUrl: `${process.env.R2_PUBLIC_ENDPOINT}/${gig.imgKey}`,
      author: { username: gig.author.username }
    }
  }));

  const responseBody = {
    success: true,
    message: "Get gig applications successfully",
    applications: sanitizedApplications,
    pageSize: COUNT,
    page,
    totalPages: 1,
    total: 0
  }

  if (applications.length > 0) {
    const stats = applications[0].user.applicationStats;

    const totalPages = stats?.received === 0 || !stats
      ? 1
      : Math.ceil((stats.received ?? 1) / COUNT);
    
    responseBody.totalPages = totalPages;
    responseBody.total = stats?.received ?? 0;
  }
  
  res.status(200).json(responseBody);
})

export const getUserApplicationStats = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.user;
  const stats = await getApplicationStatByUserId({ userId: id });

  res.status(200).json({
    success: true,
    message: "Get applications stats successfully",
    stats
  })
})

export const acceptGigApplication = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = req.application.id;
  const idempotencyKey = req.idempotencyKey;
  const user = req.user;

  await acceptGigApplicationById({ applicationId });

  const responseBody = {
    success: true,
    message: "Gig application accepted"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const rejectGigApplication = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = req.application.id;
  const idempotencyKey = req.idempotencyKey;

  await rejectGigApplicationById({ applicationId });

  const responseBody = {
    success: true,
    message: "Gig application rejected"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
});

export const deleteApplication = asyncHandler(async (req: Request, res: Response) => {
  const application = req.application;
  const idempotencyKey = req.idempotencyKey;

  await deleteApplicationByApplicationId({ application: application });

  const responseBody = {
    success: true,
    message: "Gig successfully deleted"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const editApplication = asyncHandler(async (req: Request, res: Response) => {
  const message = req.body.message;
  const idempotencyKey = req.idempotencyKey;
  const applicationId = req.application.id;

  await updateApplicationMessageById({ message, applicationId });

  const responseBody = {
    success: true,
    message: "Gig message updated successfully"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const getUserAcceptedGigs = asyncHandler(async (req: Request, res: Response) => {
  const COUNT = 48;
  const { id } = req.user;
  const page = parseInt(req.query.page as string) || 1;

  const result = await getAcceptedApplicationsByUserId({ userId: id, page, COUNT });
  const gigs = result.applications.map(app => app.gig);
  const gigsWithImgUrl = gigs.map(gig => ({ ...gig, imgUrl: `${process.env.R2_PUBLIC_ENDPOINT}/${gig.imgKey}` }));

  const totalPages = Math.ceil(result.totalCount / COUNT);

  res.status(200).json({
    success: true,
    message: "Get gigs successfully",
    gigs: gigsWithImgUrl,
    totalPages: totalPages
  })
})

export const getUserPostedGigs = asyncHandler(async (req: Request, res: Response) => {
  const COUNT = 48;
  const { id } = req.user;
  const page = parseInt(req.query.page as string) || 1;

  const { gigs, totalCount } = await getPostedGigsWithApplications({ userId: id, page, COUNT });
  const formatted = gigs.map(gig => {
    const imgUrl = `${process.env.R2_PUBLIC_ENDPOINT}/${gig.imgKey}`;

    return {
      ...gig,
      imgUrl,
    }
  });

  const totalPages = Math.ceil(totalCount / COUNT);

  res.status(200).json({
    success: true,
    message: "Get gigs successfully",
    gigs: formatted,
    totalPages: totalPages
  })
})