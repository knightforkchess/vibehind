const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'superlike', 'nope'],
    required: true
  }
}, {
  timestamps: true
});

// Her kullanıcı bir diğer kullanıcıyı sadece bir kez beğenebilir
likeSchema.index({ from: 1, to: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema);
