/**
 * user-service.js — leitura/escrita do perfil e moedas no Firestore.
 */
import { auth, db } from './firebase.js';
import {
  DEFAULT_AVATAR,
  DEFAULT_BANNER,
  avatarById,
  bannerById,
  canUseAvatar,
  canUseBanner,
  normalizeAvatarId,
  normalizeBannerId
} from './store-items.js';
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

export function notifyProfileUpdated() {
  window.dispatchEvent(new CustomEvent('tha:profile-updated'));
}

export function normalizeUserData(raw = {}) {
  const ownedAvatars = Array.isArray(raw.ownedAvatars) && raw.ownedAvatars.length
    ? raw.ownedAvatars.map(normalizeAvatarId)
    : [DEFAULT_AVATAR];
  const ownedBanners = Array.isArray(raw.ownedBanners) && raw.ownedBanners.length
    ? raw.ownedBanners.map(normalizeBannerId)
    : [DEFAULT_BANNER];

  if (!ownedAvatars.includes(DEFAULT_AVATAR)) ownedAvatars.unshift(DEFAULT_AVATAR);
  if (!ownedBanners.includes(DEFAULT_BANNER)) ownedBanners.unshift(DEFAULT_BANNER);

  let selectedAvatar = normalizeAvatarId(raw.selectedAvatar || raw.selectedPhoto || DEFAULT_AVATAR);
  let selectedBanner = normalizeBannerId(raw.selectedBanner || raw.banner || DEFAULT_BANNER);

  if (!canUseAvatar(selectedAvatar, ownedAvatars)) selectedAvatar = DEFAULT_AVATAR;
  if (!canUseBanner(selectedBanner, ownedBanners)) selectedBanner = DEFAULT_BANNER;

  return {
    ...raw,
    nickname: raw.nickname || raw.displayName || 'Agente THA',
    bio: raw.bio || '',
    gender: raw.gender || 'menina',
    selectedAvatar,
    selectedBanner,
    ownedAvatars: [...new Set(ownedAvatars)],
    ownedBanners: [...new Set(ownedBanners)],
    coins: Number(raw.coins) || 0,
    socialLinks: {
      tiktok: raw.socialLinks?.tiktok || '',
      instagram: raw.socialLinks?.instagram || '',
      youtube: raw.socialLinks?.youtube || '',
      discord: raw.socialLinks?.discord || ''
    }
  };
}

export async function loadUser(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? normalizeUserData(snap.data()) : null;
}

export async function addCoins(uid, amount) {
  if (!uid || amount <= 0) return;
  await updateDoc(doc(db, 'users', uid), {
    coins: increment(amount),
    updatedAt: serverTimestamp()
  });
  notifyProfileUpdated();
}

export async function savePublicProfile(uid, data) {
  await setDoc(doc(db, 'profiles', uid), {
    uid,
    nickname: data.nickname,
    bio: data.bio,
    gender: data.gender,
    selectedAvatar: data.selectedAvatar,
    selectedBanner: data.selectedBanner,
    socialLinks: data.socialLinks,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function buyAvatar(uid, avatarId, userData) {
  const item = avatarById(avatarId);
  if (!item || item.free) return { ok: false, msg: 'Item gratuito.' };
  if (userData.ownedAvatars.includes(avatarId)) return { ok: false, msg: 'Você já possui este avatar.' };
  if (userData.coins < item.price) return { ok: false, msg: 'Moedas insuficientes.' };

  const ownedAvatars = [...userData.ownedAvatars, avatarId];
  await updateDoc(doc(db, 'users', uid), {
    ownedAvatars,
    coins: userData.coins - item.price,
    updatedAt: serverTimestamp()
  });
  notifyProfileUpdated();
  return { ok: true, msg: `${item.name} comprado!` };
}

export async function buyBanner(uid, bannerId, userData) {
  const item = bannerById(bannerId);
  if (!item || item.free) return { ok: false, msg: 'Item gratuito.' };
  if (userData.ownedBanners.includes(bannerId)) return { ok: false, msg: 'Você já possui este banner.' };
  if (userData.coins < item.price) return { ok: false, msg: 'Moedas insuficientes.' };

  const ownedBanners = [...userData.ownedBanners, bannerId];
  await updateDoc(doc(db, 'users', uid), {
    ownedBanners,
    coins: userData.coins - item.price,
    updatedAt: serverTimestamp()
  });
  notifyProfileUpdated();
  return { ok: true, msg: `${item.name} comprado!` };
}

export async function equipAvatar(uid, avatarId, userData) {
  if (!canUseAvatar(avatarId, userData.ownedAvatars)) {
    return { ok: false, msg: 'Compre este avatar na loja primeiro.' };
  }
  await updateDoc(doc(db, 'users', uid), {
    selectedAvatar: avatarId,
    updatedAt: serverTimestamp()
  });
  const next = { ...userData, selectedAvatar: avatarId };
  await savePublicProfile(uid, next);
  notifyProfileUpdated();
  return { ok: true, msg: 'Avatar equipado!' };
}

export async function equipBanner(uid, bannerId, userData) {
  if (!canUseBanner(bannerId, userData.ownedBanners)) {
    return { ok: false, msg: 'Compre este banner na loja primeiro.' };
  }
  await updateDoc(doc(db, 'users', uid), {
    selectedBanner: bannerId,
    updatedAt: serverTimestamp()
  });
  const next = { ...userData, selectedBanner: bannerId };
  await savePublicProfile(uid, next);
  notifyProfileUpdated();
  return { ok: true, msg: 'Banner equipado!' };
}

export function currentUid() {
  return auth.currentUser?.uid || null;
}
