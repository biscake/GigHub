import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequestError } from '../errors/bad-request-error';
import { getChatMessages, getUpdatedReadReceipt } from '../services/chat.service';

export const syncMessagesBetweenUsers = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.otherUserId) throw new BadRequestError("Missing other user id");

    const count = parseInt(req.query.count as string);
    const userDeviceId = req.user.deviceId;
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.otherUserId);
    const beforeDateISOString = req.query.beforeDateISOString as string;
    const afterDateISOString = req.query.afterDateISOString as string;
    
    const chatMessages = await getChatMessages({
      count,
      userDeviceId,
      userId,
      otherUserId,
      beforeDateISOString,
      afterDateISOString
    });

    res.status(200).json({
      success: true,
      message: `Messages of user ${userId} and user ${otherUserId} synced successfully`,
      chatMessages,
    })
  },
);

export const syncReadReceiptBetweenUsers = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.otherUserId) throw new BadRequestError("Missing other user id");
    
    const since = req.query.since as string;
    const userId = req.user.id;
    const otherUserId = parseInt(req.params.otherUserId);

    const updatedReadReceipts = await getUpdatedReadReceipt({
      lastUpdatedISOString: since,
      userId,
      otherUserId
    });

    res.status(200).json({
      success: true,
      message: `Read receipt of user ${userId} and user ${otherUserId} synced successfully`,
      updatedReadReceipts,
      lastUpdatedISOString: (new Date()).toISOString()
    })
  }
)
