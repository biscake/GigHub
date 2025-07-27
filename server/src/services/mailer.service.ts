import { Gig, Prisma } from '@prisma/client';
import NodeMailer from 'nodemailer';
import { BadRequestError } from '../errors/bad-request-error';
import { ServiceError } from '../errors/service-error';
import { prisma } from "../lib/prisma";
import { resetRequestInput } from '../types/auth';
import { issueResetToken } from "../utils/issue-tokens.util";
import { NotFoundError } from '../errors/not-found-error';
import { AppError } from '../errors/app-error';

const transporter = NodeMailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const resetRequest = async ({ email }: resetRequestInput) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new BadRequestError('Email not registered.');
    }

    const resetToken = issueResetToken();
    
    await prisma.resetToken.updateMany({
      where: {
        userId: user.id
      },
      data: {
        revoked: true
      }
    })

    await prisma.resetToken.create({
      data: {
        token: resetToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        userId: user.id
      }
    });

    await transporter.sendMail({
      from: `"GigHub" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password. This link will expire in 15 minutes.</p>
        <a href="${process.env.FRONTEND_URL}/accounts/reset-password?token=${resetToken}">
          ${process.env.FRONTEND_URL}/accounts/reset-password?token=${resetToken}
        </a>
      `
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ServiceError("Prisma", "Database error during reset request.");
    } else if (err instanceof BadRequestError) {
      throw err;
    }

    throw new ServiceError("Nodemailer", "Failed to send reset request email");
  }
}

export const sendIncomingApplication = async ({ gig }: { gig: Gig }) => {
  try {
    const gigAuthor = await prisma.user.findUnique({
      where: { id: gig.authorId }
    })

    if (!gigAuthor) {
      throw new NotFoundError("Gig Author");
    }

    await transporter.sendMail({
      from: `"GigHub" <${process.env.EMAIL_USER}>`,
      to: gigAuthor?.email,
      subject: `New application for your gig: ${gig.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
          <h2 style="color: #333;">You have a new application!</h2>
          <p>Hi ${gigAuthor?.username || "there"},</p>
          <p>
            Someone has applied to your gig: <strong>${gig.title}</strong>.
          </p>
          <p>
            Log in to your GigHub account to review the application and connect with the applicant.
          </p>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This is an automated email. Please do not reply directly.
          </p>
        </div>
      `
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }

    throw new ServiceError("Nodemailer", "Failed to send incoming application email");
  }
}

export const sendAcceptedApplication = async ({ applicantId, gig }: { applicantId: number, gig: Gig }) => {
  try {
    const applicant = await prisma.user.findUnique({
      where: { id: applicantId }
    })

    if (!applicant) {
      throw new NotFoundError("Applicant");
    }

    await transporter.sendMail({
      from: `"GigHub" <${process.env.EMAIL_USER}>`,
      to: applicant?.email,
      subject: `Your application for ${gig.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
          <h2 style="color: #333;">Congratulations! 🎉</h2>
          <p>Hi ${applicant?.username || "there"},</p>
          <p>
            Great news! Your application for <strong>${gig.title}</strong> has been <strong>accepted</strong> by the gig author.
          </p>
          <p>
            You can now connect with the client and discuss the next steps to get started.
          </p>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This is an automated email from GigHub. Please do not reply directly.
          </p>
        </div>
      `
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    
    throw new ServiceError("Nodemailer", "Failed to send accepted application email");
  }
}


export const sendRejectedApplication = async ({ applicantId, gig }: { applicantId: number, gig: Gig }) => {
  try {
    const applicant = await prisma.user.findUnique({
      where: { id: applicantId }
    })

    if (!applicant) {
      throw new NotFoundError("Applicant");
    }

    await transporter.sendMail({
      from: `"GigHub" <${process.env.EMAIL_USER}>`,
      to: applicant?.email,
      subject: `Your application for ${gig.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
          <h2 style="color: #333;">Application Update</h2>
          <p>Hi ${applicant?.username || "there"},</p>
          <p>
            Thank you for applying to <strong>${gig.title}</strong>. 
            After reviewing applications, the gig author has decided not to move forward with your application at this time.
          </p>
          <p>
            We appreciate the effort you put into applying and encourage you to explore other gigs that may suit your skills and experience.
          </p>
          <p style="margin-top: 20px; font-size: 0.9em; color: #777;">
            This is an automated email from GigHub. Please do not reply directly.
          </p>
        </div>
      `
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    
    throw new ServiceError("Nodemailer", "Failed to send accepted application email");
  }
}
