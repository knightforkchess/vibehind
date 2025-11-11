const router = require('express').Router();
const {
  createPost,
  getTimelinePosts,
  getNearbyPosts,
  getUserPosts,
  likePost,
  commentPost,
  deletePost,
  updatePost
} = require('../controllers/postController');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

// All routes are protected
router.use(auth);

// Create a post with media upload support
router.post('/', upload.array('media', 5), createPost);

// Get timeline posts
router.get('/timeline', getTimelinePosts);

// Get nearby posts
router.get('/nearby', getNearbyPosts);

// Get user's posts
router.get('/user/:userId', getUserPosts);

// Like/unlike a post
router.put('/:id/like', likePost);

// Comment on a post
router.post('/:id/comment', commentPost);

// Delete a post
router.delete('/:id', deletePost);

// Update a post
router.put('/:id', updatePost);

module.exports = router;