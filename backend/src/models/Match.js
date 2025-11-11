const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  // Her kullanıcının diğerini beğenip beğenmediğini takip et
  user1Liked: {
    type: Boolean,
    default: false
  },
  user2Liked: {
    type: Boolean,
    default: false
  },
  // Eşleşme oldu mu?
  isMatched: {
    type: Boolean,
    default: false
  },
  matchedAt: {
    type: Date
  },
  // Son mesaj bilgisi
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Her kullanıcı çifti için sadece bir match kaydı olsun
matchSchema.index({ users: 1 }, { unique: true });

// Eşleşmeleri son mesaj tarihine göre sıralamak için
matchSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Match', matchSchema);
