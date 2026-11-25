// Pure DOM-free Combat Engine supporting all 5 Classes & all 36 Elemental Enemies

import { CHARACTERS } from '../data/characters.js';
import { CARD_DB, createCardInstance } from '../data/cards.js';
import { ENEMY_DB, FACTION_META } from '../data/enemies.js';
import { LOOT_RARITIES, rollLootCard } from '../data/loot.js';
import { shuffleInPlace } from './rng.js';
import { getPowerStacks, setPower, removePower } from './powers.js';

let enemyUidSeq = 1;

// Promoted Nightmare-tier Standard Difficulty (strictly Math.floor integers, zero decimals)
const DIFFICULTY_SCALE = {
  subHp: 1.62,   // 1.35 * 1.20
  subDmg: 1.44,  // 1.25 * 1.15
  bossHp: 1.86,  // 1.55 * 1.20
  bossDmg: 1.61  // 1.40 * 1.15
};

function scaleEnemyHp(spec, actIndex) {
  const mult = spec.isBoss ? DIFFICULTY_SCALE.bossHp : DIFFICULTY_SCALE.subHp;
  const raw = Math.max(1, Math.floor(spec.hpByAct[actIndex] * mult));
  // Keep Tree's 10-HP segment bar cleanly divisible by 10
  if (spec.id === 'w_tree') return Math.max(10, Math.floor(raw / 10) * 10);
  return raw;
}

function scaleEnemyPattern(spec, actIndex) {
  const mult = spec.isBoss ? DIFFICULTY_SCALE.bossDmg : DIFFICULTY_SCALE.subDmg;
  return spec.patternByAct(actIndex).map(step => {
    if (!step || typeof step.dmg !== 'number' || step.dmg <= 0) return { ...step };
    return { ...step, dmg: Math.max(1, Math.floor(step.dmg * mult)) };
  });
}

function makeEnemyUnit(spec, actIndex = 0, overrides = {}) {
  const maxHp = overrides.maxHp != null ? Math.floor(overrides.maxHp) : scaleEnemyHp(spec, actIndex);
  const pattern = scaleEnemyPattern(spec, actIndex);
  const unit = {
    uid: `e_${enemyUidSeq++}`,
    id: spec.id,
    name: overrides.name ?? spec.name,
    faction: spec.faction,
    flavor: spec.flavor,
    isBoss: !!spec.isBoss,
    actIndex,
    formKey: overrides.formKey ?? null,
    hp: overrides.hp ?? maxHp,
    maxHp,
    block: overrides.block ?? (spec.startArmorByAct?.[actIndex] || 0),
    pattern,
    patternIndex: overrides.patternIndex ?? 0,
    intent: null,
    powers: (overrides.powers ?? spec.powersByAct(actIndex)).map(p => ({ ...p })),
    tideDmgAccum: 0,
    arrowDmgAccum: 0,
    chargeReduction: 0,
    mirrorNextDmg: null,
    hitsTakenThisTurn: 0,
    hpDmgTakenThisTurn: 0,
    lootPoolLeft: spec.isBoss ? 4 : 3,
    redDropped: false,
    interruptedThisTurn: false,
    alive: true
  };
  unit.intent = computeIntent(unit, 1, null);
  return unit;
}

export function computeIntent(enemy, turn, combat) {
  if (!enemy.alive) return { type: 'dead', label: '已击败', dmg: 0, hits: 0 };
  if (enemy.interruptedThisTurn) {
    return { type: 'stunned', label: '行动打断', dmg: 0, hits: 0 };
  }
  if (enemy.id === 'w_watery' && getPowerStacks(enemy, 'water_tide') >= 6) {
    const tDmg = Math.max(1, Math.floor(([6, 7, 8][enemy.actIndex] || 6) * DIFFICULTY_SCALE.bossDmg));
    return { type: 'tsunami', label: '海啸狂潮', dmg: tDmg, hits: 2 };
  }

  const step = enemy.pattern[enemy.patternIndex % enemy.pattern.length];
  if (['split', 'charge', 'exhausted', 'high_fly', 'defend'].includes(step.type)) {
    return { type: step.type, label: step.label, dmg: 0, hits: 0, block: step.block || 0 };
  }

  let baseDmg = step.dmg || 0;
  if (step.type === 'armor_slam') baseDmg = Math.max(2, enemy.block || baseDmg);
  if (enemy.mirrorNextDmg !== null && enemy.id === 'earth_mirror') {
    baseDmg = enemy.mirrorNextDmg;
  }
  if (enemy.id === 'fire_power' && step.label === '泰山压顶') {
    const minSmash = [3, 4, 5][enemy.actIndex] || 3;
    baseDmg = Math.max(minSmash, baseDmg - enemy.chargeReduction);
  }

  // Strength, Shot Lock, Scales, Fire Overheat, Fight Frenzy, Earth Terrain, Voice Echo
  baseDmg += getPowerStacks(enemy, 'strength');
  baseDmg += getPowerStacks(enemy, 'shot_lock');
  if (combat) {
    if (getPowerStacks(enemy, 'scales_tax') > 0) baseDmg += combat.cardsPlayedThisTurn;
    if (getPowerStacks(enemy, 'voice_echo') > 0) baseDmg += combat.voiceDupCount * 2;
    if (getPowerStacks(enemy, 'fire_overheat') > 0 && combat.cardsPlayedThisTurn > 0 && combat.cardsPlayedThisTurn <= 3) {
      baseDmg += combat.cardsPlayedThisTurn;
    }
    if (getPowerStacks(enemy, 'fight_frenzy') > 0 && enemy.hp <= enemy.maxHp * 0.5) {
      baseDmg += 2;
    }
    if (getPowerStacks(enemy, 'earth_terrain') > 0) {
      baseDmg += (turn % 2 === 1 ? -2 : 2);
    }
  }

  const weak = getPowerStacks(enemy, 'weak_atk');
  let dmg = Math.max(0, baseDmg - weak);
  if (combat && getPowerStacks(enemy, 'fire_overheat') > 0 && combat.cardsPlayedThisTurn >= 4) {
    dmg = Math.floor(dmg / 2);
  }

  let hits = step.hits || 0;
  if (getPowerStacks(enemy, 'arrow_step') > 0 && hits > 1) {
    const stepAmt = getPowerStacks(enemy, 'arrow_step');
    const cuts = Math.floor(enemy.arrowDmgAccum / stepAmt);
    hits = Math.max(1, hits - cuts);
  }

  return {
    type: step.type,
    label: step.label,
    dmg,
    hits,
    block: step.block || 0,
    gainStr: step.gainStr || 0
  };
}

function hasEnemyPower(combat, powerId) {
  return combat.enemies.some(e => e.alive && getPowerStacks(e, powerId) > 0);
}

function getEnemyPowerStacks(combat, powerId) {
  const e = combat.enemies.find(u => u.alive && getPowerStacks(u, powerId) > 0);
  return e ? getPowerStacks(e, powerId) : 0;
}

