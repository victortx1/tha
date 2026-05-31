/**
 * profile-assets.js — reexporta catálogo (compatibilidade).
 */
export {
  STORE_AVATARS as PROFILE_PHOTOS,
  STORE_BANNERS as PROFILE_BANNERS,
  avatarById as photoById,
  bannerById,
  avatarSrc as photoSrc,
  bannerSrc,
  assetPath,
  pagePath,
  canUseAvatar,
  canUseBanner,
  DEFAULT_AVATAR,
  DEFAULT_BANNER
} from './store-items.js';
