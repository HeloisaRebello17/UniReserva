const express = require('express');
const userController = require('../controllers/userController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, ensureAdmin, userController.list);
router.post('/', ensureAuthenticated, ensureAdmin, userController.create);

module.exports = router;