const SESSION_STORAGE_KEY = 'unireserva-auth';

const state = {
  token: null,
  user: null,
  rooms: [],
  users: [],
  reservations: [],
  currentWeekOffset: 0
};

const API_BASE_CANDIDATES = (() => {
  if (['3000', '3001'].includes(window.location.port)) {
    return [''];
  }

  const host = window.location.hostname || 'localhost';
  return [
    `http://${host}:3001`,
    `http://${host}:3000`,
    'http://localhost:3001',
    'http://localhost:3000'
  ];
})();

const elements = {
  status: document.getElementById('admin-status'),
  pageTitle: document.getElementById('page-title'),
  pageSubtitle: document.getElementById('page-subtitle'),
  currentDate: document.getElementById('current-date'),
  dashboardRooms: document.getElementById('salas-list'),
  recentActivity: document.getElementById('recent-activity'),
  roomsManagement: document.getElementById('salas-management-list'),
  usersTable: document.getElementById('usuarios-list'),
  agendaCalendar: document.getElementById('agenda-calendar'),
  weekRange: document.getElementById('week-range'),
  totalRooms: document.getElementById('total-rooms'),
  currentOccupancy: document.getElementById('current-occupancy'),
  todayReservations: document.getElementById('today-reservations'),
  activeUsers: document.getElementById('active-users'),
  logoutButton: document.getElementById('logout-btn'),
  addRoomButton: document.getElementById('btn-nova-sala'),
  addUserButton: document.getElementById('btn-novo-usuario'),
  addReservationButton: document.getElementById('btn-nova-reserva'),
  prevWeekButton: document.getElementById('btn-prev-week'),
  nextWeekButton: document.getElementById('btn-next-week'),
  modal: document.getElementById('admin-modal'),
  modalTitle: document.getElementById('admin-modal-title'),
  modalForm: document.getElementById('admin-modal-form'),
  modalFields: document.getElementById('admin-modal-fields'),
  modalSubmit: document.getElementById('admin-modal-submit'),
  modalClose: document.getElementById('admin-modal-close'),
  modalCancel: document.getElementById('admin-modal-cancel')
};

let modalSubmitHandler = null;

function setStatus(message, type = '') {
  if (!elements.status) {
    return;
  }

  elements.status.textContent = message || '';
  elements.status.className = `status admin-status ${type}`.trim();
}

function getStoredSession() {
  const storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch (error) {
    return null;
  }
}

function restoreSession() {
  const session = getStoredSession();
  if (!session || !session.token || !session.user) {
    window.location.href = 'admin-login.html';
    return false;
  }

  state.token = session.token;
  state.user = session.user;

  if (state.user.type !== 'admin') {
    window.location.href = 'admin-login.html';
    return false;
  }

  return true;
}

function logout() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  window.location.href = 'admin-login.html';
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
        if (response.status === 401) {
          logout();
          throw new Error('Sessão expirada.');
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

function formatDateForInput(date) {
  return date.toISOString().slice(0, 10);
}

function toLocalDate(dateValue) {
  return new Date(`${dateValue}T12:00:00`);
}

function formatDateLabel(dateValue, options = {}) {
  return toLocalDate(dateValue).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: options.year === false ? undefined : 'numeric'
  });
}

function formatWeekRange(startDate, endDate) {
  const start = formatDateLabel(startDate, { year: true });
  const end = formatDateLabel(endDate, { year: true });
  return `${start} - ${end}`;
}

function getWeekDays(offset = 0) {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const monday = new Date(today);
  monday.setHours(12, 0, 0, 0);
  monday.setDate(today.getDate() + mondayOffset + (offset * 7));

  const days = [];
  for (let index = 0; index < 7; index += 1) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + index);
    days.push(current);
  }

  return days;
}

function getRoomName(roomId) {
  const room = state.rooms.find((item) => Number(item.id) === Number(roomId));
  return room ? room.name : `Sala ${roomId}`;
}

function getUserName(userId) {
  const user = state.users.find((item) => Number(item.id) === Number(userId));
  return user ? user.name : `Usuário ${userId}`;
}

function isSameDay(dateValue, date) {
  return formatDateForInput(date) === dateValue;
}

