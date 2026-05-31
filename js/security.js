/**
 * security.js — camada simples de segurança client-side.
 * As regras reais ficam no Firestore Rules.
 */
export const THASec = {
  esc(value = '') {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  },

  strip(value = '') {
    return String(value).replace(/<[^>]*>?/gm, '');
  },

  clean(value = '', max = 160) {
    return this.strip(String(value)).trim().slice(0, max);
  },

  validNickname(value = '') {
    return /^[a-zA-ZÀ-ÿ0-9 _.-]{1,40}$/.test(String(value).trim());
  },

  validColor(value = '') {
    return /^#[0-9A-Fa-f]{6}$/.test(String(value).trim());
  },

  validURL(value = '') {
    if (!value) return true;
    try {
      const url = new URL(value);
      return ['https:', 'http:'].includes(url.protocol);
    } catch {
      return false;
    }
  },

  userSocialLinks(raw = {}) {
    const links = {};
    ['tiktok', 'instagram', 'youtube'].forEach((key) => {
      const value = this.clean(raw[key] || '', 220);
      links[key] = value && this.validURL(value) ? value : '';
    });
    links.discord = this.clean(raw.discord || '', 40);
    return links;
  },

  ownProfile(currentUID, targetUID) {
    return Boolean(currentUID && targetUID && currentUID === targetUID);
  },

  rateLimit(key, delay = 1400) {
    window.__thaRate = window.__thaRate || {};
    const now = Date.now();
    if (now - (window.__thaRate[key] || 0) < delay) return false;
    window.__thaRate[key] = now;
    return true;
  },

  setText(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = String(value ?? '');
  },

  toast(message, type = 'ok') {
    let box = document.querySelector('.toast-box');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toast-box';
      document.body.appendChild(box);
    }
    const item = document.createElement('div');
    item.className = `toast ${type}`;
    item.textContent = message;
    box.appendChild(item);
    setTimeout(() => item.remove(), 3600);
  }
};

window.THASec = THASec;
