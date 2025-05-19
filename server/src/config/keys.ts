import fs from 'fs';
import path from 'path';

const loadKey = (keyPathEnv: string): string => {
  const keyPath = process.env[keyPathEnv];

  if (!keyPath) {
    throw new Error(`Missing env: ${keyPathEnv}`);
  }

  return fs.readFileSync(path.resolve(keyPath), 'utf8');
};

export const getKeys = () => ({
  access: {
    private: loadKey('ACCESS_PRIVATE_KEY_PATH'),
    public: loadKey('ACCESS_PUBLIC_KEY_PATH'),
  },
});
