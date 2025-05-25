import { createId } from '@paralleldrive/cuid2';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthorizationError } from '../errors/authorization-error';
import { createGigApplicationById, createGigInDatabase, deleteGigFromDatabase, getGigFromDatabaseById, getGigsFromDatabase } from '../services/gig.service';
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
  const id = parseInt(req.params.gigId);

  const deletedGig = await deleteGigFromDatabase({ id });

  await deleteSingleImageFromR2({ key: deletedGig.imgKey });

  res.status(204).send();
})

export const getGigs = asyncHandler(async (req: Request, res: Response) => {
  const result = await getGigsFromDatabase(req.query);

  res.status(200).json({
    success: true,
    message: "Get gigs successfully",
    gigs: result.gigs,
    totalPages: result.totalPages
  })
})

export const getGigWithId = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const result = await getGigFromDatabaseById({ id });

  res.status(200).json({
    success: true,
    message: "Get gig successfully",
    gig: result.gig
  })
})

export const postGigApplication = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AuthorizationError("User not logged in");
  }

  const gigId = parseInt(req.params.id);
  const { message } = req.body;
  const userId = req.user.id;
  const idempotencyKey = req.idempotencyKey;

  const { application } = await createGigApplicationById({ gigId, userId, message });

  const responseBody = {
    success: true,
    message: "Gig application successfully created",
    application
  };

  await storeResponse({ responseBody, idempotencyKey });

  res.status(201).json(responseBody);
})