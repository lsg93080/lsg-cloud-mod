import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'

// SSO Bridge: JWT middleware
const jwtMiddleware = require('../shared/jwt-middleware');

//Routes
import attributes from './routes/attributes';
import tables from './routes/tables';

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
  res.status(200).json({ status: 'ok', service: 'api-get' });
});

// SSO: Validate JWT on all subsequent routes
app.use(jwtMiddleware);

//Routes
app.use(attributes);
app.use(tables);

export default app;