function getWeeklyReservations() {
  const weekDays = getWeekDays(state.currentWeekOffset);
  const startDate = formatDateForInput(weekDays[0]);
  const endDate = formatDateForInput(weekDays[weekDays.length - 1]);

  return state.reservations.filter((reservation) => {
    return reservation.status !== 'cancelada' && reservation.date >= startDate && reservation.date <= endDate;
  });
}

async function loadData() {
  const [rooms, users, reservations] = await Promise.all([
    apiRequest('/api/rooms'),
    apiRequest('/api/users'),
    apiRequest('/api/reservations')
  ]);

  state.rooms = rooms;
  state.users = users;
  state.reservations = reservations;
}

function renderMetrics() {
  const todayKey = formatDateForInput(new Date());
  const todayReservations = state.reservations.filter((reservation) => reservation.date === todayKey && reservation.status === 'ativa');
  const occupiedRooms = new Set(todayReservations.map((reservation) => Number(reservation.roomId))).size;
  const occupancy = state.rooms.length ? Math.round((occupiedRooms / state.rooms.length) * 100) : 0;

  elements.totalRooms.textContent = String(state.rooms.length);
  elements.currentOccupancy.textContent = `${occupancy}%`;
  elements.todayReservations.textContent = String(todayReservations.length);
  elements.activeUsers.textContent = String(state.users.length);
}

function renderDashboardRooms() {
  if (!state.rooms.length) {
    elements.dashboardRooms.innerHTML = '<p class="status">Nenhuma sala cadastrada.</p>';
    return;
  }

  elements.dashboardRooms.innerHTML = state.rooms
    .map((room) => {
      const activeReservation = state.reservations.find((reservation) => {
        return Number(reservation.roomId) === Number(room.id) && reservation.status === 'ativa';
      });

      return `
        <div class="sala-item">
          <div class="sala-item-info">
            <div class="sala-item-icon">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-building2 lucide-building-2 w-5 h-5" data-fg-easa13="1.45:1.11497:/src/app/components/AdminDashboard.tsx:119:17:3879:28:e:Icon" data-fgid-easa13=":r25:"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
             </div>
            <div class="sala-item-details">
              <h4>${room.name}</h4>
              <p> <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-5 h-5" data-fg-easa13="1.45:1.11497:/src/app/components/AdminDashboard.tsx:119:17:3879:28:e:Icon" data-fgid-easa13=":r28:"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg> ${room.capacity} pessoas</p>
              <p>${room.type}</p>
            </div>
          </div>
          <div class="sala-item-status">
            <div class="status-badge ${activeReservation ? 'ocupada' : ''}"></div>
            <span>${activeReservation ? 'Ocupada' : 'Disponível'}</span>
          </div>
        </div>
      `;
    })
    .join('');
}

function renderActivity() {
  const recentReservations = [...state.reservations]
    .sort((left, right) => {
      const leftDate = `${left.date}T${left.startTime}`;
      const rightDate = `${right.date}T${right.startTime}`;
      return rightDate.localeCompare(leftDate);
    })
    .slice(0, 5);

  if (!recentReservations.length) {
    elements.recentActivity.innerHTML = '<p class="status">Nenhuma atividade registrada.</p>';
    return;
  }

  elements.recentActivity.innerHTML = recentReservations
    .map((reservation) => `
      <div class="activity-item">
        <div class="activity-icon">
         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users w-5 h-5" data-fg-easa13="1.45:1.11497:/src/app/components/AdminDashboard.tsx:119:17:3879:28:e:Icon" data-fgid-easa13=":r28:"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
         </div>
        <div class="activity-content">
          <p><strong>${getUserName(reservation.userId)}</strong></p>
          <p>Reservou ${getRoomName(reservation.roomId)}</p>
          <div class="activity-time">${formatDateLabel(reservation.date)} ${reservation.startTime}</div>
        </div>
      </div>
    `)
    .join('');
}

