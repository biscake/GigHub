import { createId } from '@paralleldrive/cuid2';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { acceptGigApplicationById, createGigApplicationById, createGigInDatabase, deleteGigFromDatabase, getApplicationStatByUserId, getGigFromDatabaseById, getGigsFromDatabase, getReceivedApplicationsByUserId, getSentApplicationsByUserId, rejectGigApplicationById } from '../services/gig.service';
import { storeResponse } from '../services/idempotency.service';
import { deleteSingleImageFromR2, uploadSingleImageToR2 } from '../services/r2.service';
import { CreateGigInDatabaseParams } from '../types/gig';
import { NotFoundError } from '../errors/not-found-error';
import { BadRequestError } from '../errors/bad-request-error';

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

  const application = await createGigApplicationById({ gigId: gig.id, userId, message });

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
  const stats = await getApplicationStatByUserId({ userId: id });

  if (!stats) {
    throw new NotFoundError("User's application stats");
  }

  const totalPages = stats.sent === 0 ? 1 : Math.ceil(stats.sent / COUNT);

  res.status(200).json({
    success: true,
    message: "Get gig applications successfully",
    applications,
    pageSize: COUNT,
    totalPages,
    page,
    total: stats.sent
  });
})

export const getUserReceivedApplications = asyncHandler(async (req: Request, res: Response) => {
  const COUNT = 8;
  const { id } = req.user;
  const page = parseInt(req.query.page as string) || 1;

  const applications = await getReceivedApplicationsByUserId({ userId: id, page, COUNT });
  const stats = await getApplicationStatByUserId({ userId: id });

  if (!stats) {
    throw new NotFoundError("User's application stats");
  }

  const totalPages = stats.received === 0 ? 1 : Math.ceil(stats.received / COUNT);

  res.status(200).json({
    success: true,
    message: "Get gig applications successfully",
    applications,
    pageSize: COUNT,
    totalPages,
    page,
    total: stats.received
  });
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
  const applicationId = req.applicationId;
  const idempotencyKey = req.idempotencyKey;

  await acceptGigApplicationById({ applicationId });

  const responseBody = {
    success: true,
    message: "Gig application accepted"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
})

export const rejectGigApplication = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = req.applicationId;
  const idempotencyKey = req.idempotencyKey;

  await rejectGigApplicationById({ applicationId });

  const responseBody = {
    success: true,
    message: "Gig application rejected"
  }

  await storeResponse({ responseBody, idempotencyKey });

  res.status(200).json(responseBody);
});