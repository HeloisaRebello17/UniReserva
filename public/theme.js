const THEME_KEY = 'unireserva-theme';

function applyTheme(theme) {
  const resolvedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', resolvedTheme);

  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = resolvedTheme === 'dark' ? '☀️' : '🌙';
  }

  const toggleButton = document.getElementById('theme-toggle');
  if (toggleButton) {
    toggleButton.setAttribute('aria-label', resolvedTheme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
  }
}

function restoreTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') {
    applyTheme(saved);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

function bindThemeToggle() {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) {
    return;
  }

  toggleButton.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

restoreTheme();
bindThemeToggle();
