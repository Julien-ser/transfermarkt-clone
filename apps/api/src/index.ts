import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import playersRouter from './routes/players';
import teamsRouter from './routes/teams';
import leaguesRouter from './routes/leagues';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const prisma = new PrismaClient();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Make prisma available to routes
app.use((req, res, next) => {
  (req as any).prisma = prisma;
  next();
});

// Routes
app.use('/api/players', playersRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/leagues', leaguesRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
