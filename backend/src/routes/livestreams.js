const router = require('express').Router();
const {
  startLiveStream,
  endLiveStream,
  getActiveLiveStreams,
  getLiveStreamDetails,
  joinLiveStream,
  leaveLiveStream,
  getMyLiveStream
} = require('../controllers/liveStreamController');
const auth = require('../middleware/auth');

// Tüm route'lar auth middleware kullanır
router.use(auth);

// Yeni yayın başlat
router.post('/start', startLiveStream);

// Yayını sonlandır
router.post('/:streamId/end', endLiveStream);

// Aktif yayınları listele
router.get('/active', getActiveLiveStreams);

// Kendi yayınımı getir
router.get('/my-stream', getMyLiveStream);

// Yayına katıl
router.post('/:streamId/join', joinLiveStream);

// Yayından ayrıl
router.post('/:streamId/leave', leaveLiveStream);

// Yayın detaylarını getir
router.get('/:streamId', getLiveStreamDetails);

module.exports = router;
