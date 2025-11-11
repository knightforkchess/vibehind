const request = require('supertest');
const { app, startServer, connectDB } = require('../index');
const mongoose = require('mongoose');
const User = require('../models/User');
const LiveStream = require('../models/LiveStream');

let server;

beforeAll(async () => {
    await connectDB();
    server = await startServer(5001);
});

afterAll(async () => {
    await mongoose.connection.close();
    server.close();
});

describe('User Endpoints', () => {
  let token;
  let user;
  let otherUser;

  beforeEach(async () => {
    // Create main test user
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });

    // Create another user for interaction tests
    otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123'
    });

    token = generateTestToken(user._id);
  });

  describe('GET /api/users/:id', () => {
    it('should get user profile', async () => {
      const res = await request(app)
        .get(`/api/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.username).toBe('otheruser');
      expect(res.body.email).toBe('other@example.com');
      expect(res.body).not.toHaveProperty('password');
    });

    it('should return 404 for non-existent user', async () => {
      const res = await request(app)
        .get(`/api/users/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/users/follow/:id', () => {
    it('should follow a user', async () => {
      const res = await request(app)
        .put(`/api/users/follow/${otherUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      const updatedOtherUser = await User.findById(otherUser._id);

      expect(updatedUser.following).toContainEqual(otherUser._id);
      expect(updatedOtherUser.followers).toContainEqual(user._id);
    });

    it('should not allow self-following', async () => {
      const res = await request(app)
        .put(`/api/users/follow/${user._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/users/unfollow/:id', () => {
    beforeEach(async () => {
      // Setup following relationship
      await User.findByIdAndUpdate(user._id, {
        $push: { following: otherUser._id }
      });
      await User.findByIdAndUpdate(otherUser._id, {
        $push: { followers: user._id }
      });
    });

    it('should unfollow a user', async () => {
      const res = await request(app)
        .put(`/api/users/unfollow/${otherUser._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);

      const updatedUser = await User.findById(user._id);
      const updatedOtherUser = await User.findById(otherUser._id);

      expect(updatedUser.following).not.toContainEqual(otherUser._id);
      expect(updatedOtherUser.followers).not.toContainEqual(user._id);
    });
  });

  describe('GET /api/users/nearby/users', () => {
    beforeEach(async () => {
      // Create users with different locations
      await User.create({
        username: 'nearbyuser',
        email: 'nearby@example.com',
        password: 'password123',
        location: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });

      await User.create({
        username: 'faruser',
        email: 'far@example.com',
        password: 'password123',
        location: {
          type: 'Point',
          coordinates: [45, 45]
        }
      });
    });

    it('should get nearby users', async () => {
      const res = await request(app)
        .get('/api/users/nearby/users')
        .set('Authorization', `Bearer ${token}`)
        .query({
          longitude: 0,
          latitude: 0,
          maxDistance: 1000
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0].username).toBe('nearbyuser');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          bio: 'Updated bio',
          location: {
            type: 'Point',
            coordinates: [10, 10]
          }
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.bio).toBe('Updated bio');
      expect(res.body.location.coordinates).toEqual([10, 10]);
    });

    it('should not update sensitive fields', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: 'newpassword',
          email: 'newemail@example.com'
        });

      expect(res.statusCode).toBe(200);
      
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.email).toBe('test@example.com');
    });
  });
});

describe('Live Streaming Routes', () => {
    let token;

    beforeAll(async () => {
        // Authenticate and get a token
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com', password: 'password' });
        token = response.body.token;
    });

    test('Start a live stream', async () => {
        const response = await request(app)
            .post('/api/users/live/start')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Test Live Stream' });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.title).toBe('Test Live Stream');
    });

    test('Get active live streams', async () => {
        const response = await request(app)
            .get('/api/users/live/active')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Stop a live stream', async () => {
        // Start a stream first
        const startResponse = await request(app)
            .post('/api/users/live/start')
            .set('Authorization', `Bearer ${token}`)
            .send({ title: 'Stream to Stop' });

        const streamId = startResponse.body._id;

        // Stop the stream
        const stopResponse = await request(app)
            .post('/api/users/live/stop')
            .set('Authorization', `Bearer ${token}`)
            .send({ streamId });

        expect(stopResponse.status).toBe(200);
        expect(stopResponse.body.message).toBe('Stream stopped successfully');

        // Verify the stream is inactive
        const stream = await LiveStream.findById(streamId);
        expect(stream.isActive).toBe(false);
    });
});