const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversationId: {
    type: String
  },
  text: {
    type: String,
    required: true
  },
  media: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'seen'],
    default: 'sent'
  },
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      required: true
    }
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  edited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    text: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Generate conversationId before saving
messageSchema.pre('save', function(next) {
  if (!this.conversationId) {
    const ids = [this.sender.toString(), this.recipient.toString()].sort();
    this.conversationId = `${ids[0]}-${ids[1]}`;
  }
  next();
});

// Index for faster queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ deletedAt: 1 });

// Add method to mark message as delivered
messageSchema.methods.markDelivered = async function() {
  if (this.status === 'sent') {
    this.status = 'delivered';
    await this.save();
  }
  return this;
};

// Add method to mark message as seen
messageSchema.methods.markSeen = async function() {
  if (this.status !== 'seen') {
    this.status = 'seen';
    this.read = true;
    await this.save();
  }
  return this;
};

// Add method to add reaction
messageSchema.methods.addReaction = async function(userId, reactionType) {
  const existingReaction = this.reactions.find(r => r.user.toString() === userId.toString());
  if (existingReaction) {
    existingReaction.reaction = reactionType;
  } else {
    this.reactions.push({ user: userId, reaction: reactionType });
  }
  await this.save();
  return this;
};

// Add method to remove reaction
messageSchema.methods.removeReaction = async function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  await this.save();
  return this;
};

// Add method to soft delete message
messageSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  await this.save();
  return this;
};

// Add method to edit message
messageSchema.methods.edit = async function(newText) {
  if (this.deletedAt) {
    throw new Error('Cannot edit deleted message');
  }
  
  this.editHistory.push({
    text: this.text,
    editedAt: new Date()
  });
  
  this.text = newText;
  this.edited = true;
  await this.save();
  return this;
};

module.exports = mongoose.model('Message', messageSchema);