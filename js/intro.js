document.addEventListener('DOMContentLoaded', () => {
  const intro = document.getElementById('pinkIntro');

  if (!intro) return;

  intro.hidden = false;

  setTimeout(() => {
    intro.classList.add('done');

    setTimeout(() => {
      intro.remove();
    }, 600);
  }, 2300);
});