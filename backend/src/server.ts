import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import metricsRoutes from './routes/metricsRoutes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));

app.use(express.json());

app.use('/api/metrics', metricsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dashboard Funcional API is running' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Dashboard API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});
