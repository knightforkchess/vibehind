const request = require('supertest');
const app = require('../index');
const User = require('../models/User');
const Post = require('../models/Post');

describe('Post Endpoints', () => {
  let token;
  let user;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    token = generateTestToken(user._id);
  });

  describe('POST /api/posts', () => {
    it('should create a new post', async () => {
      const res = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Test post content',
          location: JSON.stringify({
            type: 'Point',
            coordinates: [0, 0]
          })
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.content).toBe('Test post content');
      expect(res.body.userId).toBe(user._id.toString());
    });

    it('should not create post without authentication', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({
          content: 'Test post content'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/posts/timeline', () => {
    beforeEach(async () => {
      // Create some test posts
      await Post.create({
        userId: user._id,
        content: 'Test post 1'
      });
      await Post.create({
        userId: user._id,
        content: 'Test post 2'
      });
    });

    it('should get timeline posts', async () => {
      const res = await request(app)
        .get('/api/posts/timeline')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 10 });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(2);
    });
  });

  describe('PUT /api/posts/:id/like', () => {
    let post;

    beforeEach(async () => {
      post = await Post.create({
        userId: user._id,
        content: 'Test post'
      });
    });

    it('should like a post', async () => {
      const res = await request(app)
        .put(`/api/posts/${post._id}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Post liked');

      const updatedPost = await Post.findById(post._id);
      expect(updatedPost.likes).toContain(user._id);
    });

    it('should unlike an already liked post', async () => {
      // Like the post first
      await Post.findByIdAndUpdate(post._id, {
        $push: { likes: user._id }
      });

      const res = await request(app)
        .put(`/api/posts/${post._id}/like`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Post unliked');

      const updatedPost = await Post.findById(post._id);
      expect(updatedPost.likes).not.toContain(user._id);
    });
  });

  describe('POST /api/posts/:id/comment', () => {
    let post;

    beforeEach(async () => {
      post = await Post.create({
        userId: user._id,
        content: 'Test post'
      });
    });

    it('should add a comment to post', async () => {
      const res = await request(app)
        .post(`/api/posts/${post._id}/comment`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Test comment'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.text).toBe('Test comment');
      expect(res.body.user.toString()).toBe(user._id.toString());

      const updatedPost = await Post.findById(post._id);
      expect(updatedPost.comments).toHaveLength(1);
      expect(updatedPost.comments[0].text).toBe('Test comment');
    });
  });

  describe('GET /api/posts/nearby', () => {
    beforeEach(async () => {
      await Post.create({
        userId: user._id,
        content: 'Nearby post',
        location: {
          type: 'Point',
          coordinates: [0, 0]
        }
      });

      await Post.create({
        userId: user._id,
        content: 'Far post',
        location: {
          type: 'Point',
          coordinates: [45, 45]
        }
      });
    });

    it('should get nearby posts', async () => {
      const res = await request(app)
        .get('/api/posts/nearby')
        .set('Authorization', `Bearer ${token}`)
        .query({
          longitude: 0,
          latitude: 0,
          maxDistance: 1000
        });

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0].content).toBe('Nearby post');
    });
  });
});