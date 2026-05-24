import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAssignmentStore } from '../store/useAssignmentStore';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const updateAssignmentStatus = useAssignmentStore((state) => state.updateAssignmentStatus);
  const selectedAssignment = useAssignmentStore((state) => state.selectedAssignment);

  useEffect(() => {
    // Connect to Express Socket.io server
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const socketUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    // Global broadcasts (refreshes dashboard items state)
    socket.on('global-status-update', ({ assignmentId, status }) => {
      console.log(`WebSocket event: global-status-update: ${assignmentId} -> ${status}`);
      updateAssignmentStatus(assignmentId, status);
    });

    // Room specific broadcasts (carries details for active paper outputs)
    socket.on('status-update', ({ assignmentId, status, data }) => {
      console.log(`WebSocket event: status-update: ${assignmentId} -> ${status}`);
      updateAssignmentStatus(assignmentId, status, data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, [updateAssignmentStatus]);

  // Join room for the active question paper when open
  useEffect(() => {
    const socket = socketRef.current;
    if (socket && selectedAssignment?._id) {
      console.log(`Socket joining room: ${selectedAssignment._id}`);
      socket.emit('join-assignment', selectedAssignment._id);
    }
  }, [selectedAssignment?._id]);
};
