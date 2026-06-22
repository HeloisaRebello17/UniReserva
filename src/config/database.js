const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const store = require('../data/store');

let externalAdapter = null;
let pool = null;
let mockStateLoaded = false;
const MOCK_STATE_PATH = path.join(__dirname, '..', 'data', 'store-state.json');

function loadMockState() {
  if (mockStateLoaded) {
    return;
  }

  mockStateLoaded = true;

  if (!fs.existsSync(MOCK_STATE_PATH)) {
    return;
  }

  try {
    const rawState = fs.readFileSync(MOCK_STATE_PATH, 'utf8');
    if (!rawState.trim()) {
      return;
    }

    const parsedState = JSON.parse(rawState);
    if (Array.isArray(parsedState.users)) {
      store.users = parsedState.users;
    }
    if (Array.isArray(parsedState.rooms)) {
      store.rooms = parsedState.rooms;
    }
    if (Array.isArray(parsedState.reservations)) {
      store.reservations = parsedState.reservations;
    }
  } catch (error) {
    console.warn('Falha ao carregar o estado persistido do mock:', error.message);
  }
}

function persistMockState() {
  const payload = JSON.stringify(
    {
      users: store.users,
      rooms: store.rooms,
      reservations: store.reservations
    },
    null,
    2
  );

  fs.writeFileSync(MOCK_STATE_PATH, payload, 'utf8');
}

