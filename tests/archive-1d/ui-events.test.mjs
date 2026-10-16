import test from 'node:test';
import assert from 'node:assert/strict';

// Create minimal DOM mock
globalThis.window = globalThis;
globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] ?? null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const elements = {};
function makeElem(id) {
  const listeners = {};
  return {
    id,
    classList: {
      classes: new Set(),
      add(c) { this.classes.add(c); },
      remove(c) { this.classes.delete(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.classes.has(c)) this.classes.delete(c);
          else this.classes.add(c);
        } else if (force) {
          this.classes.add(c);
        } else {
          this.classes.delete(c);
        }
      },
      contains(c) { return this.classes.has(c); }
    },
    setAttribute(k, v) { this[k] = String(v); },
    getAttribute(k) { return this[k] ?? null; },
    addEventListener(event, fn) { (listeners[event] ??= []).push(fn); },
    trigger(event, data = {}) {
      if (this['on' + event]) this['on' + event](data);
      for (const fn of (listeners[event] || [])) fn(data);
    },
    querySelector() { return makeElem('sub'); },
    querySelectorAll() { return []; },
    style: {},
    dataset: {},
    textContent: '',
    innerHTML: '',
    focus() {},
    click() { this.trigger('click'); }
  };
}

globalThis.document = {
  listeners: {},
  getElementById(id) { return elements[id] ??= makeElem(id); },
  querySelector(sel) { return makeElem(sel); },
  querySelectorAll() { return []; },
  createElement(tag) { return makeElem(tag); },
  addEventListener(event, fn) { (this.listeners[event] ??= []).push(fn); },
  trigger(event, data = {}) {
    for (const fn of (this.listeners[event] || [])) fn(data);
  }
};

// Import app.js
await import('../../dist/archive-1d/app.js');

test('UI Events: Initial render populates HUD elements', () => {
  const turn = document.getElementById('turn');
  const energy = document.getElementById('energy');
  const health = document.getElementById('health-numbers');

  assert.ok(turn.textContent.length > 0);
  assert.ok(energy.textContent.length > 0);
  assert.ok(health.textContent.length > 0);
});

test('UI Events: Menu button toggles menu visibility', () => {
  const menuBtn = document.getElementById('menu-btn');
  const gameMenu = document.getElementById('game-menu');

  menuBtn.trigger('click');
  assert.ok(menuBtn.getAttribute('aria-expanded') !== null);
});

test('UI Events: Exert and Drink buttons trigger preview modes', () => {
  const exertBtn = document.getElementById('exert');
  const confirmBtn = document.getElementById('confirm-action');

  exertBtn.trigger('click');
  assert.equal(confirmBtn.textContent, 'تجلّد');

  const cancelBtn = document.getElementById('cancel-action');
  cancelBtn.trigger('click');

  const drinkBtn = document.getElementById('drink');
  drinkBtn.trigger('click');
  // If drink was valid or previewed
  assert.ok(confirmBtn.textContent === 'اشرب' || confirmBtn.textContent === 'العب');
});

test('UI Events: Leap mode selection flow', () => {
  const leapBtn = document.getElementById('leap');
  const hint = document.getElementById('selection-hint');

  leapBtn.trigger('click');
  assert.ok(hint.textContent.includes('اطرح بطاقة') || hint.textContent.includes('١'));

  const cancelBtn = document.getElementById('cancel-action');
  cancelBtn.trigger('click');
});
