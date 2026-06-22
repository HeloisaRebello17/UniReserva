/* ===== ESTADO ===== */
const SESSION_KEY = 'unireserva-auth';

const state = {
  token: null,
  user: null,
  allRooms: [],
  allReservations: [],
  currentWeekOffset: 0
};

function confirmar(mensagem) {
  return new Promise((resolve) => {
    const modal = document.getElementById('modal-confirmar');
    const msg   = document.getElementById('modal-confirmar-msg');
    const ok    = document.getElementById('modal-confirmar-ok');
    const cancel = document.getElementById('modal-confirmar-cancel');
    const backdrop = document.getElementById('modal-confirmar-backdrop');

    msg.textContent = mensagem;
    modal.classList.remove('hidden');

    function fechar(resultado) {
      modal.classList.add('hidden');
      ok.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      backdrop.removeEventListener('click', onCancel);
      resolve(resultado);
    }

    function onOk()     { fechar(true);  }
    function onCancel() { fechar(false); }

    ok.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    backdrop.addEventListener('click', onCancel);
  });
}

const API_BASE_CANDIDATES = (() => {
  if (['3000', '3001'].includes(window.location.port)) return [''];
  const host = window.location.hostname || 'localhost';
  return [
    `http://${host}:3001`,
    `http://${host}:3000`,
    'http://localhost:3001',
    'http://localhost:3000'
  ];
})();

/* ===== SESSION ===== */
function restoreSession() {
  const stored = localStorage.getItem(SESSION_KEY);
  if (!stored) { window.location.href = 'login.html'; return; }
  try {
    const parsed = JSON.parse(stored);
    state.token = parsed.token || null;
    state.user  = parsed.user  || null;
    if (!state.token || !state.user) { window.location.href = 'login.html'; }
  } catch { localStorage.removeItem(SESSION_KEY); window.location.href = 'login.html'; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'professor-login.html';
}

/* ===== API ===== */
async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(state.token ? { Authorization: `Bearer ${state.token}` } : {})
  };

  let lastError = null;
  for (const base of API_BASE_CANDIDATES) {
    try {
      const res  = await fetch(`${base}${path}`, { ...options, headers });
      const text = await res.text();
      let data = {};
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
      if (!res.ok) {
        if (res.status === 401) { clearSession(); throw new Error('Sessão expirada'); }
        throw new Error(data.message || `Erro ${res.status}`);
      }
      return data;
    } catch (e) {
      if (!(e instanceof TypeError)) throw e;
      lastError = e;
    }
  }
  throw new Error(lastError?.message || 'Falha de conexão');
}

/* ===== INICIALIZAÇÃO ===== */
async function init() {
  restoreSession();
  updateUserUI();
  await Promise.all([loadRooms(), loadReservations()]);
  renderSalas();
  renderAside();
  renderReservas();
  renderCalendar();
  setupNav();
  setupFilters();
  setupModal();
  setupLogout();
  setupWeekNav();
  // atalho legado
  document.getElementById('load-reservations').addEventListener('click', async () => {
    await loadReservations();
    renderReservas();
  });
}

function updateUserUI() {
  if (!state.user) return;
  const nome = state.user.name || 'Professor';
  const el = document.getElementById('user-name');
  const el2 = document.getElementById('user-hello');
  if (el)  el.textContent  = nome;
  if (el2) el2.textContent = nome;
}

async function loadRooms() {
  try { state.allRooms = await apiRequest('/api/rooms'); } catch { state.allRooms = []; }
}

async function loadReservations() {
  try {
    const all = await apiRequest('/api/reservations');
    state.allReservations = all.filter(r =>
      state.user && Number(r.userId) === Number(state.user.id)
    );
  } catch { state.allReservations = []; }
}