function renderRoomsManagement() {
  if (!state.rooms.length) {
    elements.roomsManagement.innerHTML = '<p class="status">Nenhuma sala cadastrada.</p>';
    return;
  }

  elements.roomsManagement.innerHTML = state.rooms
    .map(
      (room) => `
        <div class="sala-card">
          <div class="sala-card-header">
            <h4>${room.name}</h4>
            <span class="sala-card-status">#${room.id}</span>
          </div>
          <div class="sala-card-info">
            <span>👥 ${room.capacity} pessoas</span>
          </div>
          <div class="sala-card-info">
            <span>Tipo: ${room.type}</span>
          </div>
          <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
            <button class="btn-primary" type="button" data-room-edit-id="${room.id}" style="flex: 1;">Editar</button>
            <button class="btn-primary" type="button" data-room-delete-id="${room.id}" style="flex: 1; background: var(--error);">Remover</button>
          </div>
        </div>
      `
    )
    .join('');
}

function renderUsersTable() {
  if (!state.users.length) {
    elements.usersTable.innerHTML = '<p class="status">Nenhum usuário cadastrado.</p>';
    return;
  }

  elements.usersTable.innerHTML = `
    <div class="table-header">
      <div>Nome</div>
      <div>Email</div>
      <div>Tipo</div>
      <div>ID</div>
    </div>
    ${state.users
      .map(
        (user) => `
          <div class="table-row">
            <div>${user.name}</div>
            <div>${user.email}</div>
            <div>${user.type}</div>
            <div>#${user.id}</div>
          </div>
        `
      )
      .join('')}
  `;
}

function renderReservationsList() {
  const list = document.getElementById('reservation-list');
  const title = document.getElementById('reservation-section-title');

  if (title) {
    title.textContent = 'Reservas Recentes';
  }

  if (!list) {
    return;
  }

  const reservations = [...state.reservations].sort((left, right) => {
    const leftDate = `${left.date}T${left.startTime}`;
    const rightDate = `${right.date}T${right.startTime}`;
    return rightDate.localeCompare(leftDate);
  });

  if (!reservations.length) {
    list.innerHTML = '<li>Nenhuma reserva cadastrada.</li>';
    return;
  }

  list.innerHTML = reservations
    .map((reservation) => {
      const statusLabel = reservation.status === 'ativa' ? 'ativa' : reservation.status;
      return `
        <li>
          <strong>Reserva #${reservation.id}</strong> - ${getRoomName(reservation.roomId)} - ${getUserName(reservation.userId)} -
          ${formatDateLabel(reservation.date)} de ${reservation.startTime} às ${reservation.endTime} -
          <span style="color: ${reservation.status === 'ativa' ? 'green' : 'red'};">${statusLabel}</span>
          <button type="button" class="small-button" data-reservation-edit-id="${reservation.id}">Editar</button>
          <button type="button" class="small-button" data-reservation-cancel-id="${reservation.id}">Cancelar</button>
        </li>
      `;
    })
    .join('');
}

