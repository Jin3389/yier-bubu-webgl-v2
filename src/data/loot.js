// Full 6-Tier Loot System: 20 Shared White-Gold Loot + 36 Elemental Red Exclusives (1 per Clow Card)

export const LOOT_RARITIES = {
  white:  { label: '白·杂物', icon: '⚪', color: '#cbd5e1' },
  green:  { label: '绿·实用', icon: '🟢', color: '#4ade80' },
  blue:   { label: '蓝·精良', icon: '🔵', color: '#60a5fa' },
  purple: { label: '紫·珍品', icon: '🟣', color: '#c084fc' },
  gold:   { label: '金·大金', icon: '🟡', color: '#fbbf24' },
  red:    { label: '红·大红', icon: '🔴', color: '#fb7185' }
};

export const GENERIC_LOOT_CARDS = {
  // White (5)
  loot_w_coin:    { id: 'loot_w_coin',    name: '旧铜钱',   rarity: 'white',  cost: 0, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 6,  dmg: 5, keywords: ['loot','consumable'], desc: '【白·6金】砸掉：造成 5 伤害。' },
  loot_w_feather: { id: 'loot_w_feather', name: '褪色羽签', rarity: 'white',  cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 7,  draw: 1, keywords: ['loot','consumable'], desc: '【白·7金】砸掉：抽 1 张牌。' },
  loot_w_pebble:  { id: 'loot_w_pebble',  name: '磨圆石子', rarity: 'white',  cost: 0, type: 'loot', target: 'all',   owner: 'thief', consumable: true, sellPrice: 6,  weakenAtk: 3, keywords: ['loot','consumable'], desc: '【白·6金】砸掉：敌方本回合单段攻击 -3。' },
  loot_w_herb:    { id: 'loot_w_herb',    name: '干草药包', rarity: 'white',  cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 8,  heal: 2, draw: 1, keywords: ['loot','consumable'], desc: '【白·8金】砸掉：回复 2 血并抽 1 牌。' },
  loot_w_nail:    { id: 'loot_w_nail',    name: '生锈铁钉', rarity: 'white',  cost: 0, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 7,  dmg: 4, pierce: true, keywords: ['loot','pierce','consumable'], desc: '【白·7金】砸掉：造成 4 穿透伤害。' },

  // Green (5)
  loot_g_dagger:  { id: 'loot_g_dagger',  name: '精钢飞刀', rarity: 'green',  cost: 0, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 13, dmg: 8, keywords: ['loot','consumable'], desc: '【绿·13金】砸掉：造成 8 伤害。' },
  loot_g_oil:     { id: 'loot_g_oil',     name: '便携火油', rarity: 'green',  cost: 1, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 15, dmg: 11, pierce: true, keywords: ['loot','pierce','consumable'], desc: '【绿·15金】砸掉：造成 11 穿透伤害。' },
  loot_g_bell:    { id: 'loot_g_bell',    name: '铜制风铃', rarity: 'green',  cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 14, gainEnergy: 1, draw: 1, keywords: ['loot','consumable'], desc: '【绿·14金】砸掉：回 1 费并抽 1 牌。' },
  loot_g_salve:   { id: 'loot_g_salve',   name: '行军药膏', rarity: 'green',  cost: 0, type: 'loot', target: 'all',   owner: 'thief', consumable: true, sellPrice: 15, heal: 4, weakenAtk: 4, keywords: ['loot','consumable'], desc: '【绿·15金】砸掉：回 4 血并使敌攻 -4。' },
  loot_g_net:     { id: 'loot_g_net',     name: '细丝捕网', rarity: 'green',  cost: 0, type: 'loot', target: 'all',   owner: 'thief', consumable: true, sellPrice: 14, weakenAtk: 6, draw: 1, keywords: ['loot','consumable'], desc: '【绿·14金】砸掉：敌攻 -6 并抽 1 牌。' },

  // Blue (4)
  loot_b_watch:   { id: 'loot_b_watch',   name: '镀银怀表', rarity: 'blue',   cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 22, gainEnergy: 1, draw: 2, keywords: ['loot','consumable'], desc: '【蓝·22金】砸掉：回 1 费并抽 2 牌。' },
  loot_b_weight:  { id: 'loot_b_weight',  name: '重铅砝码', rarity: 'blue',   cost: 1, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 21, dmg: 14, stripArmor: true, keywords: ['loot','consumable'], desc: '【蓝·21金】砸掉：造成 14 伤并清零目标护甲。' },
  loot_b_sachet:  { id: 'loot_b_sachet',  name: '精致香囊', rarity: 'blue',   cost: 0, type: 'loot', target: 'all',   owner: 'thief', consumable: true, sellPrice: 24, weakenAtk: 8, heal: 4, keywords: ['loot','consumable'], desc: '【蓝·24金】砸掉：敌攻 -8 并回 4 血。' },
  loot_b_bomb:    { id: 'loot_b_bomb',    name: '精工爆弹', rarity: 'blue',   cost: 1, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 25, dmg: 15, pierce: true, keywords: ['loot','pierce','consumable'], desc: '【蓝·25金】砸掉：造成 15 穿透伤害。' },

  // Purple (3)
  loot_p_cloak:   { id: 'loot_p_cloak',   name: '隐身斗篷', rarity: 'purple', cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 38, evadeAll: true, draw: 2, keywords: ['loot','evade','consumable'], desc: '【紫·38金】砸掉：本回合闪避全攻并抽 2 牌。' },
  loot_p_prism:   { id: 'loot_p_prism',   name: '魔导棱镜', rarity: 'purple', cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 36, nextDouble: true, draw: 1, gainEnergy: 1, keywords: ['loot','consumable'], desc: '【紫·36金】砸掉：下张工具/赃物双发，回 1 费抽 1 牌。' },
  loot_p_blade:   { id: 'loot_p_blade',   name: '秘银断刃', rarity: 'purple', cost: 1, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 40, dmg: 20, stripArmor: true, pierce: true, keywords: ['loot','pierce','consumable'], desc: '【紫·40金】砸掉：造成 20 穿透伤并清零护甲。' },

  // Gold (3)
  loot_y_core:    { id: 'loot_y_core',    name: '古金核心', rarity: 'gold',   cost: 0, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 62, interrupt: true, gainEnergy: 1, draw: 2, keywords: ['loot','consumable'], desc: '【大金·62金】砸掉：打断目标行动，回 1 费并抽 2 牌！' },
  loot_y_chalice: { id: 'loot_y_chalice', name: '圣金圣杯', rarity: 'gold',   cost: 0, type: 'loot', target: 'self',  owner: 'thief', consumable: true, sellPrice: 68, heal: 8, gainEnergy: 2, draw: 3, keywords: ['loot','consumable'], desc: '【大金·68金】砸掉：回 8 血、回 2 费并抽 3 牌！' },
  loot_y_spear:   { id: 'loot_y_spear',   name: '黄金破甲枪', rarity: 'gold', cost: 1, type: 'loot', target: 'enemy', owner: 'thief', consumable: true, sellPrice: 60, dmg: 26, pierce: true, keywords: ['loot','pierce','consumable'], desc: '【大金·60金】砸掉：造成 26 穿透伤害！' }
};

