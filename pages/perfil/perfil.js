/**
 * perfil.js — perfil com equipar, redes sociais e Firebase.
 */
import { auth, db } from '../../js/firebase.js';
import { watchAuth } from '../../js/auth.js';
import { THASec } from '../../js/security.js';
import { initCore } from '../../js/main.js';
import {
  STORE_AVATARS,
  STORE_BANNERS,
  avatarSrc,
  bannerSrc,
  pagePath,
  canUseAvatar,
  canUseBanner
} from '../../js/store-items.js';
import { loadUser, savePublicProfile } from '../../js/user-service.js';
import { doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const GENDER_LABELS = { homem: 'Homem', menina: 'Menina', outro: 'Outro' };
const VALID_GENDERS = ['homem', 'menina', 'outro'];

let userData = null;
let selectedAvatarId = 'avatar_tha_1';
let selectedBannerId = 'banner_tha_1';

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? '';
}

function getInputValue(id) {
  return document.getElementById(id)?.value || '';
}

function getFormData() {
  const gender = getInputValue('gender');
  return {
    nickname: THASec.clean(getInputValue('nickname'), 40),
    bio: THASec.clean(getInputValue('bio'), 160),
    gender: VALID_GENDERS.includes(gender) ? gender : 'menina',
    selectedAvatar: selectedAvatarId,
    selectedBanner: selectedBannerId,
    socialLinks: THASec.userSocialLinks({
      tiktok: getInputValue('tiktok'),
      instagram: getInputValue('instagram'),
      youtube: getInputValue('youtube'),
      discord: getInputValue('discord')
    })
  };
}

function applyGenderTheme(gender) {
  document.body.classList.remove('gender-male', 'gender-female', 'gender-other');
  if (gender === 'homem') document.body.classList.add('gender-male');
  else if (gender === 'menina') document.body.classList.add('gender-female');
  else if (gender === 'outro') document.body.classList.add('gender-other');
}

function setAvatarAndBanner(avatarId, bannerId) {
  ['publicPhoto', 'previewPhoto'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.src = avatarSrc(avatarId);
  });
  ['publicBanner', 'previewBanner'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.src = bannerSrc(bannerId);
  });
}

function renderSocialPublic(links = {}) {
  const wrap = document.getElementById('publicSocials');
  if (!wrap) return;
  wrap.textContent = '';

  const items = [
    { key: 'tiktok', label: 'TikTok', icon: '♪' },
    { key: 'instagram', label: 'Instagram', icon: '◎' },
    { key: 'youtube', label: 'YouTube', icon: '▶' },
    { key: 'discord', label: 'Discord', icon: '#' }
  ];

  items.forEach((item) => {
    const value = links[item.key];
    if (!value) return;

    const card = document.createElement('article');
    card.className = 'social-user-card';

    const icon = document.createElement('span');
    icon.className = 'social-user-card__icon';
    icon.textContent = item.icon;

    const label = document.createElement('strong');
    label.textContent = item.label;

    card.append(icon, label);

    if (item.key === 'discord') {
      const text = document.createElement('p');
      text.textContent = value;
      card.appendChild(text);
    } else {
      const link = document.createElement('a');
      link.href = value;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Abrir';
      link.className = 'btn btn-ghost btn-sm';
      card.appendChild(link);
    }

    wrap.appendChild(card);
  });
}

function renderEquipGrid() {
  const ownedA = userData?.ownedAvatars || [];
  const ownedB = userData?.ownedBanners || [];

  renderItemGrid('photoChoices', STORE_AVATARS, selectedAvatarId, ownedA, 'avatar');
  renderItemGrid('bannerChoices', STORE_BANNERS, selectedBannerId, ownedB, 'banner');
}

function renderItemGrid(wrapId, items, selectedId, owned, type) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  wrap.textContent = '';

  items.forEach((item) => {
    const usable = type === 'avatar'
      ? canUseAvatar(item.id, owned)
      : canUseBanner(item.id, owned);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.disabled = !usable;
    btn.className = `choice-card ${type === 'banner' ? 'banner-card' : ''} ${selectedId === item.id ? 'active' : ''} ${usable ? '' : 'locked'}`;

    const img = document.createElement('img');
    img.alt = item.name;
    img.src = type === 'avatar' ? avatarSrc(item.id) : bannerSrc(item.id);

    const span = document.createElement('span');
    span.textContent = usable ? item.name : `${item.name} 🔒`;

    btn.append(img, span);

    if (usable) {
      btn.addEventListener('click', () => {
        if (type === 'avatar') selectedAvatarId = item.id;
        else selectedBannerId = item.id;
        renderEquipGrid();
        updatePreview();
      });
    }

    wrap.appendChild(btn);
  });

  const hint = document.getElementById(`${wrapId}Hint`);
  if (hint) {
    hint.textContent = '';
    const link = document.createElement('a');
    link.href = pagePath('loja');
    link.textContent = 'Comprar mais na Loja →';
    hint.appendChild(link);
  }
}

