/**
 * badges.js — 20 badges da THA.
 */
import { initCore } from '../../js/main.js';

export const BADGES = [
  { id:1, name:'Nova Agente', desc:'Entrou pela primeira vez na comunidade.', rarity:'comum', icon:'🌸' },
  { id:2, name:'Fã da THA', desc:'Mostrou apoio para a THA.', rarity:'comum', icon:'💗' },
  { id:3, name:'TikTok Lover', desc:'Veio pelo TikTok da THA.', rarity:'rara', icon:'♪' },
  { id:4, name:'Valorant Girl', desc:'Carrega a vibe competitiva.', rarity:'rara', icon:'🎯' },
  { id:5, name:'Mira Rosa', desc:'Precisão com muito estilo.', rarity:'epica', icon:'⊕' },
  { id:6, name:'Primeira Visita', desc:'Visitou o site oficial.', rarity:'comum', icon:'✨' },
  { id:7, name:'Perfil Estiloso', desc:'Personalizou o card de agente.', rarity:'rara', icon:'🪪' },
  { id:8, name:'Rainha Rosa', desc:'Dominou o tema rosa claro.', rarity:'epica', icon:'👑' },
  { id:9, name:'Clutch Queen', desc:'Brilha nos momentos difíceis.', rarity:'epica', icon:'⚡' },
  { id:10, name:'Seguidora Fiel', desc:'Sempre acompanha a THA.', rarity:'rara', icon:'💞' },
  { id:11, name:'Spike Plantada', desc:'Missão social concluída.', rarity:'rara', icon:'◆' },
  { id:12, name:'Estrela Social', desc:'Conectou suas redes.', rarity:'rara', icon:'⭐' },
  { id:13, name:'Comunidade THA', desc:'Faz parte da squad rosa.', rarity:'comum', icon:'🤍' },
  { id:14, name:'VIP', desc:'Badge especial da comunidade.', rarity:'lendaria', icon:'💎' },
  { id:15, name:'Perfil Completo', desc:'Preencheu todos os detalhes.', rarity:'epica', icon:'✅' },
  { id:16, name:'Squad Rosa', desc:'Entrou no time da THA.', rarity:'rara', icon:'🛡️' },
  { id:17, name:'Energia Positiva', desc:'Espalha boas vibes.', rarity:'comum', icon:'☀️' },
  { id:18, name:'Top Fã', desc:'Badge de fã destaque.', rarity:'lendaria', icon:'🏆' },
  { id:19, name:'Conectada', desc:'Ligada em todas as redes.', rarity:'epica', icon:'🔗' },
  { id:20, name:'Lenda da THA', desc:'A conquista máxima.', rarity:'lendaria', icon:'🔥' }
];

export function renderBadges(target = '#badgesGrid', unlocked = [1, 6]) {
  const grid = document.querySelector(target);
  if (!grid) return;

  grid.textContent = '';
  BADGES.forEach((badge) => {
    const card = document.createElement('article');
    const isUnlocked = unlocked.includes(badge.id);
    card.className = `badge-card ${badge.rarity} ${isUnlocked ? 'unlocked' : 'locked'}`;

    const top = document.createElement('div');
    top.className = 'badge-top';

    const icon = document.createElement('div');
    icon.className = 'badge-icon';
    icon.textContent = isUnlocked ? badge.icon : '🔒';

    const rarity = document.createElement('span');
    rarity.className = 'badge-rarity';
    rarity.textContent = badge.rarity;

    top.append(icon, rarity);

    const title = document.createElement('h3');
    title.textContent = badge.name;

    const desc = document.createElement('p');
    desc.textContent = badge.desc;

    card.append(top, title, desc);
    grid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCore();
  renderBadges();
});
