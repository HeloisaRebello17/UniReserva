/**
 * Admin Login Script - Redirecionamento para Admin Dashboard
 */

(function() {
  const originalLoginForm = document.getElementById('login-form');
  
  if (originalLoginForm) {
    originalLoginForm.onsubmit = null;

    originalLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

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
      const loginStatus = document.getElementById('login-status');
      let state = { token: null, user: null };

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

      const formData = new FormData(originalLoginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      // Validação básica
      if (!email || !password) {
        setStatus(loginStatus, 'Por favor, preencha email e senha.', 'error');
        return;
      }

      try {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            email,
            password
          })
        });

        state.token = data.token;
        state.user = data.user;

        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({
            token: state.token,
            user: state.user
          })
        );

        setStatus(loginStatus, `Login realizado como ${data.user.name}. Redirecionando...`, 'success');
        
        setTimeout(() => {
          window.location.href = 'admin-dashboard.html';
        }, 1500);
      } catch (error) {
        const errorMessage = error.message || 'Erro desconhecido';
        
        // Mensagens de erro mais úteis
        if (errorMessage.includes('Credenciais inválidas')) {
          setStatus(
            loginStatus, 
            'Email ou senha incorretos. Verifique seus dados e tente novamente.',
            'error'
          );
        } else if (errorMessage.includes('Falha de conexão')) {
          setStatus(
            loginStatus,
            'Não foi possível conectar ao servidor. Verifique sua conexão.',
            'error'
          );
        } else {
          setStatus(loginStatus, errorMessage, 'error');
        }
      }
    });
  }
})();
