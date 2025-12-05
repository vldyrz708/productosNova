const express = require('express');
const router = express.Router();
const { login, logout, me, register } = require('../controller/authController');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/logout
router.post('/logout', logout);

// GET /api/auth/me
router.get('/me', me);

module.exports = router;
