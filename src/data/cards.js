import { ALL_LOOT_CARDS } from './loot.js';

export const CARD_DB = {
  // === Knight ===
  k_hshield:     { id: 'k_hshield',     name: '重盾',     cost: 1, type: 'defense', target: 'self',  owner: 'knight', icon: '🛡️', block: 5, keywords: ['stance'], desc: '【防御牌】获得 5 护甲。' },
  k_rshield:     { id: 'k_rshield',     name: '圆盾',     cost: 1, type: 'defense', target: 'self',  owner: 'knight', icon: '🔰', block: 3, draw: 1, keywords: ['stance'], desc: '【防御牌】获得 3 护甲，抽 1 张牌。' },
  k_hslash:      { id: 'k_hslash',      name: '重斩',     cost: 1, type: 'offense', target: 'enemy', owner: 'knight', icon: '⚔️', dmg: 8, keywords: ['stance','precision'], desc: '【进攻牌】基伤 8（非破防 6 / 破防 10）。' },
  k_lthrust:     { id: 'k_lthrust',     name: '轻刺',     cost: 1, type: 'offense', target: 'enemy', owner: 'knight', icon: '🗡️', dmg: 4, keywords: ['stance','precision'], desc: '【进攻牌】基伤 4（非破防 3 / 破防 5）。' },
  k_shift:       { id: 'k_shift',       name: '变阵',     cost: 0, type: 'effect',  target: 'self',  owner: 'knight', icon: '⚡', switchStance: true, keywords: ['stance'], desc: '【效果牌】免费切换形态并触发切入收益。' },
  k_adjust:      { id: 'k_adjust',      name: '收力',     cost: 0, type: 'effect',  target: 'self',  owner: 'knight', icon: '⚖️', adjustMode: 1, draw: 1, keywords: ['precision'], desc: '【效果牌】选择下张牌伤害或护甲 +1 / -1，抽 1 牌。' },
  k_parry_guard: { id: 'k_parry_guard', name: '微调小盾', cost: 0, type: 'defense', target: 'self',  owner: 'knight', icon: '🛡️', block: 2, keywords: ['stance'], desc: '【防御牌】0 费获得 2 护甲（精准拼甲件）。' },
  k_twin_blade:  { id: 'k_twin_blade',  name: '连环刺',   cost: 1, type: 'offense', target: 'enemy', owner: 'knight', icon: '⚔️', dmg: 4, draw: 1, keywords: ['stance','precision'], desc: '【进攻牌】基伤 4（破防 5），抽 1 张牌。' },
  k_counter:     { id: 'k_counter',     name: '盾后追击', cost: 0, type: 'effect',  target: 'self',  owner: 'knight', icon: '⚡', switchStance: true, draw: 1, keywords: ['stance'], desc: '【效果牌】免费换阵并抽 1 张牌。' },
  k_point:       { id: 'k_point',       name: '点刺',     cost: 0, type: 'offense', target: 'enemy', owner: 'knight', icon: '🗡️', dmg: 3, keywords: ['stance','precision'], desc: '【进攻牌】0 费基伤 3，用于追击破防。' },

  // === Thief ===
  th_dagger:      { id: 'th_dagger',      name: '短匕',       cost: 1, type: 'perm', target: 'enemy', owner: 'thief', icon: '🗡️', dmg: 4, keywords: [], desc: '【永久】造成 4 伤害。' },
  th_steal:       { id: 'th_steal',       name: '妙手空空',   cost: 1, type: 'perm', target: 'enemy', owner: 'thief', icon: '💎', dmg: 2, stealLoot: true, keywords: ['loot'], desc: '【永久】造成 2 伤，摸 1 件【赃物】洗入抽牌堆。' },
  th_dodge:       { id: 'th_dodge',       name: '侧身闪避',   cost: 1, type: 'perm', target: 'all',   owner: 'thief', icon: '💨', weakenAtk: 3, keywords: [], desc: '【永久】敌方本回合单段攻击 -3。' },
  th_rope:        { id: 'th_rope',        name: '绊马索',     cost: 0, type: 'tool', target: 'all',   owner: 'thief', icon: '🪢', consumable: true, uses: 2, price: 8, weakenAtk: 6, draw: 1, keywords: ['consumable'], desc: '【工具·2次】敌方单段攻击 -6，抽 1 牌。' },
  th_powder:      { id: 'th_powder',      name: '黑火药',     cost: 1, type: 'tool', target: 'enemy', owner: 'thief', icon: '💣', consumable: true, price: 10, dmg: 12, pierce: true, keywords: ['pierce','consumable'], desc: '【工具·消耗】造成 12 穿透伤害。' },
  th_clasp:       { id: 'th_clasp',       name: '暗扣',       cost: 0, type: 'tool', target: 'self',  owner: 'thief', icon: '🧷', consumable: true, price: 12, nextDouble: true, keywords: ['consumable'], desc: '【工具·消耗】本回合下张工具或赃物触发 2 次。' },
  th_smoke:       { id: 'th_smoke',       name: '烟雾弹',     cost: 1, type: 'tool', target: 'self',  owner: 'thief', icon: '🌫️', consumable: true, price: 16, evadeAll: true, keywords: ['evade','consumable'], desc: '【工具·消耗】本回合完全闪避敌方全部攻击。' },
  th_powder_pack: { id: 'th_powder_pack', name: '精工火药包', cost: 1, type: 'tool', target: 'enemy', owner: 'thief', icon: '🧨', consumable: true, uses: 3, price: 28, dmg: 11, pierce: true, keywords: ['pierce','consumable'], desc: '【黑市装备·3次】造成 11 穿透伤害。' },
  th_smoke_box:   { id: 'th_smoke_box',   name: '便携烟雾匣', cost: 1, type: 'tool', target: 'self',  owner: 'thief', icon: '💨', consumable: true, uses: 2, price: 32, evadeAll: true, draw: 1, keywords: ['evade','consumable'], desc: '【黑市装备·2次】闪避本回合全攻并抽 1 牌。' },
  th_dagger_plus: { id: 'th_dagger_plus', name: '淬毒短匕',   cost: 1, type: 'perm', target: 'enemy', owner: 'thief', icon: '☠️', price: 32, dmg: 7, pierce: true, keywords: ['pierce'], desc: '【永久强化】造成 7 穿透伤害。' },
  th_steal_plus:  { id: 'th_steal_plus',  name: '神偷探囊',   cost: 1, type: 'perm', target: 'enemy', owner: 'thief', icon: '👑', price: 38, dmg: 4, stealLoot: true, stealLuck: true, keywords: ['loot'], desc: '【永久强化】造成 4 伤并高爆率摸金 1 次！' },

  // === Chef ===
  c_sour:        { id: 'c_sour',        name: '陈醋',       cost: 1, type: 'flavor', flavor: 'sour',   target: 'enemy', owner: 'chef', icon: '🍋', dmg: 7, selfDmg: 2, pierce: true, keywords: ['flavor','pierce'], desc: '【酸】自损 2 血，造成 7 穿透伤害。' },
  c_spicy:       { id: 'c_spicy',       name: '干辣椒',     cost: 1, type: 'flavor', flavor: 'spicy',  target: 'enemy', owner: 'chef', icon: '🌶️', spicy: 3, heat: 2, keywords: ['flavor','spicy'], desc: '【辣】敌方获 3 层辣灼，自身获 2 层上火。' },
  c_sweet:       { id: 'c_sweet',       name: '冰糖',       cost: 1, type: 'flavor', flavor: 'sweet',  target: 'self',  owner: 'chef', icon: '🍯', heal: 6, keywords: ['flavor'], desc: '【甜】回复 6 点生命。' },
  c_bitter:      { id: 'c_bitter',      name: '苦瓜汁',     cost: 0, type: 'flavor', flavor: 'bitter', target: 'self',  owner: 'chef', icon: '🍵', suppress: true, draw: 1, keywords: ['flavor'], desc: '【苦】本回合自身上火/自损减半，抽 1 牌。' },
  c_salty:       { id: 'c_salty',       name: '粗盐',       cost: 1, type: 'flavor', flavor: 'salty',  target: 'self',  owner: 'chef', icon: '🧂', preserve: 3, draw: 1, keywords: ['flavor'], desc: '【咸】下张牌正面伤/回血 +3（辣灼 +1 层），抽 1 牌。' },
  c_sour_dish:   { id: 'c_sour_dish',   name: '老坛酸汤鱼', cost: 1, type: 'flavor', flavor: 'sour',   target: 'enemy', owner: 'chef', icon: '🍲', dmg: 11, selfDmg: 3, pierce: true, keywords: ['flavor','pierce'], desc: '【酸·菜肴】自损 3 血，造成 11 穿透伤害。' },
  c_spicy_dish:  { id: 'c_spicy_dish',  name: '沸腾麻辣锅', cost: 1, type: 'flavor', flavor: 'spicy',  target: 'enemy', owner: 'chef', icon: '🔥', spicy: 6, heat: 3, keywords: ['flavor','spicy'], desc: '【辣·菜肴】敌方获 6 层辣灼，自身获 3 层上火。' },
  c_sweet_dish:  { id: 'c_sweet_dish',  name: '桂花蜜藕',   cost: 1, type: 'flavor', flavor: 'sweet',  target: 'self',  owner: 'chef', icon: '🍡', heal: 11, draw: 1, keywords: ['flavor'], desc: '【甜·菜肴】回复 11 血，抽 1 牌。' },
  c_bitter_dish: { id: 'c_bitter_dish', name: '清火苦丁茶', cost: 0, type: 'flavor', flavor: 'bitter', target: 'self',  owner: 'chef', icon: '🫖', suppress: true, heal: 4, draw: 2, keywords: ['flavor'], desc: '【苦·菜肴】本回合自损减半，回 4 血抽 2 牌。' },
  c_salty_dish:  { id: 'c_salty_dish',  name: '秘制腌笃鲜', cost: 1, type: 'flavor', flavor: 'salty',  target: 'self',  owner: 'chef', icon: '🥘', preserve: 5, draw: 2, keywords: ['flavor'], desc: '【咸·菜肴】下张牌正面伤/回血 +5（辣灼 +2 层），抽 2 牌。' },

  // === Teacher (Restrained Match-3 Red/Blue/Yellow) ===
  t_red:         { id: 't_red',         name: '严厉批评', cost: 1, type: 'lesson', color: 'red',    target: 'enemy', owner: 'teacher', icon: '🔴', dmg: 4, keywords: ['match3'], desc: '【红】造成 4 伤（红×3 消除额外打 8 伤）。' },
  t_blue:        { id: 't_blue',        name: '课堂纪律', cost: 1, type: 'lesson', color: 'blue',   target: 'enemy', owner: 'teacher', icon: '🔵', dmg: 2, weakenAtk: 2, keywords: ['match3'], desc: '【蓝】造成 2 伤、敌攻 -2（蓝×3 减攻 6 回 3 血）。' },
  t_yellow:      { id: 't_yellow',      name: '课间提问', cost: 1, type: 'lesson', color: 'yellow', target: 'enemy', owner: 'teacher', icon: '🟡', dmg: 2, draw: 1, keywords: ['match3'], desc: '【黄】造成 2 伤、抽 1 牌（黄×3 回 1 费抽 2 牌）。' },
  t_wild:        { id: 't_wild',        name: '万能粉笔', cost: 0, type: 'lesson', color: 'wild',   target: 'self',  owner: 'teacher', icon: '🌈', draw: 1, keywords: ['match3'], desc: '【彩虹·0费】补进当前最高色 +1（全0则三色+1），抽 1 牌。' },
  t_red_plus:    { id: 't_red_plus',    name: '重点批改', cost: 1, type: 'lesson', color: 'red',    target: 'enemy', owner: 'teacher', icon: '🔴', dmg: 5, colorWeight: 2, keywords: ['match3'], desc: '【红×2】造成 5 伤，本牌直接计作 2 格红色！' },
  t_blue_plus:   { id: 't_blue_plus',   name: '模范纪律', cost: 1, type: 'lesson', color: 'blue',   target: 'enemy', owner: 'teacher', icon: '🔵', dmg: 3, weakenAtk: 3, colorWeight: 2, keywords: ['match3'], desc: '【蓝×2】造成 3 伤、敌攻 -3，计作 2 格蓝色！' },
  t_yellow_plus: { id: 't_yellow_plus', name: '板书提纲', cost: 1, type: 'lesson', color: 'yellow', target: 'enemy', owner: 'teacher', icon: '🟡', dmg: 2, draw: 1, colorWeight: 2, keywords: ['match3'], desc: '【黄×2】造成 2 伤、抽 1 牌，计作 2 格黄色！' },
  t_wild_plus:   { id: 't_wild_plus',   name: '彩色教鞭', cost: 0, type: 'lesson', color: 'wild',   target: 'self',  owner: 'teacher', icon: '🌈', draw: 1, matchBoost: 2, keywords: ['match3'], desc: '【彩虹·0费】最高色 +1 抽 1 牌，下次三消 +2！' },

  // === Yier (Star Mark + Clow Card Sealing) ===
  y_bolt:       { id: 'y_bolt',       name: '星光弹',   cost: 1, type: 'attack', target: 'enemy', owner: 'yier', icon: '✨', dmg: 5, keywords: ['starmark'], desc: '造成 5 伤害。' },
  y_shield:     { id: 'y_shield',     name: '魔力盾',   cost: 1, type: 'skill',  target: 'self',  owner: 'yier', icon: '🔮', block: 5, keywords: [], desc: '获得 5 护甲。' },
  y_dot:        { id: 'y_dot',        name: '点星',     cost: 0, type: 'skill',  target: 'enemy', owner: 'yier', icon: '⭐', dmg: 2, starMark: 1, keywords: ['starmark'], desc: '造成 2 伤，施加 1 层【星印】。' },
  y_burst:      { id: 'y_burst',      name: '星爆',     cost: 1, type: 'attack', target: 'enemy', owner: 'yier', icon: '💥', consumeStar: 'pierce', keywords: ['starmark','pierce'], desc: '引爆全部【星印】，每层造成 5 穿透伤害。' },
  y_lock:       { id: 'y_lock',       name: '星锁',     cost: 1, type: 'skill',  target: 'enemy', owner: 'yier', icon: '⛓️', consumeStar: 'lock', keywords: ['starmark'], desc: '引爆全部【星印】，每层获 3 甲；≥2 层使敌攻 -5。' },
  clow_water:   { id: 'clow_water',   name: '库洛·水镜', cost: 1, type: 'skill', target: 'self',  owner: 'yier', icon: '🌊', isClow: true, block: 8, heal: 4, draw: 1, keywords: ['seal'], desc: '【水系库洛牌】获 8 甲、回 4 血并抽 1 牌。' },
  clow_earth:   { id: 'clow_earth',   name: '库洛·岩盾', cost: 1, type: 'skill', target: 'enemy', owner: 'yier', icon: '🪨', isClow: true, block: 10, starMark: 2, keywords: ['seal','starmark'], desc: '【地系库洛牌】获 10 甲并施加 2 层【星印】。' },
  clow_fire:    { id: 'clow_fire',    name: '库洛·炎刃', cost: 1, type: 'attack',target: 'enemy', owner: 'yier', icon: '🔥', isClow: true, dmg: 7, hits: 2, starMark: 1, keywords: ['seal','starmark'], desc: '【火系库洛牌】造成 7×2 伤害并施加 1 层【星印】。' },
  clow_wind:    { id: 'clow_wind',    name: '库洛·疾风', cost: 0, type: 'skill', target: 'self',  owner: 'yier', icon: '🌪️', isClow: true, gainEnergy: 1, draw: 2, keywords: ['seal'], desc: '【风系库洛牌】0 费回 1 费并抽 2 牌。' },

  // === Derivative Status Cards (Snow / Flower Petal) ===
  status_snow:  { id: 'status_snow',  name: '积雪', cost: 0, type: 'status', target: 'self', owner: 'all', icon: '❄️', consumable: true, keywords: ['consumable'], desc: '【积雪】无效果，打出后消耗清雪。' },
  status_petal: { id: 'status_petal', name: '花瓣', cost: 0, type: 'status', target: 'self', owner: 'all', icon: '🌸', consumable: true, ethereal: true, draw: 1, petalBuffFlower: true, keywords: ['consumable','ethereal'], desc: '【花瓣·虚无】抽 1 牌并消耗；打出使【花】永久 +1 力量。' },

  ...ALL_LOOT_CARDS
};

export const KNIGHT_SPAR_POOL = ['k_parry_guard', 'k_twin_blade', 'k_counter', 'k_point'];
export const THIEF_SHOP_CATALOG = ['th_powder_pack', 'th_smoke_box', 'th_dagger_plus', 'th_steal_plus', 'th_powder', 'th_smoke', 'th_clasp'];
export const CHEF_DISH_MAP = { c_sour: 'c_sour_dish', c_spicy: 'c_spicy_dish', c_sweet: 'c_sweet_dish', c_bitter: 'c_bitter_dish', c_salty: 'c_salty_dish' };
export const TEACHER_UPGRADE_MAP = { t_red: 't_red_plus', t_blue: 't_blue_plus', t_yellow: 't_yellow_plus', t_wild: 't_wild_plus' };

let uidSeq = 1;
export function createCardInstance(cardId) {
  const base = CARD_DB[cardId];
  if (!base) throw new Error(`Unknown cardId: ${cardId}`);
  return {
    ...base,
    uid: `c_${uidSeq++}`,
    usesLeft: base.uses || (base.consumable ? 1 : null),
    tempCost: null,
    bubbleWrapped: false,
    misted: false,
    retained: false,
    dyedColor: null
  };
}