export function createCombatState(runState, encounter, rng) {
  const ch = CHARACTERS[runState.charId];
  const enemySpec = ENEMY_DB[encounter.enemyId];
  const actIndex = encounter.actIndex || 0;
  const drawPile = runState.deck.map(id => createCardInstance(id));
  shuffleInPlace(drawPile, rng);

  const hero = {
    id: ch.id,
    name: ch.name,
    hp: runState.hp,
    maxHp: runState.maxHp,
    block: 0,
    powers: []
  };
  if (ch.id === 'knight') setPower(hero, 'stance_defense', 1);

  const enemies = enemySpec.isTwin
    ? [
        makeEnemyUnit(enemySpec, actIndex, { name: '双·赤焰（左）', formKey: 'twin_l' }),
        makeEnemyUnit(enemySpec, actIndex, { name: '双·赤焰（右）', formKey: 'twin_r' })
      ]
    : [makeEnemyUnit(enemySpec, actIndex)];

  const combat = {
    encounter,
    actIndex,
    turn: 1,
    maxEnergy: 3,
    energy: 3,
    nextTurnEnergyPenalty: 0,
    nextTurnDrawPenalty: 0,
    hero,
    enemies,
    drawPile,
    hand: [],
    discardPile: [],
    exhaustPile: [],
    hiddenCard: null, // Wind Move subspace card
    retainedUid: null,
    activeUsedThisTurn: false,
    knightClashCount: 0,
    cardsPlayedThisTurn: 0,
    playedNamesThisTurn: new Set(),
    voiceDupCount: 0,
    maxSingleDirectHitThisTurn: 0,
    teacherTrack: { red: 0, blue: 0, yellow: 0 },
    yierBlankSeals: runState.yierBlankSeals ?? 2,
    sealedClowCardId: null,
    pendingChoice: null,
    finished: null,
    stolenLootIds: []
  };

  const events = [];
  startPlayerTurnInternal(combat, rng, events, true);
  return { combat, events };
}

function startPlayerTurnInternal(combat, rng, events, isFirst) {
  // Energy rules (Dash 4, Loop 2<->4, Freeze penalty)
  let baseE = 3;
  if (hasEnemyPower(combat, 'dash_turbo')) baseE = 4;
  else if (hasEnemyPower(combat, 'loop_energy')) baseE = combat.turn % 2 === 1 ? 2 : 4;
  combat.maxEnergy = baseE;
  combat.energy = Math.max(1, baseE - combat.nextTurnEnergyPenalty);
  combat.nextTurnEnergyPenalty = 0;

  combat.hero.block = 0;
  combat.activeUsedThisTurn = false;
  combat.knightClashCount = 0;
  combat.cardsPlayedThisTurn = 0;
  combat.playedNamesThisTurn = new Set();
  combat.voiceDupCount = 0;
  combat.maxSingleDirectHitThisTurn = 0;

  removePower(combat.hero, 'evade_all');
  removePower(combat.hero, 'next_double');
  removePower(combat.hero, 'bitter_suppress');
  removePower(combat.hero, 'match_boost');
  events.push({ type: 'HERO_BUFF_SYNC', evade: false, doubleNext: false, bitter: false, salt: getPowerStacks(combat.hero, 'salty_preserve') });

  for (const e of combat.enemies.filter(u => u.alive)) {
    e.hitsTakenThisTurn = 0;
    e.hpDmgTakenThisTurn = 0;
    e.arrowDmgAccum = 0;
    e.intent = computeIntent(e, combat.turn, combat);
  }

  events.push({ type: 'TURN_BANNER', side: 'player', turn: combat.turn, text: `第 ${combat.turn} 回合 · 玩家行动` });

  // Draw rules (Dash 5, Maze 3, Float 4 then 2, Wave penalty)
  let drawCount = 4;
  if (hasEnemyPower(combat, 'dash_turbo')) drawCount = 5;
  else if (hasEnemyPower(combat, 'maze_draw')) drawCount = 3;
  else if (hasEnemyPower(combat, 'float_zero_g') && !isFirst) drawCount = 2;
  drawCount = Math.max(1, drawCount - combat.nextTurnDrawPenalty);
  combat.nextTurnDrawPenalty = 0;

  drawCardsInternal(combat, drawCount, rng, events);

  // Flower Petal injection at turn start
  if (hasEnemyPower(combat, 'flower_petal') && combat.hand.length < 10) {
    combat.hand.push(createCardInstance('status_petal'));
    events.push({ type: 'STATUS_TRIGGER', target: 'enemies', tone: 'rose', text: '🌸 【花】飘落 1 张 0 费虚无【花瓣】' });
  }

  // Wind Move subspace hide
  if (hasEnemyPower(combat, 'move_hide') && combat.hand.length > 1) {
    const idx = Math.floor(rng() * combat.hand.length);
    combat.hiddenCard = combat.hand.splice(idx, 1)[0];
    const req = getEnemyPowerStacks(combat, 'move_hide');
    events.push({ type: 'STATUS_TRIGGER', target: 'enemies', tone: 'sky', text: `🌌 【移】藏起了【${combat.hiddenCard.name}】！（本回合打满 ${req} 血伤夺回）` });
  }

  // Wind Song +1 random cost
  if (hasEnemyPower(combat, 'song_tax') && combat.hand.length) {
    const pick = combat.hand[Math.floor(rng() * combat.hand.length)];
    pick.tempCost = (pick.tempCost ?? pick.cost) + 1;
    events.push({ type: 'STATUS_TRIGGER', target: 'enemies', tone: 'amber', text: `🎵 【歌】令【${pick.name}】本回合费用 +1` });
  }

  // Wind Sovereign shuffle costs 0-2
  if (hasEnemyPower(combat, 'wind_shuffle_cost') && combat.hand.length >= 2) {
    const costs = combat.hand.map(() => Math.floor(rng() * 3));
    costs[0] = 0;
    costs[costs.length - 1] = 2;
    shuffleInPlace(costs, rng);
    combat.hand.forEach((c, i) => { c.tempCost = costs[i]; });
    events.push({ type: 'STATUS_TRIGGER', target: 'enemies', tone: 'sky', text: '🎐 【风】乱流洗牌：手牌费用随机洗为 0–2 费！' });
  }
}

export function canPlayCard(combat, card, targetEnemyUid = null) {
  if (combat.finished) return { ok: false, reason: '战斗已结束' };
  if (combat.pendingChoice) return { ok: false, reason: '请先完成当前选择' };

  // Earth Lock: edge-only hand
  if (hasEnemyPower(combat, 'lock_edges') && combat.hand.length > 2) {
    const idx = combat.hand.findIndex(c => c.uid === card.uid);
    if (idx > 0 && idx < combat.hand.length - 1) {
      return { ok: false, reason: '【錠】铁链封锁：仅可打最左或最右两端的牌' };
    }
  }

  if (card.bubbleWrapped) {
    if (combat.energy < 1) return { ok: false, reason: '需要 1 费戳破泡泡膜' };
    return { ok: true, isBubblePop: true };
  }

  const cost = card.tempCost !== null ? card.tempCost : card.cost;
  if (combat.energy < cost) return { ok: false, reason: '费用不足' };

  if (combat.hero.id === 'knight') {
    const inDef = getPowerStacks(combat.hero, 'stance_defense') > 0;
    if (inDef && card.type === 'offense') return { ok: false, reason: '防御形态不可用进攻牌' };
    if (!inDef && card.type === 'defense') return { ok: false, reason: '进攻形态不可用防御牌' };
  }

  if (card.target === 'enemy') {
    const alive = combat.enemies.filter(e => e.alive);
    if (!alive.length) return { ok: false, reason: '没有可攻击的目标' };
    if (targetEnemyUid && !alive.some(e => e.uid === targetEnemyUid)) {
      return { ok: false, reason: '目标已离场' };
    }
  }
  return { ok: true, isBubblePop: false };
}

function drawCardsInternal(combat, count, rng, events) {
  let drawn = 0;
  for (let i = 0; i < count; i++) {
    if (combat.hand.length >= 10) break;
    if (!combat.drawPile.length) {
      if (!combat.discardPile.length) break;
      combat.drawPile.push(...combat.discardPile.splice(0));
      shuffleInPlace(combat.drawPile, rng);
    }
    const card = combat.drawPile.pop();
    if (card) {
      combat.hand.push(card);
      drawn++;
    }
  }
  if (drawn > 0) events.push({ type: 'CARDS_DRAWN', count: drawn });
}