function renderAgenda() {
  const weekDays = getWeekDays(state.currentWeekOffset);
  const weekReservations = getWeeklyReservations();

  if (elements.weekRange) {
    elements.weekRange.textContent = formatWeekRange(formatDateForInput(weekDays[0]), formatDateForInput(weekDays[weekDays.length - 1]));
  }

  const headers = ['Horário', ...weekDays.map((date) => `${date.toLocaleDateString('pt-BR', { weekday: 'long' }).replace(/^./, (char) => char.toUpperCase())}<br>${formatDateLabel(formatDateForInput(date), { year: false })}`)];
  const hours = Array.from({ length: 10 }, (_, index) => 7 + index);

  const dayMap = new Map(weekDays.map((date) => [formatDateForInput(date), []]));
  weekReservations.forEach((reservation) => {
    if (!dayMap.has(reservation.date)) {
      return;
    }

    dayMap.get(reservation.date).push(reservation);
  });

  elements.agendaCalendar.innerHTML = `
    <div class="calendar-grid">
      ${headers.map((header, index) => `
        <div class="${index === 0 ? 'calendar-time' : 'calendar-header-cell'}">${header}</div>
      `).join('')}
      ${hours.map((hour) => {
        const hourLabel = `${String(hour).padStart(2, '0')}:00`;
        const cells = weekDays.map((date) => {
          const dayReservations = (dayMap.get(formatDateForInput(date)) || []).filter((reservation) => reservation.startTime.startsWith(hourLabel.slice(0, 2)));
          return `
            <div class="calendar-day">
              ${dayReservations.map((reservation) => `
                <div class="calendar-event" data-reservation-id="${reservation.id}">
                  <div class="calendar-event-title">${getRoomName(reservation.roomId)}</div>
                  <div>${getUserName(reservation.userId)}</div>
                  <div class="calendar-event-time">${reservation.startTime} - ${reservation.endTime}</div>
                  <div style="display: flex; gap: 0.35rem; margin-top: 0.4rem; flex-wrap: wrap;">
                    <button type="button" class="small-button" data-reservation-edit-id="${reservation.id}">Editar</button>
                    <button type="button" class="small-button" data-reservation-cancel-id="${reservation.id}">Cancelar</button>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        });

        return `
          <div class="calendar-time">${hourLabel}</div>
          ${cells.join('')}
        `;
      }).join('')}
    </div>
  `;
}

function renderAll() {
  renderMetrics();
  renderDashboardRooms();
  renderActivity();
  renderRoomsManagement();
  renderUsersTable();
  renderReservationsList();
  renderAgenda();
}

async function refreshAll(message) {
  try {
    await loadData();
    // Se a semana atual não tem reservas visíveis, garantir que mostramos a semana corrente
    const weekly = getWeeklyReservations();
    if ((!weekly || weekly.length === 0) && state.reservations && state.reservations.length > 0) {
      state.currentWeekOffset = 0;
    }

    renderAll();
    if (message) {
      setStatus(message, 'success');
    }
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

function closeModal() {
  if (!elements.modal) {
    return;
  }

  elements.modal.classList.add('hidden');
  elements.modal.setAttribute('aria-hidden', 'true');
  modalSubmitHandler = null;
  if (elements.modalForm) {
    elements.modalForm.reset();
  }
}

function buildField(field, values = {}) {
  const value = values[field.name] ?? field.value ?? '';
  const required = field.required === false ? '' : 'required';

  if (field.type === 'select') {
    return `
      <div class="admin-modal-field">
        <label for="${field.name}">${field.label}</label>
        <select id="${field.name}" name="${field.name}" ${required}>
          ${field.options.map((option) => `
            <option value="${option.value}" ${String(option.value) === String(value) ? 'selected' : ''}>${option.label}</option>
          `).join('')}
        </select>
      </div>
    `;
  }

  return `
    <div class="admin-modal-field">
      <label for="${field.name}">${field.label}</label>
      <input
        id="${field.name}"
        name="${field.name}"
        type="${field.type || 'text'}"
        value="${value}"
        placeholder="${field.placeholder || ''}"
        ${required}
      />
    </div>
  `;
}

function openModal({ title, submitLabel = 'Salvar', fields = [], values = {}, onSubmit }) {
  if (!elements.modal || !elements.modalTitle || !elements.modalFields || !elements.modalSubmit || !elements.modalForm) {
    return;
  }

  modalSubmitHandler = onSubmit;
  elements.modalTitle.textContent = title;
  elements.modalSubmit.textContent = submitLabel;
  elements.modalFields.innerHTML = fields.map((field) => buildField(field, values)).join('');
  elements.modal.classList.remove('hidden');
  elements.modal.setAttribute('aria-hidden', 'false');

  const firstInput = elements.modalFields.querySelector('input, select, textarea');
  if (firstInput) {
    firstInput.focus();
  }
}

function readModalValues() {
  const formData = new FormData(elements.modalForm);
  return Object.fromEntries(formData.entries());
}

function openRoomModal(room = null) {
  const isEdit = Boolean(room);
  openModal({
    title: isEdit ? 'Editar sala' : 'Nova sala',
    submitLabel: isEdit ? 'Salvar alterações' : 'Criar sala',
    fields: [
      { name: 'name', label: 'Nome da sala', value: room?.name || '', placeholder: 'Sala 101' },
      { name: 'capacity', label: 'Capacidade', type: 'number', value: room?.capacity || '', placeholder: '30' },
      { name: 'type', label: 'Tipo', value: room?.type || '', placeholder: 'sala comum' }
    ],
    values: room || {},
    onSubmit: async (values) => {
      await apiRequest(isEdit ? `/api/rooms/${room.id}` : '/api/rooms', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          capacity: Number(values.capacity),
          type: values.type.trim()
        })
      });

      closeModal();
      await refreshAll(isEdit ? 'Sala atualizada com sucesso.' : 'Sala criada com sucesso.');
    }
  });
}

function openUserModal() {
  openModal({
    title: 'Novo usuário',
    submitLabel: 'Criar usuário',
    fields: [
      { name: 'name', label: 'Nome', placeholder: 'Nome completo' },
      { name: 'email', label: 'Email', type: 'email', placeholder: 'usuario@unireserva.com' },
      { name: 'password', label: 'Senha', type: 'password', placeholder: 'Senha inicial' },
      {
        name: 'type',
        label: 'Tipo',
        type: 'select',
        value: 'teacher',
        options: [
          { value: 'admin', label: 'Administrador' },
          { value: 'teacher', label: 'Professor' }
        ]
      }
    ],
    values: { type: 'teacher' },
    onSubmit: async (values) => {
      await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
          type: values.type
        })
      });

      closeModal();
      await refreshAll('Usuário criado com sucesso.');
    }
  });
}

