const User = require('../models/User');
const { cloudinary } = require('../config/cloudinary');
const LiveStream = require('../models/LiveStream');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'username profilePicture')
      .populate('following', 'username profilePicture');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Handle file uploads if present
    if (req.files) {
      if (req.files.profilePicture) {
        updates.profilePicture = req.files.profilePicture[0].path;
      }
      if (req.files.coverPicture) {
        updates.coverPicture = req.files.coverPicture[0].path;
      }
    }

    // Get current user data to check for existing images
    const currentUser = await User.findById(req.user.id);
    
    // Delete old images from Cloudinary if they're being replaced
    if (updates.profilePicture && currentUser.profilePicture) {
      const publicId = currentUser.profilePicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }
    if (updates.coverPicture && currentUser.coverPicture) {
      const publicId = currentUser.coverPicture.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    }

    updates.lastActive = new Date();
    delete updates.password; // Prevent password update through this route
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    // Delete uploaded files if update fails
    if (req.files) {
      for (const fileArray of Object.values(req.files)) {
        for (const file of fileArray) {
          const publicId = file.path.split('/').pop().split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }
    res.status(500).json({ message: error.message });
  }
};

// Follow user
const followUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    await currentUser.updateOne({ $push: { following: req.params.id } });
    await userToFollow.updateOne({ $push: { followers: req.user.id } });

    res.json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Unfollow user
const unfollowUser = async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot unfollow yourself' });
    }

    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    await currentUser.updateOne({ $pull: { following: req.params.id } });
    await userToUnfollow.updateOne({ $pull: { followers: req.user.id } });

    res.json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get nearby users
const getNearbyUsers = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

    const users = await User.find({
      _id: { $ne: req.user.id },
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('username profilePicture location lastActive');

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user location
const updateLocation = async (req, res) => {
  try {
    const { longitude, latitude } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          location: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          lastActive: new Date()
        }
      },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users
const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        {
          $or: [
            { username: { $regex: q, $options: 'i' } },
            { name: { $regex: q, $options: 'i' } },
            { bio: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('username name profilePicture bio verified')
    .limit(10);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Start a live stream
const startLiveStream = async (req, res) => {
  try {
    const { title } = req.body;
    const host = req.user.id;

    const newStream = await LiveStream.create({ title, host });
    res.status(201).json(newStream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Stop a live stream
const stopLiveStream = async (req, res) => {
  try {
    const { streamId } = req.body;
    const stream = await LiveStream.findOneAndUpdate(
      { _id: streamId, host: req.user.id },
      { isActive: false },
      { new: true }
    );

    if (!stream) {
      return res.status(404).json({ message: 'Live stream not found or unauthorized' });
    }

    res.json(stream);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get active live streams
const getActiveLiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find({ isActive: true })
      .populate('host', 'username profilePicture');

    res.json(streams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch user profiles for the feed
const getUserProfilesForFeed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const mongoose = require('mongoose');
    
    // Exclude current user and get random users
    const users = await User.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(req.user.id) } } },
      { $sample: { size: limit } },
      { 
        $project: { 
          username: 1, 
          profilePicture: 1, 
          bio: 1, 
          location: 1, 
          interests: 1,
          lastActive: 1,
          isOnline: 1
        } 
      }
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};