import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { ApiError } from './utils/apiError';
import { config } from './config/env';

const app = express();

// Security HTTP headers with relaxed Content Security Policy for inline scripts & static dev
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Enable CORS
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// HTTP Request logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from root folder
app.use(express.static(path.resolve(__dirname, '..')));

// API v1 routes
app.use('/api/v1', routes);

// 404 Handler for unhandled routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.originalUrl} not found`));
});

// Centralized error handling
app.use(errorHandler);

export default app;
