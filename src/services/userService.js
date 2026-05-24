const userRepository = require('../repositories/userRepository');

async function listUsers() {
  return userRepository.listUsers();
}

async function createUser({ name, email, password, type }) {
  if (!name || !email || !password) {
    throw new Error('Nome, e-mail e senha são obrigatórios.');
  }

  const userExists = await userRepository.findByEmail(email);
  if (userExists) {
    throw new Error('Já existe um usuário com este e-mail.');
  }

  return userRepository.createUser({
    name,
    email,
    password,
    type: type || 'teacher'
  });
}

module.exports = {
  listUsers,
  createUser
};