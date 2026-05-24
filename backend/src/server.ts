import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { initWebSocket } from './websocket';
import { initWorker } from './workers/generationWorker';
import assignmentRoutes from './routes/assignmentRoutes';
import fs from 'fs';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

// Ensure public/pdfs directory exists for output documents
const pdfsDir = path.join(__dirname, '..', 'public', 'pdfs');
if (!fs.existsSync(pdfsDir)) {
  fs.mkdirSync(pdfsDir, { recursive: true });
}

// Serve public directory (PDFs downloading)
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount API Routes
app.use('/api/assignments', assignmentRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDB();

    // 2. Start WebSocket listeners
    initWebSocket(server);

    // 3. Spawn BullMQ Worker
    initWorker();
    console.log('BullMQ generation worker started successfully');

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

startServer();