function openReservationModal(reservation = null) {
  if (!state.rooms.length || !state.users.length) {
    setStatus('É necessário ter salas e usuários cadastrados.', 'error');
    return;
  }

  const isEdit = Boolean(reservation);
  openModal({
    title: isEdit ? 'Editar reserva' : 'Nova reserva',
    submitLabel: isEdit ? 'Salvar alterações' : 'Criar reserva',
    fields: [
      {
        name: 'userId',
        label: 'Usuário',
        type: 'select',
        value: reservation?.userId || state.users[0]?.id || '',
        options: state.users.map((user) => ({ value: user.id, label: `${user.name} (#${user.id})` }))
      },
      {
        name: 'roomId',
        label: 'Sala',
        type: 'select',
        value: reservation?.roomId || state.rooms[0]?.id || '',
        options: state.rooms.map((room) => ({ value: room.id, label: `${room.name} (#${room.id})` }))
      },
      { name: 'date', label: 'Data', type: 'date', value: reservation?.date || formatDateForInput(new Date()) },
      { name: 'startTime', label: 'Início', type: 'time', value: reservation?.startTime || '08:00' },
      { name: 'endTime', label: 'Fim', type: 'time', value: reservation?.endTime || '09:00' },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        value: reservation?.status || 'ativa',
        options: [
          { value: 'ativa', label: 'Ativa' },
          { value: 'cancelada', label: 'Cancelada' }
        ]
      }
    ],
    values: {
      userId: reservation?.userId || state.users[0]?.id || '',
      roomId: reservation?.roomId || state.rooms[0]?.id || '',
      date: reservation?.date || formatDateForInput(new Date()),
      startTime: reservation?.startTime || '08:00',
      endTime: reservation?.endTime || '09:00',
      status: reservation?.status || 'ativa'
    },
    onSubmit: async (values) => {
      const payload = {
        userId: Number(values.userId),
        roomId: Number(values.roomId),
        date: values.date,
        startTime: values.startTime,
        endTime: values.endTime,
        status: values.status
      };

      await apiRequest(isEdit ? `/api/reservations/${reservation.id}` : '/api/reservations', {
        method: isEdit ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      });

      closeModal();
      await refreshAll(isEdit ? 'Reserva atualizada com sucesso.' : 'Reserva criada com sucesso.');
    }
  });
}

async function createRoom() {
  openRoomModal();
}

async function editRoom(roomId) {
  const room = state.rooms.find((item) => Number(item.id) === Number(roomId));
  if (!room) {
    setStatus('Sala não encontrada.', 'error');
    return;
  }

  openRoomModal(room);
}

