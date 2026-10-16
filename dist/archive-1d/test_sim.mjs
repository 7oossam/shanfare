import { CARDS, APPROACHES, BOONS, fresh, play, exert, endTurn, reason, distance, intent, targets, cardEffect, movementTargets, leap, drink, terrain, forecast, isolated } from './engine.mjs';

console.log('Engine loaded successfully. Testing basic simulation step...');

let s = fresh(12345, 'trail');
console.log('Fresh trail state:', {
  hp: s.hp,
  pos: s.pos,
  energy: s.energy,
  hand: s.hand,
  deckLength: s.deck.length
});

let fc = forecast(s);
console.log('Forecast turn 1:', fc);
