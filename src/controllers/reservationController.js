const reservationService = require('../services/reservationService');

async function list(req, res) {
  try {
    const reservations = await reservationService.listReservations();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    const reservation = await reservationService.createReservation({
      ...req.body,
      userId: req.user.id
    });
    res.status(201).json(reservation);
  } catch (error) {
    if (error.code === 'CONFLICT') {
      return res.status(409).json({ message: error.message });
    }

    return res.status(400).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    const reservation = await reservationService.updateReservation(req.params.id, req.body, req.user);
    res.json(reservation);
  } catch (error) {
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ message: error.message });
    }

    if (error.code === 'CONFLICT') {
      return res.status(409).json({ message: error.message });
    }

    return res.status(400).json({ message: error.message });
  }
}

async function cancel(req, res) {
  try {
    const reservation = await reservationService.cancelReservation(req.params.id, req.user);
    res.json(reservation);
  } catch (error) {
    if (error.code === 'FORBIDDEN') {
      return res.status(403).json({ message: error.message });
    }

    return res.status(404).json({ message: error.message });
  }
}

module.exports = {
  list,
  create,
  update,
  cancel
};