async function deleteRoom(roomId) {
  if (!window.confirm('Deseja remover esta sala? As reservas vinculadas também serão afetadas.')) {
    return;
  }

  try {
    await apiRequest(`/api/rooms/${roomId}`, {
      method: 'DELETE'
    });

    await refreshAll('Sala removida com sucesso.');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

async function createUser() {
  openUserModal();
}

async function createReservation() {
  openReservationModal();
}

async function editReservation(reservationId) {
  const reservation = state.reservations.find((item) => Number(item.id) === Number(reservationId));
  if (!reservation) {
    setStatus('Reserva não encontrada.', 'error');
    return;
  }

  openReservationModal(reservation);
}

async function cancelReservation(reservationId) {
  if (!window.confirm('Deseja cancelar esta reserva?')) {
    return;
  }

  try {
    await apiRequest(`/api/reservations/${reservationId}`, {
      method: 'DELETE'
    });

    await refreshAll('Reserva cancelada com sucesso.');
  } catch (error) {
    setStatus(error.message, 'error');
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach((tab) => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.remove('active'));

  const selectedTab = document.getElementById(`${tabName}-tab`);
  const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);

  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  if (selectedButton) {
    selectedButton.classList.add('active');
  }

  const titles = {
    dashboard: { title: 'Dashboard', subtitle: 'Bem-vindo de volta, Admin' },
    salas: { title: 'Salas', subtitle: 'Gerencie as salas do sistema' },
    usuarios: { title: 'Usuários', subtitle: 'Gerencie os usuários' },
    agenda: { title: 'Agenda', subtitle: 'Visualize e edite reservas' },
    configuracoes: { title: 'Configurações', subtitle: 'Ajustes do sistema' }
  };

  const config = titles[tabName] || titles.dashboard;
  elements.pageTitle.textContent = config.title;
  elements.pageSubtitle.textContent = config.subtitle;
}

function bindEvents() {
  document.querySelectorAll('.nav-item').forEach((button) => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });

  elements.logoutButton.addEventListener('click', logout);
  elements.addRoomButton?.addEventListener('click', createRoom);
  elements.addUserButton?.addEventListener('click', createUser);
  elements.addReservationButton?.addEventListener('click', createReservation);
  elements.prevWeekButton?.addEventListener('click', async () => {
    state.currentWeekOffset -= 1;
    renderAgenda();
  });
  elements.nextWeekButton?.addEventListener('click', async () => {
    state.currentWeekOffset += 1;
    renderAgenda();
  });

  elements.modalClose?.addEventListener('click', closeModal);
  elements.modalCancel?.addEventListener('click', closeModal);
  elements.modal?.querySelector('[data-modal-close]')?.addEventListener('click', closeModal);

  elements.modalForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!modalSubmitHandler) {
      return;
    }

    const values = readModalValues();
    try {
      await modalSubmitHandler(values);
    } catch (error) {
      setStatus(error.message, 'error');
    }
  });

  elements.roomsManagement.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-room-edit-id]');
    const deleteButton = event.target.closest('[data-room-delete-id]');

    if (editButton) {
      editRoom(editButton.getAttribute('data-room-edit-id'));
      return;
    }

    if (deleteButton) {
      deleteRoom(deleteButton.getAttribute('data-room-delete-id'));
    }
  });

  // Support button in the Salas tab which uses a different id
  const addSalaTabButton = document.getElementById('btn-adicionar-sala');
  addSalaTabButton?.addEventListener('click', createRoom);

  elements.agendaCalendar.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-reservation-edit-id]');
    const cancelButton = event.target.closest('[data-reservation-cancel-id]');

    if (editButton) {
      editReservation(editButton.getAttribute('data-reservation-edit-id'));
      return;
    }

    if (cancelButton) {
      cancelReservation(cancelButton.getAttribute('data-reservation-cancel-id'));
    }
  });

  const reservationList = document.getElementById('reservation-list');
  reservationList?.addEventListener('click', (event) => {
    const editButton = event.target.closest('[data-reservation-edit-id]');
    const cancelButton = event.target.closest('[data-reservation-cancel-id]');

    if (editButton) {
      editReservation(editButton.getAttribute('data-reservation-edit-id'));
      return;
    }

    if (cancelButton) {
      cancelReservation(cancelButton.getAttribute('data-reservation-cancel-id'));
    }
  });
}

async function initialize() {
  if (!restoreSession()) {
    return;
  }

  const today = new Date();
  elements.currentDate.textContent = today.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  bindEvents();
  await refreshAll(`Bem-vindo de volta, ${state.user.name}.`);
}

initialize();