// Mock database adapter para desenvolvimento sem PostgreSQL
class MockDatabase {
  async query(sql, params = []) {
    loadMockState();
    const sqlLower = sql.toLowerCase();
    console.log('SQL:', sqlLower.trim().slice(0, 120));
    
    // Ignorar CREATE TABLE e comentários
    if (sqlLower.includes('create table') || sqlLower.startsWith('--')) {
      return { rows: [] };
    }

    // SELECT users WHERE email
    if (sqlLower.includes('select') && sqlLower.includes('from users') && sqlLower.includes('where email')) {
      const email = params[0];
      const user = store.users.find(u => u.email === email);
      return { rows: user ? [user] : [] };
    }

    // INSERT INTO users
    if (sqlLower.includes('insert into users')) {
      const newUser = {
        id: Math.max(...store.users.map(u => u.id), 0) + 1,
        name: params[0],
        email: params[1],
        password: params[2],
        type: params[3] || 'common'
      };
      store.users.push(newUser);
      persistMockState();
      return { rows: [newUser] };
    }

    // SELECT users list
    if (sqlLower.includes('select') && sqlLower.includes('from users') && !sqlLower.includes('where email')) {
      const users = store.users.map(({ password, ...user }) => user);
      return { rows: users };
    }

    // SELECT FROM rooms
    if (sqlLower.includes('select') && sqlLower.includes('from rooms') && !sqlLower.includes('where')) {
      return { rows: store.rooms };
    }

    // SELECT FROM rooms WHERE id
    if (sqlLower.includes('select') && sqlLower.includes('from rooms') && sqlLower.includes('where id')) {
      const id = params[0];
      const room = store.rooms.find(r => r.id === id);
      return { rows: room ? [room] : [] };
    }

    // INSERT INTO rooms
    if (sqlLower.includes('insert into rooms')) {
      const newRoom = {
        id: Math.max(...store.rooms.map(r => r.id), 0) + 1,
        name: params[0],
        capacity: params[1],
        type: params[2]
      };
      store.rooms.push(newRoom);
      persistMockState();
      return { rows: [newRoom] };
    }

    // UPDATE rooms WHERE id
    if (sqlLower.includes('update rooms') && sqlLower.includes('where id')) {
      const id = Number(params[0]);
      const room = store.rooms.find(r => Number(r.id) === id);
      if (!room) {
        return { rows: [] };
      }

      room.name = params[1];
      room.capacity = params[2];
      room.type = params[3];
      persistMockState();
      return { rows: [room] };
    }

    // DELETE FROM rooms WHERE id
    if (sqlLower.includes('delete from rooms') && sqlLower.includes('where id')) {
      const id = Number(params[0]);
      const roomIndex = store.rooms.findIndex(r => Number(r.id) === id);
      if (roomIndex === -1) {
        return { rows: [] };
      }

      const [deletedRoom] = store.rooms.splice(roomIndex, 1);
      // Simula ON DELETE CASCADE do PostgreSQL para reservas vinculadas.
      store.reservations = store.reservations.filter(r => Number(r.room_id) !== id);
      persistMockState();
      return { rows: [deletedRoom] };
    }

    // SELECT FROM reservations - encontrar conflitos
    if (
      sqlLower.includes('from reservations') &&
      sqlLower.includes('where room_id') &&
      sqlLower.includes('status <>') &&
      sqlLower.includes('limit 1')
    ) {
      const roomId = params[0];
      const date = params[1];
      const startTime = params[2];
      const endTime = params[3];
      
      const conflict = store.reservations.find(r => 
        r.room_id === roomId && 
        r.date === date && 
        r.status !== 'cancelada' &&
        r.start_time < endTime &&
        r.end_time > startTime
      );
      
      return { rows: conflict ? [{ id: conflict.id }] : [] };
    }

    // SELECT FROM reservations - conflito por usuário
    if (
      sqlLower.includes('from reservations') &&
      sqlLower.includes('where user_id') &&
      sqlLower.includes('status <>') &&
      sqlLower.includes('limit 1')
    ) {
      const userId = Number(params[0]);
      const date = params[1];
      const startTime = params[2];
      const endTime = params[3];

      const conflict = store.reservations.find(r =>
        Number(r.user_id) === userId &&
        r.date === date &&
        r.status !== 'cancelada' &&
        r.start_time < endTime &&
        r.end_time > startTime
      );

      return { rows: conflict ? [{ id: conflict.id }] : [] };
    }

    // INSERT INTO reservations
    if (sqlLower.includes('insert into reservations')) {
      const newReservation = {
        id: Math.max(...store.reservations.map(r => r.id || 0), 0) + 1,
        date: params[0],
        start_time: params[1],
        end_time: params[2],
        room_id: params[3],
        user_id: params[4],
        status: 'ativa'
      };
      store.reservations.push(newReservation);
      persistMockState();
      return { rows: [newReservation] };
    }

    // UPDATE reservations
    if (sqlLower.includes('update reservations') && sqlLower.includes('set date')) {
      const resId = Number(params[0]);
      const reservation = store.reservations.find(r => Number(r.id) === resId);
      if (!reservation) {
        return { rows: [] };
      }

      reservation.date = params[1];
      reservation.start_time = params[2];
      reservation.end_time = params[3];
      reservation.room_id = params[4];
      reservation.user_id = params[5];
      reservation.status = params[6];
      persistMockState();
      return { rows: [reservation] };
    }

    // SELECT FROM reservations WHERE user_id
    if (sqlLower.includes('select') && sqlLower.includes('from reservations') && sqlLower.includes('where user_id')) {
      const userId = params[0];
      const userRes = store.reservations.filter(r => r.user_id === userId);
      return { rows: userRes };
    }

    // UPDATE reservations - cancelar
    if (sqlLower.includes('update reservations') && sqlLower.includes("set status = 'cancelada'")) {
      const resId = params[0];
      const reservation = store.reservations.find(r => r.id === resId);
      if (reservation) {
        reservation.status = 'cancelada';
        persistMockState();
        return { rows: [reservation] };
      }
      return { rows: [] };
    }

    // SELECT FROM reservations WHERE id = $1 LIMIT 1
    if (
      sqlLower.includes('from reservations') &&
      sqlLower.includes('where id = $1') &&
      sqlLower.includes('limit 1')
    ) {
      const id = Number(params[0]);
      const reservation = store.reservations.find(r => Number(r.id) === id);
      console.log('FIND BY ID:', id, reservation);
      return { rows: reservation ? [reservation] : [] };
    }

    // SELECT FROM reservations (genérico)
    if (sqlLower.includes('select') && sqlLower.includes('from reservations')) {
      return { rows: store.reservations };
    }

    return { rows: [] };
  }

  async end() {
    return Promise.resolve();
  }
}

function buildPool() {
  // Em desenvolvimento, usa banco em memória
  if (process.env.NODE_ENV !== 'production') {
    return new MockDatabase();
  }

  return new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unireserva'
  });
}

function getDatabase() {
  if (externalAdapter) {
    return externalAdapter;
  }

  if (!pool) {
    pool = buildPool();
  }

  return pool;
}

function setDatabaseAdapter(adapter) {
  externalAdapter = adapter;
}

async function closeDatabase() {
  if (externalAdapter && typeof externalAdapter.end === 'function') {
    await externalAdapter.end();
    externalAdapter = null;
    return;
  }

  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  getDatabase,
  setDatabaseAdapter,
  closeDatabase
};
