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
  querySelectorAll: () => buttons,
});
vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'site.js'), 'utf8'), { document });
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
console.log('Passed: deck navigation, swipe/scroll/cancel, menu, local assets, anchors, Android link and coming-soon copy.');
