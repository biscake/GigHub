import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { errorHandler } from './middleware/error-handler.middleware';
import authRoute from './routes/auth.routes';
import gigsRoute from './routes/gigs.routes';
import usersRoute from './routes/user.routes';
import keysRoute from './routes/keys.routes';
import chatRoute from './routes/chat.routes';
import { setupWebSocket } from './websocket';
import expressWs from 'express-ws';

const app = express();
expressWs(app);

// websocket
setupWebSocket(app);

// enable cors
app.use(cors({
  origin: process.env.NODE_ENV == 'production' ? process.env.FRONTEND_URL : 'http://localhost:5173',
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

// gig api
app.use('/api/gigs', gigsRoute);

// user api
app.use('/api/users', usersRoute);

// user's encrypted private key and public key api
app.use('/api/keys', keysRoute);

// chat api
app.use('/api/chat', chatRoute);

// Use error handler
app.use(errorHandler);

export default app;
