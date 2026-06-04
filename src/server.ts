import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { PORT } from './config';
import tickersRouter from './routes/tickers.route';
import authRouter from './routes/auth.route';
import { authMiddleware, verifyToken } from './middleware/auth';
import { broadcastService } from './services/broadcastService';
import { simulator } from './services/marketSimulator';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.use('/api/auth', authRouter);
app.use('/api/tickers', authMiddleware, tickersRouter);

const server = http.createServer(app);

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws, req) => {
  const url = new URL(req.url ?? '', `http://localhost:${PORT}`);
  const token = url.searchParams.get('token');

  if (!token || !verifyToken(token)) {
    ws.close(1008, 'Unauthorized');
    return;
  }

  broadcastService.registerClient(ws);
});

simulator.start();

server.listen(PORT, () => {
  console.log(`[server] http://localhost:${PORT}`);
  console.log(`[server] ws://localhost:${PORT}/ws`);
});
