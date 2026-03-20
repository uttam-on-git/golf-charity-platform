import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import supabase from './config/supabase.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});