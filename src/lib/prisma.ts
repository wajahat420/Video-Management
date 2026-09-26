import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  min: 0,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});
const prisma = new PrismaClient({ adapter });

export default prisma;
