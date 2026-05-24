import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export const initWebSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*', // Allow connections from Next.js frontend
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected to WebSocket:', socket.id);

    socket.on('join-assignment', (assignmentId: string) => {
      socket.join(assignmentId);
      console.log(`Socket ${socket.id} joined assignment room: ${assignmentId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

export const notifyStatusChange = (assignmentId: string, status: string, data?: any) => {
  if (io) {
    console.log(`WebSocket Emit: assignment ${assignmentId} is now ${status}`);
    // Emit specifically to client listening to this assignment
    io.to(assignmentId).emit('status-update', { assignmentId, status, data });
    // Emit globally to refresh dashboard lists
    io.emit('global-status-update', { assignmentId, status });
  }
};
