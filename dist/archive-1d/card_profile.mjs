import { CARDS } from './engine.mjs';

console.log('=== CARD NUMERICAL PROFILE ===\n');

for (let [id, c] of Object.entries(CARDS)) {
  let dpe = c.cost > 0 ? ((c.dmg || 0) / c.cost).toFixed(2) : (c.dmg ? 'INF' : '0');
  let bpe = c.cost > 0 ? ((c.block || 0) / c.cost).toFixed(2) : (c.block ? 'INF' : '0');
  let closeDpe = c.close && c.cost > 0 ? (c.close / c.cost).toFixed(2) : '-';
  let rockBpe = c.rockBonus && c.cost > 0 ? (((c.block || 0) + c.rockBonus) / c.cost).toFixed(2) : '-';

  console.log(`${id.padEnd(9)} | Name: ${c.name.padEnd(14)} | Cost: ${c.cost} | Type: ${c.type.padEnd(6)} | Base Dmg: ${(c.dmg || 0).toString().padEnd(2)} (DPE: ${dpe.padEnd(4)}) | Close Dmg: ${(c.close || '-').toString().padEnd(2)} (Close DPE: ${closeDpe.padEnd(4)}) | Block: ${(c.block || 0).toString().padEnd(2)} (BPE: ${bpe.padEnd(4)}) | Rock Block: ${(c.block ? (c.block + (c.rockBonus || 0)) : '-').toString().padEnd(2)} (Rock BPE: ${rockBpe.padEnd(4)}) | Special: ${JSON.stringify({ weak: c.weak, push: c.push, move: c.move, strain: c.strain, mark: c.mark, draw: c.draw, recoverBow: c.recoverBow, min: c.min, max: c.max, steady: c.steady, unplayable: c.unplayable })}`);
}
