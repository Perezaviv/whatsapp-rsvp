
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from the project root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import apiRouter from './api';
import { seedDatabase } from './services/db';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL // Restrict requests to your frontend's URL
}));
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Root endpoint for health checks
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('WhatsApp RSVP Backend is running!');
});

// Global error handler. This should be the last middleware used.
// It will catch any errors that occur in the routing and middleware functions.
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('An unhandled error occurred:', err);
    // Ensure we send a JSON response, not an HTML error page.
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ 
        error: 'Internal Server Error', 
        message: err.message || 'An unexpected error occurred.' 
    });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  // Optional: Seed database with initial data if it's empty
  await seedDatabase();
  console.log('Database is ready.');
});
