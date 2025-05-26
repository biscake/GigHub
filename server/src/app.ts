import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error-handler.middleware';
import authRoute from './routes/auth.routes';
import gigsRoute from './routes/gigs.routes';

const app = express();

// enable cors
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// cookie parser
app.use(cookieParser());

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ connected: true, status: 'up' });
});

// api route
app.use('/api/auth', authRoute);

app.use('/api/gigs', gigsRoute);

// Use error handler
app.use(errorHandler);

export default app;
