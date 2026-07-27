import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

// SSO Bridge: JWT middleware
const jwtMiddleware = require('../shared/jwt-middleware');

//Routes
import initial_attributes from './routes/initial_attributes';

import real_time_attributes from './routes/real_time_attributes';

const app = express();

//Middlewares
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost,http://localhost:80,http://localhost:5173').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

// Health check (no auth required)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'api-post' });
});

// SSO: Validate JWT on all subsequent routes
app.use(jwtMiddleware);

//Routes
app.use(initial_attributes);
app.use(real_time_attributes);

export default app;