/* ===== MÉTRICAS ===== */
function updateMetrics() {
  const today = new Date().toISOString().split('T')[0];
  const ativas = state.allReservations.filter(r => r.status === 'ativa');
  document.getElementById('metric-ativas').textContent = ativas.length;

  const disponiveis = getAvailableCount();
  document.getElementById('metric-salas').textContent = disponiveis;

  // próxima aula de hoje em diante
  const proxima = ativas
    .filter(r => r.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];
  document.getElementById('metric-proxima').textContent = proxima ? proxima.startTime : '--:--';

  const badge = document.getElementById('badge-ativas');
  if (badge) badge.textContent = `${ativas.length} ativas`;
}

function getAvailableCount() {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().slice(0,5);
  return state.allRooms.filter(room => {
    return !state.allReservations.some(r =>
      r.roomId === room.id &&
      r.date === today &&
      r.status === 'ativa' &&
      r.startTime <= now &&
      r.endTime > now
    );
  }).length;
}

/* ===== NAVEGAÇÃO ===== */
function setupNav() {
  document.querySelectorAll('.pf-nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-nav-link').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pf-tab-content').forEach(t => t.classList.remove('active'));
      btn.classList.add('active');
      const tab = document.getElementById(`tab-${btn.dataset.tab}`);
      if (tab) tab.classList.add('active');
    });
  });
}

/* ===== FILTROS DE SALAS ===== */
let activeFilter = 'todas';
let searchQuery  = '';

function setupFilters() {
  document.querySelectorAll('.pf-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pf-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      renderSalas();
    });
  });

  document.getElementById('search-salas').addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase();
    renderSalas();
  });
}

/* ===== RENDER SALAS ===== */
function getRoomStatus(room) {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().slice(0,5);
  const ocupada = state.allReservations.some(r =>
    r.roomId === room.id &&
    r.date === today &&
    r.status === 'ativa' &&
    r.startTime <= now &&
    r.endTime > now
  );
  return ocupada ? 'ocupada' : 'disponivel';
}

function getRoomCurrentReservation(room) {
  const today = new Date().toISOString().split('T')[0];
  const now   = new Date().toTimeString().slice(0,5);
  return state.allReservations.find(r =>
    r.roomId === room.id &&
    r.date === today &&
    r.status === 'ativa' &&
    r.startTime <= now &&
    r.endTime > now
  );
}

function getFeatures(room) {
  const feats = [];
  if (room.type) feats.push(room.type);
  if (room.capacity >= 20) feats.push('Projetor');
  if (room.capacity >= 10) feats.push('Wifi');
  if (room.type && room.type.toLowerCase().includes('reuni')) feats.push('Coffee');
  return feats.slice(0,3);
}

const FEAT_ICONS = {
  Projetor: `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 2l-4 5-4-5"/></svg>`,
  Wifi:      `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1" fill="currentColor"/></svg>`,
  Coffee:    `<svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/></svg>`
};

function renderSalas() {
  updateMetrics();
  const container = document.getElementById('rooms-list');
  let rooms = [...state.allRooms];

  if (searchQuery) {
    rooms = rooms.filter(r => r.name.toLowerCase().includes(searchQuery));
  }

  if (activeFilter !== 'todas') {
    rooms = rooms.filter(r => getRoomStatus(r) === activeFilter);
  }

  if (!rooms.length) {
    container.innerHTML = '<p style="color:var(--muted);padding:1rem 0">Nenhuma sala encontrada.</p>';
    return;
  }

  container.innerHTML = rooms.map(room => {
    const status   = getRoomStatus(room);
    const dispLabel = status === 'disponivel' ? 'Disponível' : 'Ocupada';
    const features = getFeatures(room);
    const reserva  = getRoomCurrentReservation(room);

    const featHtml = features.map(f => `
      <span class="pf-sala-feat">
        ${FEAT_ICONS[f] || ''} ${f}
      </span>`).join('');

    const reservaHtml = reserva ? `
      <div class="pf-sala-reserva-info">
        <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Reserva atual
      </div>
      <div class="pf-sala-reserva-info">Professor: ${state.user?.name || 'Prof.'}</div>` : '';

    return `
      <div class="pf-sala-item">
        <div class="pf-sala-top">
          <h3 class="pf-sala-name">${room.name}</h3>
          <div class="pf-sala-status pf-sala-status--${status}">
            <span class="pf-sala-status-dot"></span>
            ${dispLabel}
          </div>
        </div>
        <div class="pf-sala-cap">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          ${room.capacity} pessoas
        </div>
        <div class="pf-sala-features">${featHtml}</div>
        ${reservaHtml}
        <button
          class="pf-btn-reservar"
          data-room-id="${room.id}"
          data-room-name="${room.name}"
          ${status === 'ocupada' ? 'disabled' : ''}
        >Reservar sala</button>
      </div>`;
  }).join('');

  container.querySelectorAll('.pf-btn-reservar:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.roomId, btn.dataset.roomName));
  });
}

