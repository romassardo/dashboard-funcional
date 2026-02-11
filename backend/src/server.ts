import express from 'express';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';
import metricsRoutes from './routes/metricsRoutes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(compression());

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json());

const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

app.use('/api/metrics', (req, res, next) => {
  const key = req.originalUrl;
  // Skip cache for ticket list, detail, and attachments (unique URLs)
  if (key.includes('/tickets') || key.includes('/attachments') || key.includes('/open-ticket-count')) {
    return next();
  }
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return res.json(cached.data);
  }
  const originalJson = res.json.bind(res);
  res.json = (body: any) => {
    if (res.statusCode === 200) {
      cache.set(key, { data: body, timestamp: Date.now() });
    }
    return originalJson(body);
  };
  next();
});

app.use('/api/metrics', metricsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dashboard Funcional API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
