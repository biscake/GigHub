import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;
export const hashPlainPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}
