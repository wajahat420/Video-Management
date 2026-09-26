import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

router.get('/db-check', async (req, res) => {
  try {
    const result = await prisma.$queryRaw<{ current_database: string }[]>`SELECT current_database()`;
    res.json({ status: 'ok', database: result[0].current_database });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ status: 'error', message });
  }
});

export default router;
