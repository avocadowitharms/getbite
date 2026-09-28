// Run with: node site.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const element = (extra = {}) => ({
  listeners: {},
  addEventListener(type, listener) { this.listeners[type] = listener; },
  ...extra,
});
const cards = ['Chickpea Salad', 'Pasta al Pomodoro', 'Protein Oats'].map(name => ({
  dataset: {},
  setAttribute(key, value) { this[key] = value; },
  querySelector() { return { textContent: name }; },
}));
let focused = false;
const menu = element({ open: true, contains: target => target === menu, querySelector: () => ({ focus() { focused = true; } }) });
const deck = element({ querySelectorAll: () => cards, setPointerCapture() {} });
const status = {};
const buttons = [-1, 1].map(step => element({ dataset: { deckStep: step } }));
const document = element({
  querySelector: selector => ({ '.mobile-menu': menu, '.deck': deck, '.deck-status': status })[selector],
  querySelectorAll: selector => selector === '[data-deck-step]' ? buttons : [],
});
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'site.js'), 'utf8'), { document, matchMedia: () => ({ matches: true }) });
const checkCard = index => {
  assert.equal(cards[index].dataset.position, 0);
  assert.equal(cards.filter(card => card['aria-hidden'] === 'false').length, 1);
  assert.ok(status.textContent.includes(cards[index].querySelector().textContent));
};
buttons[0].listeners.click(); checkCard(2); // Backward wrap.
buttons[1].listeners.click(); checkCard(0); // Forward wrap.
deck.listeners.keydown({ key: 'ArrowRight', preventDefault() {} }); checkCard(1);
deck.listeners.pointerdown({ isPrimary: true, button: 0, clientX: 200, clientY: 20, pointerId: 1 });
deck.listeners.pointerup({ clientX: 100, clientY: 25, pointerId: 1 }); checkCard(2);
deck.listeners.pointerdown({ isPrimary: true, button: 0, clientX: 200, clientY: 20, pointerId: 1 });
deck.listeners.pointerup({ clientX: 150, clientY: 200, pointerId: 1 }); checkCard(2); // Vertical scroll is not a swipe.
deck.listeners.pointerdown({ isPrimary: true, button: 0, clientX: 200, clientY: 20, pointerId: 1 });
deck.listeners.pointercancel();
deck.listeners.pointerup({ clientX: 100, clientY: 25, pointerId: 1 }); checkCard(2);
document.listeners.keydown({ key: 'Escape' });
assert.equal(menu.open, false); assert.equal(focused, true);
menu.open = true;
menu.listeners.click({ target: { closest: () => ({}) } });
assert.equal(menu.open, false);
menu.open = true;
document.listeners.click({ target: {} });
assert.equal(menu.open, false);

// Entrance effects reveal each card once; reduced motion leaves content visible.
let cardTop = 1000;
const healthCard = { classList: new Set(), getBoundingClientRect: () => ({ top: cardTop, bottom: cardTop + 200 }) };
const healthDocument = { ...document, querySelectorAll: selector => selector === '.health-card' ? [healthCard] : buttons };
const scrollWindow = element({ removeEventListener(type) { delete this.listeners[type]; } });
const script = fs.readFileSync(path.join(__dirname, 'site.js'), 'utf8');
vm.runInNewContext(script, { document: healthDocument, window: scrollWindow, innerHeight: 800, matchMedia: () => ({ matches: false }) });
assert.ok(healthCard.classList.has('reveal-ready'));
assert.ok(!healthCard.classList.has('is-visible'));
cardTop = 500;
scrollWindow.listeners.scroll();
assert.ok(healthCard.classList.has('is-visible'));
assert.equal(scrollWindow.listeners.scroll, undefined);
assert.equal(scrollWindow.listeners.resize, undefined);
healthCard.classList.clear();
vm.runInNewContext(script, { document: healthDocument, matchMedia: () => ({ matches: true }) });
assert.equal(healthCard.classList.size, 0);

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'IDs must be unique');
for (const [, attribute, value] of html.matchAll(/\b(src|href)="([^"]+)"/g)) {
  if (value.startsWith('#')) assert.ok(ids.includes(value.slice(1)), `Missing anchor: ${value}`);
  else if (!/^https?:/.test(value)) assert.ok(fs.existsSync(path.join(__dirname, value)), `Missing ${attribute}: ${value}`);
}
assert.ok(html.includes('https://play.google.com/store/apps/details?id=com.avocadowitharms.bite'));
assert.ok(html.includes('Voice control · Coming soon'));
assert.ok(!/iPhone|apps\.apple\.com/.test(html));
console.log('Passed: deck, menu, card entrance/reduced motion, local assets, anchors, Android link and coming-soon copy.');
