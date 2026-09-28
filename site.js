const menu = document.querySelector('.mobile-menu');
menu.addEventListener('click', (event) => {
  if (event.target.closest('a')) menu.open = false;
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
document.addEventListener('click', (event) => {
  if (!menu.contains(event.target)) menu.open = false;
});

const deck = document.querySelector('.deck');
const cards = [...deck.querySelectorAll('.recommendation-card')];
const status = document.querySelector('.deck-status');
let active = 0;

function showRecommendation(step) {
  active = (active + step + cards.length) % cards.length;
  cards.forEach((card, index) => {
    const position = (index - active + cards.length) % cards.length;
    card.dataset.position = position;
    card.setAttribute('aria-hidden', String(position !== 0));
  });
  status.textContent = `${String(active + 1).padStart(2, '0')} / 03 · ${cards[active].querySelector('h3').textContent}`;
}

document.querySelectorAll('[data-deck-step]').forEach((button) => {
  button.addEventListener('click', () => showRecommendation(Number(button.dataset.deckStep)));
});
deck.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    showRecommendation(event.key === 'ArrowRight' ? 1 : -1);
  }
});
let start = null;
deck.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  start = { x: event.clientX, y: event.clientY, id: event.pointerId };
  deck.setPointerCapture(event.pointerId);
});
deck.addEventListener('pointerup', (event) => {
  if (!start || start.id !== event.pointerId) return;
  const dx = event.clientX - start.x;
  const dy = event.clientY - start.y;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) showRecommendation(dx < 0 ? 1 : -1);
  start = null;
});
deck.addEventListener('pointercancel', () => { start = null; });

if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let pendingHealthCards = [...document.querySelectorAll('.health-card')];
  pendingHealthCards.forEach(card => card.classList.add('reveal-ready'));
  function revealHealthCards() {
    pendingHealthCards = pendingHealthCards.filter(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top >= innerHeight * 0.9 || rect.bottom <= 0) return true;
      card.classList.add('is-visible');
      return false;
    });
    if (!pendingHealthCards.length) {
      window.removeEventListener('scroll', revealHealthCards);
      window.removeEventListener('resize', revealHealthCards);
    }
  }
  window.addEventListener('scroll', revealHealthCards, { passive: true });
  window.addEventListener('resize', revealHealthCards);
  revealHealthCards();
}
