// Pure JSON RunState + Seed + 3-Act 9-Battle Route + All 5 Classes Campfire (Scheme B) & Shop Router

import { CHARACTERS } from '../data/characters.js';
import { CARD_DB, KNIGHT_SPAR_POOL, THIEF_SHOP_CATALOG, CHEF_DISH_MAP, TEACHER_UPGRADE_MAP } from '../data/cards.js';
import { generateThreeActRoute } from '../data/enemies.js';
import { createRng } from './rng.js';
import { createCombatState } from './combat-engine.js';

export const SAVE_KEY = 'yier_bubu_webgl_v2_run';

export function createNewRun(charId, seed = Math.floor(Math.random() * 1e9)) {
  const ch = CHARACTERS[charId];
  if (!ch) throw new Error(`Unknown character: ${charId}`);
  const routeRng = createRng(seed);
  const { factions, nodes } = generateThreeActRoute(routeRng);
  return {
    version: 2,
    seed,
    charId,
    hp: ch.maxHp,
    maxHp: ch.maxHp,
    gold: ch.startGold || 0,
    deck: [...ch.starterDeck],
    relics: ch.starterRelics.map(r => ({ ...r })),
    potions: [],
    yierBlankSeals: charId === 'yier' ? 2 : 0,
    factions,
    nodes,
    nodeIndex: 0,
    screen: 'map',
    campfireUsed: false,
    shopStock: []
  };
}

export function getCurrentNode(run) {
  return run.nodes?.[run.nodeIndex] || null;
}

export function enterCurrentMapNode(run) {
  const node = getCurrentNode(run);
  if (!node) {
    run.screen = 'victory';
    return run.screen;
  }
  if (node.type === 'campfire') {
    run.screen = 'campfire';
    run.campfireUsed = false;
    run.shopStock = THIEF_SHOP_CATALOG.map(id => ({
      cardId: id,
      price: CARD_DB[id].price || 20,
      sold: false
    }));
  } else {
    run.screen = 'combat';
  }
  return run.screen;
}

export function startNodeCombat(run) {
  const node = getCurrentNode(run);
  if (!node || node.type !== 'combat') throw new Error('Current node is not combat');
  const rng = createRng(run.seed + run.nodeIndex * 9973);
  const { combat, events } = createCombatState(run, node, rng);
  return { combat, events, rng };
}

export function applyCombatVictory(run, combat) {
  run.hp = Math.max(1, combat.hero.hp);
  if (run.charId === 'thief' && combat.stolenLootIds.length) {
    run.deck.push(...combat.stolenLootIds);
  }
  if (run.charId === 'yier') {
    run.yierBlankSeals = combat.yierBlankSeals;
    if (combat.sealedClowCardId) {
      run.deck.push(combat.sealedClowCardId);
    }
  }
  run.gold += combat.encounter.isBoss ? 38 : 20;
  run.nodeIndex++;

  const nextNode = getCurrentNode(run);
  run.screen = nextNode ? 'map' : 'victory';
  return run.screen;
}

export function performCampfireRest(run) {
  if (run.campfireUsed) return { ok: false, reason: '本次营地行动已完成' };
  const amount = run.charId === 'chef' ? 8 : 6;
  const healed = Math.min(amount, run.maxHp - run.hp);
  run.hp += healed;
  run.campfireUsed = true;
  return { ok: true, healed };
}

export function getKnightSparOffers(run) {
  const rng = createRng(run.seed + run.nodeIndex * 313);
  const pool = [...KNIGHT_SPAR_POOL];
  const offers = [];
  while (offers.length < 3 && pool.length) {
    offers.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
  }
  return offers;
}

export function performKnightSparSwap(run, removeDeckIndex, addCardId) {
  if (run.campfireUsed) return { ok: false, reason: '本次营地行动已完成' };
  if (removeDeckIndex < 0 || removeDeckIndex >= run.deck.length || !CARD_DB[addCardId]) {
    return { ok: false, reason: '无效选择' };
  }
  run.deck.splice(removeDeckIndex, 1, addCardId);
  run.campfireUsed = true;
  return { ok: true, addCardId };
}

export function getChefCookOptions(run) {
  const opts = [];
  const seen = new Set();
  run.deck.forEach((cid, idx) => {
    const target = CHEF_DISH_MAP[cid];
    if (target && !seen.has(cid)) {
      seen.add(cid);
      opts.push({ deckIndex: idx, fromId: cid, toId: target });
    }
  });
  return opts;
}

export function performChefCook(run, deckIndex, toId) {
  if (run.campfireUsed) return { ok: false, reason: '本次营地行动已完成' };
  if (!CARD_DB[toId] || deckIndex < 0 || deckIndex >= run.deck.length) return { ok: false, reason: '无效选择' };
  run.deck.splice(deckIndex, 1, toId);
  run.campfireUsed = true;
  return { ok: true, toId };
}

export function getTeacherUpgradeOptions(run) {
  const opts = [];
  const seen = new Set();
  run.deck.forEach((cid, idx) => {
    const target = TEACHER_UPGRADE_MAP[cid];
    if (target && !seen.has(cid)) {
      seen.add(cid);
      opts.push({ deckIndex: idx, fromId: cid, toId: target });
    }
  });
  return opts;
}

export function performTeacherUpgrade(run, deckIndex, toId) {
  if (run.campfireUsed) return { ok: false, reason: '本次营地行动已完成' };
  if (!CARD_DB[toId] || deckIndex < 0 || deckIndex >= run.deck.length) return { ok: false, reason: '无效选择' };
  run.deck.splice(deckIndex, 1, toId);
  run.campfireUsed = true;
  return { ok: true, toId };
}

export function getYierReleaseOptions(run) {
  return run.deck
    .map((cid, idx) => ({ deckIndex: idx, cardId: cid, spec: CARD_DB[cid] }))
    .filter(x => x.spec?.isClow);
}

export function performYierRelease(run, deckIndex) {
  if (run.campfireUsed) return { ok: false, reason: '本次营地行动已完成' };
  const cid = run.deck[deckIndex];
  if (!CARD_DB[cid]?.isClow) return { ok: false, reason: '只能解放库洛牌' };
  run.deck.splice(deckIndex, 1);
  run.yierBlankSeals++;
  run.campfireUsed = true;
  return { ok: true, cardId: cid };
}

export function sellLootInShop(run, deckIndex) {
  const cardId = run.deck[deckIndex];
  const spec = CARD_DB[cardId];
  if (!spec || spec.type !== 'loot') return { ok: false, reason: '只能出售赃物' };
  run.deck.splice(deckIndex, 1);
  run.gold += spec.sellPrice || 8;
  return { ok: true, cardName: spec.name, earned: spec.sellPrice || 8 };
}

export function buyShopItem(run, stockIndex) {
  const item = run.shopStock[stockIndex];
  if (!item || item.sold) return { ok: false, reason: '商品已售罄' };
  if (run.gold < item.price) return { ok: false, reason: '金币不足' };
  run.gold -= item.price;
  item.sold = true;
  run.deck.push(item.cardId);
  return { ok: true, cardId: item.cardId };
}

export function advanceFromCampfire(run) {
  run.nodeIndex++;
  const nextNode = getCurrentNode(run);
  run.screen = nextNode ? 'map' : 'victory';
  return run.screen;
}

export function serializeRun(run) {
  return JSON.stringify(run);
}

export function deserializeRun(jsonStr) {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.version === 2 && CHARACTERS[parsed.charId] && Array.isArray(parsed.nodes)) return parsed;
  } catch {
    return null;
  }
  return null;
}