function dealDamageToEnemy(combat, enemy, rawDmg, { pierce = false, element = 'physical', isDirect = true, tier = null, rng }, events) {
  if (!enemy.alive || rawDmg <= 0) return { hpLoss: 0 };

  let dmg = rawDmg;
  if (isDirect) {
    enemy.hitsTakenThisTurn++;
    if (getPowerStacks(enemy, 'sand_dampen') > 0 && enemy.hitsTakenThisTurn === 1) {
      dmg = Math.floor(dmg / 2);
    }
    if (getPowerStacks(enemy, 'sword_first_vuln') > 0 && enemy.hitsTakenThisTurn === 1) {
      dmg = Math.floor(dmg * 1.5);
    }
    if (getPowerStacks(enemy, 'shield_reduce') > 0 && enemy.block > 0 && !pierce) {
      dmg = Math.max(1, dmg - 1);
    }
    if (getPowerStacks(enemy, 'earth_terrain') > 0) {
      dmg = Math.max(1, dmg + (combat.turn % 2 === 1 ? -2 : 2));
    }
    if (getPowerStacks(enemy, 'fight_frenzy') > 0 && enemy.hp <= enemy.maxHp * 0.5) {
      dmg += 2;
    }
    if (getPowerStacks(enemy, 'power_inertia') > 0 && enemy.intent?.type === 'exhausted') {
      dmg = Math.floor(dmg * 1.5);
    }
    if (getPowerStacks(enemy, 'fly_altitude') > 0) {
      if (enemy.intent?.type === 'high_fly') dmg = Math.floor(dmg / 2);
      else dmg += 2;
    }
    if (getPowerStacks(enemy, 'jump_parity') > 0) {
      dmg = enemy.hitsTakenThisTurn % 2 === 1 ? Math.max(1, dmg - 1) : dmg + 2;
    }
    if (getPowerStacks(enemy, 'stranded') > 0) {
      dmg = Math.floor(dmg * 1.3);
    }
    if (dmg > combat.maxSingleDirectHitThisTurn) {
      combat.maxSingleDirectHitThisTurn = dmg;
    }
  }

  const prevHp = enemy.hp;
  const hadBlock = enemy.block > 0;
  let blocked = 0;
  let hpLoss = 0;

  if (pierce) {
    hpLoss = Math.min(enemy.hp, dmg);
    enemy.hp -= hpLoss;
  } else {
    blocked = Math.min(enemy.block, dmg);
    enemy.block -= blocked;
    const remain = dmg - blocked;
    hpLoss = Math.min(enemy.hp, remain);
    enemy.hp -= hpLoss;
  }

  enemy.hpDmgTakenThisTurn += hpLoss;
  enemy.arrowDmgAccum += hpLoss;

  const resolvedTier = tier || (pierce || dmg >= 8 ? 'heavy' : 'light');
  events.push({ type: 'VFX_BURST', target: enemy.uid, element: pierce ? 'pierce' : element, tier: resolvedTier });
  events.push({ type: 'DAMAGE_HIT', target: enemy.uid, dmg: hpLoss, blocked, pierce, tier: resolvedTier, hpAfter: enemy.hp, blockAfter: enemy.block });

  // Armor break + Bubbles wrap
  if (hadBlock && enemy.block <= 0) {
    events.push({ type: 'ARMOR_BREAK', target: enemy.uid });
    const bubbleCap = getPowerStacks(enemy, 'bubble_armor');
    if (bubbleCap > 0) {
      const allCards = [...combat.hand, ...combat.drawPile, ...combat.discardPile];
      const wrappedCount = allCards.filter(c => c.bubbleWrapped).length;
      const candidates = allCards.filter(c => !c.bubbleWrapped);
      if (wrappedCount < bubbleCap && candidates.length) {
        const picked = candidates[Math.floor(rng() * candidates.length)];
        picked.bubbleWrapped = true;
        events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'sky', text: `🫧 泡泡破膜！【${picked.name}】裹上泡泡膜（1 费戳破）` });
      }
    }
  }

  // Wood 10-HP segment break
  if (getPowerStacks(enemy, 'wood_segment') > 0 && hpLoss > 0 && enemy.alive) {
    const prevSeg = Math.ceil(prevHp / 10);
    const curSeg = Math.ceil(enemy.hp / 10);
    const broken = Math.max(0, prevSeg - curSeg);
    if (broken > 0) {
      setPower(enemy, 'weak_atk', getPowerStacks(enemy, 'weak_atk') + broken * 2);
      enemy.intent = computeIntent(enemy, combat.turn, combat);
      events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'emerald', text: `🌿 斩断 ${broken} 段树干！本回合攻击 -${broken * 2}！` });
    }
  }

  // Fire Power T1 charge dmg reduction
  if (getPowerStacks(enemy, 'power_inertia') > 0 && enemy.intent?.type === 'charge' && hpLoss > 0) {
    enemy.chargeReduction += Math.floor(hpLoss / 2);
  }

  // Wind Move rescue check
  if (combat.hiddenCard && hasEnemyPower(combat, 'move_hide')) {
    const req = getEnemyPowerStacks(combat, 'move_hide');
    const totalHpDmg = combat.enemies.reduce((s, u) => s + u.hpDmgTakenThisTurn, 0);
    if (totalHpDmg >= req) {
      const rescued = combat.hiddenCard;
      combat.hiddenCard = null;
      combat.hand.push(rescued);
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'emerald', text: `🌌 破界夺回【${rescued.name}】！` });
    }
  }

  // Water Sovereign Tide drop
  if (enemy.id === 'w_watery' && hpLoss > 0 && enemy.alive) {
    enemy.tideDmgAccum += hpLoss;
    const drops = Math.floor(enemy.tideDmgAccum / 5);
    if (drops > 0) {
      enemy.tideDmgAccum %= 5;
      const prevTide = getPowerStacks(enemy, 'water_tide');
      const nextTide = Math.max(0, prevTide - drops);
      setPower(enemy, 'water_tide', nextTide);
      if (prevTide > 0 && nextTide === 0) {
        setPower(enemy, 'stranded', 2);
        enemy.interruptedThisTurn = true;
        enemy.intent = computeIntent(enemy, combat.turn, combat);
        events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'sky', text: '💧 潮汐归零！【水】搁浅打断行动，受伤 +30%！' });
      }
    }
  }

  // Recompute intent live for Arrow / Fight
  if (enemy.alive) {
    enemy.intent = computeIntent(enemy, combat.turn, combat);
  }

  // Death check
  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.alive = false;
    events.push({ type: 'ENEMY_DEFEATED', target: enemy.uid, name: enemy.name });

    if (enemy.id === 'w_cloud') {
      const survivors = combat.enemies.filter(e => e.alive && e.id === 'w_cloud');
      const healAmt = getPowerStacks(enemy, 'cloud_split') || 2;
      if (survivors.length) {
        for (const s of survivors) {
          const h = Math.min(healAmt, s.maxHp - s.hp);
          if (h > 0) {
            s.hp += h;
            events.push({ type: 'HEAL', target: s.uid, amount: h, hpAfter: s.hp });
          }
        }
        events.push({ type: 'STATUS_TRIGGER', target: survivors[0].uid, tone: 'sky', text: `☁️ 云雾聚散：其余云团回复 ${healAmt} 生命！` });
      }
    }
  }

  if (combat.enemies.every(e => !e.alive)) {
    combat.finished = 'victory';
    events.push({ type: 'BATTLE_END', result: 'victory' });
  }
  return { hpLoss };
}

