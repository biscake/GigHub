import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequestError } from '../errors/bad-request-error';
import { getChatMessages } from '../services/chat.service';

export const getChatMessagesBetweenUsers = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.query.originDeviceId) throw new BadRequestError("Missing queries");

    if (!req.params.originUserId || !req.params.targetUserId) throw new BadRequestError("Missing user id");

    const count = parseInt(req.query.count as string);
    const originDeviceId = req.query.originDeviceId as string;
    const originUserId = parseInt(req.params.originUserId);
    const targetUserId = parseInt(req.params.targetUserId);
    const beforeDateISOString = req.query.beforeDateISOString as string;
    const afterDateISOString = req.query.afterDateISOString as string;

    const chatMessages = await getChatMessages({
      count,
      originDeviceId,
      originUserId,
      targetUserId,
      beforeDateISOString,
      afterDateISOString
    });

    res.status(200).json({
      success: true,
      message: `Get chat messages between ${originUserId} and ${targetUserId} successfully`,
      chatMessages
    })
  },
);