/* ===== ASIDE ===== */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const dt = new Date(Number(y), Number(m)-1, Number(d));
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate()+1);
  if (dt.getTime() === today.getTime()) return 'Hoje';
  if (dt.getTime() === tomorrow.getTime()) return 'Amanhã';
  return dt.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function renderAside() {
  const container = document.getElementById('aside-reservations');
  const ativas = state.allReservations
    .filter(r => r.status === 'ativa')
    .sort((a,b) => (a.date+a.startTime).localeCompare(b.date+b.startTime))
    .slice(0, 4);

  if (!ativas.length) {
    container.innerHTML = '<p style="color:var(--muted);font-size:.875rem">Nenhuma reserva ativa.</p>';
    return;
  }

  container.innerHTML = ativas.map(r => {
    const room = state.allRooms.find(rm => rm.id === r.roomId);
    const roomName = room ? room.name : `Sala ${r.roomId}`;
    const subject  = room ? (room.type || 'Aula') : 'Aula';
    return `
      <div class="pf-aside-card">
        <span class="pf-aside-card-dot"></span>
        <div class="pf-aside-card-name">${roomName}</div>
        <div class="pf-aside-card-sub">${subject}</div>
        <div class="pf-aside-card-info">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDate(r.date)}
        </div>
        <div class="pf-aside-card-info">
          <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${r.startTime} – ${r.endTime}
        </div>
        <button class="pf-btn-detalhes">Ver Detalhes</button>
      </div>`;
  }).join('');

  container.querySelectorAll('.pf-btn-detalhes').forEach((btn, index) => {
  btn.addEventListener('click', () => {
    const ativas = state.allReservations
      .filter(r => r.status === 'ativa')
      .sort((a,b) => (a.date+a.startTime).localeCompare(b.date+b.startTime))
      .slice(0, 4);

    const reserva = ativas[index];
    if (!reserva) return;

    const room = state.allRooms.find(rm => rm.id === reserva.roomId);
    const roomName = room ? room.name : `Sala ${reserva.roomId}`;
    const subject  = room ? (room.type || 'Aula') : 'Aula';

     const body = document.getElementById('modal-detalhes-body');
      body.innerHTML = `
        <div class="pf-reserva-meta" style="font-size:.95rem">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <strong>${roomName}</strong>
        </div>
        <div class="pf-reserva-meta">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          ${subject}
        </div>
        <div class="pf-reserva-meta">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          ${formatDateFull(reserva.date)}
        </div>
        <div class="pf-reserva-meta">
          <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${reserva.startTime} – ${reserva.endTime}
        </div>
      `;
      document.getElementById('modal-detalhes').classList.remove('hidden');
  });
  });
}

