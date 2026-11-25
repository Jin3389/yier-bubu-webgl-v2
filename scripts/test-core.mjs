// Comprehensive DOM-free verification: ALL 36 Elemental enemies across Acts 1-3 + ALL 5 classes + Campfire/Shop + Save

import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/data/characters.js';
import { ENEMY_DB, FACTION_META } from '../src/data/enemies.js';
import { VISUAL_MANIFEST } from '../src/data/visuals.js';
import { RED_LOOT_BY_ENEMY } from '../src/data/loot.js';
import { createRng } from '../src/core/rng.js';
import { createCombatState, playCard, useActiveSkill, resolvePendingChoice, endPlayerTurn, canPlayCard } from '../src/core/combat-engine.js';
import {
  createNewRun, enterCurrentMapNode, applyCombatVictory, performCampfireRest,
  performKnightSparSwap, getKnightSparOffers,
  getChefCookOptions, performChefCook,
  getTeacherUpgradeOptions, performTeacherUpgrade,
  sellLootInShop, buyShopItem, serializeRun, deserializeRun
} from '../src/core/run-engine.js';

// 1. Verify all 36 enemies exist, have visuals, have Red Exclusives, and run 2 turns cleanly in Acts 0/1/2
const enemyIds = Object.keys(ENEMY_DB);
assert.equal(enemyIds.length, 36, `Expected 36 Elemental enemies, got ${enemyIds.length}`);
for (const id of enemyIds) {
  assert.ok(VISUAL_MANIFEST.enemies[id], `Missing visual manifest for ${id}`);
  assert.ok(RED_LOOT_BY_ENEMY[id], `Missing Red Exclusive loot for ${id}`);
  for (const actIndex of [0, 1, 2]) {
    const run = createNewRun('knight', 1000 + actIndex);
    const rng = createRng(5555 + actIndex);
    const enc = { enemyId: id, actIndex, faction: ENEMY_DB[id].faction, isBoss: ENEMY_DB[id].isBoss };
    const { combat } = createCombatState(run, enc, rng);
    if (id === 'fire_twin') assert.equal(combat.enemies.length, 2, 'Fire Twins must spawn 2 independent units');
    for (let t = 0; t < 2 && !combat.finished; t++) {
      for (const c of [...combat.hand]) {
        const target = combat.enemies.find(e => e.alive)?.uid || null;
        if (canPlayCard(combat, c, target).ok) {
          const r = playCard(combat, c.uid, target, rng);
          if (r.pendingChoice) resolvePendingChoice(combat, r.pendingChoice.options[0].id, rng);
        }
      }
      if (!combat.finished) endPlayerTurn(combat, rng);
    }
  }
}

// 2. Verify all 5 classes' active skills, pendingChoice flows, Campfire (Scheme B), and JSON Save
for (const charId of Object.keys(CHARACTERS)) {
  const run = createNewRun(charId, 20261125);
  assert.equal(run.nodes.length, 17, '3-Act route must have 9 battles + 8 campfires = 17 nodes');
  assert.deepEqual(deserializeRun(serializeRun(run)), run);

  const rng = createRng(777);
  const { combat } = createCombatState(run, run.nodes[0], rng);
  // Test active skill (for Yier lower enemy HP to 30% first)
  if (charId === 'yier') {
    combat.enemies[0].hp = Math.floor(combat.enemies[0].maxHp * 0.3);
  }
  const sk = useActiveSkill(combat, rng);
  assert.equal(sk.ok, true, `${charId} active skill failed: ${sk.reason}`);
  if (sk.pendingChoice) {
    const r1 = resolvePendingChoice(combat, sk.pendingChoice.options[0].id, rng);
    assert.equal(r1.ok, true);
    if (r1.pendingChoice) {
      const r2 = resolvePendingChoice(combat, r1.pendingChoice.options[0].id, rng);
      assert.equal(r2.ok, true);
    }
  }

  // Test Campfire upgrade flow
  combat.finished = 'victory';
  applyCombatVictory(run, combat);
  assert.equal(run.screen, 'map');
  enterCurrentMapNode(run);
  assert.equal(run.screen, 'campfire');
  if (charId === 'knight') {
    const offers = getKnightSparOffers(run);
    assert.equal(performKnightSparSwap(run, 0, offers[0]).ok, true);
  } else if (charId === 'chef') {
    const opts = getChefCookOptions(run);
    assert.ok(opts.length > 0);
    assert.equal(performChefCook(run, opts[0].deckIndex, opts[0].toId).ok, true);
  } else if (charId === 'teacher') {
    const opts = getTeacherUpgradeOptions(run);
    assert.ok(opts.length > 0);
    assert.equal(performTeacherUpgrade(run, opts[0].deckIndex, opts[0].toId).ok, true);
  } else if (charId === 'thief') {
    assert.equal(buyShopItem(run, 4).ok, true);
  } else if (charId === 'yier') {
    assert.equal(performCampfireRest(run).ok, true);
  }
}

console.log('ALL_36_ENEMIES_AND_5_CLASSES_OK!');
