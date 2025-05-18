import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error-handler.middleware';
import authRoute from './routes/auth.routes';

const app = express();

// enable cors
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:5173',
  }),
);

// cookie parser
app.use(cookieParser());

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ connected: true, status: 'up' });
});

// api route
app.use('/api', authRoute);

// Use error handler
app.use(errorHandler);

export default app;