/* ===== RESERVAS TAB ===== */
function renderReservas() {
  updateMetrics();
  const container = document.getElementById('reservations-list');
  const ativas = state.allReservations
    .filter(r => r.status === 'ativa')
    .sort((a,b) => (a.date+a.startTime).localeCompare(b.date+b.startTime));

  if (!ativas.length) {
    container.innerHTML = '<p style="color:var(--muted)">Nenhuma reserva ativa.</p>';
    return;
  }

  container.innerHTML = ativas.map(r => {
    const room = state.allRooms.find(rm => rm.id === r.roomId);
    const roomName = room ? room.name : `Sala ${r.roomId}`;
    const subject  = room ? (room.type || 'Aula') : 'Aula';
    const dateLabel = formatDateFull(r.date);
    return `
      <div class="pf-reserva-item">
        <div class="pf-reserva-icon">
          <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
        <div class="pf-reserva-info">
          <div class="pf-reserva-name">${roomName}</div>
          <div class="pf-reserva-sub">${subject}</div>
          <div class="pf-reserva-meta">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${dateLabel}
          </div>
          <div class="pf-reserva-meta">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${r.startTime} – ${r.endTime}
          </div>
        </div>
        <div class="pf-reserva-actions">
          <button class="pf-btn-edit" title="Editar">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="pf-btn-delete" title="Cancelar" data-cancel-id="${r.id}">
            <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('[data-cancel-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!await confirmar('Deseja cancelar esta reserva?')) return;
      try {
        await apiRequest(`/api/reservations/${btn.dataset.cancelId}`, { method: 'DELETE' });
        await loadReservations();
        renderReservas();
        renderSalas();
        renderAside();
        renderCalendar();
      } catch (e) { alert(e.message); }
    });
  });
  container.querySelectorAll('.pf-btn-edit').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.pf-reserva-item');
    const cancelBtn = item.querySelector('[data-cancel-id]');
    const reservaId = cancelBtn?.dataset.cancelId;
    const reserva = state.allReservations.find(r => String(r.id) === String(reservaId));
    if (!reserva) return;

    const room = state.allRooms.find(rm => rm.id === reserva.roomId);
    openModal(reserva.roomId, room ? room.name : `Sala ${reserva.roomId}`);

    // pré-preencher com os dados atuais
    document.getElementById('date').value = reserva.date;
    document.getElementById('startTime').value = reserva.startTime;
    document.getElementById('endTime').value = reserva.endTime;

    // ao confirmar, atualiza em vez de criar
    const form = document.getElementById('reservation-form');
    form.dataset.editId = reservaId;
  });
});
}

function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  const dt = new Date(Number(y), Number(m)-1, Number(d));
  return dt.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  }).replace(/^\w/, c => c.toUpperCase());
}

/* ===== CALENDÁRIO ===== */
const DAYS_PT = ['Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const HOURS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];

function getWeekDates(offset) {
  const now = new Date();
  const day = now.getDay(); // 0=dom, 1=seg, ..., 6=sab
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() + diffToMonday + offset * 7);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function renderCalendar() {
  const dates  = getWeekDates(state.currentWeekOffset);
  const todayStr = toDateStr(new Date());

  // Atualizar label da semana
  const fmt = (d) => d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric' });
  document.getElementById('week-range').textContent =
    `${fmt(dates[0])} – ${fmt(dates[dates.length-1])}`;

  const cal = document.getElementById('calendar');

  // Cabeçalho
  let html = `<div class="pf-cal-corner">Horário</div>`;
  dates.forEach((d, i) => {
    const dateStr = toDateStr(d);
    const isToday = dateStr === todayStr;
    const num = d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit' }).replace('/', '/');
    html += `<div class="pf-cal-day-head${isToday ? ' today' : ''}">
      <div class="pf-cal-day-name">${DAYS_PT[i]}</div>
      <div class="pf-cal-day-num">${num}</div>
    </div>`;
  });

  // Linhas de hora
  HOURS.forEach(hour => {
    html += `<div class="pf-cal-time">${hour}</div>`;
    dates.forEach(d => {
      const dateStr = toDateStr(d);
      // eventos que começam nesta hora
      const events = state.allReservations.filter(r => {
        if (r.date !== dateStr || r.status !== 'ativa') return false;
        const startH = r.startTime.slice(0,5);
        return startH === hour;
      });

      const evHtml = events.map(r => {
      const room = state.allRooms.find(rm => rm.id === r.roomId);
      const roomName = room ? room.name : `Sala ${r.roomId}`;
      const subject  = room ? (room.type || 'Aula') : 'Aula';
      return `<div class="pf-cal-event" data-reserva-id="${r.id}" style="cursor:pointer">
        <div class="pf-cal-event-room">${roomName}</div>
        <div class="pf-cal-event-sub">${subject}</div>
        <div class="pf-cal-event-time">${r.startTime} – ${r.endTime}</div>
      </div>`;
    }).join('');

      html += `<div class="pf-cal-cell">${evHtml}</div>`;
    });
  });

  cal.innerHTML = html;

  cal.querySelectorAll('.pf-cal-event[data-reserva-id]').forEach(el => {
  el.addEventListener('click', () => {
    const reservaId = el.dataset.reservaId;
    const reserva = state.allReservations.find(r => String(r.id) === String(reservaId));
    if (!reserva) return;

    const room = state.allRooms.find(rm => rm.id === reserva.roomId);
    const roomName = room ? room.name : `Sala ${reserva.roomId}`;
    const subject  = room ? (room.type || 'Aula') : 'Aula';

    const body = document.getElementById('modal-detalhes-body');
    body.innerHTML = `
      <div class="pf-reserva-meta" style="font-size:.95rem">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <strong>${roomName}</strong>
      </div>
      <div class="pf-reserva-meta">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        ${subject}
      </div>
      <div class="pf-reserva-meta">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        ${formatDateFull(reserva.date)}
      </div>
      <div class="pf-reserva-meta">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        ${reserva.startTime} – ${reserva.endTime}
      </div>
    `;
    document.getElementById('modal-detalhes').classList.remove('hidden');
  });
});
}

function setupWeekNav() {
  document.getElementById('week-prev').addEventListener('click', () => {
    state.currentWeekOffset--;
    renderCalendar();
  });
  document.getElementById('week-next').addEventListener('click', () => {
    state.currentWeekOffset++;
    renderCalendar();
  });
}

/* ===== MODAL RESERVAR ===== */
function openModal(roomId, roomName) {
  document.getElementById('roomId').value = roomId;
  document.getElementById('modal-room-label').textContent = `Sala: ${roomName}`;
  document.getElementById('date').value = new Date().toISOString().split('T')[0];
  document.getElementById('reservation-status').textContent = '';
  document.getElementById('modal-reservar').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal-reservar').classList.add('hidden');
}

function setupModal() {
  document.getElementById('modal-close').addEventListener('click', closeModal);
  document.getElementById('modal-cancel').addEventListener('click', closeModal);
  document.getElementById('modal-backdrop').addEventListener('click', closeModal);

  document.getElementById('modal-detalhes-close').addEventListener('click', () => document.getElementById('modal-detalhes').classList.add('hidden'));
  document.getElementById('modal-detalhes-backdrop').addEventListener('click', () => document.getElementById('modal-detalhes').classList.add('hidden'));

  document.getElementById('reservation-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form      = e.target;
    const roomId    = Number(form.roomId.value);
    const date      = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;
    const editId    = form.dataset.editId;
    const statusEl  = document.getElementById('reservation-status');

    if (endTime <= startTime) {
      statusEl.textContent = 'O horário de fim deve ser maior que o início.';
      statusEl.className = 'status error';
      return;
    }

    try {
      statusEl.textContent = editId ? 'Atualizando reserva...' : 'Criando reserva...';
      statusEl.className = 'status';
     if (editId) {
    const reserva = state.allReservations.find(r => String(r.id) === String(editId));
    await apiRequest(`/api/reservations/${editId}`, {
      method: 'PUT',
      body: JSON.stringify({ 
        roomId, 
        date, 
        startTime, 
        endTime,
        userId: reserva?.userId ?? state.user.id
      })
    });
    delete form.dataset.editId;
  } else {
    await apiRequest('/api/reservations', {
      method: 'POST',
      body: JSON.stringify({ 
        roomId, 
        date, 
        startTime, 
        endTime,
        userId: state.user.id
      })
    });
  }
      closeModal();
      await loadReservations();
      renderSalas();
      renderAside();
      renderReservas();
      renderCalendar();
    } catch (err) {
      statusEl.textContent = err.message;
      statusEl.className = 'status error';
    }
  });
}

/* ===== LOGOUT ===== */
function setupLogout() {
  document.getElementById('logout-button').addEventListener('click', clearSession);
}



/* ===== START ===== */
init();