function applyTeacherColor(combat, color, weight, targetEnemy, rng, events) {
  const track = combat.teacherTrack;
  const boost = getPowerStacks(combat.hero, 'match_boost');
  let targetColors = [];
  if (color === 'wild') {
    const maxV = Math.max(track.red, track.blue, track.yellow);
    if (maxV === 0) targetColors = ['red', 'blue', 'yellow'];
    else {
      const best = ['red', 'blue', 'yellow'].find(c => track[c] === maxV);
      targetColors = [best];
    }
  } else {
    targetColors = [color];
  }

  for (const col of targetColors) {
    track[col] += weight;
    while (track[col] >= 3 && !combat.finished) {
      track[col] -= 3;
      if (boost > 0) removePower(combat.hero, 'match_boost');
      if (col === 'red') {
        const d = 8 + boost;
        const foe = targetEnemy?.alive ? targetEnemy : combat.enemies.find(e => e.alive);
        events.push({ type: 'MATCH_THREE', color: 'red', target: foe?.uid || 'hero' });
        events.push({ type: 'STATUS_TRIGGER', target: foe?.uid || 'hero', tone: 'rose', text: `🔴 红×3 消除【重点轰炸】：造成 ${d} 伤！` });
        if (foe) dealDamageToEnemy(combat, foe, d, { element: 'fire', isDirect: true, tier: 'heavy', rng }, events);
      } else if (col === 'blue') {
        const wk = 6 + boost;
        for (const e of combat.enemies.filter(u => u.alive)) {
          setPower(e, 'weak_atk', getPowerStacks(e, 'weak_atk') + wk);
          e.intent = computeIntent(e, combat.turn, combat);
        }
        const h = Math.min(3, combat.hero.maxHp - combat.hero.hp);
        combat.hero.hp += h;
        if (h > 0) events.push({ type: 'HEAL', target: 'hero', amount: h, hpAfter: combat.hero.hp });
        events.push({ type: 'MATCH_THREE', color: 'blue', target: 'hero' });
        events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: `🔵 蓝×3 消除【模范课堂】：敌攻 -${wk} 并回 3 血！` });
      } else if (col === 'yellow') {
        combat.energy += 1;
        events.push({ type: 'MATCH_THREE', color: 'yellow', target: 'hero' });
        events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: '🟡 黄×3 消除【灵感迸发】：回 1 费并抽 2 牌！' });
        drawCardsInternal(combat, 2, rng, events);
      }
    }
  }
}

