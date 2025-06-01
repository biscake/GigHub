import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { resetRequest } from '../services/mailer.service';

export const sendResetToken = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    
    await resetRequest({ email });

    res.status(200).json({
      success: true,
      message: 'Email sent to user'
    })
  }
)