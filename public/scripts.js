const themeToggle = document.querySelector('[data-theme-toggle]');
const mobileMenuButton = document.querySelector('[data-mobile-menu-button]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
const mobileMenuBackdrop = document.querySelector('[data-mobile-menu-backdrop]');
const mobileMenuClose = document.querySelector('[data-mobile-menu-close]');
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
  const isOpen = !mobileMenu.classList.contains('open');
  mobileMenu.classList.toggle('open', isOpen);
  mobileMenuBackdrop?.classList.toggle('open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
  mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('open');
  mobileMenuBackdrop?.classList.remove('open');
  document.body.classList.remove('menu-open');
  mobileMenu.setAttribute('aria-hidden', 'true');
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
  mobileMenuClose?.addEventListener('click', closeMobileMenu);
  mobileMenuBackdrop?.addEventListener('click', closeMobileMenu);
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('click', (event) => {
    if (mobileMenu && mobileMenuButton && !mobileMenu.contains(event.target) && !mobileMenuButton.contains(event.target) && !mobileMenuBackdrop?.contains(event.target)) {
      closeMobileMenu();
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });

  const loopText = document.getElementById('loop-text');
  if (loopText) {
    const labels = ['Premium Stays', 'Luxury Villas', 'Best Getaways', 'Cozy Homes'];
    let labelIndex = 0;
    window.setInterval(() => {
      labelIndex = (labelIndex + 1) % labels.length;
      loopText.style.opacity = '0';
      window.setTimeout(() => { loopText.textContent = labels[labelIndex]; loopText.style.opacity = '1'; }, 220);
    }, 2500);
  }
  parseToastQuery();
});
