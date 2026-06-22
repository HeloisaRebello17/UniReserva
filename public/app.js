const loginForm = document.getElementById('login-form');
const reservationForm = document.getElementById('reservation-form');
const loadRoomsButton = document.getElementById('load-rooms');
const loadReservationsButton = document.getElementById('load-reservations');
const roomList = document.getElementById('room-list');
const reservationList = document.getElementById('reservation-list');
const loginStatus = document.getElementById('login-status');
const sessionStatus = document.getElementById('session-status');
const reservationStatus = document.getElementById('reservation-status');
const logoutButton = document.getElementById('logout-button');

const protectedButtons = [loadRoomsButton, loadReservationsButton, logoutButton];

const SESSION_STORAGE_KEY = 'unireserva-auth';

const API_BASE_CANDIDATES = (() => {
  if (['3000', '3001'].includes(window.location.port)) return [''];

  const host = window.location.hostname || 'localhost';

  if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
    return [''];
  }

  return [
    `http://${host}:3001`,
    `http://${host}:3000`,
    'http://localhost:3001',
    'http://localhost:3000'
  ];
})();

const state = {
  token: null,
  user: null
};

const today = new Date().toISOString().split('T')[0];
document.getElementById('date').value = today;

function saveSession() {
  if (!state.token || !state.user) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      token: state.token,
      user: state.user
    })
  );
}

function setAuthenticatedUI(isAuthenticated) {
  protectedButtons.forEach((button) => {
    button.disabled = !isAuthenticated && button !== logoutButton;
  });

  reservationForm.querySelector('button[type="submit"]').disabled = !isAuthenticated;

  if (isAuthenticated && state.user) {
    setStatus(sessionStatus, `Sessão ativa: ${state.user.name}.`, 'success');
    logoutButton.style.display = 'block';
  } else {
    setStatus(sessionStatus, 'Faça login para carregar salas e criar reservas.', '');
    logoutButton.style.display = 'none';
  }
}

function restoreSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) {
    return;
  }

  try {
    const parsedSession = JSON.parse(storedSession);
    state.token = parsedSession.token || null;
    state.user = parsedSession.user || null;

    if (state.token && state.user) {
      setStatus(loginStatus, `Login restaurado para ${state.user.name}.`, 'success');
    }
  } catch (error) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

function clearSession(message) {
  state.token = null;
  state.user = null;
  saveSession();
  roomList.innerHTML = '';
  reservationList.innerHTML = '';
  if (message) {
    setStatus(loginStatus, message, 'error');
  }
  setAuthenticatedUI(false);
}

function setStatus(element, message, type) {
  element.textContent = message;
  element.className = `status ${type || ''}`.trim();
}

async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  let networkError = null;

  for (const baseUrl of API_BASE_CANDIDATES) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers
      });

      const rawBody = await response.text();
      let data = {};

      if (rawBody) {
        try {
          data = JSON.parse(rawBody);
        } catch (error) {
          data = { message: rawBody };
        }
      }

      if (!response.ok) {
        if (response.status === 401 && path !== '/api/auth/login') {
          clearSession('Sua sessão expirou ou o token é inválido. Faça login novamente.');
        }
        throw new Error(data.message || `Falha na requisição (${response.status}).`);
      }

      return data;
    } catch (error) {
      const isNetworkFailure = error instanceof TypeError;
      if (!isNetworkFailure) {
        throw error;
      }
      networkError = error;
    }
  }

  throw new Error(networkError ? `Falha de conexão com a API: ${networkError.message}` : 'Falha de conexão com a API.');
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(loginForm);
  try {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: formData.get('email'),
        password: formData.get('password')
      })
    });

    state.token = data.token;
    state.user = data.user;
    saveSession();
    setAuthenticatedUI(true);
    setStatus(loginStatus, `Login realizado como ${data.user.name}.`, 'success');
  } catch (error) {
    setStatus(loginStatus, error.message, 'error');
  }
});

loadRoomsButton.addEventListener('click', async () => {
  try {
    const rooms = await apiRequest('/api/rooms');
    roomList.innerHTML = rooms
      .map((room) => `<li><strong>${room.name}</strong> - ${room.type} - capacidade ${room.capacity}</li>`)
      .join('');
  } catch (error) {
    setStatus(loginStatus, error.message, 'error');
  }
});

reservationForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = new FormData(reservationForm);

  try {
    const reservation = await apiRequest('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({
        roomId: Number(formData.get('roomId')),
        date: formData.get('date'),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime')
      })
    });

    setStatus(reservationStatus, `Reserva #${reservation.id} criada com sucesso.`, 'success');
  } catch (error) {
    setStatus(reservationStatus, error.message, 'error');
  }
});

loadReservationsButton.addEventListener('click', async () => {
  try {
    const reservations = await apiRequest('/api/reservations');
    reservationList.innerHTML = reservations
      .map((reservation) => `<li>Reserva #${reservation.id} - sala ${reservation.roomId} - ${reservation.date} ${reservation.startTime} às ${reservation.endTime} - ${reservation.status}</li>`)
      .join('');
  } catch (error) {
    setStatus(reservationStatus, error.message, 'error');
  }
});

logoutButton.addEventListener('click', () => {
  clearSession();
  setStatus(loginStatus, 'Sessão encerrada.', 'success');
});

restoreSession();
setAuthenticatedUI(Boolean(state.token && state.user));
