import { createId } from '@paralleldrive/cuid2';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { acceptGigApplicationById, createGigApplicationById, createGigInDatabase, deleteGigFromDatabase, getGigFromDatabaseById, getGigsFromDatabase, rejectGigApplicationById } from '../services/gig.service';
import { storeResponse } from '../services/idempotency.service';
import { deleteSingleImageFromR2, uploadSingleImageToR2 } from '../services/r2.service';
import { CreateGigInDatabaseParams } from '../types/gig';

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

  const deletedGig = await deleteGigFromDatabase({ id: gig.id });

  await deleteSingleImageFromR2({ key: deletedGig.imgKey });

  res.status(204).send();
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

export const getApplicationsByGigId = asyncHandler(async (req: Request, res: Response) => {
  const gigApplications = req.gig.GigApplication;

  res.status(200).json({
    success: true,
    message: "Get gig applications successfully",
    gigApplications
  });
})

export const acceptGigApplication = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = req.applicationId;

  await acceptGigApplicationById({ applicationId });

  res.status(204).send();
})

export const rejectGigApplication = asyncHandler(async (req: Request, res: Response) => {
  const applicationId = req.applicationId;

  await rejectGigApplicationById({ applicationId });

  res.status(204).send();
});