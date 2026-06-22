const loginForm = document.getElementById('login-form');
const loginStatus = document.getElementById('login-status');

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
      setStatus(loginStatus, `Login restaurado para ${state.user.name}. Redirecionando...`, 'success');
      setTimeout(() => {
        window.location.href = 'reservations.html';
      }, 1500);
    }
  } catch (error) {
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }
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
    setStatus(loginStatus, `Login realizado como ${data.user.name}. Redirecionando...`, 'success');
    
    setTimeout(() => {
      window.location.href = 'reservations.html';
    }, 1500);
  } catch (error) {
    setStatus(loginStatus, error.message, 'error');
  }
});

// Verifica se já existe uma sessão ativa
restoreSession();
