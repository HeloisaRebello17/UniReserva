const express = require('express');
const reservationController = require('../controllers/reservationController');
const { ensureAuthenticated } = require('../middleware/auth');

const router = express.Router();

router.get('/', ensureAuthenticated, reservationController.list);
router.post('/', ensureAuthenticated, reservationController.create);
router.put('/:id', ensureAuthenticated, reservationController.update);
router.delete('/:id', ensureAuthenticated, reservationController.cancel);

module.exports = router;
