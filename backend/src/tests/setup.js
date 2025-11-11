const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const { createServer } = require('http');
const express = require('express');

let mongoServer;
let httpServer;
let io;
let serverSocket;
let clientSocket;

// Create a JWT token for testing
global.generateTestToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1d' }
  );
};

// Create test server for socket.io
global.setupTestServer = () => {
  const app = express();
  httpServer = createServer(app);
  io = new Server(httpServer);

  return { app, httpServer, io };
};

// Create test client for socket.io
global.setupTestClient = (port, token) => {
  return new Client(`http://localhost:${port}`, {
    auth: { token: `Bearer ${token}` },
    transports: ['websocket']
  });
};

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }
});

afterEach(() => {
  if (clientSocket) {
    clientSocket.close();
  }
  if (io) {
    io.close();
  }
});