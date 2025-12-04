const express = require('express');
const router = express.Router();
const { login, logout } = require('../controller/authController');

const { me } = require('../controller/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', me);

module.exports = router;
