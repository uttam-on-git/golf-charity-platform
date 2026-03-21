import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import supabase from './config/supabase.js';
import authRoutes from './routes/auth.js';
import scoreRoutes from './routes/scores.js';
import charityRoutes from './routes/charities.js';
import subscriptionRoutes from './routes/subscriptions.js';
import drawRoutes from './routes/draws.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/api/health', async (_req, res) => {
  const { error } = await supabase.from('profiles').select('id').limit(1);
  res.json({
    success: true,
    message: 'API is running',
    db: error ? 'DB connection failed' : 'DB connected'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});