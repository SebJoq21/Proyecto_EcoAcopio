import 'dotenv/config';

export const ENV = {
  PORT: process.env.PORT || 3000,
  DATABASE_URL: process.env.DATABASE_URL as string,
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'supersecret_development_key'),
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Validaciones estrictas: Si falta algo crítico, el servidor ni siquiera encenderá.
if (!ENV.DATABASE_URL) {
  throw new Error('Falta configurar DATABASE_URL en el archivo .env');
}

if (!ENV.JWT_SECRET) {
  throw new Error('Falta configurar JWT_SECRET en el archivo .env en producción');
}