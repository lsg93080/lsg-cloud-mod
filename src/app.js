import logger from 'morgan';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors'

// SSO Bridge: JWT middleware and user-sync
const jwtMiddleware = require('../shared/jwt-middleware');
const { findOrCreatePlayer } = require('../shared/user-sync');
const mysqlConnection = require('./database');

//Routes

import player_config from './routes/player_config';

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
  res.status(200).json({ status: 'ok', service: 'user-mgmt' });
});

// SSO: Validate JWT on all subsequent routes
app.use(jwtMiddleware);

// SSO: Sync LSG user to cloud module player
app.use(async (req, res, next) => {
  try {
    const player = await findOrCreatePlayer(req.lsgUser, mysqlConnection);
    req.cloudPlayer = player;
    next();
  } catch (err) {
    console.error('User sync error:', err.message);
    res.status(500).json({ error: 'Failed to sync user identity' });
  }
});

//Routes
app.use(player_config);

export default app;