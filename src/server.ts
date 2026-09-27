import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import routes from './routes';
import { config } from './config';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/storage', express.static(path.resolve(process.cwd(), config.storageRoot)));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  const message = err instanceof Error ? err.message : 'Internal server error';
  res.status(500).json({ status: 'error', message });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