function resolveCardEffects(combat, card, targetEnemy, opts, rng, events) {
  const hero = combat.hero;
  const adjust = getPowerStacks(hero, 'adjust_next');
  const salt = getPowerStacks(hero, 'salty_preserve');
  const bitter = getPowerStacks(hero, 'bitter_suppress') > 0;
  let usedAdjust = false;
  let usedSalt = false;

  // Flower Petal buff
  if (card.petalBuffFlower) {
    for (const e of combat.enemies.filter(u => u.alive && u.id === 'earth_flower')) {
      setPower(e, 'strength', getPowerStacks(e, 'strength') + 1);
      e.intent = computeIntent(e, combat.turn, combat);
    }
    events.push({ type: 'STATUS_TRIGGER', target: 'enemies', tone: 'rose', text: '🌸 【花】吸收花瓣：永久 +1 力量！' });
  }

  // Chef self-damage
  if (card.selfDmg) {
    const loss = bitter ? Math.max(1, Math.floor(card.selfDmg / 2)) : card.selfDmg;
    hero.hp = Math.max(1, hero.hp - loss);
    events.push({ type: 'DAMAGE_HIT', target: 'hero', dmg: loss, blocked: 0, hpAfter: hero.hp, blockAfter: hero.block });
  }

  // Chef bitter / salty
  if (card.suppress) {
    setPower(hero, 'bitter_suppress', 1);
    events.push({ type: 'HERO_BUFF_SYNC', bitter: true });
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'emerald', text: '🍵 苦味压制：本回合自损与上火减半！' });
  }
  if (card.preserve) {
    setPower(hero, 'salty_preserve', card.preserve);
    events.push({ type: 'HERO_BUFF_SYNC', salt: card.preserve });
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: `🧂 咸味保鲜：下张牌正面效果 +${card.preserve}！` });
  }
  if (card.spicy && targetEnemy?.alive) {
    const sp = card.spicy + (salt > 0 ? 1 : 0);
    if (salt > 0) usedSalt = true;
    setPower(targetEnemy, 'spicy_burn', getPowerStacks(targetEnemy, 'spicy_burn') + sp);
    events.push({ type: 'VFX_BURST', target: targetEnemy.uid, element: 'fire' });
  }
  if (card.heat) {
    setPower(hero, 'self_heat', getPowerStacks(hero, 'self_heat') + card.heat);
  }

  // Knight stance switch
  if (card.switchStance && hero.id === 'knight') {
    const inDef = getPowerStacks(hero, 'stance_defense') > 0;
    if (inDef) {
      removePower(hero, 'stance_defense');
      setPower(hero, 'stance_offense', 1);
      events.push({ type: 'STANCE_CHANGE', stance: 'offense' });
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: '⚔️ 切入进攻形态：抽 1 张牌！' });
      drawCardsInternal(combat, 1, rng, events);
    } else {
      removePower(hero, 'stance_offense');
      setPower(hero, 'stance_defense', 1);
      hero.block += 2;
      events.push({ type: 'STANCE_CHANGE', stance: 'defense' });
      events.push({ type: 'BLOCK_GAIN', target: 'hero', amount: 2, blockAfter: hero.block });
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: '🛡️ 切入防御形态：获得 2 护甲！' });
    }
  }

  if (card.adjustMode && opts.adjustDelta) {
    setPower(hero, 'adjust_next', opts.adjustDelta);
    events.push({ type: 'ADJUST_STATE', delta: opts.adjustDelta });
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: `⚖️ 收力蓄势：下张牌 ${opts.adjustDelta > 0 ? '+' + opts.adjustDelta : opts.adjustDelta}` });
  }

  if (card.stripArmor && targetEnemy?.alive && targetEnemy.block > 0) {
    targetEnemy.block = 0;
    events.push({ type: 'ARMOR_BREAK', target: targetEnemy.uid });
  }

  if (card.interrupt && targetEnemy?.alive) {
    targetEnemy.interruptedThisTurn = true;
    targetEnemy.intent = computeIntent(targetEnemy, combat.turn, combat);
    events.push({ type: 'STATUS_TRIGGER', target: targetEnemy.uid, tone: 'amber', text: `⚡ 打断了【${targetEnemy.name}】本回合行动！` });
  }

  // Yier Star Mark & Consume
  if (card.starMark && targetEnemy?.alive) {
    const nextStar = getPowerStacks(targetEnemy, 'star_mark') + card.starMark;
    setPower(targetEnemy, 'star_mark', nextStar);
    events.push({ type: 'STAR_MARK_FX', target: targetEnemy.uid, stacks: nextStar });
  }
  if (card.consumeStar && targetEnemy?.alive) {
    const st = getPowerStacks(targetEnemy, 'star_mark');
    if (st > 0) {
      removePower(targetEnemy, 'star_mark');
      if (card.consumeStar === 'pierce') {
        events.push({ type: 'STAR_BURST', target: targetEnemy.uid, stacks: st });
        dealDamageToEnemy(combat, targetEnemy, st * 5, { pierce: true, element: 'pierce', tier: 'precision_break', rng }, events);
      } else if (card.consumeStar === 'lock') {
        events.push({ type: 'STAR_LOCK', target: targetEnemy.uid, stacks: st });
        hero.block += st * 3;
        events.push({ type: 'BLOCK_GAIN', target: 'hero', amount: st * 3, blockAfter: hero.block });
        if (st >= 2) {
          setPower(targetEnemy, 'weak_atk', getPowerStacks(targetEnemy, 'weak_atk') + 5);
          targetEnemy.intent = computeIntent(targetEnemy, combat.turn, combat);
          events.push({ type: 'STATUS_TRIGGER', target: targetEnemy.uid, tone: 'sky', text: '⛓️ 星锁压制：敌方攻击 -5！' });
        }
      }
    }
  }

  // Block / Heal / Energy / Evade / Double
  if (card.block) {
    const b = Math.max(0, card.block + adjust);
    if (adjust !== 0) usedAdjust = true;
    hero.block += b;
    events.push({ type: 'BLOCK_GAIN', target: 'hero', amount: b, blockAfter: hero.block });
  }
  if (card.heal) {
    const rawH = card.heal + salt;
    if (salt > 0) usedSalt = true;
    const h = Math.min(rawH, hero.maxHp - hero.hp);
    hero.hp += h;
    if (h > 0) events.push({ type: 'HEAL', target: 'hero', amount: h, hpAfter: hero.hp });
  }
  if (card.gainEnergy) {
    combat.energy += card.gainEnergy;
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: `⚡ 回复 ${card.gainEnergy} 点费用！` });
  }
  if (card.evadeAll) {
    setPower(hero, 'evade_all', 1);
    events.push({ type: 'HERO_BUFF_SYNC', evade: true });
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'emerald', text: '🌫️ 本回合闪避全部攻击！' });
  }
  if (card.nextDouble) {
    setPower(hero, 'next_double', 1);
    events.push({ type: 'HERO_BUFF_SYNC', doubleNext: true });
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'purple', text: '🧷 下张工具或赃物触发 2 次！' });
  }
  if (card.matchBoost) {
    setPower(hero, 'match_boost', getPowerStacks(hero, 'match_boost') + card.matchBoost);
  }
  if (card.weakenAtk) {
    for (const e of combat.enemies.filter(u => u.alive)) {
      setPower(e, 'weak_atk', getPowerStacks(e, 'weak_atk') + card.weakenAtk);
      e.intent = computeIntent(e, combat.turn, combat);
      events.push({ type: 'VFX_BURST', target: e.uid, element: 'water' });
    }
    events.push({ type: 'STATUS_TRIGGER', target: 'enemies', tone: 'sky', text: `⬇️ 敌方本回合单段攻击 -${card.weakenAtk}！` });
  }

  // Damage
  if (card.dmg && targetEnemy?.alive) {
    let base = Math.max(1, card.dmg + adjust + salt);
    if (adjust !== 0) usedAdjust = true;
    if (salt > 0) usedSalt = true;

    let isPrecision = false;
    if (hero.id === 'knight' && card.type === 'offense') {
      const foeAtk = targetEnemy.intent?.dmg || 0;
      if (foeAtk > 0 && base >= foeAtk) {
        base = Math.floor(base * 1.25);
        isPrecision = true;
        combat.knightClashCount++;
        const halfCut = Math.ceil(foeAtk / 2);
        setPower(targetEnemy, 'weak_atk', getPowerStacks(targetEnemy, 'weak_atk') + halfCut);
        targetEnemy.intent = computeIntent(targetEnemy, combat.turn, combat);
      } else {
        base = Math.max(1, Math.floor(base * 0.75));
      }
    }

    events.push({ type: 'ACTOR_LUNGE', actor: 'hero', target: targetEnemy.uid });
    const hits = card.hits || 1;
    for (let i = 0; i < hits; i++) {
      if (!targetEnemy.alive) break;
      const isBomb = ['th_powder', 'th_powder_pack', 'loot_b_bomb', 'loot_g_oil'].includes(card.id);
      if (isBomb) events.push({ type: 'BOMB_BLAST', target: targetEnemy.uid });
      const hitTier = isPrecision ? 'precision_break' : (isBomb || card.id === 'k_hslash' || card.pierce || base >= 8 ? 'heavy' : 'light');
      dealDamageToEnemy(combat, targetEnemy, base, {
        pierce: !!card.pierce,
        element: card.rarity === 'red' ? 'fire' : (card.flavor === 'sour' ? 'pierce' : 'physical'),
        tier: hitTier,
        rng
      }, events);
    }
    if (isPrecision) {
      events.push({ type: 'STATUS_TRIGGER', target: targetEnemy.uid, tone: 'amber', text: `⚔️ 精攻破防 ×${combat.knightClashCount}！伤 1.25× 且敌攻折半！` });
    }
  }

  // Thief Steal Loot
  if (card.stealLoot && targetEnemy) {
    if (targetEnemy.lootPoolLeft <= 0) {
      events.push({ type: 'STATUS_TRIGGER', target: targetEnemy.uid, tone: 'amber', text: '这只怪身上已经被搜刮干净了！' });
    } else {
      targetEnemy.lootPoolLeft--;
      const lootSpec = rollLootCard(targetEnemy.id, rng, {
        luck: !!card.stealLuck,
        isBoss: targetEnemy.isBoss,
        redDropped: targetEnemy.redDropped
      });
      if (lootSpec.rarity === 'red') targetEnemy.redDropped = true;
      const inst = createCardInstance(lootSpec.id);
      combat.drawPile.push(inst);
      shuffleInPlace(combat.drawPile, rng);
      combat.stolenLootIds.push(lootSpec.id);
      const rar = LOOT_RARITIES[lootSpec.rarity] || LOOT_RARITIES.white;
      events.push({ type: 'STEAL_ARC', from: targetEnemy.uid, rarity: lootSpec.rarity });
      events.push({
        type: 'LOOT_DROP',
        rarity: lootSpec.rarity,
        cardName: lootSpec.name,
        sellPrice: lootSpec.sellPrice,
        text: `${rar.icon} 摸出${rar.label}【${lootSpec.name}】（${lootSpec.sellPrice}金）`
      });
    }
  }

  if (card.draw) drawCardsInternal(combat, card.draw, rng, events);

  // Teacher Match-3 color progression
  const effColor = card.dyedColor || card.color;
  if (hero.id === 'teacher' && effColor && !combat.finished) {
    applyTeacherColor(combat, effColor, card.colorWeight || 1, targetEnemy, rng, events);
  }

  if (usedAdjust) { removePower(hero, 'adjust_next'); events.push({ type: 'ADJUST_STATE', delta: 0 }); }
  if (usedSalt) { removePower(hero, 'salty_preserve'); events.push({ type: 'HERO_BUFF_SYNC', salt: 0 }); }
}

