/**
 * main.js — navegação, mini perfil, fundo FPS, intro e home.
 */
import { watchAuth, logout } from './auth.js';
import { THASec } from './security.js';
import { loadUser } from './user-service.js';
import { avatarSrc, bannerSrc, pagePath } from './store-items.js';
import { renderSocialCards } from './social.js';

const isHomePage = !location.pathname.includes('/pages/');

export function initCore() {
  setupNavLinks();
  setupMenu();
  setupAuthUI();
  setupReveal();
  initFxBackground();
  window.addEventListener('tha:profile-updated', () => {
    const user = window.__thaCurrentUser;
    if (user) refreshNavAndHome(user);
  });
}

function setupNavLinks() {
  document.querySelectorAll('[data-nav-perfil]').forEach((el) => { el.href = pagePath('perfil'); });
  document.querySelectorAll('[data-nav-loja]').forEach((el) => { el.href = pagePath('loja'); });
  document.querySelectorAll('[data-nav-game]').forEach((el) => { el.href = pagePath('game'); });
  document.querySelectorAll('[data-nav-home]').forEach((el) => { el.href = pagePath('home'); });
  const miniBtn = document.getElementById('navMiniProfileBtn');
  if (miniBtn) miniBtn.href = pagePath('perfil');
}

function setupMenu() {
  const btn = document.querySelector('.menu-btn');
  const menu = document.querySelector('.nav-links');
  if (!btn || !menu) return;

  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

async function refreshNavAndHome(user) {
  window.__thaCurrentUser = user;
  let data = null;
  if (user) {
    try {
      data = await loadUser(user.uid);
    } catch (e) {
      console.warn('[nav profile]', e);
    }
  }
  renderNavMini(user, data);
  if (isHomePage) renderHomeProfile(user, data);
}

function setupAuthUI() {
  watchAuth((user) => refreshNavAndHome(user));
  document.querySelectorAll('[data-logout]').forEach((btn) => btn.addEventListener('click', logout));
}

function renderNavMini(user, data) {
  const mini = document.getElementById('navMiniProfile');
  const loginBtn = document.getElementById('navLoginBtn');
  const logoutBtn = document.getElementById('navLogoutBtn');

  if (!user) {
    if (mini) mini.hidden = true;
    if (loginBtn) loginBtn.hidden = false;
    if (logoutBtn) logoutBtn.hidden = true;
    return;
  }

  if (mini) mini.hidden = false;
  if (loginBtn) loginBtn.hidden = true;
  if (logoutBtn) logoutBtn.hidden = false;

  const avatar = document.getElementById('navMiniAvatar');
  const name = document.getElementById('navMiniName');
  const coins = document.getElementById('navMiniCoins');

  const avatarId = data?.selectedAvatar || 'avatar_tha_1';
  const nickname = THASec.clean(data?.nickname || user.displayName || 'Agente', 40);
  const coinCount = data?.coins ?? 0;

  if (avatar) {
    avatar.src = avatarSrc(avatarId);
    avatar.alt = nickname;
  }
  if (name) name.textContent = nickname;
  if (coins) coins.textContent = String(coinCount);
}

export async function refreshNavProfile() {
  const user = window.__thaCurrentUser;
  if (user) await refreshNavAndHome(user);
}

function setupReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.16 });

  items.forEach((el) => io.observe(el));
}

function initFxBackground() {
  const wrap = document.querySelector('.page-bg');
  if (!wrap || wrap.dataset.fxReady) return;
  wrap.dataset.fxReady = '1';

  const canvas = document.createElement('canvas');
  canvas.className = 'fx-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  wrap.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  let particles = [];
  let bullets = [];
  let crosshairs = [];

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function seed() {
    particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.35 + 0.15
    }));

    bullets = Array.from({ length: 14 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      len: Math.random() * 28 + 14,
      speed: Math.random() * 4 + 3,
      angle: Math.random() * Math.PI * 2,
      pink: Math.random() > 0.35
    }));

    crosshairs = Array.from({ length: 6 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      s: Math.random() * 18 + 12,
      rot: Math.random() * 360,
      spin: (Math.random() - 0.5) * 0.4
    }));
  }

  function drawCrosshair(x, y, size, rot) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.strokeStyle = 'rgba(255,126,182,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.lineTo(size, 0);
    ctx.moveTo(0, -size);
    ctx.lineTo(0, size);
    ctx.stroke();
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;
      ctx.fillStyle = `rgba(255,126,182,${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });

    bullets.forEach((b) => {
      b.x += Math.cos(b.angle) * b.speed;
      b.y += Math.sin(b.angle) * b.speed;
      if (b.x < -40 || b.x > w + 40 || b.y < -40 || b.y > h + 40) {
        b.x = Math.random() * w;
        b.y = Math.random() * h;
        b.angle = Math.random() * Math.PI * 2;
      }
      ctx.strokeStyle = b.pink ? 'rgba(255,126,182,0.55)' : 'rgba(255,255,255,0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - Math.cos(b.angle) * b.len, b.y - Math.sin(b.angle) * b.len);
      ctx.stroke();
    });

    crosshairs.forEach((c) => {
      c.rot += c.spin;
      drawCrosshair(c.x, c.y, c.s, c.rot);
    });

    requestAnimationFrame(frame);
  }

  resize();
  seed();
  window.addEventListener('resize', () => { resize(); seed(); });
  requestAnimationFrame(frame);
}

function initPinkIntro() {
  if (sessionStorage.getItem('tha_intro_seen')) return;

  const intro = document.getElementById('pinkIntro');
  if (!intro) return;

  sessionStorage.setItem('tha_intro_seen', '1');
  intro.hidden = false;
  intro.classList.add('play');

  setTimeout(() => {
    intro.classList.add('done');
    setTimeout(() => { intro.hidden = true; }, 600);
  }, 2300);
}

function renderHomeProfile(user, data) {
  const loggedBox = document.getElementById('homeProfileLogged');
  const guestBox = document.getElementById('homeProfileGuest');
  const coinsEl = document.getElementById('homeProfileCoins');
  if (!loggedBox || !guestBox) return;

  if (!user) {
    loggedBox.hidden = true;
    guestBox.hidden = false;
    if (coinsEl) coinsEl.textContent = '0';
    return;
  }

  loggedBox.hidden = false;
  guestBox.hidden = true;

  const nameEl = document.getElementById('homeProfileName');
  const bioEl = document.getElementById('homeProfileBio');
  const photoEl = document.getElementById('homeProfilePhoto');
  const bannerEl = document.getElementById('homeProfileBanner');

  const profile = data || {};
  if (nameEl) nameEl.textContent = THASec.clean(profile.nickname || user.displayName || 'Agente', 40);
  if (bioEl) bioEl.textContent = THASec.clean(profile.bio || 'Membro da comunidade THA.', 160);
  if (coinsEl) coinsEl.textContent = String(profile.coins ?? 0);
  if (photoEl) photoEl.src = avatarSrc(profile.selectedAvatar || 'avatar_tha_1');
  if (bannerEl) bannerEl.src = bannerSrc(profile.selectedBanner || 'banner_tha_1');
}

function initHome() {
  renderSocialCards('#homeSocialGrid');
  initPinkIntro();
}

document.addEventListener('DOMContentLoaded', () => {
  if (isHomePage) {
    initCore();
    initHome();
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('pinkIntro');

  if (!intro) return;

  intro.hidden = false;

  setTimeout(() => {
    intro.classList.add('done');

    setTimeout(() => {
      intro.remove();
    }, 600);
  }, 2300);
});