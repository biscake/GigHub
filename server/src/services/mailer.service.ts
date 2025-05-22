import NodeMailer from 'nodemailer';
import { BadRequestError } from '../errors/bad-request-error';
import { prisma } from "../lib/prisma";
import { resetRequestInput } from '../types/auth';
import { issueResetToken } from "../utils/issue-tokens.util";

const transporter = NodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const resetRequest = async ({ email }: resetRequestInput) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new BadRequestError('Email not registered.');
  }

  const resetToken = issueResetToken();

  await prisma.resetToken.create({
    data: {
      token: resetToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      userId: user.id
    }
  });

  await prisma.resetToken.updateMany({
    where: {
      userId: user.id
    },
    data: {
      revoked: true
    }
  })

  await transporter.sendMail({
    from: `"GigHub" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <p>You requested a password reset.</p>
      <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
        ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}
      </a>
    `
  });
}