const router = require('express').Router();
const {
  swipeUser,
  getMatches,
  getMatchDetails,
  unmatch
} = require('../controllers/matchController');
const auth = require('../middleware/auth');

// Tüm route'lar auth middleware kullanır
router.use(auth);

// Kullanıcıyı beğen/geç
router.post('/swipe', swipeUser);

// Eşleşmeleri getir
router.get('/', getMatches);

// Belirli bir eşleşmenin detaylarını getir
router.get('/:matchId', getMatchDetails);

// Eşleşmeyi kaldır
router.delete('/:matchId', unmatch);

module.exports = router;
