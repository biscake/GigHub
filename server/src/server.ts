import cron from 'node-cron';
import './config/dotenv';
import app from './app';
import { cleanUpRefreshToken } from './cron/clean-refresh-token.cron';
import { cleanUpResetToken } from './cron/clean-reset-token.cron';

// Use PORT provided in environment or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});

cron.schedule('0 0 * * *', cleanUpRefreshToken);
cron.schedule('0 0 * * *', cleanUpResetToken);