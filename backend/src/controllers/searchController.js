const User = require('../models/User');

// Kullanıcı arama
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ users: [] });
    }

    // Username veya tam isimde arama yap
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ],
      _id: { $ne: req.user.id } // Kendini hariç tut
    })
    .select('username firstName lastName profilePicture isOnline')
    .limit(10)
    .lean();

    res.json({ users });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchUsers
};
