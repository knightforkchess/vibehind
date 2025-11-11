const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const handleUploadError = require('./middleware/handleUploadError');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const messageRoutes = require('./routes/messages');
const matchRoutes = require('./routes/matches');
const livestreamRoutes = require('./routes/livestreams');
const searchRoutes = require('./routes/search');

dotenv.config();
const app = express();
const httpServer = createServer(app);

// Compression middleware
app.use(compression());

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://your-production-domain.com'
    : 'http://localhost:3000',
  credentials: true
}));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rate limiting configuration
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many uploads from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/users/profile', uploadLimiter);
app.use('/api/posts', uploadLimiter);

// Socket.IO setup with optimized configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? 'https://your-production-domain.com'
      : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 60000,
  maxHttpBufferSize: 1e6,
  transports: ['websocket', 'polling'],
  connectTimeout: 45000,
  pingInterval: 25000
});

// Make io accessible in routes
app.set('io', io);

// Socket.IO Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (!verified) {
      return next(new Error('Invalid token'));
    }

    socket.userId = verified.id;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO Connection handling
io.on('connection', async (socket) => {
  console.log('User connected:', socket.userId);
  socket.join(socket.userId);

  // Set user online
  try {
    const User = require('./models/User');
    await User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastActive: new Date()
    });
    
    // Notify others that user is online
    io.emit('user-online', socket.userId);
  } catch (error) {
    console.error('Error setting user online:', error);
  }

  // Handle private messages
  socket.on('private-message', async (data) => {
    try {
      const { recipientId, message } = data;
      io.to(recipientId).emit('private-message', {
        senderId: socket.userId,
        message
      });
    } catch (error) {
      console.error('Message error:', error);
    }
  });

  // Handle live stream chat messages
  socket.on('stream-message', (data) => {
    const { streamId, message } = data;
    io.to(`stream:${streamId}`).emit('stream-message', {
      userId: socket.userId,
      message,
      timestamp: new Date()
    });
  });

  // Join stream room
  socket.on('join-stream', (data) => {
    const { streamId } = data;
    socket.join(`stream:${streamId}`);
    console.log(`User ${socket.userId} joined stream ${streamId}`);
  });

  // Leave stream room
  socket.on('leave-stream', (data) => {
    const { streamId } = data;
    socket.leave(`stream:${streamId}`);
    console.log(`User ${socket.userId} left stream ${streamId}`);
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected:', socket.userId);
    
    // Set user offline
    try {
      const User = require('./models/User');
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastActive: new Date()
      });
      
      // Notify others that user is offline
      io.emit('user-offline', socket.userId);
    } catch (error) {
      console.error('Error setting user offline:', error);
    }
  });
});

// MongoDB connection with performance optimizations
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vibehind';
    await mongoose.connect(mongoUri, {
      autoIndex: process.env.NODE_ENV === 'development', // Only auto-index in development
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      connectTimeoutMS: 10000
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

// Connect to MongoDB only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Enable MongoDB debug mode in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/livestreams', livestreamRoutes);
app.use('/api/search', searchRoutes);

// Error handling
app.use(handleUploadError);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

// Start server only if not in test environment
const startServer = (port = process.env.PORT || 5000) => {
  return new Promise((resolve) => {
    const server = httpServer.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      resolve(server);
    });
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export for testing
module.exports = { app, httpServer, io, startServer, connectDB };