/**
 * loja.js — compra e equipar avatares/banners com moedas.
 */
import { auth } from '../../js/firebase.js';
import { watchAuth } from '../../js/auth.js';
import { THASec } from '../../js/security.js';
import { initCore } from '../../js/main.js';
import {
  STORE_AVATARS,
  STORE_BANNERS,
  avatarSrc,
  bannerSrc
} from '../../js/store-items.js';
import {
  loadUser,
  buyAvatar,
  buyBanner,
  equipAvatar,
  equipBanner
} from '../../js/user-service.js';

let userData = null;

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = String(val ?? '');
}

function renderShop() {
  const coins = userData?.coins ?? 0;
  setText('shopCoins', coins);

  renderCategory('shopAvatars', STORE_AVATARS, 'avatar');
  renderCategory('shopBanners', STORE_BANNERS, 'banner');
}

function renderCategory(containerId, items, type) {
  const wrap = document.getElementById(containerId);
  if (!wrap) return;
  wrap.textContent = '';

  const owned = type === 'avatar' ? (userData?.ownedAvatars || []) : (userData?.ownedBanners || []);
  const selected = type === 'avatar' ? userData?.selectedAvatar : userData?.selectedBanner;
  const coins = userData?.coins ?? 0;

  items.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'shop-card';

    const img = document.createElement('img');
    img.alt = item.name;
    img.src = type === 'avatar' ? avatarSrc(item.id) : bannerSrc(item.id);
    if (type === 'banner') img.className = 'shop-banner-img';

    const title = document.createElement('h3');
    title.textContent = item.name;

    const price = document.createElement('p');
    price.className = 'shop-price';
    price.textContent = item.free ? 'Grátis' : `🪙 ${item.price} moedas`;

    const actions = document.createElement('div');
    actions.className = 'shop-actions';

    const hasItem = item.free || owned.includes(item.id);
    const isEquipped = selected === item.id;

    if (isEquipped) {
      const badge = document.createElement('span');
      badge.className = 'shop-badge equipped';
      badge.textContent = 'Equipado';
      actions.appendChild(badge);
    } else if (hasItem) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary btn-sm';
      btn.textContent = 'Equipar';
      btn.addEventListener('click', () => handleEquip(type, item.id));
      actions.appendChild(btn);
      const badge = document.createElement('span');
      badge.className = 'shop-badge owned';
      badge.textContent = 'Comprado';
      actions.appendChild(badge);
    } else if (item.free) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary btn-sm';
      btn.textContent = 'Equipar';
      btn.addEventListener('click', () => handleEquip(type, item.id));
      actions.appendChild(btn);
    } else {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-primary btn-sm';
      btn.textContent = 'Comprar';
      btn.disabled = coins < item.price;
      btn.addEventListener('click', () => handleBuy(type, item.id));
      actions.appendChild(btn);
      if (coins < item.price) {
        const warn = document.createElement('span');
        warn.className = 'shop-warn';
        warn.textContent = 'Moedas insuficientes';
        actions.appendChild(warn);
      }
    }

    card.append(img, title, price, actions);
    wrap.appendChild(card);
  });
}

async function handleBuy(type, id) {
  const uid = auth.currentUser?.uid;
  if (!uid || !userData) {
    THASec.toast('Entre com Google para comprar.', 'error');
    return;
  }
  if (!THASec.rateLimit('shop-buy', 1200)) return;

  const result = type === 'avatar'
    ? await buyAvatar(uid, id, userData)
    : await buyBanner(uid, id, userData);

  THASec.toast(result.msg, result.ok ? 'ok' : 'error');
  if (result.ok) {
    userData = await loadUser(uid);
    renderShop();
  }
}

async function handleEquip(type, id) {
  const uid = auth.currentUser?.uid;
  if (!uid || !userData) return;
  if (!THASec.rateLimit('shop-equip', 800)) return;

  const result = type === 'avatar'
    ? await equipAvatar(uid, id, userData)
    : await equipBanner(uid, id, userData);

  THASec.toast(result.msg, result.ok ? 'ok' : 'error');
  if (result.ok) {
    userData = await loadUser(uid);
    renderShop();
  }
}

function initShop() {
  watchAuth(async (user) => {
    const guest = document.getElementById('shopGuest');
    const area = document.getElementById('shopArea');

    if (!user) {
      if (guest) guest.hidden = false;
      if (area) area.hidden = true;
      return;
    }

    if (guest) guest.hidden = true;
    if (area) area.hidden = false;
    userData = await loadUser(user.uid);
    renderShop();
  });

  window.addEventListener('tha:profile-updated', async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    userData = await loadUser(uid);
    renderShop();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCore();
  initShop();
});
