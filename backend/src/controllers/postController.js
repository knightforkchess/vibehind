const Post = require('../models/Post');
const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');

// Create a new post
const createPost = async (req, res) => {
  try {
    const mediaFiles = req.files?.map(file => ({
      type: file.mimetype.startsWith('image/') ? 'image' : 'video',
      url: file.path
    }));

    const newPost = new Post({
      userId: req.user.id,
      content: req.body.content,
      media: mediaFiles,
      location: req.body.location ? JSON.parse(req.body.location) : undefined
    });

    const savedPost = await newPost.save();
    await savedPost.populate('userId', 'username profilePicture');
    
    res.status(201).json(savedPost);
  } catch (error) {
    // Delete uploaded files if post creation fails
    if (req.files) {
      for (const file of req.files) {
        const publicId = file.path.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// Get timeline posts
const getTimelinePosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const following = user.following;
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({
      $or: [
        { userId: req.user.id },
        { userId: { $in: following } }
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'username profilePicture')
    .populate('comments.user', 'username profilePicture');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearby posts
const getNearbyPosts = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query;
    
    const posts = await Post.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    })
    .sort({ createdAt: -1 })
    .populate('userId', 'username profilePicture')
    .populate('comments.user', 'username profilePicture');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's posts
const getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'username profilePicture')
      .populate('comments.user', 'username profilePicture');
      
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a post
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes.includes(req.user.id)) {
      await post.updateOne({ $pull: { likes: req.user.id } });
      res.json({ message: 'Post unliked' });
    } else {
      await post.updateOne({ $push: { likes: req.user.id } });
      res.json({ message: 'Post liked' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add comment to post
const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user.id,
      text: req.body.text
    };

    post.comments.push(comment);
    await post.save();
    
    const populatedPost = await post.populate('comments.user', 'username profilePicture');
    res.json(populatedPost.comments[populatedPost.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can delete only your posts' });
    }

    // Delete media files from Cloudinary
    if (post.media && post.media.length > 0) {
      for (const mediaItem of post.media) {
        const publicId = mediaItem.url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a post
const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can update only your posts' });
    }

    const updates = {
      content: req.body.content,
      location: req.body.location ? JSON.parse(req.body.location) : post.location
    };

    // Handle media updates if present
    if (req.files && req.files.length > 0) {
      // Delete old media from Cloudinary
      if (post.media && post.media.length > 0) {
        for (const mediaItem of post.media) {
          const publicId = mediaItem.url.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // Add new media
      updates.media = req.files.map(file => ({
        type: file.mimetype.startsWith('image/') ? 'image' : 'video',
        url: file.path
      }));
    }

    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate('userId', 'username profilePicture');

    res.json(updatedPost);
  } catch (error) {
    // Delete uploaded files if update fails
    if (req.files) {
      for (const file of req.files) {
        const publicId = file.path.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      }
    }
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPost,
  getTimelinePosts,
  getNearbyPosts,
  getUserPosts,
  likePost,
  commentPost,
  deletePost,
  updatePost
};