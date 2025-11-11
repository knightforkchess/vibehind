const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index');
const User = require('../models/User');
const Message = require('../models/Message');

describe('Message Endpoints', () => {
  let token;
  let user;
  let recipient;
  let testMessage;

  beforeEach(async () => {
    // Create test users
    user = await User.create({
      username: 'sender',
      email: 'sender@example.com',
      password: 'password123'
    });

    recipient = await User.create({
      username: 'recipient',
      email: 'recipient@example.com',
      password: 'password123'
    });

    token = generateTestToken(user._id);

    // Create a test message
    testMessage = await Message.create({
      sender: user._id,
      recipient: recipient._id,
      text: 'Test message'
    });
  });

  describe('GET /api/messages/conversations', () => {
    beforeEach(async () => {
      // Create some test messages
      await Message.create({
        sender: user._id,
        receiver: recipient._id,
        text: 'Hello'
      });

      await Message.create({
        sender: recipient._id,
        receiver: user._id,
        text: 'Hi there'
      });
    });

    it('should get user conversations', async () => {
      const res = await request(app)
        .get('/api/messages/conversations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(1);
      expect(res.body[0].userDetails.username).toBe('recipient');
      expect(res.body[0].lastMessage.text).toBe('Hi there');
    });
  });

  describe('GET /api/messages/:userId', () => {
    beforeEach(async () => {
      // Create conversation messages
      await Message.create([
        {
          sender: user._id,
          receiver: recipient._id,
          text: 'Message 1'
        },
        {
          sender: recipient._id,
          receiver: user._id,
          text: 'Message 2'
        },
        {
          sender: user._id,
          receiver: recipient._id,
          text: 'Message 3'
        }
      ]);
    });

    it('should get messages between two users', async () => {
      const res = await request(app)
        .get(`/api/messages/${recipient._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(3);
      expect(res.body[0].text).toBe('Message 1');
      expect(res.body[1].text).toBe('Message 2');
      expect(res.body[2].text).toBe('Message 3');
    });
  });

  describe('POST /api/messages/:userId', () => {
    it('should send a message', async () => {
      const res = await request(app)
        .post(`/api/messages/${recipient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Test message'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.text).toBe('Test message');
      expect(res.body.sender.toString()).toBe(user._id.toString());
      expect(res.body.receiver.toString()).toBe(recipient._id.toString());
    });

    it('should send a message with media', async () => {
      const res = await request(app)
        .post(`/api/messages/${recipient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Test message with media',
          media: 'http://example.com/test.jpg'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.text).toBe('Test message with media');
      expect(res.body.media).toBe('http://example.com/test.jpg');
    });
  });

  describe('PUT /api/messages/read/:userId', () => {
    beforeEach(async () => {
      // Create unread messages
      await Message.create([
        {
          sender: recipient._id,
          receiver: user._id,
          text: 'Unread 1',
          read: false
        },
        {
          sender: recipient._id,
          receiver: user._id,
          text: 'Unread 2',
          read: false
        }
      ]);
    });

    it('should mark messages as read', async () => {
      const res = await request(app)
        .put(`/api/messages/read/${recipient._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);

      const messages = await Message.find({
        sender: recipient._id,
        receiver: user._id
      });

      expect(messages.every(msg => msg.read)).toBeTruthy();
    });
  });

  describe('Message Status Updates', () => {
    it('should mark message as delivered', async () => {
      const res = await request(app)
        .put(`/api/messages/${testMessage._id}/deliver`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('delivered');
    });

    it('should mark message as seen', async () => {
      const res = await request(app)
        .put(`/api/messages/${testMessage._id}/seen`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('seen');
      expect(res.body.read).toBe(true);
    });
  });

  describe('Message Reactions', () => {
    it('should add reaction to message', async () => {
      const res = await request(app)
        .post(`/api/messages/${testMessage._id}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reaction: '❤️' });

      expect(res.statusCode).toBe(200);
      expect(res.body.reactions).toHaveLength(1);
      expect(res.body.reactions[0].reaction).toBe('❤️');
      expect(res.body.reactions[0].user.toString()).toBe(user._id.toString());
    });

    it('should update existing reaction', async () => {
      // Add initial reaction
      await request(app)
        .post(`/api/messages/${testMessage._id}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reaction: '❤️' });

      // Update reaction
      const res = await request(app)
        .post(`/api/messages/${testMessage._id}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reaction: '👍' });

      expect(res.statusCode).toBe(200);
      expect(res.body.reactions).toHaveLength(1);
      expect(res.body.reactions[0].reaction).toBe('👍');
    });

    it('should remove reaction from message', async () => {
      // Add reaction first
      await request(app)
        .post(`/api/messages/${testMessage._id}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reaction: '❤️' });

      // Remove reaction
      const res = await request(app)
        .delete(`/api/messages/${testMessage._id}/reactions`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.reactions).toHaveLength(0);
    });
  });

  describe('Message Editing', () => {
    it('should edit message', async () => {
      const res = await request(app)
        .put(`/api/messages/${testMessage._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Updated message' });

      expect(res.statusCode).toBe(200);
      expect(res.body.text).toBe('Updated message');
      expect(res.body.edited).toBe(true);
      expect(res.body.editHistory).toHaveLength(1);
      expect(res.body.editHistory[0].text).toBe('Test message');
    });

    it('should not edit deleted message', async () => {
      // Delete message first
      await testMessage.softDelete();

      const res = await request(app)
        .put(`/api/messages/${testMessage._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'Updated message' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Message Deletion', () => {
    it('should soft delete message', async () => {
      const res = await request(app)
        .delete(`/api/messages/${testMessage._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.deletedAt).toBeTruthy();
    });

    it('should not show deleted messages in conversation', async () => {
      // Create multiple messages and delete one
      const msg1 = await Message.create({
        sender: user._id,
        recipient: recipient._id,
        text: 'Message 1'
      });

      const msg2 = await Message.create({
        sender: user._id,
        recipient: recipient._id,
        text: 'Message 2'
      });

      await msg1.softDelete();

      const res = await request(app)
        .get(`/api/messages/${recipient._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].text).toBe('Message 2');
    });
  });

  describe('Message Threading', () => {
    it('should create reply to message', async () => {
      const res = await request(app)
        .post(`/api/messages/${recipient._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          text: 'Reply message',
          replyTo: testMessage._id
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.text).toBe('Reply message');
      expect(res.body.replyTo.toString()).toBe(testMessage._id.toString());
    });

    it('should get thread messages', async () => {
      // Create reply message
      await Message.create({
        sender: user._id,
        recipient: recipient._id,
        text: 'Reply 1',
        replyTo: testMessage._id
      });

      const res = await request(app)
        .get(`/api/messages/thread/${testMessage._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].text).toBe('Test message');
      expect(res.body[1].text).toBe('Reply 1');
    });
  });
});