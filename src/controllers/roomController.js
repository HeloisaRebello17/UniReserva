const roomService = require('../services/roomService');

async function list(req, res) {
  try {
    const rooms = await roomService.listRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function create(req, res) {
  try {
    const room = await roomService.createRoom(req.body);
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function update(req, res) {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    res.json(room);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

async function remove(req, res) {
  try {
    const room = await roomService.deleteRoom(req.params.id);
    res.json(room);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

module.exports = {
  list,
  create,
  update,
  remove
};
