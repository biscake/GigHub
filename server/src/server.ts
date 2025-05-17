import dotenv from 'dotenv';
import app from './app';

// import env
dotenv.config();

// Use PORT provided in environment or default to 3000
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
