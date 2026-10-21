import { io } from 'socket.io-client';
import { getMemoryToken } from './api';

const SOCKET_URL = (import.meta.env?.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const token = getMemoryToken() || localStorage.getItem('token') || '';
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token
      },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    });

    socketInstance.on('connect', () => {
      // Re-authenticate on reconnect if token is available
      const currentToken = getMemoryToken() || localStorage.getItem('token') || '';
      if (currentToken) {
        socketInstance.emit('authenticate', currentToken);
      }
    });
  }
  return socketInstance;
}

export function authenticateSocket(token) {
  const socket = getSocket();
  if (socket && token) {
    socket.auth = { token };
    if (socket.connected) {
      socket.emit('authenticate', token);
    } else {
      socket.connect();
    }
  }
}

export function subscribeToInventory(callback) {
  const socket = getSocket();
  socket.on('inventory:updated', callback);
  return () => {
    socket.off('inventory:updated', callback);
  };
}

export function subscribeToNotifications(callback) {
  const socket = getSocket();
  socket.on('notification:new', callback);
  return () => {
    socket.off('notification:new', callback);
  };
}

export function subscribeToVolunteerActivity(callback) {
  const socket = getSocket();
  socket.on('activity:new', callback);
  return () => {
    socket.off('activity:new', callback);
  };
}

export function subscribeToReservationUpdates(callback) {
  const socket = getSocket();
  socket.on('reservation:updated', callback);
  return () => {
    socket.off('reservation:updated', callback);
  };
}

export function subscribeToHubInventory(hubId, callback) {
  const socket = getSocket();
  const upperHubId = (hubId || '').toUpperCase();

  if (upperHubId) {
    socket.emit('subscribe:hub', upperHubId);
  }

  const handler = (payload) => {
    if (!upperHubId || payload.hubId === upperHubId) {
      callback(payload);
    }
  };

  socket.on('inventory:updated', handler);
  socket.on('hub:inventory:updated', handler);

  return () => {
    if (upperHubId) {
      socket.emit('unsubscribe:hub', upperHubId);
    }
    socket.off('inventory:updated', handler);
    socket.off('hub:inventory:updated', handler);
  };
}

export default {
  getSocket,
  authenticateSocket,
  subscribeToInventory,
  subscribeToNotifications,
  subscribeToVolunteerActivity,
  subscribeToReservationUpdates,
  subscribeToHubInventory
};