const RED_SPECS = [
  // Water (9)
  ['w_bubbles',      'red_bubbles',   '幻彩珍珠泡', 92,  { target: 'self',  evadeAll: true, heal: 5, draw: 2 }, '【大红·92金】砸掉：本回合闪避全攻、回 5 血并抽 2 牌！'],
  ['w_wave',         'red_wave',      '沧海潮纹螺', 95,  { target: 'enemy', dmg: 18, pierce: true, draw: 2 }, '【大红·95金】砸掉：造成 18 穿透伤并抽 2 牌！'],
  ['w_mist',         'red_mist',      '幻雾青铜炉', 92,  { target: 'self',  evadeAll: true, gainEnergy: 2, draw: 2 }, '【大红·92金】砸掉：本回合闪避全攻、回 2 费并抽 2 牌！'],
  ['w_rain',         'red_rain',      '骤雨千针伞', 94,  { target: 'enemy', dmg: 7, hits: 3, pierce: true }, '【大红·94金】砸掉：造成 7×3 穿透连击！'],
  ['w_freeze',       'red_freeze',    '万年玄冰鳞', 98,  { target: 'enemy', interrupt: true, dmg: 16, pierce: true }, '【大红·98金】砸掉：冻结打断目标并造成 16 穿透伤！'],
  ['w_snow',         'red_snow',      '六棱永霜晶', 92,  { target: 'all',   weakenAtk: 10, heal: 6, draw: 2 }, '【大红·92金】砸掉：敌攻 -10、回 6 血并抽 2 牌！'],
  ['w_cloud',        'red_cloud',     '浮云金星坠', 94,  { target: 'self',  heal: 8, gainEnergy: 2, draw: 2 }, '【大红·94金】砸掉：回 8 血、回 2 费并抽 2 牌！'],
  ['w_wood',         'red_wood',      '古木生命枝', 96,  { target: 'enemy', heal: 12, dmg: 12, pierce: true }, '【大红·96金】砸掉：回 12 血并造成 12 穿透伤！'],
  ['w_watery',       'red_watery',    '海神之泪',   120, { target: 'enemy', interrupt: true, heal: 10, dmg: 22, pierce: true }, '【统领大红·120金】砸掉：打断行动、回 10 血并造成 22 穿透伤！'],
  // Earth (9)
  ['earth_flower',   'red_flower',    '永生金瓣冠', 92,  { target: 'self',  heal: 8, draw: 3, gainEnergy: 1 }, '【大红·92金】砸掉：回 8 血、回 1 费并抽 3 牌！'],
  ['earth_sand',     'red_sand',      '时之黄金沙漏', 95,{ target: 'enemy', interrupt: true, gainEnergy: 2, draw: 2 }, '【大红·95金】砸掉：打断行动、回 2 费并抽 2 牌！'],
  ['earth_shield',   'red_shield',    '圣纹秘银盾', 94,  { target: 'enemy', stripArmor: true, dmg: 16, pierce: true, heal: 5 }, '【大红·94金】砸掉：碎甲造成 16 穿透伤并回 5 血！'],
  ['earth_lock',     'red_lock',      '金翼秘钥',   93,  { target: 'self',  gainEnergy: 2, draw: 3 }, '【大红·93金】砸掉：回 2 费并抽 3 牌！'],
  ['earth_scales',   'red_scales',    '真理黄金秤', 95,  { target: 'enemy', dmg: 18, pierce: true, heal: 6 }, '【大红·95金】砸掉：造成 18 穿透伤并回 6 血！'],
  ['earth_loop',     'red_loop',      '永恒莫比乌斯环', 96, { target: 'self', gainEnergy: 3, draw: 2 }, '【大红·96金】砸掉：回 3 费并抽 2 牌！'],
  ['earth_maze',     'red_maze',      '迷宫黄金罗盘', 93, { target: 'self', draw: 4, gainEnergy: 1 }, '【大红·93金】砸掉：回 1 费并抽 4 牌！'],
  ['earth_mirror',   'red_mirror',    '真视水银镜', 95,  { target: 'self',  nextDouble: true, evadeAll: true, draw: 2 }, '【大红·95金】砸掉：闪避全攻、下张双发并抽 2 牌！'],
  ['earth_sovereign','red_earth',     '大地圣心石', 120, { target: 'enemy', stripArmor: true, dmg: 24, pierce: true, heal: 10 }, '【统领大红·120金】砸掉：碎甲打 24 穿透伤并回 10 血！'],
  // Fire (9)
  ['fire_arrow',     'red_arrow',     '烈日贯星箭', 94,  { target: 'enemy', dmg: 6, hits: 4, pierce: true }, '【大红·94金】砸掉：造成 6×4 穿透连射！'],
  ['fire_fight',     'red_fight',     '赤金战意印', 95,  { target: 'enemy', dmg: 22, pierce: true, gainEnergy: 1 }, '【大红·95金】砸掉：造成 22 穿透伤并回 1 费！'],
  ['fire_power',     'red_power',     '泰坦赤金拳套', 96,{ target: 'enemy', dmg: 26, pierce: true }, '【大红·96金】砸掉：造成 26 穿透重击！'],
  ['fire_shot',      'red_shot',      '赤炎锁魂弹', 93,  { target: 'enemy', dmg: 18, pierce: true, draw: 2 }, '【大红·93金】砸掉：造成 18 穿透伤并抽 2 牌！'],
  ['fire_sword',     'red_sword',     '绯红圣裁剑', 98,  { target: 'enemy', dmg: 28, pierce: true }, '【大红·98金】砸掉：造成 28 穿透一斩！'],
  ['fire_through',   'red_through',   '虚空赤环',   94,  { target: 'self',  evadeAll: true, draw: 3, gainEnergy: 1 }, '【大红·94金】砸掉：闪避全攻、回 1 费并抽 3 牌！'],
  ['fire_thunder',   'red_thunder',   '九霄雷纹珠', 96,  { target: 'enemy', interrupt: true, dmg: 18, pierce: true }, '【大红·96金】砸掉：雷击打断目标并造成 18 穿透伤！'],
  ['fire_twin',      'red_twin',      '双生烈焰戒', 98,  { target: 'enemy', nextDouble: true, dmg: 16, pierce: true }, '【大红·98金】砸掉：造成 16 穿透伤且下张双发！'],
  ['fire_sovereign', 'red_fire',      '红莲圣火核', 120, { target: 'enemy', dmg: 30, pierce: true, draw: 2 }, '【统领大红·120金】砸掉：造成 30 穿透烈焰并抽 2 牌！'],
  // Wind (9)
  ['wind_dash',      'red_dash',      '疾风羽翼靴', 93,  { target: 'self',  gainEnergy: 2, draw: 3 }, '【大红·93金】砸掉：回 2 费并抽 3 牌！'],
  ['wind_float',     'red_float',     '浮空青玉铃', 92,  { target: 'self',  evadeAll: true, heal: 6, draw: 2 }, '【大红·92金】砸掉：闪避全攻、回 6 血并抽 2 牌！'],
  ['wind_fly',       'red_fly',       '天翔银翎羽', 95,  { target: 'enemy', evadeAll: true, dmg: 16, pierce: true }, '【大红·95金】砸掉：闪避全攻并造成 16 穿透伤！'],
  ['wind_jump',      'red_jump',      '跃空星环',   93,  { target: 'enemy', dmg: 10, hits: 2, pierce: true, draw: 1 }, '【大红·93金】砸掉：造成 10×2 穿透伤并抽 1 牌！'],
  ['wind_move',      'red_move',      '折跃时空匣', 95,  { target: 'self',  nextDouble: true, gainEnergy: 2, draw: 2 }, '【大红·95金】砸掉：下张双发、回 2 费并抽 2 牌！'],
  ['wind_song',      'red_song',      '天籁金竖琴', 94,  { target: 'all',   weakenAtk: 12, heal: 8, draw: 2 }, '【大红·94金】砸掉：敌攻 -12、回 8 血并抽 2 牌！'],
  ['wind_storm',     'red_storm',     '飓风翡翠瓶', 96,  { target: 'enemy', dmg: 20, pierce: true, draw: 3 }, '【大红·96金】砸掉：造成 20 穿透伤并抽 3 牌！'],
  ['wind_voice',     'red_voice',     '共鸣水晶螺', 93,  { target: 'enemy', interrupt: true, dmg: 15, pierce: true }, '【大红·93金】砸掉：打断目标并造成 15 穿透伤！'],
  ['wind_sovereign', 'red_wind',      '风灵御风冠', 120, { target: 'self',  evadeAll: true, gainEnergy: 3, draw: 3 }, '【统领大红·120金】砸掉：闪避全攻、回 3 费并抽 3 牌！']
];

