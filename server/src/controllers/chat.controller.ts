import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { BadRequestError } from '../errors/bad-request-error';
import { findIfNotCreateConversation, getAllLastRead, getChatMessages, getConversationMetaByKey, getConversationParticipantsAndKeys, getExistingConversations, getLastRead } from '../services/chat.service';

export const syncMessages = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.conversationKey) throw new BadRequestError("Missing conversationKey");

    const count = parseInt(req.query.count as string);
    const userDeviceId = req.user.deviceId;
    const userId = req.user.id;
    const conversationKey = req.params.conversationKey;
    const before = req.query.before as string;
    const since = req.query.since as string;
    
    const chatMessages = await getChatMessages({
      count,
      userDeviceId,
      userId,
      conversationKey,
      before,
      since
    });

    res.status(200).json({
      success: true,
      message: `Messages of coversation ${conversationKey}`,
      chatMessages,
    })
  },
);

export const syncReadReceipt = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.params.conversationKey) throw new BadRequestError("Missing conversationKey");
    
    const conversationKey = req.params.conversationKey;

    const result = await getLastRead({ conversationKey });

    res.status(200).json({
      success: true,
      message: `Get last read successfully`,
      lastReads: result,
      conversationKey
    })
  }
)

export const getConversations = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;
    
    const conversationKeys = await getExistingConversations({ userId });
    
    res.status(200).json({
      success: true,
      message: `New messages fetched successfully`,
      conversationKeys,
    })
  },
)

export const getAllReadReceipts = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result = await getAllLastRead({ userId });

    res.status(200).json({
      success: true,
      message: `Get last read successfully`,
      lastReads: result,
    })
  }
)

export const getConversationParticipants = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationKey = req.params.conversationKey;

    const result = await getConversationParticipantsAndKeys({ conversationKey });

    res.status(200).json({
      success: true,
      message: `Get last read successfully`,
      participants: result,
      conversationKey
    })
  }
)

export const getOrElseCreateConversation = asyncHandler(
  async (req: Request, res: Response) => {
    const gigId = parseInt(req.params.gigId);
    const userId = req.user.id;

    const result = await findIfNotCreateConversation({ gigId, userId });

    res.status(200).json({
      success: true,
      message: `Get last read successfully`,
      conversationKey: result.conversation.conversationKey,
      title: result.title,
      gigAuthorUsername: result.gigAuthorUsername
    })
  }
)

export const getConversationMeta = asyncHandler(
  async (req: Request, res: Response) => {
    const conversationKey = req.params.conversationKey as string;
    const userId = req.user.id;

    const result = await getConversationMetaByKey({ userId, conversationKey });

    res.status(200).json({
      success: true,
      message: `Get last read successfully`,
      conversationKey: result.conversationKey,
      title: result.title,
      gigAuthorUsername: result.gigAuthorUsername
    })
  }
)