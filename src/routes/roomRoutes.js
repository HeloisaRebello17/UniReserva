const express = require('express');
const roomController = require('../controllers/roomController');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, roomController.list);
router.post('/', ensureAuthenticated, ensureAdmin, roomController.create);
router.put('/:id', ensureAuthenticated, ensureAdmin, roomController.update);
router.delete('/:id', ensureAuthenticated, ensureAdmin, roomController.remove);

module.exports = router;
