const { getDatabase } = require('../config/database');

function formatDateValue(value) {
  if (typeof value === 'string') {
    return value.length >= 10 ? value.slice(0, 10) : value;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function mapReservation(row) {
  return {
    id: row.id,
    date: formatDateValue(row.date),
    startTime: row.start_time,
    endTime: row.end_time,
    userId: row.user_id,
    roomId: row.room_id,
    status: row.status
  };
}

async function listReservations() {
  const db = getDatabase();
  const result = await db.query(
    `SELECT id, date, start_time, end_time, user_id, room_id, status
     FROM reservations
     ORDER BY date, start_time, id`
  );

  return result.rows.map(mapReservation);
}

async function findReservationById(id) {
  const db = getDatabase();
  const result = await db.query(
    `SELECT id, date, start_time, end_time, user_id, room_id, status
     FROM reservations
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return result.rows[0] ? mapReservation(result.rows[0]) : null;
}

async function findConflict({ date, startTime, endTime, roomId }) {
  const db = getDatabase();
  const result = await db.query(
    `SELECT id
     FROM reservations
     WHERE room_id = $1
       AND date = $2
       AND status <> 'cancelada'
       AND $3::time < end_time
       AND $4::time > start_time
     LIMIT 1`,
    [roomId, date, startTime, endTime]
  );

  return result.rows[0] || null;
}

async function findUserConflict({ date, startTime, endTime, userId }) {
  const db = getDatabase();
  const result = await db.query(
    `SELECT id
     FROM reservations
     WHERE user_id = $1
       AND date = $2
       AND status <> 'cancelada'
       AND $3::time < end_time
       AND $4::time > start_time
     LIMIT 1`,
    [userId, date, startTime, endTime]
  );

  return result.rows[0] || null;
}

async function createReservation({ date, startTime, endTime, roomId, userId }) {
  const db = getDatabase();
  const result = await db.query(
    `INSERT INTO reservations (date, start_time, end_time, room_id, user_id, status)
     VALUES ($1, $2, $3, $4, $5, 'ativa')
     RETURNING id, date, start_time, end_time, room_id, user_id, status`,
    [date, startTime, endTime, roomId, userId]
  );

  return mapReservation(result.rows[0]);
}

async function cancelReservation(id) {
  const db = getDatabase();
  const result = await db.query(
    `UPDATE reservations
     SET status = 'cancelada'
     WHERE id = $1
     RETURNING id, date, start_time, end_time, room_id, user_id, status`,
    [id]
  );

  return result.rows[0] ? mapReservation(result.rows[0]) : null;
}

async function updateReservationById(id, { date, startTime, endTime, roomId, userId, status }) {
  const db = getDatabase();
  const result = await db.query(
    `UPDATE reservations
     SET date = $2,
         start_time = $3,
         end_time = $4,
         room_id = $5,
         user_id = $6,
         status = $7
     WHERE id = $1
     RETURNING id, date, start_time, end_time, room_id, user_id, status`,
    [id, date, startTime, endTime, roomId, userId, status]
  );

  return result.rows[0] ? mapReservation(result.rows[0]) : null;
}

module.exports = {
  listReservations,
  findReservationById,
  findConflict,
  findUserConflict,
  createReservation,
  cancelReservation,
  updateReservationById
};
