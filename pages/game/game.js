import { auth } from '../../js/firebase.js';
import { initCore, refreshNavProfile } from '../../js/main.js';
import { addCoins } from '../../js/user-service.js';
import { THASec } from '../../js/security.js';

const ARENA = '#gameArena';
const DURATION = 30;
const SPAWN_MS = 900;
const COINS_PER_BALLOON = 2;

let balloonsPopped = 0;
let timeLeft = DURATION;
let playing = false;
let timerId = null;
let spawnId = null;

function $(sel) {
  return document.querySelector(sel);
}

function setText(sel, val) {
  const el = $(sel);
  if (el) el.textContent = String(val);
}

function randomPos(arena) {
  const pad = 40;
  const w = arena.clientWidth - pad * 2;
  const h = arena.clientHeight - pad * 2;
  return {
    x: pad + Math.random() * Math.max(w, 0),
    y: pad + Math.random() * Math.max(h, 0)
  };
}

function spawnBalloon() {
  const arena = $(ARENA);
  if (!arena || !playing) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'balloon';
  btn.setAttribute('aria-label', 'Balão');

  const pos = randomPos(arena);
  btn.style.left = `${pos.x}px`;
  btn.style.top = `${pos.y}px`;
  btn.style.animationDelay = `${Math.random()}s`;

  btn.addEventListener('click', () => {
    if (!playing) return;
    balloonsPopped += 1;
    setText('#gameScore', balloonsPopped);
    btn.classList.add('pop');
    setTimeout(() => btn.remove(), 200);
  });

  arena.appendChild(btn);

  setTimeout(() => {
    if (btn.isConnected && !btn.classList.contains('pop')) btn.remove();
  }, 2800);
}

function clearArena() {
  const arena = $(ARENA);
  if (arena) arena.textContent = '';
}

function stopGame() {
  playing = false;
  clearInterval(timerId);
  clearInterval(spawnId);
  timerId = null;
  spawnId = null;
  const arena = $(ARENA);
  if (arena) arena.classList.remove('active');
  const startBtn = $('#gameStart');
  if (startBtn) startBtn.disabled = false;
}

async function showResult() {
  const box = $('#gameResult');
  const final = $('#gameFinalScore');
  const coinsEarned = $('#gameCoinsEarned');
  const guestNote = $('#gameGuestNote');

  const totalCoinsEarned = balloonsPopped * COINS_PER_BALLOON;

  if (final) final.textContent = String(balloonsPopped);
  if (coinsEarned) coinsEarned.textContent = String(totalCoinsEarned);

  const user = auth.currentUser;
  if (guestNote) guestNote.hidden = Boolean(user);
  if (box) box.hidden = false;

  if (user && totalCoinsEarned > 0) {
    try {
      await addCoins(user.uid, totalCoinsEarned);
      THASec.toast(`+${totalCoinsEarned} moedas salvas!`, 'ok');
      await refreshNavProfile();
    } catch (e) {
      console.warn('[game coins]', e);
      THASec.toast('Não foi possível salvar moedas.', 'error');
    }
  } else if (!user && totalCoinsEarned > 0) {
    THASec.toast('Entre com Google para salvar suas moedas.', 'error');
  }
}

function startGame() {
  balloonsPopped = 0;
  timeLeft = DURATION;
  playing = true;

  setText('#gameScore', 0);
  setText('#gameTime', timeLeft);
  const result = $('#gameResult');
  if (result) result.hidden = true;

  clearArena();
  const arena = $(ARENA);
  if (arena) arena.classList.add('active');

  const startBtn = $('#gameStart');
  if (startBtn) startBtn.disabled = true;

  spawnBalloon();
  spawnId = setInterval(spawnBalloon, SPAWN_MS);

  timerId = setInterval(() => {
    timeLeft -= 1;
    setText('#gameTime', timeLeft);
    if (timeLeft <= 0) {
      stopGame();
      showResult();
    }
  }, 1000);
}

function setupCursor() {
  const cursor = document.createElement('div');
  cursor.className = 'game-cursor';
  cursor.hidden = true;
  document.body.appendChild(cursor);
  document.body.classList.add('game-page');

  document.addEventListener('mousemove', (e) => {
    cursor.hidden = false;
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initCore();
  setupCursor();
  $('#gameStart')?.addEventListener('click', startGame);
  $('#gameRestart')?.addEventListener('click', startGame);
});
