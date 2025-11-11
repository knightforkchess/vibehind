const router = require('express').Router();
const {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getNearbyUsers,
  updateLocation,
  searchUsers,
  startLiveStream,
  stopLiveStream,
  getActiveLiveStreams,
  getUserProfilesForFeed
} = require('../controllers/userController');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Search users
router.get('/search', searchUsers);

// Route to fetch user profiles for the feed (must be before /:id)
router.get('/feed/profiles', getUserProfilesForFeed);

// Get user profile
router.get('/:id', getUserProfile);

// Update user profile with photo upload support
router.put('/profile', upload.fields([
  { name: 'profilePicture', maxCount: 1 },
  { name: 'coverPicture', maxCount: 1 }
]), updateProfile);

// Follow user
router.put('/follow/:id', followUser);

// Unfollow user
router.put('/unfollow/:id', unfollowUser);

// Get nearby users
router.get('/nearby/users', getNearbyUsers);

// Update user location
router.put('/location', updateLocation);

// Live stream routes
router.post('/live/start', startLiveStream);
router.post('/live/stop', stopLiveStream);
router.get('/live/active', getActiveLiveStreams);

module.exports = router;