export function playCard(combat, cardUid, targetEnemyUid, rng, opts = {}) {
  const idx = combat.hand.findIndex(c => c.uid === cardUid);
  if (idx === -1) return { ok: false, reason: '手牌中找不到该牌', events: [] };
  const card = combat.hand[idx];
  const check = canPlayCard(combat, card, targetEnemyUid);
  if (!check.ok) return { ok: false, reason: check.reason, events: [] };

  const events = [];
  if (check.isBubblePop) {
    combat.energy -= 1;
    card.bubbleWrapped = false;
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: `🫧 戳破了【${card.name}】的泡泡膜！` });
    return { ok: true, events };
  }

  if (card.adjustMode && !opts.adjustDelta) {
    combat.pendingChoice = {
      kind: 'knight_adjust',
      title: '收力微调',
      prompt: '选择下张牌的伤害或护甲修正值：',
      cardUid,
      targetEnemyUid,
      options: [
        { id: 'plus', label: '+1 强化', desc: '下张牌伤害或护甲 +1', value: 1 },
        { id: 'minus', label: '-1 降档', desc: '下张牌伤害或护甲 -1', value: -1 }
      ]
    };
    return { ok: true, pendingChoice: combat.pendingChoice, events: [] };
  }

  const cost = card.tempCost !== null ? card.tempCost : card.cost;
  combat.energy -= cost;
  combat.hand.splice(idx, 1);
  if (combat.retainedUid === card.uid) combat.retainedUid = null;

  combat.cardsPlayedThisTurn++;

  // Wind Voice duplicate check
  if (hasEnemyPower(combat, 'voice_echo')) {
    if (combat.playedNamesThisTurn.has(card.name)) {
      combat.voiceDupCount++;
      combat.hero.hp = Math.max(1, combat.hero.hp - 1);
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'rose', text: `🗣️ 回声反噬：同名牌【${card.name}】自损 1 血且敌攻 +2！` });
    }
    combat.playedNamesThisTurn.add(card.name);
  }

  const alive = combat.enemies.filter(e => e.alive);
  const targetEnemy = card.target === 'enemy'
    ? (alive.find(e => e.uid === targetEnemyUid) || alive[0])
    : alive[0];

  events.push({ type: 'CARD_PLAY', cardId: card.id, cardType: card.type, cardName: card.name, target: card.target === 'enemy' ? (targetEnemy?.uid || 'hero') : 'hero' });

  let triggers = 1;
  if ((card.type === 'tool' || card.type === 'loot') && getPowerStacks(combat.hero, 'next_double') > 0) {
    triggers = 2;
    removePower(combat.hero, 'next_double');
    events.push({ type: 'HERO_BUFF_SYNC', doubleNext: false });
    events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'purple', text: `🧷 暗扣连发！【${card.name}】触发 2 次！` });
  }

  for (let t = 0; t < triggers; t++) {
    if (combat.finished) break;
    resolveCardEffects(combat, card, targetEnemy, opts, rng, events);
  }

  // Pile routing
  card.dyedColor = null;
  if (card.consumable) {
    card.usesLeft = (card.usesLeft ?? 1) - 1;
    if (card.usesLeft <= 0) {
      combat.exhaustPile.push(card);
      if (card.type === 'loot') {
        const sIdx = combat.stolenLootIds.indexOf(card.id);
        if (sIdx !== -1) combat.stolenLootIds.splice(sIdx, 1);
      }
    } else {
      combat.discardPile.push(card);
    }
  } else {
    combat.discardPile.push(card);
  }

  if (!combat.finished) {
    // Earth Maze draw +1 every 2 cards
    if (hasEnemyPower(combat, 'maze_draw') && combat.cardsPlayedThisTurn % 2 === 0) {
      drawCardsInternal(combat, 1, rng, events);
    }
    // Wind Storm 2nd card sweep
    if (hasEnemyPower(combat, 'storm_sweep') && combat.cardsPlayedThisTurn === 2 && combat.hand.length > 0) {
      const cnt = combat.hand.length;
      combat.discardPile.push(...combat.hand.splice(0));
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: `🌪️ 【嵐】飓风吹飞 ${cnt} 张手牌并重抽！` });
      drawCardsInternal(combat, cnt, rng, events);
    }
    // Live intent updates for Scales / Fire Overheat / Voice
    for (const e of combat.enemies.filter(u => u.alive)) {
      e.intent = computeIntent(e, combat.turn, combat);
    }
  }

  return { ok: true, events };
}

export function useActiveSkill(combat, rng) {
  if (combat.finished || combat.pendingChoice) return { ok: false, reason: '当前不可发动主动技', events: [] };
  const ch = CHARACTERS[combat.hero.id];
  if (combat.activeUsedThisTurn) return { ok: false, reason: '本回合主动技已使用', events: [] };
  if (combat.energy < ch.activeSkillCost) return { ok: false, reason: '费用不足', events: [] };

  const events = [];

  if (ch.id === 'knight') {
    combat.energy -= ch.activeSkillCost;
    combat.activeUsedThisTurn = true;
    const inDef = getPowerStacks(combat.hero, 'stance_defense') > 0;
    if (inDef) {
      removePower(combat.hero, 'stance_defense');
      setPower(combat.hero, 'stance_offense', 1);
      events.push({ type: 'STANCE_CHANGE', stance: 'offense' });
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: '⚡ 换阵·进攻形态：抽 1 张牌！' });
      drawCardsInternal(combat, 1, rng, events);
    } else {
      removePower(combat.hero, 'stance_offense');
      setPower(combat.hero, 'stance_defense', 1);
      combat.hero.block += 2;
      events.push({ type: 'STANCE_CHANGE', stance: 'defense' });
      events.push({ type: 'BLOCK_GAIN', target: 'hero', amount: 2, blockAfter: combat.hero.block });
      events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: '⚡ 换阵·防御形态：获得 2 护甲！' });
    }
    return { ok: true, events };
  }

  if (ch.id === 'thief') {
    const consumables = combat.drawPile.filter(c => c.consumable);
    if (!consumables.length) return { ok: false, reason: '抽牌堆里没有消耗牌/赃物', events: [] };
    const choices = consumables.slice(-3).reverse();
    combat.pendingChoice = {
      kind: 'thief_flip_bag',
      title: '翻包检索',
      prompt: '从抽牌堆挑选 1 张工具或赃物入手（消耗 1 费）：',
      options: choices.map(c => ({ id: c.uid, label: c.name, desc: c.desc }))
    };
    return { ok: true, pendingChoice: combat.pendingChoice, events: [] };
  }

  if (ch.id === 'chef') {
    if (!combat.hand.length || !(combat.drawPile.length || combat.discardPile.length)) {
      return { ok: false, reason: '需要手牌与可抽牌堆', events: [] };
    }
    combat.pendingChoice = {
      kind: 'chef_fire_ctrl',
      title: '控火调序',
      prompt: '选 1 张手牌放回牌库顶并另抽 1 张（消耗 1 费）：',
      options: combat.hand.map(c => ({ id: c.uid, label: c.name, desc: c.desc }))
    };
    return { ok: true, pendingChoice: combat.pendingChoice, events: [] };
  }

  if (ch.id === 'teacher') {
    const dyeable = combat.hand.filter(c => c.color && c.color !== 'wild');
    if (!dyeable.length) return { ok: false, reason: '手牌里没有可改色的色块牌', events: [] };
    combat.pendingChoice = {
      kind: 'teacher_dye_card',
      title: '彩色粉笔（0 费）',
      prompt: '选 1 张手牌进行改色：',
      options: dyeable.map(c => ({ id: c.uid, label: c.name, desc: c.desc }))
    };
    return { ok: true, pendingChoice: combat.pendingChoice, events: [] };
  }

  if (ch.id === 'yier') {
    if (combat.yierBlankSeals <= 0) return { ok: false, reason: '没有剩余空白封印卡（可在营地解封旧牌）', events: [] };
    const sealable = combat.enemies.find(e => e.alive && e.hp <= Math.ceil(e.maxHp * 0.4));
    if (!sealable) return { ok: false, reason: '需将敌方生命压至 ≤ 40% 才能发动魔杖封印！', events: [] };
    combat.energy -= ch.activeSkillCost;
    combat.activeUsedThisTurn = true;
    combat.yierBlankSeals--;
    sealable.hp = 0;
    sealable.alive = false;
    const clowId = FACTION_META[sealable.faction]?.clowCard || 'clow_water';
    combat.sealedClowCardId = clowId;
    events.push({ type: 'CLOW_SEAL', target: sealable.uid, faction: sealable.faction, cardName: CARD_DB[clowId].name });
    events.push({ type: 'STATUS_TRIGGER', target: sealable.uid, tone: 'purple', text: `🪄 封印成功！收服【${sealable.name}】，获得【${CARD_DB[clowId].name}】！` });
    events.push({ type: 'ENEMY_DEFEATED', target: sealable.uid, name: sealable.name });
    if (combat.enemies.every(e => !e.alive)) {
      combat.finished = 'victory';
      events.push({ type: 'BATTLE_END', result: 'victory' });
    }
    return { ok: true, events };
  }

  return { ok: false, reason: '未知职业主动技', events: [] };
}

