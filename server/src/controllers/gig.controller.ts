import { createId } from '@paralleldrive/cuid2';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createGigInDatabase, deleteGigFromDatabase, getGigsFromDatabase } from '../services/gig.service';
import { storeResponse } from '../services/idempotency.service';
import { deleteSingleImageFromR2, uploadSingleImageToR2 } from '../services/r2.service';
import { CreateGigInDatabaseInput } from '../types/gig';

export const createGig = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;
  const idempotencyKey = req.idempotencyKey;

  const key = file
    ? `gigs/${createId()}-${file.originalname}`
    : "default/default.jpg";

  const gigDetails: CreateGigInDatabaseInput = {
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
  const gigId = parseInt(req.params.gigId);

  const deletedGig = await deleteGigFromDatabase({ gigId });

  await deleteSingleImageFromR2({ key: deletedGig.imgKey });

  res.status(204).send();
})

export const getGigs = asyncHandler(async (req: Request, res: Response) => {
  const result = await getGigsFromDatabase(req.query);

  res.status(200).json({
    success: true,
    message: "Get gigs successfully",
    gigs: result 
  })
})