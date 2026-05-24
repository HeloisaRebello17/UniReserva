const roomRepository = require('../repositories/roomRepository');

async function listRooms() {
  return roomRepository.listRooms();
}

async function createRoom({ name, capacity, type }) {
  if (!name || !capacity || !type) {
    throw new Error('Nome, capacidade e tipo da sala são obrigatórios.');
  }

  return roomRepository.createRoom({
    name,
    capacity: Number(capacity),
    type
  });
}

async function updateRoom(id, { name, capacity, type }) {
  if (!name || !capacity || !type) {
    throw new Error('Nome, capacidade e tipo da sala são obrigatórios.');
  }

  const updatedRoom = await roomRepository.updateRoomById(Number(id), {
    name,
    capacity: Number(capacity),
    type
  });

  if (!updatedRoom) {
    throw new Error('Sala não encontrada.');
  }

  return updatedRoom;
}

async function deleteRoom(id) {
  const deletedRoom = await roomRepository.deleteRoomById(Number(id));
  if (!deletedRoom) {
    throw new Error('Sala não encontrada.');
  }

  return deletedRoom;
}

module.exports = {
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom
};