export function resolvePendingChoice(combat, optionId, rng) {
  const pc = combat.pendingChoice;
  if (!pc) return { ok: false, reason: '无待处理选项', events: [] };
  combat.pendingChoice = null;

  if (pc.kind === 'knight_adjust') {
    const opt = pc.options.find(o => o.id === optionId);
    if (!opt) return { ok: false, reason: '无效选择', events: [] };
    return playCard(combat, pc.cardUid, pc.targetEnemyUid, rng, { adjustDelta: opt.value });
  }

  if (pc.kind === 'thief_flip_bag') {
    const idx = combat.drawPile.findIndex(c => c.uid === optionId);
    if (idx === -1) return { ok: false, reason: '未找到该牌', events: [] };
    combat.energy -= CHARACTERS.thief.activeSkillCost;
    combat.activeUsedThisTurn = true;
    const [picked] = combat.drawPile.splice(idx, 1);
    combat.hand.push(picked);
    return { ok: true, events: [{ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: `🎒 翻包摸出【${picked.name}】！` }] };
  }

  if (pc.kind === 'chef_fire_ctrl') {
    const idx = combat.hand.findIndex(c => c.uid === optionId);
    if (idx === -1) return { ok: false, reason: '未找到该牌', events: [] };
    combat.energy -= CHARACTERS.chef.activeSkillCost;
    combat.activeUsedThisTurn = true;
    const [picked] = combat.hand.splice(idx, 1);
    const events = [{ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: `🔥 控火：将【${picked.name}】留作下一抽并换牌！` }];
    drawCardsInternal(combat, 1, rng, events);
    combat.drawPile.push(picked);
    return { ok: true, events };
  }

  if (pc.kind === 'teacher_dye_card') {
    const card = combat.hand.find(c => c.uid === optionId);
    if (!card) return { ok: false, reason: '未找到该牌', events: [] };
    combat.pendingChoice = {
      kind: 'teacher_dye_color',
      title: `为【${card.name}】选择新颜色`,
      prompt: '本回合临时改染为目标颜色：',
      cardUid: card.uid,
      options: [
        { id: 'red', label: '🔴 染成红色', desc: '凑红×3 重点轰炸（8 伤）' },
        { id: 'blue', label: '🔵 染成蓝色', desc: '凑蓝×3 模范课堂（敌攻 -6 回 3 血）' },
        { id: 'yellow', label: '🟡 染成黄色', desc: '凑黄×3 灵感迸发（回 1 费抽 2 牌）' }
      ]
    };
    return { ok: true, pendingChoice: combat.pendingChoice, events: [] };
  }

  if (pc.kind === 'teacher_dye_color') {
    const card = combat.hand.find(c => c.uid === pc.cardUid);
    if (!card) return { ok: false, reason: '未找到该牌', events: [] };
    card.dyedColor = optionId;
    combat.activeUsedThisTurn = true;
    const labelMap = { red: '红色', blue: '蓝色', yellow: '黄色' };
    return { ok: true, events: [{ type: 'DYE_FLASH', color: optionId }, { type: 'STATUS_TRIGGER', target: 'hero', tone: 'sky', text: `🖍️ 已将【${card.name}】染为${labelMap[optionId]}！` }] };
  }

  return { ok: false, reason: '未知选择类型', events: [] };
}

export function setRetainCard(combat, cardUid) {
  if (!cardUid) { combat.retainedUid = null; return; }
  if (combat.hand.some(c => c.uid === cardUid)) combat.retainedUid = cardUid;
}

