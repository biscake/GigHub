import { createId } from '@paralleldrive/cuid2';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { createGigInDatabase } from '../services/gig.service';
import { uploadSingleImageToR2 } from '../services/r2.service';
import { CreateGigInDatabaseInput } from '../types/gig';

export const createGig = asyncHandler(async (req: Request, res: Response) => {
  const file = req.file;

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
  
  res.status(200).json({
    success: true,
    gig
  })
})

export const deleteGig = asyncHandler(async (req: Request, res: Response) => {
  
})