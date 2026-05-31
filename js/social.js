/**
 * social.js — links oficiais da THA (fácil de trocar).
 */
export const SOCIAL_LINKS = {
  tiktok: 'https://www.tiktok.com/@thaiswm?is_from_webapp=1&sender_device=pc',
  Ganhefps: 'https://beastfps.lovable.app/',
  livepix: 'https://livepix.gg/thakk',
  discord: 'https://discord.gg/fNYH9DyY8m'
};

export const SOCIALS = [
  { key: 'tiktok', name: 'TikTok', icon: '♪', text: 'Lives, vídeos e gameplay.' },
  { key: 'Ganhefps', name: 'GanheFPS', icon: '◎', text: 'otimização exclusiva no seu jogo favorito.' },
  { key: 'livepix', name: 'Live pix', icon: '▶', text: '🎮 Apoie com Pix e faça parte da jornada!.' },
  { key: 'discord', name: 'Discord', icon: '#', text: 'Comunidade da THA.' }
];

export function renderSocialCards(target = '#socialGrid') {
  const grid = document.querySelector(target);
  if (!grid) return;
  grid.textContent = '';

  SOCIALS.forEach((item) => {
    const card = document.createElement('article');
    card.className = 'social-card';

    const icon = document.createElement('div');
    icon.className = 'social-icon';
    icon.textContent = item.icon;

    const title = document.createElement('h3');
    title.textContent = item.name;

    const text = document.createElement('p');
    text.textContent = item.text;

    const link = document.createElement('a');
    link.className = 'btn btn-primary';
    link.href = SOCIAL_LINKS[item.key] || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = `Abrir ${item.name}`;

    card.append(icon, title, text, link);
    grid.appendChild(card);
  });
}
