const router = require('express').Router();
const { register, login, getCurrentUser } = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Register new user with validation
router.post('/register', validateRegistration, register);

// Login user with validation
router.post('/login', validateLogin, login);

// Get current user (protected route)
router.get('/me', auth, getCurrentUser);

module.exports = router;