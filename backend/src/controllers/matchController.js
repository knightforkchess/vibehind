const Like = require('../models/Like');
const Match = require('../models/Match');
const User = require('../models/User');
const Message = require('../models/Message');

// Kullanıcıyı beğen (like/superlike/nope)
const swipeUser = async (req, res) => {
  try {
    const { targetUserId, type } = req.body; // type: 'like', 'superlike', 'nope'
    const currentUserId = req.user.id;

    if (currentUserId === targetUserId) {
      return res.status(400).json({ message: 'Kendinizi beğenemezsiniz' });
    }

    // Hedef kullanıcı var mı kontrol et
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Daha önce beğenmiş mi kontrol et
    let existingLike = await Like.findOne({
      from: currentUserId,
      to: targetUserId
    });

    if (existingLike) {
      // Güncelle
      existingLike.type = type;
      await existingLike.save();
    } else {
      // Yeni like oluştur
      existingLike = await Like.create({
        from: currentUserId,
        to: targetUserId,
        type: type
      });
    }

    // Eğer 'like' veya 'superlike' ise, karşılıklı beğeni var mı kontrol et
    if (type === 'like' || type === 'superlike') {
      const reciprocalLike = await Like.findOne({
        from: targetUserId,
        to: currentUserId,
        type: { $in: ['like', 'superlike'] }
      });

      if (reciprocalLike) {
        // Eşleşme var! Match oluştur veya güncelle
        const users = [currentUserId, targetUserId].sort();
        
        let match = await Match.findOne({ users: users });
        
        if (!match) {
          match = await Match.create({
            users: users,
            user1Liked: true,
            user2Liked: true,
            isMatched: true,
            matchedAt: new Date()
          });
        } else if (!match.isMatched) {
          match.isMatched = true;
          match.matchedAt = new Date();
          await match.save();
        }

        return res.json({
          message: 'Eşleşme oluştu!',
          matched: true,
          match: match
        });
      }
    }

    res.json({
      message: 'Beğeni kaydedildi',
      matched: false
    });
  } catch (error) {
    console.error('Swipe error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcının eşleşmelerini getir
const getMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await Match.find({
      users: userId,
      isMatched: true
    })
    .populate('users', 'username profilePicture isOnline lastActive')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1, matchedAt: -1 });

    // Her eşleşme için diğer kullanıcıyı ve son mesajı formatla
    const formattedMatches = matches.map(match => {
      const otherUser = match.users.find(u => u._id.toString() !== userId);
      
      return {
        _id: match._id,
        user: {
          _id: otherUser._id,
          username: otherUser.username,
          profilePicture: otherUser.profilePicture,
          isOnline: otherUser.isOnline,
          lastActive: otherUser.lastActive
        },
        lastMessage: match.lastMessage,
        lastMessageAt: match.lastMessageAt,
        matchedAt: match.matchedAt
      };
    });

    res.json(formattedMatches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir eşleşmenin detaylarını getir
const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await Match.findOne({
      _id: matchId,
      users: userId,
      isMatched: true
    })
    .populate('users', 'username profilePicture bio interests isOnline lastActive');

    if (!match) {
      return res.status(404).json({ message: 'Eşleşme bulunamadı' });
    }

    const otherUser = match.users.find(u => u._id.toString() !== userId);

    res.json({
      _id: match._id,
      user: otherUser,
      matchedAt: match.matchedAt
    });
  } catch (error) {
    console.error('Get match details error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Eşleşmeyi kaldır (unmatch)
const unmatch = async (req, res) => {
  try {
    const { matchId } = req.params;
    const userId = req.user.id;

    const match = await Match.findOne({
      _id: matchId,
      users: userId
    });

    if (!match) {
      return res.status(404).json({ message: 'Eşleşme bulunamadı' });
    }

    // Eşleşmeyi sil
    await Match.findByIdAndDelete(matchId);

    // İlgili like kayıtlarını da sil
    const otherUserId = match.users.find(id => id.toString() !== userId);
    await Like.deleteMany({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId }
      ]
    });

    res.json({ message: 'Eşleşme kaldırıldı' });
  } catch (error) {
    console.error('Unmatch error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  swipeUser,
  getMatches,
  getMatchDetails,
  unmatch
};
