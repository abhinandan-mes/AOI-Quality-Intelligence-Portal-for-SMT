import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import { startFileWatcher } from './services/fileWatcher';

dotenv.config();

const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: '*', // For development
    methods: ['GET', 'POST']
  }
});

// Start watching for new AOI/SPI files
startFileWatcher();


app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
