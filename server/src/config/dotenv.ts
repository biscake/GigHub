import dotenv from 'dotenv';

dotenv.config();

const envVariables = [
  "ACCESS_PUBLIC_KEY_PATH",
  "ACCESS_PRIVATE_KEY_PATH",
  "DATABASE_URL",
  "R2_ACCESS_KEY",
  "R2_SECRET_KEY",
  "R2_BUCKET_NAME",
  "R2_ENDPOINT",
  "R2_REGION"
]

envVariables.forEach(variable => {
  if (process.env[variable] === undefined) throw new Error(`Missing ENV variable: ${variable}`)
});