function renderPublicProfile(data) {
  setAvatarAndBanner(data.selectedAvatar, data.selectedBanner);
  setText('publicName', data.nickname || 'Agente THA');
  setText('publicBio', data.bio || 'Perfil de agente da comunidade THA.');
  setText('publicGender', GENDER_LABELS[data.gender] || 'Menina');
  setText('profileCoins', String(userData?.coins ?? 0));
  applyGenderTheme(data.gender);
  renderSocialPublic(data.socialLinks);
}

function updatePreview() {
  const data = getFormData();
  setAvatarAndBanner(data.selectedAvatar, data.selectedBanner);
  setText('previewName', data.nickname || 'Agente THA');
  setText('previewBio', data.bio || 'Perfil de agente da comunidade THA.');
  setText('previewGender', GENDER_LABELS[data.gender] || 'Menina');
  applyGenderTheme(data.gender);
}

function fillForm(profile) {
  userData = profile;
  selectedAvatarId = profile.selectedAvatar;
  selectedBannerId = profile.selectedBanner;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  };

  setVal('nickname', profile.nickname);
  setVal('bio', profile.bio);
  setVal('gender', VALID_GENDERS.includes(profile.gender) ? profile.gender : 'menina');
  setVal('tiktok', profile.socialLinks?.tiktok);
  setVal('instagram', profile.socialLinks?.instagram);
  setVal('youtube', profile.socialLinks?.youtube);
  setVal('discord', profile.socialLinks?.discord);

  renderEquipGrid();
  updatePreview();
  renderPublicProfile({ ...getFormData(), ...profile });
}

async function saveCurrentProfile(uid) {
  if (!THASec.rateLimit('save-profile', 1800)) {
    THASec.toast('Aguarde antes de salvar novamente.', 'error');
    return;
  }
  if (!THASec.ownProfile(auth.currentUser?.uid, uid)) {
    THASec.toast('Você só pode editar o seu próprio perfil.', 'error');
    return;
  }

  const data = getFormData();
  if (!THASec.validNickname(data.nickname)) {
    THASec.toast('Nickname inválido.', 'error');
    return;
  }

  if (!canUseAvatar(data.selectedAvatar, userData?.ownedAvatars || [])) {
    THASec.toast('Avatar bloqueado. Compre na loja.', 'error');
    return;
  }
  if (!canUseBanner(data.selectedBanner, userData?.ownedBanners || [])) {
    THASec.toast('Banner bloqueado. Compre na loja.', 'error');
    return;
  }

  try {
    await setDoc(doc(db, 'users', uid), {
      nickname: data.nickname,
      bio: data.bio,
      gender: data.gender,
      selectedAvatar: data.selectedAvatar,
      selectedBanner: data.selectedBanner,
      socialLinks: data.socialLinks,
      updatedAt: serverTimestamp()
    }, { merge: true });

    await savePublicProfile(uid, data);
    userData = { ...userData, ...data };

    THASec.toast('Perfil salvo!', 'ok');
    renderPublicProfile(data);
    showEditor(false);
    window.dispatchEvent(new CustomEvent('tha:profile-updated'));
  } catch (error) {
    console.warn('[save profile]', error);
    THASec.toast('Erro ao salvar perfil.', 'error');
  }
}

function showEditor(show) {
  const editor = document.getElementById('profileEditor');
  if (editor) editor.hidden = !show;
  const btn = document.getElementById('editToggle');
  if (btn) btn.textContent = show ? 'Editando...' : 'Editar Perfil';
}

function initProfilePage() {
  document.querySelectorAll('#nickname, #bio, #gender, #tiktok, #instagram, #youtube, #discord').forEach((el) => {
    el.addEventListener('input', () => { updatePreview(); renderSocialPublic(getFormData().socialLinks); });
    el.addEventListener('change', updatePreview);
  });

  document.getElementById('editToggle')?.addEventListener('click', () => showEditor(true));
  document.getElementById('closeEditor')?.addEventListener('click', () => showEditor(false));

  watchAuth(async (user) => {
    const authBox = document.getElementById('authBox');
    const area = document.getElementById('profileArea');

    if (!user) {
      if (authBox) authBox.hidden = false;
      if (area) area.hidden = true;
      document.body.classList.remove('gender-male', 'gender-female', 'gender-other');
      return;
    }

    if (authBox) authBox.hidden = true;
    if (area) area.hidden = false;

    const profile = await loadUser(user.uid);
    if (profile) fillForm(profile);
    else updatePreview();
  });

  document.getElementById('saveProfile')?.addEventListener('click', () => {
    const uid = auth.currentUser?.uid;
    if (uid) saveCurrentProfile(uid);
  });

  window.addEventListener('tha:profile-updated', async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const profile = await loadUser(uid);
    if (profile) fillForm(profile);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCore();
  initProfilePage();
});