export function endPlayerTurn(combat, rng) {
  if (combat.finished || combat.pendingChoice) return { ok: false, events: [] };
  const events = [];

  const nonRetainedCount = combat.hand.filter(c => c.uid !== combat.retainedUid && !c.ethereal).length;
  const unspentEnergy = combat.energy;

  // Wind Move unrescued card discarded
  if (combat.hiddenCard) {
    combat.discardPile.push(combat.hiddenCard);
    combat.hiddenCard = null;
  }

  // Hand end-of-turn handling (Float zero-G retains all, Ethereal exhausts)
  const isFloat = hasEnemyPower(combat, 'float_zero_g');
  const kept = [];
  for (const c of combat.hand) {
    c.tempCost = null;
    c.dyedColor = null;
    if (c.ethereal) {
      combat.exhaustPile.push(c);
    } else if (isFloat || c.uid === combat.retainedUid) {
      c.retained = true;
      kept.push(c);
    } else {
      combat.discardPile.push(c);
    }
  }
  combat.hand = kept;
  combat.retainedUid = null;

  // Chef Spicy DoT on enemies & Self Heat on hero
  for (const e of combat.enemies.filter(u => u.alive)) {
    const sp = getPowerStacks(e, 'spicy_burn');
    if (sp > 0) {
      dealDamageToEnemy(combat, e, sp, { pierce: true, element: 'fire', isDirect: false, rng }, events);
      setPower(e, 'spicy_burn', Math.max(0, sp - 1));
    }
  }
  const heat = getPowerStacks(combat.hero, 'self_heat');
  if (heat > 0 && !combat.finished) {
    const bitter = getPowerStacks(combat.hero, 'bitter_suppress') > 0;
    const hDmg = bitter ? Math.floor(heat / 2) : heat;
    if (hDmg > 0) {
      combat.hero.hp = Math.max(0, combat.hero.hp - hDmg);
      events.push({ type: 'DAMAGE_HIT', target: 'hero', dmg: hDmg, blocked: 0, hpAfter: combat.hero.hp, blockAfter: combat.hero.block });
    }
    setPower(combat.hero, 'self_heat', Math.max(0, heat - 1));
    if (combat.hero.hp <= 0) {
      combat.finished = 'defeat';
      events.push({ type: 'BATTLE_END', result: 'defeat' });
      return { ok: true, events };
    }
  }
  if (combat.finished) return { ok: true, events };

  // End-of-player-turn enemy trait checks (Through, Thunder, Shot, Fire Overheat, Wood heal)
  for (const e of combat.enemies.filter(u => u.alive)) {
    if (getPowerStacks(e, 'through_empty') > 0) {
      if (nonRetainedCount === 0) {
        const cDmg = getPowerStacks(e, 'through_empty');
        events.push({ type: 'STATUS_TRIGGER', target: e.uid, tone: 'amber', text: `🌀 空手反穿！【抜】受到 ${cDmg} 反击伤！` });
        dealDamageToEnemy(combat, e, cDmg, { pierce: true, element: 'fire', isDirect: false, rng }, events);
      } else {
        setPower(e, 'strength', getPowerStacks(e, 'strength') + 0); // transient bonus handled below
        e._throughBonus = nonRetainedCount;
      }
    }
    if (getPowerStacks(e, 'thunder_ground') > 0 && unspentEnergy >= 1) {
      const refDmg = getPowerStacks(e, 'thunder_ground');
      e._thunderHalved = true;
      events.push({ type: 'STATUS_TRIGGER', target: e.uid, tone: 'amber', text: `⚡ 留费避雷：雷击减半并反震 ${refDmg} 伤！` });
      dealDamageToEnemy(combat, e, refDmg, { pierce: true, element: 'fire', isDirect: false, rng }, events);
    }
    if (getPowerStacks(e, 'shot_lock') > 0 && combat.cardsPlayedThisTurn >= 3) {
      setPower(e, 'shot_lock', 0);
      events.push({ type: 'STATUS_TRIGGER', target: e.uid, tone: 'emerald', text: '🎯 打出 ≥3 牌，清空【撃】全部锁定！' });
    }
    if (getPowerStacks(e, 'fire_overheat') > 0 && combat.cardsPlayedThisTurn >= 4) {
      const burn = getPowerStacks(e, 'fire_overheat');
      events.push({ type: 'STATUS_TRIGGER', target: e.uid, tone: 'amber', text: `🔥 扇风过载！【火】攻减半并自灼 ${burn} 血！` });
      dealDamageToEnemy(combat, e, burn, { pierce: true, element: 'fire', isDirect: false, rng }, events);
    }
    if (getPowerStacks(e, 'wood_segment') > 0 && e.alive) {
      const rem = e.hp % 10;
      if (rem !== 0) {
        const heal = 10 - rem;
        e.hp = Math.min(e.maxHp, e.hp + heal);
        events.push({ type: 'HEAL', target: e.uid, amount: heal, hpAfter: e.hp });
      }
    }
  }
  if (combat.finished) return { ok: true, events };

  events.push({ type: 'TURN_BANNER', side: 'enemy', turn: combat.turn, text: '敌方行动回合' });

  const actingEnemies = combat.enemies.filter(e => e.alive);
  for (const enemy of actingEnemies) {
    if (combat.finished || !enemy.alive) break;
    const intent = computeIntent(enemy, combat.turn, combat);

    if (intent.type === 'split' && enemy.id === 'w_cloud') {
      const currentClouds = combat.enemies.filter(e => e.alive && e.id === 'w_cloud');
      if (currentClouds.length < 4) {
        const nextTotal = currentClouds.length === 1 ? 2 : 4;
        const formKeys = nextTotal === 2 ? ['m1', 'm2'] : ['s1', 's2', 's3', 's4'];
        const newUnits = [];
        let fkIdx = 0;
        for (const cUnit of currentClouds) {
          const halfHp = Math.max(4, Math.ceil(cUnit.hp / 2));
          const halfMax = Math.max(4, Math.ceil(cUnit.maxHp / 2));
          for (let k = 0; k < 2; k++) {
            const formKey = formKeys[fkIdx++] || 's1';
            newUnits.push(makeEnemyUnit(ENEMY_DB.w_cloud, combat.actIndex, {
              name: nextTotal === 2 ? `中云分身 ${fkIdx}` : `小云灵 ${fkIdx}`,
              hp: halfHp, maxHp: halfMax, formKey, patternIndex: 1
            }));
          }
        }
        combat.enemies = newUnits;
        events.push({ type: 'ACTOR_FORM_CHANGE', enemyId: 'w_cloud', count: newUnits.length, text: `☁️ 云团分裂！化作 ${newUnits.length} 个独立目标！` });
        break;
      }
    }

    if (intent.type === 'stunned') {
      events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'sky', text: `⚡ 【${enemy.name}】行动被打断！` });
      enemy.interruptedThisTurn = false;
    } else {
      if (intent.block) {
        enemy.block += intent.block;
        events.push({ type: 'BLOCK_GAIN', target: enemy.uid, amount: intent.block, blockAfter: enemy.block });
      }
      if (intent.gainStr) {
        setPower(enemy, 'strength', getPowerStacks(enemy, 'strength') + intent.gainStr);
      }

      let finalAtk = intent.dmg + (enemy._throughBonus || 0);
      if (enemy._thunderHalved) finalAtk = Math.floor(finalAtk / 2);
      enemy._throughBonus = 0;
      enemy._thunderHalved = false;

      if (intent.hits > 0 && finalAtk > 0) {
        events.push({ type: 'ACTOR_LUNGE', actor: enemy.uid, target: 'hero' });
        if (getPowerStacks(combat.hero, 'evade_all') > 0) {
          events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'emerald', text: `💨 烟雾闪避了【${enemy.name}】全部攻击！` });
        } else {
          let totalBlocked = 0;
          let totalHpLoss = 0;
          for (let h = 0; h < intent.hits; h++) {
            const blk = Math.min(combat.hero.block, finalAtk);
            combat.hero.block -= blk;
            totalBlocked += blk;
            const rem = finalAtk - blk;
            const loss = Math.min(combat.hero.hp, rem);
            combat.hero.hp -= loss;
            totalHpLoss += loss;
            events.push({ type: 'VFX_BURST', target: 'hero', element: enemy.faction });
            events.push({ type: 'DAMAGE_HIT', target: 'hero', dmg: loss, blocked: blk, hpAfter: combat.hero.hp, blockAfter: combat.hero.block });
            if (combat.hero.hp <= 0) break;
          }

          if (totalHpLoss > 0) {
            if (getPowerStacks(enemy, 'wave_wash') > 0) {
              combat.nextTurnDrawPenalty = Math.max(combat.nextTurnDrawPenalty, 1);
              if (combat.hand.length) combat.discardPile.push(...combat.hand.splice(0));
              events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'sky', text: '🌊 海浪冲刷：留牌被冲走且下回合少抽 1 牌！' });
            }
            if (getPowerStacks(enemy, 'freeze_chill') > 0) {
              combat.nextTurnEnergyPenalty = Math.max(combat.nextTurnEnergyPenalty, 1);
              events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'sky', text: '🧊 冰寒冻结：下回合费用 -1！' });
            }
            if (enemy.id === 'fire_shot') {
              setPower(enemy, 'shot_lock', getPowerStacks(enemy, 'shot_lock') + 1);
            }
          }

          if (combat.hero.id === 'knight' && getPowerStacks(combat.hero, 'stance_defense') > 0 && totalHpLoss === 0 && totalBlocked > 0 && enemy.alive) {
            events.push({ type: 'PRECISION_GUARD', target: enemy.uid, counter: 5 });
            events.push({ type: 'STATUS_TRIGGER', target: 'hero', tone: 'amber', text: '🛡️ 精防反击！弹回 5 点伤害！' });
            events.push({ type: 'ACTOR_LUNGE', actor: 'hero', target: enemy.uid });
            dealDamageToEnemy(combat, enemy, 5, { element: 'physical', isDirect: false, tier: 'counter', rng }, events);
          }
        }

        if (intent.type === 'armor_slam') enemy.block = 0;
        if (enemy.id === 'w_watery' && enemy.alive) {
          if (intent.type === 'tsunami') {
            setPower(enemy, 'water_tide', 2);
            events.push({ type: 'STATUS_TRIGGER', target: enemy.uid, tone: 'sky', text: '🌊 海啸退潮，潮汐回落至 2/6' });
          } else {
            const nt = Math.min(6, getPowerStacks(enemy, 'water_tide') + 2);
            setPower(enemy, 'water_tide', nt);
          }
        }
      }
    }

    if (combat.hero.hp <= 0) {
      combat.hero.hp = 0;
      combat.finished = 'defeat';
      events.push({ type: 'BATTLE_END', result: 'defeat' });
      return { ok: true, events };
    }
    if (combat.finished) return { ok: true, events };

    // Snow drop at turn end
    if (getPowerStacks(enemy, 'snow_drop') > 0) {
      combat.discardPile.push(createCardInstance('status_snow'));
    }

    // Mirror copy for next turn
    if (getPowerStacks(enemy, 'mirror_copy') > 0) {
      const cap = getPowerStacks(enemy, 'mirror_copy');
      const minV = [3, 4, 5][combat.actIndex] || 3;
      enemy.mirrorNextDmg = Math.max(minV, Math.min(cap, combat.maxSingleDirectHitThisTurn || minV));
    }

    // Fire Power charge reset after T2 smash
    if (enemy.id === 'fire_power' && intent.label === '泰山压顶') enemy.chargeReduction = 0;

    enemy.patternIndex++;
    removePower(enemy, 'weak_atk');
    const st = getPowerStacks(enemy, 'stranded');
    if (st > 0) setPower(enemy, 'stranded', st - 1);
  }

  // Fire Twins revive check
  if (combat.enemies.length === 2 && combat.enemies[0].id === 'fire_twin') {
    const aliveTwins = combat.enemies.filter(e => e.alive);
    const deadTwins = combat.enemies.filter(e => !e.alive);
    if (aliveTwins.length === 1 && deadTwins.length === 1) {
      const revived = deadTwins[0];
      revived.alive = true;
      revived.hp = Math.ceil(revived.maxHp * 0.5);
      events.push({ type: 'ACTOR_FORM_CHANGE', enemyId: 'fire_twin', count: 2, text: '👯 双生共鸣：存活双子以半血复活了同伴！' });
    }
  }

  combat.turn++;
  startPlayerTurnInternal(combat, rng, events, false);
  return { ok: true, events };
}
