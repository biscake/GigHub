import { Role } from "@prisma/client";

export const mockUser = {
  id: 1,
  email: "test@example.com",
  username: "testuser",
  role: Role.USER,
  createdAt: new Date(),
  userProfileId: 1
};

export const mockResetTokenRecord = {
  id: 1,
  token: "reset_token",
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  userId: 1,
  user: mockUser,
  revoked: false
}

export const mockRefreshTokenRecord = {
  id: 1,
  token: "refresh_token",
  revoked: false,
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 24 * 14 * 60 * 60 * 1000),
  userId: 1,
  user: mockUser
};

export const mockUserProfile = {
  id: 1,
  numberOfGigsPosted: 2,
  numberOfGigsCompleted: 3,
  averageRating: 4.5,
  bio: "test bio",
  profilePictureKey: "test.svg",
  userId: 1,
  user: mockUser
}

export const mockReview = {
  id: 1,
  comment: "test comment",
  rating: 5,
  createdAt: new Date(),
  reviewerId: 2,
  revieweeId: 1
}