import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import deathRoutes from './routes/deaths';
import drugRoutes from './routes/drugs';
import icd11Routes from './routes/icd11';
import dashboardRoutes from './routes/dashboard';
import { auditLogger } from './middleware/auditLogger';
import { apiLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();

// Global Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.VITE_API_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check (public)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deaths', deathRoutes);
app.use('/api/drugs', drugRoutes);
app.use('/api/icd11', icd11Routes);
app.use('/api/dashboard', dashboardRoutes);

// Apply audit logger to mutations
app.use(auditLogger);

// Apply API rate limiting
app.use('/api', apiLimiter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

export default app;
