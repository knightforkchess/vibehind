const LiveStream = require('../models/LiveStream');
const User = require('../models/User');
const crypto = require('crypto');

// Yeni canlı yayın başlat
const startLiveStream = async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const hostId = req.user.id;

    // Kullanıcının zaten aktif bir yayını var mı kontrol et
    const existingStream = await LiveStream.findOne({
      host: hostId,
      isActive: true
    });

    if (existingStream) {
      return res.status(400).json({ message: 'Zaten aktif bir yayınınız var' });
    }

    // Benzersiz stream key oluştur
    const streamKey = crypto.randomBytes(16).toString('hex');

    const liveStream = await LiveStream.create({
      title,
      description,
      host: hostId,
      streamKey,
      category: category || 'Sohbet',
      isActive: true,
      startedAt: new Date()
    });

    const populatedStream = await LiveStream.findById(liveStream._id)
      .populate('host', 'username profilePicture isOnline');

    // Socket.IO ile tüm kullanıcılara yeni yayın bildirimi gönder
    const io = req.app.get('io');
    if (io && populatedStream && populatedStream.host) {
      io.emit('stream-started', {
        streamId: populatedStream._id,
        host: {
          _id: populatedStream.host._id,
          username: populatedStream.host.username,
          profilePicture: populatedStream.host.profilePicture,
          isOnline: populatedStream.host.isOnline
        },
        title: populatedStream.title,
        category: populatedStream.category,
        viewerCount: 0
      });
    }

    res.status(201).json(populatedStream);
  } catch (error) {
    console.error('Start live stream error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Canlı yayını sonlandır
const endLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;

    const stream = await LiveStream.findOne({
      _id: streamId,
      host: userId
    });

    if (!stream) {
      return res.status(404).json({ message: 'Yayın bulunamadı' });
    }

    stream.isActive = false;
    stream.endedAt = new Date();
    await stream.save();

    // Socket.IO ile yayın sonlandı bildirimi gönder
    const io = req.app.get('io');
    if (io) {
      io.emit('stream-ended', {
        streamId: stream._id
      });
    }

    res.json({ message: 'Yayın sonlandırıldı', stream });
  } catch (error) {
    console.error('End live stream error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Aktif canlı yayınları listele
const getActiveLiveStreams = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const streams = await LiveStream.find({ isActive: true })
      .populate('host', 'username profilePicture isOnline')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LiveStream.countDocuments({ isActive: true });

    res.json({
      streams,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get active live streams error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Belirli bir yayının detaylarını getir
const getLiveStreamDetails = async (req, res) => {
  try {
    const { streamId } = req.params;

    const stream = await LiveStream.findById(streamId)
      .populate('host', 'username profilePicture bio isOnline')
      .populate('viewers', 'username profilePicture');

    if (!stream) {
      return res.status(404).json({ message: 'Yayın bulunamadı' });
    }

    res.json(stream);
  } catch (error) {
    console.error('Get live stream details error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Yayına katıl (viewer olarak)
const joinLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;

    const stream = await LiveStream.findById(streamId);

    if (!stream) {
      return res.status(404).json({ message: 'Yayın bulunamadı' });
    }

    if (!stream.isActive) {
      return res.status(400).json({ message: 'Bu yayın aktif değil' });
    }

    // Kullanıcı zaten izleyici listesinde mi?
    if (!stream.viewers.includes(userId)) {
      stream.viewers.push(userId);
      stream.viewerCount = stream.viewers.length;
      await stream.save();
    }

    const populatedStream = await LiveStream.findById(streamId)
      .populate('host', 'username profilePicture isOnline');

    res.json(populatedStream);
  } catch (error) {
    console.error('Join live stream error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Yayından ayrıl
const leaveLiveStream = async (req, res) => {
  try {
    const { streamId } = req.params;
    const userId = req.user.id;

    const stream = await LiveStream.findById(streamId);

    if (!stream) {
      return res.status(404).json({ message: 'Yayın bulunamadı' });
    }

    stream.viewers = stream.viewers.filter(
      viewerId => viewerId.toString() !== userId
    );
    stream.viewerCount = stream.viewers.length;
    await stream.save();

    res.json({ message: 'Yayından ayrıldınız' });
  } catch (error) {
    console.error('Leave live stream error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Kullanıcının kendi yayınını getir
const getMyLiveStream = async (req, res) => {
  try {
    const userId = req.user.id;

    const stream = await LiveStream.findOne({
      host: userId,
      isActive: true
    }).populate('host', 'username profilePicture');

    if (!stream) {
      return res.status(404).json({ message: 'Aktif yayınınız yok' });
    }

    res.json(stream);
  } catch (error) {
    console.error('Get my live stream error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  startLiveStream,
  endLiveStream,
  getActiveLiveStreams,
  getLiveStreamDetails,
  joinLiveStream,
  leaveLiveStream,
  getMyLiveStream
};
