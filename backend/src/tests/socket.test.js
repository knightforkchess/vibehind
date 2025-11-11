const Client = require('socket.io-client');
const { app, startServer, io } = require('../index');
const User = require('../models/User');
const mongoose = require('mongoose');

describe('Socket.IO Tests', () => {
  let clientSocket;
  let httpServer;
  let user;
  let otherUser;
  let token;
  let port;

  beforeAll(async () => {
    // Create test users after the MongoDB connection is established in setup.js
    user = await User.create({
      username: 'socketuser',
      email: 'socket@example.com',
      password: 'password123'
    });

    otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123'
    });

    token = generateTestToken(user._id);

    // Start server on a random port
    port = Math.floor(Math.random() * 10000) + 50000;
    httpServer = await startServer(port);
  }, 10000); // Increase timeout for setup

  afterAll(async () => {
    await new Promise((resolve) => {
      if (clientSocket) {
        clientSocket.close();
      }
      httpServer.close(resolve);
    });
  });

  beforeEach((done) => {
    clientSocket = new Client(`http://localhost:${port}`, {
      auth: {
        token: `Bearer ${token}`
      },
      transports: ['websocket'],
      forceNew: true
    });

    clientSocket.on('connect', done);
  });

  afterEach(() => {
    if (clientSocket.connected) {
      clientSocket.disconnect();
    }
  });

  test('should authenticate with valid token', (done) => {
    clientSocket.on('connect', () => {
      expect(clientSocket.connected).toBe(true);
      done();
    });
  }, 5000);

  test('should reject connection with invalid token', (done) => {
    const invalidSocket = new Client(`http://localhost:${port}`, {
      auth: {
        token: 'invalid-token'
      },
      transports: ['websocket']
    });

    invalidSocket.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication error');
      invalidSocket.close();
      done();
    });
  }, 5000);

  test('should handle private messages', (done) => {
    const message = {
      recipientId: otherUser._id.toString(),
      message: 'Hello!'
    };

    // Create a second socket for the recipient
    const recipientSocket = new Client(`http://localhost:${port}`, {
      auth: {
        token: `Bearer ${generateTestToken(otherUser._id)}`
      },
      transports: ['websocket']
    });

    recipientSocket.on('private-message', (data) => {
      expect(data.senderId).toBe(user._id.toString());
      expect(data.message).toBe(message.message);
      recipientSocket.close();
      done();
    });

    recipientSocket.on('connect', () => {
      clientSocket.emit('private-message', message);
    });
  }, 5000);

  test('should handle live stream events', (done) => {
    const streamData = {
      streamId: 'test-stream-123'
    };

    clientSocket.on('stream-started', (response) => {
      expect(response.streamId).toBe(streamData.streamId);
      expect(response.userId).toBe(user._id.toString());
      done();
    });

    clientSocket.emit('start-stream', streamData);
  }, 5000);

  test('should handle stream messages', (done) => {
    const streamData = {
      streamId: 'test-stream-123',
      message: 'Test stream message'
    };

    // Join stream room first
    clientSocket.emit('start-stream', { streamId: streamData.streamId });

    clientSocket.on('stream-message', (data) => {
      expect(data.message).toBe(streamData.message);
      expect(data.userId).toBe(user._id.toString());
      done();
    });

    setTimeout(() => {
      clientSocket.emit('stream-message', streamData);
    }, 100);
  }, 5000);

  test('should handle stream end', (done) => {
    const streamData = {
      streamId: 'test-stream-123'
    };

    clientSocket.emit('start-stream', streamData);

    clientSocket.on('stream-ended', (data) => {
      expect(data.streamId).toBe(streamData.streamId);
      expect(data.userId).toBe(user._id.toString());
      done();
    });

    setTimeout(() => {
      clientSocket.emit('end-stream', streamData);
    }, 100);
  }, 5000);

  test('should handle user disconnect', (done) => {
    // Create a second socket to listen for disconnect events
    const secondSocket = new Client(`http://localhost:${port}`, {
      auth: {
        token: `Bearer ${generateTestToken(otherUser._id)}`
      },
      transports: ['websocket']
    });

    secondSocket.on('user-offline', (userId) => {
      expect(userId).toBe(user._id.toString());
      secondSocket.close();
      done();
    });

    secondSocket.on('connect', () => {
      clientSocket.disconnect();
    });
  }, 5000);
});