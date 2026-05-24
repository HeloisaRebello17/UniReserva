const { getDatabase } = require('../config/database');

async function findByEmail(email) {
  const db = getDatabase();
  const result = await db.query(
    'SELECT id, name, email, password, type FROM users WHERE email = $1 LIMIT 1',
    [email]
  );
  return result.rows[0] || null;
}

async function listUsers() {
  const db = getDatabase();
  const result = await db.query('SELECT id, name, email, type FROM users ORDER BY id');
  return result.rows;
}

async function createUser({ name, email, password, type }) {
  const db = getDatabase();
  const result = await db.query(
    'INSERT INTO users (name, email, password, type) VALUES ($1, $2, $3, $4) RETURNING id, name, email, type',
    [name, email, password, type]
  );

  return result.rows[0];
}

module.exports = {
  findByEmail,
  listUsers,
  createUser
};
