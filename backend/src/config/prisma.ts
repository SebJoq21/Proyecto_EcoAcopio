import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ENV } from './env'; 

// 1. Instanciamos el adaptador nativo usando la URL segura y validada
const adapter = new PrismaPg({
  connectionString: ENV.DATABASE_URL,
});

// 2. Inyectamos el adaptador al cliente de Prisma
const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

export default prisma;