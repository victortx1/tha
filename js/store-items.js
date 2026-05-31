/**
 * store-items.js — catálogo de avatares e banners (loja + perfil).
 * Edite preços e caminhos aqui.
 */
export const STORE_AVATARS = [
  {
    id: 'avatar_tha_1',
    name: 'THA Rosa',
    src: 'assets/avatars/ttha.png',
    price: 0,
    free: true
  },
    {
    id: 'avatar_tata_1',
    name: 'Blue Agent',
    src: 'assets/avatars/thavava.png',
    price: 100,
    free: false
  },
  {
    id: 'avatar_blue_1',
    name: 'Blue Agent',
    src: 'assets/avatars/mtha.png',
    price: 150,
    free: false
  },
    {
    id: 'avatar_vava_1',
    name: 'Blue Agent',
    src: 'assets/avatars/vava.webp',
    price: 150,
    free: false
  },
  {
    id: 'avatar_angel_1',
    name: 'Angel',
    src: 'assets/avatars/avatar.jfif',
    price: 200,
    free: false
  }
];

export const STORE_BANNERS = [
  {
    id: 'banner_tha_1',
    name: 'THA Neon',
    src: 'assets/banners/avatartha.png',
    price: 0,
    free: true
  },
      {
    id: 'banner_ttk_1',
    name: 'Azul Gamer',
    src: 'assets/banners/ttktha.png',
    price: 100,
    free: false
  },
  {
    id: 'banner_blue_1',
    name: 'Azul Gamer',
    src: 'assets/banners/craft.png',
    price: 120,
    free: false
  },
    {
    id: 'banner_vamp_1',
    name: 'Azul Gamer',
    src: 'assets/banners/vamptha.png',
    price: 150,
    free: false
  },
  {
    id: 'banner_white_1',
    name: 'Branco Premium',
    src: 'assets/banners/cptha.png',
    price: 150,
    free: false
  }
];

export const DEFAULT_AVATAR = 'avatar_tha_1';
export const DEFAULT_BANNER = 'banner_tha_1';

const AVATAR_MAP = new Map(STORE_AVATARS.map((item) => [item.id, item]));
const BANNER_MAP = new Map(STORE_BANNERS.map((item) => [item.id, item]));

export const AVATAR_IDS = STORE_AVATARS.map((item) => item.id);
export const BANNER_IDS = STORE_BANNERS.map((item) => item.id);

export function avatarById(id) {
  return AVATAR_MAP.get(id) || STORE_AVATARS[0];
}

export function bannerById(id) {
  return BANNER_MAP.get(id) || STORE_BANNERS[0];
}

export function assetPath(relativeFromRoot) {
  const inPages = location.pathname.includes('/pages/');
  return inPages ? `../../${relativeFromRoot}` : relativeFromRoot;
}

export function avatarSrc(id) {
  return assetPath(avatarById(id).src);
}

export function bannerSrc(id) {
  return assetPath(bannerById(id).src);
}

export function pagePath(page) {
  const inPages = location.pathname.includes('/pages/');
  const base = inPages ? '../' : 'pages/';
  const map = {
    home: inPages ? '../../index.html' : 'index.html',
    perfil: `${base}perfil/perfil.html`,
    loja: `${base}loja/loja.html`,
    badges: `${base}badges/badges.html`,
    redes: `${base}redes/redes.html`,
    game: `${base}game/game.html`
  };
  return map[page] || map.home;
}

export function canUseAvatar(id, ownedAvatars = []) {
  const item = avatarById(id);
  if (!item) return false;
  if (item.free) return true;
  return ownedAvatars.includes(id);
}

export function canUseBanner(id, ownedBanners = []) {
  const item = bannerById(id);
  if (!item) return false;
  if (item.free) return true;
  return ownedBanners.includes(id);
}

export function normalizeAvatarId(id) {
  const legacy = {
    rosa_1: 'avatar_tha_1',
    blue_1: 'avatar_blue_1',
    angel_1: 'avatar_angel_1'
  };
  return legacy[id] || id;
}

export function normalizeBannerId(id) {
  const legacy = {
    pink_banner: 'banner_tha_1',
    blue_banner: 'banner_blue_1',
    white_banner: 'banner_white_1'
  };
  return legacy[id] || id;
}
