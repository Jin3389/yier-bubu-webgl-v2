// Headless 250-Run (50 x 5 Classes) 3-Act Balance Simulator running directly on DOM-free src/core/

import { CHARACTERS } from '../src/data/characters.js';
import {
  createNewRun, getCurrentNode, enterCurrentMapNode, startNodeCombat, applyCombatVictory,
  performCampfireRest, getKnightSparOffers, performKnightSparSwap,
  getChefCookOptions, performChefCook, getTeacherUpgradeOptions,
  performTeacherUpgrade, sellLootInShop, buyShopItem, advanceFromCampfire
} from '../src/core/run-engine.js';
import { playCard, useActiveSkill, resolvePendingChoice, endPlayerTurn, canPlayCard } from '../src/core/combat-engine.js';

const RUNS_PER_CLASS = 50;

function simulateRun(charId, seed) {
  const run = createNewRun(charId, seed);
  let battlesWon = 0;

  while (run.screen !== 'victory' && run.screen !== 'defeat') {
    if (run.screen === 'map') {
      enterCurrentMapNode(run);
      continue;
    }
    if (run.screen === 'combat') {
      const { combat, rng } = startNodeCombat(run);
      let guard = 0;
      while (!combat.finished && guard++ < 40) {
        // Use active skill opportunistically
        if (!combat.activeUsedThisTurn) {
          const sk = useActiveSkill(combat, rng);
          if (sk.ok && sk.pendingChoice) {
            const r1 = resolvePendingChoice(combat, sk.pendingChoice.options[0].id, rng);
            if (r1.pendingChoice) resolvePendingChoice(combat, r1.pendingChoice.options[0].id, rng);
          }
        }
        // Play playable cards
        let playedAny = true;
        while (playedAny && !combat.finished) {
          playedAny = false;
          const target = combat.enemies.find(e => e.alive)?.uid || null;
          for (const c of [...combat.hand]) {
            if (canPlayCard(combat, c, target).ok) {
              const r = playCard(combat, c.uid, target, rng);
              if (r.ok) {
                if (r.pendingChoice) resolvePendingChoice(combat, r.pendingChoice.options[0].id, rng);
                playedAny = true;
                break;
              }
            }
          }
        }
        if (!combat.finished) endPlayerTurn(combat, rng);
      }
      if (combat.finished === 'victory') {
        battlesWon++;
        applyCombatVictory(run, combat);
      } else {
        run.screen = 'defeat';
      }
    } else if (run.screen === 'campfire') {
      if (run.hp < run.maxHp * 0.55) {
        performCampfireRest(run);
      } else if (charId === 'knight') {
        const offers = getKnightSparOffers(run);
        performKnightSparSwap(run, 0, offers[0]);
      } else if (charId === 'chef') {
        const opts = getChefCookOptions(run);
        if (opts.length) performChefCook(run, opts[0].deckIndex, opts[0].toId);
        else performCampfireRest(run);
      } else if (charId === 'teacher') {
        const opts = getTeacherUpgradeOptions(run);
        if (opts.length) performTeacherUpgrade(run, opts[0].deckIndex, opts[0].toId);
        else performCampfireRest(run);
      } else if (charId === 'thief') {
        // Sell all loot and buy best affordable item
        for (let i = run.deck.length - 1; i >= 0; i--) sellLootInShop(run, i);
        for (let s = 0; s < run.shopStock.length; s++) buyShopItem(run, s);
        performCampfireRest(run);
      } else {
        performCampfireRest(run);
      }
      advanceFromCampfire(run);
    } else {
      break;
    }
  }

  return { win: run.screen === 'victory', battlesWon, finalDeck: run.deck.length };
}

console.log(`=== WebGL v2 Headless 3-Act Simulator (${RUNS_PER_CLASS} runs x 5 classes = ${RUNS_PER_CLASS * 5} runs) ===`);
for (const charId of Object.keys(CHARACTERS)) {
  let wins = 0, sumBattles = 0, sumDeck = 0;
  for (let i = 0; i < RUNS_PER_CLASS; i++) {
    const r = simulateRun(charId, 100000 + i * 37);
    if (r.win) wins++;
    sumBattles += r.battlesWon;
    sumDeck += r.finalDeck;
  }
  const rate = ((wins / RUNS_PER_CLASS) * 100).toFixed(1);
  console.log(`  ${charId.padEnd(8)} | Clear: ${rate.padStart(5)}% | Avg Battles: ${(sumBattles / RUNS_PER_CLASS).toFixed(2)}/9 | Final Deck: ${(sumDeck / RUNS_PER_CLASS).toFixed(1)}`);
}
