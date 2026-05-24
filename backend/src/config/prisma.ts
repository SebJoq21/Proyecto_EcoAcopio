import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

// 1. Instanciamos el adaptador nativo usando la URL de Railway
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

// 2. Inyectamos el adaptador al cliente de Prisma (El nuevo estándar de Prisma 7)
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

export default prisma;