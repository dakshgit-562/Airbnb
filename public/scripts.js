const themeToggle = document.querySelector('[data-theme-toggle]');
const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const htmlRoot = document.documentElement;

function setTheme(theme) {
  htmlRoot.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('preferredTheme', theme);
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem('preferredTheme');
  if (savedTheme) {
    setTheme(savedTheme);
    return;
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

function toggleTheme() {
  const isDark = htmlRoot.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
}

function toggleMobileMenu() {
  if (!mobileMenu || !mobileMenuButton) return;
  mobileMenu.classList.toggle('open');
  mobileMenuButton.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  if (mobileMenuButton) mobileMenuButton.setAttribute('aria-expanded', 'false');
}

function showToast(type, title, description) {
  const root = document.querySelector('.toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<strong>${title}</strong><p>${description}</p>`;
  root.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}

function parseToastQuery() {
  const params = new URLSearchParams(window.location.search);
  const toastType = params.get('toast');
  if (!toastType) return;

  const messages = {
    added: ['Added to favourites', 'Your home has been added to favourites.'],
    removed: ['Removed from favourites', 'The home has been removed from your favourites.'],
    hostAdded: ['Property created', 'Your listing is live and ready to book.'],
    hostUpdated: ['Property updated', 'Your home details were saved successfully.'],
    hostDeleted: ['Property removed', 'The home was deleted from your host dashboard.'],
    loginSuccess: ['Welcome back!', 'You are now signed in.'],
    bookingSuccess: ['Booking confirmed', 'Your reservation has been created successfully.'],
    bookingCancelled: ['Booking cancelled', 'The reservation has been cancelled.'],
    bookingConflict: ['Booking conflict', 'The selected dates are unavailable.'],
    checkinPast: ['Invalid date', 'Check-in cannot be in the past.'],
    checkoutAfterCheckin: ['Invalid date', 'Check-out must be after check-in.'],
    invalidBooking: ['Invalid booking', 'Please select valid check-in and check-out dates.']
  };

  const message = messages[toastType];
  if (message) {
    showToast('success', message[0], message[1]);
  }

  params.delete('toast');
  const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
  window.history.replaceState(null, '', newUrl);
}

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
  document.addEventListener('click', (event) => {
    if (mobileMenu && mobileMenuButton && !mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target)) {
      closeMobileMenu();
    }
  });
  parseToastQuery();
});
