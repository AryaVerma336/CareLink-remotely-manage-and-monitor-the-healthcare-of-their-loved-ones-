/* ═══════════════════ APP CONTROLLER & STATE ═══════════════════ */
let currentRole = null;
let currentPage = null;

const ROLES = {
  relative: {
    name: 'Arjun Sharma', loc: '📍 Chennai', color: '#00d4b4',
    pill: { bg: 'rgba(0,212,180,0.15)', color: '#00d4b4', label: 'Patient Relative' },
    avatar: { bg: 'var(--teal-dim)', color: 'var(--teal)', text: 'AS' },
    nav: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'medical-history', icon: '📋', label: 'Medical History' },
      ]},
      { section: 'Services', items: [
        { id: 'book-appointment', icon: '📅', label: 'Book Appointment' },
        { id: 'consultation', icon: '💻', label: 'Online Consultation' },
        { id: 'pickup-drop', icon: '🚗', label: 'Pickup & Drop', badge: '1' },
      ]},
      { section: 'Medicines', items: [
        { id: 'search-medicines', icon: '🔍', label: 'Search Medicines' },
        { id: 'order-medicines', icon: '🛒', label: 'Order Medicines' },
        { id: 'track-delivery', icon: '📦', label: 'Track Delivery' },
      ]},
    ]
  },
  patient: {
    name: 'Ramesh Sharma', loc: '📍 Lucknow', color: '#4f9cf9',
    pill: { bg: 'rgba(79,156,249,0.15)', color: '#4f9cf9', label: 'Patient' },
    avatar: { bg: 'var(--blue-dim)', color: 'var(--blue)', text: 'RS' },
    nav: [
      { section: 'Overview', items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'appointments', icon: '📅', label: 'My Appointments' },
      ]},
      { section: 'Care', items: [
        { id: 'consultation', icon: '💻', label: 'Join Consultation' },
        { id: 'prescriptions', icon: '📄', label: 'My Prescriptions' },
      ]},
      { section: 'Emergency', items: [
        { id: 'emergency', icon: '🆘', label: 'Emergency Contact' },
      ]},
    ]
  },
  hospital: {
    name: 'King George Hospital', loc: '📍 Lucknow', color: '#f5a623',
    pill: { bg: 'rgba(245,166,35,0.15)', color: '#f5a623', label: 'Hospital' },
    avatar: { bg: 'var(--amber-dim)', color: 'var(--amber)', text: '🏥' },
    nav: [
      { section: 'Management', items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'doctors', icon: '👨‍⚕️', label: 'Manage Doctors' },
        { id: 'appointments', icon: '📅', label: 'Appointments', badge: '4' },
      ]},
    ]
  },
  pharmacist: {
    name: 'MedPlus Pharmacy', loc: '📍 Lucknow', color: '#2dd97a',
    pill: { bg: 'rgba(45,217,122,0.15)', color: '#2dd97a', label: 'Pharmacist' },
    avatar: { bg: 'var(--green-dim)', color: 'var(--green)', text: '💊' },
    nav: [
      { section: 'Inventory', items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'expiry', icon: '⏰', label: 'Expiry Tracker', badge: '3' },
      ]},
    ]
  },
  driver: {
    name: 'Suresh Kumar', loc: '📍 Lucknow', color: '#a78bfa',
    pill: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', label: 'Driver' },
    avatar: { bg: 'var(--purple-dim)', color: 'var(--purple)', text: 'SK' },
    nav: [
      { section: 'Trips', items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'trips', icon: '🗺️', label: 'My Trips', badge: '2' },
      ]},
    ]
  },
  admin: {
    name: 'Admin Console', loc: '📍 System', color: '#ff4f6d',
    pill: { bg: 'rgba(255,79,109,0.15)', color: '#ff4f6d', label: 'Admin' },
    avatar: { bg: 'var(--red-dim)', color: 'var(--red)', text: '⚙️' },
    nav: [
      { section: 'Platform', items: [
        { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
        { id: 'approvals', icon: '✅', label: 'Approvals', badge: '7' },
      ]},
    ]
  }
};

function loginAs(role) {
  currentRole = role;
  const r = ROLES[role];
  if (!r) return;

  const pill = document.getElementById('role-pill');
  if (pill) {
    pill.textContent = r.pill.label;
    pill.style.cssText = `background:${r.pill.bg};color:${r.pill.color};font-size:10px;font-weight:600;letter-spacing:1px;text-transform:uppercase;padding:3px 10px;border-radius:100px;border:1px solid ${r.pill.color}33;`;
  }

  const av = document.getElementById('user-avatar');
  if (av) {
    av.textContent = r.avatar.text;
    av.style.cssText = `background:${r.avatar.bg};color:${r.avatar.color};width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:600;flex-shrink:0;`;
  }

  const nameEl = document.getElementById('user-name');
  const locEl = document.getElementById('user-loc');
  if (nameEl) nameEl.textContent = r.name;
  if (locEl) locEl.textContent = r.loc;

  const nav = document.getElementById('sidebar-nav');
  if (nav) {
    nav.innerHTML = r.nav.map(section => `
      <div class="nav-section">
        <div class="nav-section-label">${section.section}</div>
        ${section.items.map(item => `
          <div class="nav-item" id="nav-${item.id}" onclick="navigate('${item.id}')">
            <span class="icon">${item.icon}</span>
            <span>${item.label}</span>
            ${item.badge ? `<span class="badge">${item.badge}</span>` : ''}
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  const land = document.getElementById('landing');
  const app = document.getElementById('app');
  if (land) land.style.display = 'none';
  if (app) app.style.display = 'flex';
  
  navigate('dashboard');
}

function logout() {
  const app = document.getElementById('app');
  const land = document.getElementById('landing');
  if (app) app.style.display = 'none';
  if (land) land.style.display = 'block';
  currentRole = null;
}

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.getElementById('nav-' + page);
  if (navEl) navEl.classList.add('active');

  const pageTitle = document.getElementById('page-title');
  if (pageTitle) pageTitle.textContent = page.replace(/-/g, ' ').toUpperCase();

  const rendererName = `render_${currentRole}_${page}`.replace(/-/g, '_');
  const fallbackName = `render_${currentRole}_dashboard`.replace(/-/g, '_');
  const fn = window[rendererName] || window[fallbackName];

  const contentEl = document.getElementById('dashboard-content');
  if (fn && contentEl) {
    contentEl.innerHTML = fn();
    postRender();
  }
}

function postRender() {
  document.querySelectorAll('.stat-val[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    let cur = 0; 
    const step = Math.ceil(target / 20);
    const t = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(t);
    }, 30);
  });
}

function showToast(msg, type = 'info') {
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌', danger: '🆘' };
  const t = document.createElement('div');
  t.className = 'toast-msg';
  t.innerHTML = `${icons[type] || '📢'} ${msg}`;
  const container = document.getElementById('toast');
  if (container) {
    container.appendChild(t);
    setTimeout(() => t.remove(), 3500);
  }
}

function openModal(title, body) {
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  const overlay = document.getElementById('modal-overlay');
  if (titleEl) titleEl.textContent = title;
  if (bodyEl) bodyEl.innerHTML = body;
  if (overlay) overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.remove('open');
}