export const RED_LOOT_BY_ENEMY = Object.fromEntries(
  RED_SPECS.map(([enemyId, id, name, sellPrice, fx, desc]) => [
    enemyId,
    {
      id, name, rarity: 'red', cost: 0, type: 'loot', owner: 'thief',
      consumable: true, sellPrice, keywords: ['loot', 'consumable'], desc, ...fx
    }
  ])
);

export const ALL_LOOT_CARDS = {
  ...GENERIC_LOOT_CARDS,
  ...Object.fromEntries(Object.values(RED_LOOT_BY_ENEMY).map(c => [c.id, c]))
};

const POOL_BY_RARITY = {
  gold: ['loot_y_core', 'loot_y_chalice', 'loot_y_spear'],
  purple: ['loot_p_cloak', 'loot_p_prism', 'loot_p_blade'],
  blue: ['loot_b_watch', 'loot_b_weight', 'loot_b_sachet', 'loot_b_bomb'],
  green: ['loot_g_dagger', 'loot_g_oil', 'loot_g_bell', 'loot_g_salve', 'loot_g_net'],
  white: ['loot_w_coin', 'loot_w_feather', 'loot_w_pebble', 'loot_w_herb', 'loot_w_nail']
};

export function rollLootCard(enemyId, rng, { luck = false, isBoss = false, redDropped = false } = {}) {
  const redSpec = RED_LOOT_BY_ENEMY[enemyId];
  const r = rng();
  if (redSpec && !redDropped) {
    const redChance = isBoss ? (luck ? 0.55 : 0.38) : (luck ? 0.28 : 0.14);
    if (r < redChance) return { ...redSpec };
  }
  const r2 = rng();
  let rarity = 'white';
  if (luck) {
    if (r2 < 0.16) rarity = 'gold';
    else if (r2 < 0.40) rarity = 'purple';
    else if (r2 < 0.70) rarity = 'blue';
    else rarity = 'green';
  } else {
    if (r2 < 0.08) rarity = 'gold';
    else if (r2 < 0.22) rarity = 'purple';
    else if (r2 < 0.45) rarity = 'blue';
    else if (r2 < 0.75) rarity = 'green';
    else rarity = 'white';
  }
  const ids = POOL_BY_RARITY[rarity];
  const id = ids[Math.floor(rng() * ids.length)];
  return { ...GENERIC_LOOT_CARDS[id] };
}
