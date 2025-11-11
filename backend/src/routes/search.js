const express = require('express');
const router = express.Router();
const { searchUsers } = require('../controllers/searchController');
const auth = require('../middleware/auth');

// Kullanıcı arama
router.get('/users', auth, searchUsers);

module.exports = router;
