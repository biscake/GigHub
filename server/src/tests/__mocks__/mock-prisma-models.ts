import { Account, ApplicationStats, ChatMessage, ChatMessageDevice, Conversation, Device, Gig, GigApplication, Participant, RefreshToken, ResetToken, Role, Status, User, UserProfile } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

export const mockUser1Account: Account = {
  id: 1,
  provider: 'credentials',
  providerAccountId: 'test@example.com',
  passwordHash: 'hashed_password',
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  userId: 1,
}

export const mockUser2Account: Account = {
  id: 2,
  provider: 'credentials',
  providerAccountId: 'test2@example.com',
  passwordHash: 'hashed_password2',
  accessToken: 'access_token2',
  refreshToken: 'refresh_token2',
  userId: 2,
}

export const mockUser: User = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: Role.USER,
  createdAt: new Date(),
  userProfileId: 1,
};

export const mockUser2: User = {
  id: 2,
  email: "test2@example.com",
  username: "testuser2",
  role: Role.USER,
  createdAt: new Date(),
  userProfileId: 2,
};

export const mockResetTokenRecord: ResetToken = {
  id: 1,
  token: "reset_token",
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  userId: 1,
  revoked: false
}

export const mockRefreshTokenRecord: RefreshToken = {
  id: 1,
  token: "refresh_token",
  revoked: false,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 14 * 60 * 60 * 1000),
  deviceId: 1
};

export const mockUserProfile: UserProfile = {
  id: 1,
  numberOfGigsPosted: 2,
  numberOfGigsCompleted: 3,
  averageRating: 4.5,
  bio: "test bio",
  profilePictureKey: "test.svg",
  userId: 1,
}

export const mockUser2Profile: UserProfile = {
  id: 2,
  numberOfGigsPosted: 2,
  numberOfGigsCompleted: 3,
  averageRating: 4.5,
  bio: "test bio",
  profilePictureKey: "test.svg",
  userId: 2,
}

export const mockReview = {
  id: 1,
  comment: "test comment",
  rating: 5,
  createdAt: new Date(),
  reviewerId: 2,
  revieweeId: 1
}

export const mockChatMessage: ChatMessage = {
  id: 'message_1',
  senderId: 1,
  sentAt: new Date(),
  conversationKey: 'conversation_1'
}

export const mockChatMessageDevice: ChatMessageDevice = {
  id: 'chat_message_device_1',
  messageId: 'message_1',
  recipientDeviceId: 2,
  senderDeviceId: 1,
  ciphertext: 'ciphertext_1'
}

export const mockConversation: Conversation = {
  id: 'conversation_1_id',
  conversationKey: 'conversation_1',
  createdAt: new Date(),
  gigId: 1
}

export const mockParticipant1: Participant = {
  id: 'participant_1',
  userId: 1,
  conversationId: 'conversation_1'
}

export const mockParticipant2: Participant = {
  id: 'participant_2',
  userId: 2,
  conversationId: 'conversation_1'
}

export const mockDeviceUser1: Device = {
  id: 1,
  deviceId: 'device_1',
  encryptedPrivateKey: 'encrypted_key_1',
  publicKey: 'public_key_1',
  userId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  salt: 'salt_1',
  iv: 'iv_1',
}

export const mockDeviceUser2: Device = {
  id: 2,
  deviceId: 'device_2',
  encryptedPrivateKey: 'encrypted_key_2',
  publicKey: 'public_key_2',
  userId: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  salt: 'salt_2',
  iv: 'iv_2',
}

export const mockGig: Gig = {
  id: 1,
  imgKey: 'gig_img_key',
  title: 'gig_1',
  price: new Decimal(1.00),
  description: 'description',
  category: 'misc',
  published: true,
  createdAt: new Date(),
  authorId: 1,
}

export const mockPendingGigApplication: GigApplication = {
  id: 1,
  createdAt: new Date(),
  userId: 2,
  status: Status.PENDING,
  gigId: 1,
  message: 'application_message'
}

export const mockAcceptedGigApplication: GigApplication = {
  id: 1,
  createdAt: new Date(),
  userId: 2,
  status: Status.ACCEPTED,
  gigId: 1,
  message: 'application_message'
}

export const mockRejectedGigApplication: GigApplication = {
  id: 1,
  createdAt: new Date(),
  userId: 2,
  status: Status.REJECTED,
  gigId: 1,
  message: 'application_message'
}

export const mockApplicationStatsUser1: ApplicationStats = {
  id: 1,
  sent: 0,
  received: 1,
  userId: 1
}

export const mockApplicationStatsUser2: ApplicationStats = {
  id: 2,
  sent: 1,
  received: 0,
  userId: 2
}