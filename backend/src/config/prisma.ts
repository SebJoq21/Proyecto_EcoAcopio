import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ENV } from './env';
// Importamos la fábrica de la extensión desde el servicio
import { createAuditExtension } from '../services/auditoria.service';

// Configuración de tu adaptador
const adapter = new PrismaPg({
  connectionString: ENV.DATABASE_URL,
});

// 1. Instanciamos el cliente BASE con tu adaptador y los logs
const basePrisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
});

// 2. Creamos el cliente final inyectando el cliente base a la extensión
const prisma = basePrisma.$extends(createAuditExtension(basePrisma));

export default prisma;