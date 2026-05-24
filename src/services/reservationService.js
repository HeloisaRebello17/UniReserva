const reservationRepository = require('../repositories/reservationRepository');
const roomRepository = require('../repositories/roomRepository');

async function listReservations() {
  return reservationRepository.listReservations();
}

async function createReservation({ date, startTime, endTime, roomId, userId }) {
  if (!date || !startTime || !endTime || !roomId || !userId) {
    throw new Error('Data, horários, sala e usuário são obrigatórios.');
  }

  if (endTime <= startTime) {
    throw new Error('O horário de fim deve ser maior que o horário de início.');
  }

  const normalizedRoomId = Number(roomId);
  const normalizedUserId = Number(userId);
  const room = await roomRepository.findRoomById(normalizedRoomId);
  if (!room) {
    throw new Error('Sala não encontrada.');
  }

  const conflict = await reservationRepository.findConflict({
    date,
    startTime,
    endTime,
    roomId: normalizedRoomId
  });

  if (conflict) {
    const error = new Error('Já existe uma reserva para esta sala no horário informado.');
    error.code = 'CONFLICT';
    throw error;
  }

  const userConflict = await reservationRepository.findUserConflict({
    date,
    startTime,
    endTime,
    userId: normalizedUserId
  });

  if (userConflict) {
    const error = new Error('Usuário já possui uma reserva neste horário.');
    error.code = 'CONFLICT';
    throw error;
  }

  return reservationRepository.createReservation({
    date,
    startTime,
    endTime,
    roomId: normalizedRoomId,
    userId: normalizedUserId
  });
}

async function cancelReservation(id, requester) {
  const reservation = await reservationRepository.findReservationById(Number(id));
  if (!reservation) {
    throw new Error('Reserva não encontrada.');
  }

  const canCancel = requester.type === 'admin' || reservation.userId === Number(requester.id);
  if (!canCancel) {
    const error = new Error('Usuário sem permissão para cancelar esta reserva.');
    error.code = 'FORBIDDEN';
    throw error;
  }

  return reservationRepository.cancelReservation(Number(id));
}

async function updateReservation(id, { date, startTime, endTime, roomId, userId, status }, requester) {
  if (!requester || requester.type !== 'admin') {
    const error = new Error('Apenas administradores podem editar reservas.');
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (!date || !startTime || !endTime || !roomId || !userId) {
    throw new Error('Data, horários, sala e usuário são obrigatórios.');
  }

  if (endTime <= startTime) {
    throw new Error('O horário de fim deve ser maior que o horário de início.');
  }

  const reservationId = Number(id);
  const normalizedRoomId = Number(roomId);
  const normalizedUserId = Number(userId);

  const existingReservation = await reservationRepository.findReservationById(reservationId);
  if (!existingReservation) {
    throw new Error('Reserva não encontrada.');
  }

  const room = await roomRepository.findRoomById(normalizedRoomId);
  if (!room) {
    throw new Error('Sala não encontrada.');
  }

  const conflict = await reservationRepository.findConflict({
    date,
    startTime,
    endTime,
    roomId: normalizedRoomId
  });

  if (conflict && Number(conflict.id) !== reservationId) {
    const error = new Error('Já existe uma reserva para esta sala no horário informado.');
    error.code = 'CONFLICT';
    throw error;
  }

  const userConflict = await reservationRepository.findUserConflict({
    date,
    startTime,
    endTime,
    userId: normalizedUserId
  });

  if (userConflict && Number(userConflict.id) !== reservationId) {
    const error = new Error('Usuário já possui uma reserva neste horário.');
    error.code = 'CONFLICT';
    throw error;
  }

  return reservationRepository.updateReservationById(reservationId, {
    date,
    startTime,
    endTime,
    roomId: normalizedRoomId,
    userId: normalizedUserId,
    status: status || existingReservation.status
  });
}

module.exports = {
  listReservations,
  createReservation,
  cancelReservation,
  updateReservation
};
