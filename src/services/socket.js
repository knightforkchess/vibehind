import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.onlineStatusListeners = [];
  }

  connect(token) {
    this.socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Listen for online/offline events
    this.socket.on('user-online', (userId) => {
      this.notifyOnlineStatusChange(userId, true);
    });

    this.socket.on('user-offline', (userId) => {
      this.notifyOnlineStatusChange(userId, false);
    });

    return this.socket;
  }

  // Online status management
  onOnlineStatusChange(callback) {
    if (!callback) return () => {};
    
    this.onlineStatusListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.onlineStatusListeners = this.onlineStatusListeners.filter(cb => cb !== callback);
    };
  }

  notifyOnlineStatusChange(userId, isOnline) {
    if (!userId) return;
    
    this.onlineStatusListeners.forEach(callback => {
      try {
        callback(userId, isOnline);
      } catch (error) {
        console.error('Error in online status callback:', error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Message handling
  sendPrivateMessage(recipientId, message) {
    if (!this.socket) return;
    this.socket.emit('private-message', { recipientId, message });
  }

  // Live stream handling
  startStream(streamId) {
    if (!this.socket) return;
    this.socket.emit('start-stream', { streamId });
  }

  sendStreamMessage(streamId, message) {
    if (!this.socket) return;
    this.socket.emit('stream-message', { streamId, message });
  }

  endStream(streamId) {
    if (!this.socket) return;
    this.socket.emit('end-stream', { streamId });
  }
}

export default new SocketService();