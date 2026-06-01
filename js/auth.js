import { auth, db, googleProvider } from './firebase.js';
import {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

import { THASec } from './security.js';
import { DEFAULT_AVATAR, DEFAULT_BANNER } from './store-items.js';
import { notifyProfileUpdated } from './user-service.js';

const DEFAULT_BADGES = [1, 6];

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export async function loginGoogle() {
  if (!THASec.rateLimit('login', 1800)) return;

  try {
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }

    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateUser(result.user);
    THASec.toast(`Bem-vinda, ${THASec.clean(result.user.displayName || 'Agente', 40)}!`, 'ok');
    notifyProfileUpdated();
  } catch (error) {
    console.warn('[loginGoogle]', error);
    THASec.toast('Não foi possível entrar com Google.', 'error');
  }
}

getRedirectResult(auth)
  .then(async (result) => {
    if (!result || !result.user) return;

    await createOrUpdateUser(result.user);
    THASec.toast(`Bem-vinda, ${THASec.clean(result.user.displayName || 'Agente', 40)}!`, 'ok');
    notifyProfileUpdated();
  })
  .catch((error) => {
    console.warn('[getRedirectResult]', error);
  });

export async function logout() {
  try {
    await signOut(auth);
    THASec.toast('Você saiu da conta.', 'ok');
    notifyProfileUpdated();
    setTimeout(() => {
      location.href = 'index.html';
    }, 800);
  } catch (error) {
    console.warn('[logout]', error);
  }
}

export async function createOrUpdateUser(user) {
  if (!user) return;

  const userRef = doc(db, 'users', user.uid);
  const publicRef = doc(db, 'profiles', user.uid);
  const snap = await getDoc(userRef);

  if (!snap.exists()) {
    const displayName = THASec.clean(user.displayName || 'Agente THA', 40);

    const payload = {
      uid: user.uid,
      displayName,
      photoURL: user.photoURL || '',
      nickname: displayName,
      bio: 'Agente da THA. Gamer rosa e energia competitiva.',
      gender: 'menina',
      selectedAvatar: DEFAULT_AVATAR,
      selectedBanner: DEFAULT_BANNER,
      ownedAvatars: [DEFAULT_AVATAR],
      ownedBanners: [DEFAULT_BANNER],
      coins: 0,
      socialLinks: { tiktok: '', instagram: '', youtube: '', discord: '' },
      unlockedBadges: DEFAULT_BADGES,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userRef, payload);
    await setDoc(publicRef, {
      uid: user.uid,
      nickname: payload.nickname,
      bio: payload.bio,
      gender: payload.gender,
      selectedAvatar: payload.selectedAvatar,
      selectedBanner: payload.selectedBanner,
      socialLinks: payload.socialLinks,
      updatedAt: serverTimestamp()
    });

    return payload;
  }

  await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
  return snap.data();
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

window.loginGoogle = loginGoogle;
window.logout = logout;