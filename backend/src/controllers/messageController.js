const Message = require('../models/Message');
const User = require('../models/User');
const mongoose = require('mongoose');

// Helper function to validate ObjectId
const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ],
          deletedAt: null
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$recipient', req.user._id] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          let: { 
            senderId: '$lastMessage.sender',
            recipientId: '$lastMessage.recipient'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $ne: ['$_id', req.user._id]
                    },
                    {
                      $or: [
                        { $eq: ['$_id', '$$senderId'] },
                        { $eq: ['$_id', '$$recipientId'] }
                      ]
                    }
                  ]
                }
              }
            }
          ],
          as: 'userDetails'
        }
      },
      {
        $unwind: '$userDetails'
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    if (!isValidObjectId(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const messages = await Message.find({
      conversationId: {
        $regex: new RegExp(`${req.user._id}|${otherUserId}`)
      },
      deletedAt: null
    })
    .sort({ createdAt: -1 })
    .populate('sender recipient', 'username profilePicture');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { text, media, replyTo } = req.body;
    const recipientId = req.params.userId;

    if (!isValidObjectId(recipientId)) {
      return res.status(400).json({ message: 'Invalid recipient ID' });
    }

    if (replyTo && !isValidObjectId(replyTo)) {
      return res.status(400).json({ message: 'Invalid reply message ID' });
    }

    const message = new Message({
      sender: req.user._id,
      recipient: recipientId,
      text,
      media,
      replyTo
    });

    await message.save();
    await message.populate('sender recipient', 'username profilePicture');

    // Emit socket event for real-time updates
    req.app.get('io').to(recipientId).emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markDelivered = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markDelivered();
    req.app.get('io').to(message.sender.toString()).emit('messageDelivered', message._id);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markSeen = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.markSeen();
    req.app.get('io').to(message.sender.toString()).emit('messageSeen', message._id);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addReaction = async (req, res) => {
  try {
    const { reaction } = req.body;
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.addReaction(req.user._id, reaction);
    req.app.get('io').to(message.sender.toString()).emit('messageReaction', {
      messageId: message._id,
      reaction,
      user: req.user._id
    });
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeReaction = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.removeReaction(req.user._id);
    req.app.get('io').to(message.sender.toString()).emit('messageReactionRemoved', {
      messageId: message._id,
      user: req.user._id
    });
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.editMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.edit(text);
    req.app.get('io').to(message.recipient.toString()).emit('messageEdited', message);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findOne({
      _id: req.params.messageId,
      sender: req.user._id
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.softDelete();
    req.app.get('io').to(message.recipient.toString()).emit('messageDeleted', message._id);
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getThreadMessages = async (req, res) => {
  try {
    const originalMessage = await Message.findById(req.params.messageId);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const threadMessages = await Message.find({
      $or: [
        { _id: originalMessage._id },
        { replyTo: originalMessage._id }
      ],
      deletedAt: null
    })
    .sort({ createdAt: 1 })
    .populate('sender recipient', 'username profilePicture');

    res.json(threadMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};