import bcrypt from 'bcrypt';

// El número de "rondas" define qué tan pesada será la encriptación. 10 es el estándar seguro y rápido.
const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};