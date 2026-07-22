import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import permissionRoutes from './routes/permissionRoutes';
import activityRoutes from './routes/activityRoutes';
import dashboardRoutes from './routes/dashboard';
import lineRoutes from './routes/lineRoutes';
import inspectionRoutes from './routes/inspectionRoutes';
import defectRoutes from './routes/defectRoutes';
import reportRoutes from './routes/reportRoutes';
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
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/inspections', inspectionRoutes);
app.use('/api/defects', defectRoutes);
app.use('/api/reports', reportRoutes);

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
