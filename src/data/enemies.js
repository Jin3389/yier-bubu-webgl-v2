// Complete 36 Elemental Enemies (Water 9 + Earth 9 + Fire 9 + Wind 9) with [Act 1 / Act 2 / Act 3] Dynamic Scaling

export const FACTION_META = {
  water: { id: 'water', name: '水之章 · 侵蚀与速杀', bg: './assets/bg/bg-water.webp', bgm: 'water', bossId: 'w_watery', clowCard: 'clow_water' },
  earth: { id: 'earth', name: '地之章 · 规则与秩序', bg: './assets/bg/bg-earth.webp', bgm: 'earth', bossId: 'earth_sovereign', clowCard: 'clow_earth' },
  fire:  { id: 'fire',  name: '火之章 · 高压与破绽', bg: './assets/bg/bg-fire.webp',  bgm: 'fire',  bossId: 'fire_sovereign', clowCard: 'clow_fire' },
  wind:  { id: 'wind',  name: '风之章 · 变速与流转', bg: './assets/bg/bg-wind.webp',  bgm: 'wind',  bossId: 'wind_sovereign', clowCard: 'clow_wind' }
};

export const ENEMY_DB = {
  // ================= WATER (9) =================
  w_bubbles: {
    id: 'w_bubbles', name: '泡 · The Bubbles', faction: 'water', flavor: 'bitter', isBoss: false,
    hpByAct: [26, 32, 40], startArmorByAct: [6, 8, 10],
    traitName: '泡沫封膜', traitDesc: '破甲时为牌库随机 1 牌裹上泡泡膜（1 费戳破，上限 2/3/4）。',
    powersByAct: (a) => [{ id: 'bubble_armor', stacks: [2, 3, 4][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 6, 7][a], hits: 1, label: '泡影轻击' },
      { type: 'defend_attack', block: [5, 7, 9][a], dmg: [4, 5, 6][a], hits: 1, label: '泡沫护膜' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '连环泡沫' }
    ]
  },
  w_wave: {
    id: 'w_wave', name: '波 · The Wave', faction: 'water', flavor: 'salty', isBoss: false,
    hpByAct: [27, 34, 42], startArmorByAct: [0, 0, 0],
    traitName: '海浪冲刷', traitDesc: '造成生命伤时冲走留牌且下回合少抽 1 牌；第 3 拍 +1 力量。',
    powersByAct: () => [{ id: 'wave_wash', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '浪涌拍击' },
      { type: 'attack', dmg: [7, 9, 11][a], hits: 1, label: '怒涛突进' },
      { type: 'buff_attack', dmg: [5, 7, 9][a], hits: 1, gainStr: [1, 1, 2][a], label: '涨潮蓄势' }
    ]
  },
  w_mist: {
    id: 'w_mist', name: '雾 · The Mist', faction: 'water', flavor: 'sweet', isBoss: false,
    hpByAct: [25, 31, 39], startArmorByAct: [0, 0, 0],
    traitName: '迷雾遮蔽', traitDesc: '隐藏意图细节，每回合干扰视听。',
    powersByAct: () => [{ id: 'mist_veil', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 8][a], hits: 1, label: '迷雾暗袭' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '???' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '浓雾穿刺' }
    ]
  },
  w_rain: {
    id: 'w_rain', name: '雨 · The Rain', faction: 'water', flavor: 'spicy', isBoss: false,
    hpByAct: [26, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '骤雨连针', traitDesc: '固定 3 段连击，每回合单段伤害递增至上限。',
    powersByAct: () => [{ id: 'rain_ramp', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [2, 3, 4][a], hits: 3, label: '细雨三连' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 3, label: '骤雨倾盆' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 3, label: '暴雨千针' }
    ]
  },
  w_freeze: {
    id: 'w_freeze', name: '冻 · The Freeze', faction: 'water', flavor: 'sour', isBoss: false,
    hpByAct: [27, 34, 42], startArmorByAct: [0, 0, 0],
    traitName: '冰甲寒潮', traitDesc: '叠厚冰甲后以护甲砸人；造成生命伤时冻结下回合 1 点费用。',
    powersByAct: () => [{ id: 'freeze_chill', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'defend', block: [8, 11, 14][a], label: '凝结冰壳' },
      { type: 'armor_slam', dmg: [6, 8, 10][a], hits: 1, label: '冰甲重撞' },
      { type: 'attack', dmg: [2, 3, 3][a], hits: 4, label: '碎冰四连' }
    ]
  },
  w_snow: {
    id: 'w_snow', name: '雪 · The Snow', faction: 'water', flavor: 'sweet', isBoss: false,
    hpByAct: [27, 34, 42], startArmorByAct: [0, 0, 0],
    traitName: '落雪塞牌', traitDesc: '每回合结束往弃牌堆塞入 1 张 0 费消耗【积雪】。',
    powersByAct: () => [{ id: 'snow_drop', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '风雪吹拂' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '飞雪双斩' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '暴雪压顶' }
    ]
  },
  w_cloud: {
    id: 'w_cloud', name: '云 · The Cloud', faction: 'water', flavor: 'salty', isBoss: false,
    hpByAct: [28, 34, 42], startArmorByAct: [0, 0, 0],
    traitName: '云团分裂', traitDesc: '首回合裂为 2 团（最多 4 团）；每团独立血条，击散分身会为其余云团回血。',
    powersByAct: (a) => [{ id: 'cloud_split', stacks: [2, 3, 4][a] }],
    patternByAct: (a) => [
      { type: 'split', label: '云雾分裂' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 1, label: '云雷齐落' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 1, label: '骤云压顶' }
    ]
  },
  w_wood: {
    id: 'w_wood', name: '树 · The Wood', faction: 'water', flavor: 'bitter', isBoss: false,
    hpByAct: [30, 40, 50], startArmorByAct: [0, 0, 0],
    traitName: '分段树干', traitDesc: '每 10 血为 1 段，回合末未斩断的残段会回满；每斩断 1 段本回合敌攻 -2。',
    powersByAct: () => [{ id: 'wood_segment', stacks: 10 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '藤蔓抽击' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '双枝缠绕' },
      { type: 'buff_attack', dmg: [5, 7, 9][a], hits: 1, gainStr: 1, label: '古木生长' }
    ]
  },
  w_watery: {
    id: 'w_watery', name: '水 · The Watery', faction: 'water', flavor: 'sweet', isBoss: true,
    hpByAct: [36, 45, 56], startArmorByAct: [0, 0, 0],
    traitName: '潮汐拉锯', traitDesc: '0/6 潮汐（初始 2）。攻击 +2，满 6 放海啸；每受 5 血伤降 1，归 0 搁浅（受伤 +30%）。',
    powersByAct: () => [{ id: 'water_tide', stacks: 2 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '奔流冲击' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '双浪拍岸' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '深渊暗涌' }
    ]
  },

  // ================= EARTH (9) =================
  earth_flower: {
    id: 'earth_flower', name: '花 · The Flower', faction: 'earth', flavor: 'sweet', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '落英诱惑', traitDesc: '每回合初塞 1 张 0 费虚无【花瓣】（抽 1 牌），打出使【花】永久 +1 力量。',
    powersByAct: () => [{ id: 'flower_petal', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '花雨轻拂' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '繁花连舞' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '盛放冲击' }
    ]
  },
  earth_sand: {
    id: 'earth_sand', name: '砂 · The Sand', faction: 'earth', flavor: 'salty', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '流沙泄力', traitDesc: '每回合受到的第 1 次直接伤害减半，后续伤害全额生效。',
    powersByAct: () => [{ id: 'sand_dampen', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [6, 8, 9][a], hits: 1, label: '流沙冲击' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '沙暴双袭' },
      { type: 'attack', dmg: [7, 9, 11][a], hits: 1, label: '沙漏倾泻' }
    ]
  },
  earth_shield: {
    id: 'earth_shield', name: '盾 · The Shield', faction: 'earth', flavor: 'bitter', isBoss: false,
    hpByAct: [18, 24, 30], startArmorByAct: [6, 8, 10],
    traitName: '坚盾减伤', traitDesc: '拥有护甲期间，每次受到的直接伤害 -1（最低 1）。',
    powersByAct: () => [{ id: 'shield_reduce', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'defend_attack', block: [4, 5, 6][a], dmg: [4, 5, 7][a], hits: 1, label: '举盾撞击' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '重盾猛砸' },
      { type: 'defend_attack', block: [5, 6, 8][a], dmg: [3, 4, 5][a], hits: 1, label: '固守反冲' }
    ]
  },
  earth_lock: {
    id: 'earth_lock', name: '錠 · The Lock', faction: 'earth', flavor: 'spicy', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '锁链手牌', traitDesc: '手牌被铁链封锁，仅可打出最左或最右两端的牌。',
    powersByAct: () => [{ id: 'lock_edges', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '铁锁重击' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '双链鞭挞' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '封禁砸落' }
    ]
  },
  earth_scales: {
    id: 'earth_scales', name: '秤 · The Scales', faction: 'earth', flavor: 'sour', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '等量天平', traitDesc: '本回合你每打出 1 张牌，【秤】的预告单段攻击实时 +1。',
    powersByAct: () => [{ id: 'scales_tax', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [3, 4, 5][a], hits: 1, label: '天平裁决' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 1, label: '砝码坠落' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '双秤制裁' }
    ]
  },
  earth_loop: {
    id: 'earth_loop', name: '輪 · The Loop', faction: 'earth', flavor: 'salty', isBoss: false,
    hpByAct: [27, 34, 42], startArmorByAct: [0, 0, 0],
    traitName: '潮汐轮回', traitDesc: '玩家费用在 2 费（奇数回合）与 4 费（偶数回合）之间交替。',
    powersByAct: () => [{ id: 'loop_energy', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '轮环碾压' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '双环绞杀' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '回环重击' }
    ]
  },
  earth_maze: {
    id: 'earth_maze', name: '迷 · The Maze', faction: 'earth', flavor: 'sweet', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '迷宫探路', traitDesc: '每回合基础抽 3 牌；每打出 2 张牌自动额外抽 1 牌。',
    powersByAct: () => [{ id: 'maze_draw', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '石壁挤压' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '迷途双袭' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '死路崩塌' }
    ]
  },
  earth_mirror: {
    id: 'earth_mirror', name: '鏡 · The Mirror', faction: 'earth', flavor: 'bitter', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '镜面复刻', traitDesc: '下回合单段攻击复制你本回合打出的最高单次直伤（受上下限约束）。',
    powersByAct: (a) => [{ id: 'mirror_copy', stacks: [7, 9, 11][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '镜影折射' },
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '镜像反照' },
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '碎镜反射' }
    ]
  },
  earth_sovereign: {
    id: 'earth_sovereign', name: '地 · The Earthy', faction: 'earth', flavor: 'sour', isBoss: true,
    hpByAct: [36, 46, 58], startArmorByAct: [0, 0, 0],
    traitName: '山岳与裂谷', traitDesc: '奇数回合【山岳】（双方直伤 -2）；偶数回合【裂谷】（双方直伤 +2）。',
    powersByAct: () => [{ id: 'earth_terrain', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '山岳镇压' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '裂谷震荡' },
      { type: 'attack', dmg: [7, 9, 11][a], hits: 1, label: '地脉崩裂' }
    ]
  },

  // ================= FIRE (9) =================
  fire_arrow: {
    id: 'fire_arrow', name: '矢 · The Arrow', faction: 'fire', flavor: 'spicy', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '断箭削段', traitDesc: '高频多段齐射；本回合每受 6/8/10 点血伤减少 1 段攻击（最低 1 段）。',
    powersByAct: (a) => [{ id: 'arrow_step', stacks: [6, 8, 10][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [2, 3, 3][a], hits: 3, label: '三矢齐发' },
      { type: 'attack', dmg: [2, 3, 3][a], hits: 4, label: '四箭连珠' },
      { type: 'attack', dmg: [2, 2, 3][a], hits: 5, label: '箭雨倾泻' }
    ]
  },
  fire_fight: {
    id: 'fire_fight', name: '闘 · The Fight', faction: 'fire', flavor: 'spicy', isBoss: false,
    hpByAct: [28, 36, 45], startArmorByAct: [0, 0, 0],
    traitName: '半血狂热', traitDesc: '生命 ≤ 50% 进入【狂热】：双方每次直接伤害 +2！',
    powersByAct: () => [{ id: 'fight_frenzy', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '猛虎直拳' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '连环蹴击' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '霸体崩山' }
    ]
  },
  fire_power: {
    id: 'fire_power', name: '力 · The Power', faction: 'fire', flavor: 'salty', isBoss: false,
    hpByAct: [30, 38, 48], startArmorByAct: [0, 0, 0],
    traitName: '蓄力惯性', traitDesc: 'T1 蓄力（每受 2 血伤削弱 T2 重锤 1 伤）→ T2 重锤 → T3 力竭（受伤 +50%）。',
    powersByAct: () => [{ id: 'power_inertia', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'charge', label: '沉肩蓄力' },
      { type: 'attack', dmg: [9, 12, 15][a], hits: 1, label: '泰山压顶' },
      { type: 'exhausted', label: '力竭喘息' }
    ]
  },
  fire_shot: {
    id: 'fire_shot', name: '撃 · The Shot', faction: 'fire', flavor: 'sour', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '热能锁定', traitDesc: '命中叠加【锁定】（每次 +1 攻）；单回合打出 ≥3 张牌清空锁定。',
    powersByAct: () => [{ id: 'shot_lock', stacks: 0 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 6, 8][a], hits: 1, label: '炎弹点射' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '追踪双射' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '狙杀烈焰' }
    ]
  },
  fire_sword: {
    id: 'fire_sword', name: '剣 · The Sword', faction: 'fire', flavor: 'bitter', isBoss: false,
    hpByAct: [24, 30, 38], startArmorByAct: [0, 0, 0],
    traitName: '玻璃剑客', traitDesc: '高攻脆皮；玩家每回合第 1 次直伤获得 +50% 破绽增伤。',
    powersByAct: () => [{ id: 'sword_first_vuln', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [7, 9, 12][a], hits: 1, label: '居合一闪' },
      { type: 'attack', dmg: [4, 6, 7][a], hits: 2, label: '赤炎双斩' },
      { type: 'attack', dmg: [8, 10, 13][a], hits: 1, label: '裂空剑气' }
    ]
  },
  fire_through: {
    id: 'fire_through', name: '抜 · The Through', faction: 'fire', flavor: 'sweet', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '空手反穿', traitDesc: '回合末每余 1 张非留牌手牌敌攻 +1；打空全部非留牌直接反穿敌方 4/5/6 伤！',
    powersByAct: (a) => [{ id: 'through_empty', stacks: [4, 5, 6][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [4, 5, 7][a], hits: 1, label: '疾穿突袭' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '虚空双穿' },
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '瞬影贯击' }
    ]
  },
  fire_thunder: {
    id: 'fire_thunder', name: '雷 · The Thunder', faction: 'fire', flavor: 'sour', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '留费避雷', traitDesc: '结束回合保留 ≥1 点剩余费用，雷击减半并反震敌方 3/4/5 伤！',
    powersByAct: (a) => [{ id: 'thunder_ground', stacks: [3, 4, 5][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [7, 9, 11][a], hits: 1, label: '落雷劈击' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '奔雷双闪' },
      { type: 'attack', dmg: [8, 10, 12][a], hits: 1, label: '天雷轰顶' }
    ]
  },
  fire_twin: {
    id: 'fire_twin', name: '双 · The Twin', faction: 'fire', flavor: 'sweet', isBoss: false,
    hpByAct: [15, 19, 24], startArmorByAct: [0, 0, 0], isTwin: true,
    traitName: '双生共鸣', traitDesc: '两位独立目标同场！若只击倒 1 位，存活者在回合末会以 50% 血复活同伴。',
    powersByAct: () => [{ id: 'twin_revive', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [3, 4, 5][a], hits: 1, label: '双生协击' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 1, label: '赤焰合击' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 1, label: '火舞连袭' }
    ]
  },
  fire_sovereign: {
    id: 'fire_sovereign', name: '火 · The Firey', faction: 'fire', flavor: 'spicy', isBoss: true,
    hpByAct: [36, 46, 58], startArmorByAct: [0, 0, 0],
    traitName: '扇风过载', traitDesc: '每打 1 张牌叠 1 层【燃势】：1–3 层每层敌攻 +1；≥4 层过载使敌攻减半并自灼 6/8/10 血！',
    powersByAct: (a) => [{ id: 'fire_overheat', stacks: [6, 8, 10][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '红莲火柱' },
      { type: 'attack', dmg: [4, 5, 6][a], hits: 2, label: '烈焰双翼' },
      { type: 'attack', dmg: [7, 9, 11][a], hits: 1, label: '焚天火雨' }
    ]
  },

  // ================= WIND (9) =================
  wind_dash: {
    id: 'wind_dash', name: '駆 · The Dash', faction: 'wind', flavor: 'salty', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '疾速狂飙', traitDesc: '双方加速：玩家每回合 4 费且抽 5 牌；【駆】攻击额外 +1 段。',
    powersByAct: () => [{ id: 'dash_turbo', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '疾风二连' },
      { type: 'attack', dmg: [2, 3, 4][a], hits: 3, label: '狂飙三连' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '残影突袭' }
    ]
  },
  wind_float: {
    id: 'wind_float', name: '浮 · The Float', faction: 'wind', flavor: 'sweet', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '零重力手牌', traitDesc: '未打出的手牌全部自动浮空保留（上限 10）；第 2 回合起每回合抽 2 牌。',
    powersByAct: () => [{ id: 'float_zero_g', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '失重气流' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '浮空旋斩' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '气压下坠' }
    ]
  },
  wind_fly: {
    id: 'wind_fly', name: '翔 · The Fly', faction: 'wind', flavor: 'bitter', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '高低空切换', traitDesc: 'T1 高空盘旋（受伤减半）→ T2/T3 低空俯冲滑翔（受击每次 +2 伤）。',
    powersByAct: () => [{ id: 'fly_altitude', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'high_fly', label: '高空盘旋' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '低空俯冲' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 1, label: '贴地滑翔' }
    ]
  },
  wind_jump: {
    id: 'wind_jump', name: '跳 · The Jump', faction: 'wind', flavor: 'sweet', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '奇偶弹跳', traitDesc: '每回合奇数次直伤 -1，偶数次直伤 +2！',
    powersByAct: () => [{ id: 'jump_parity', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '凌空踏击' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '二段弹跳' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '高跃重踩' }
    ]
  },
  wind_move: {
    id: 'wind_move', name: '移 · The Move', faction: 'wind', flavor: 'salty', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '亚空间藏牌', traitDesc: '回合初藏起 1 张手牌；本回合造成 ≥5/6/7 血伤即可夺回，否则回合末弃置。',
    powersByAct: (a) => [{ id: 'move_hide', stacks: [5, 6, 7][a] }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '瞬移背刺' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '折跃双袭' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '空间错位' }
    ]
  },
  wind_song: {
    id: 'wind_song', name: '歌 · The Song', faction: 'wind', flavor: 'sweet', isBoss: false,
    hpByAct: [26, 33, 41], startArmorByAct: [0, 0, 0],
    traitName: '咏叹增费', traitDesc: '每回合随机令 1 张手牌费用 +1（回合末复原）。',
    powersByAct: () => [{ id: 'song_tax', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '音波震颤' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '二重咏叹' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '高音破击' }
    ]
  },
  wind_storm: {
    id: 'wind_storm', name: '嵐 · The Storm', faction: 'wind', flavor: 'spicy', isBoss: false,
    hpByAct: [27, 34, 42], startArmorByAct: [0, 0, 0],
    traitName: '二牌飓风', traitDesc: '每回合打出第 2 张牌后，吹飞其余手牌并重抽等量新牌！',
    powersByAct: () => [{ id: 'storm_sweep', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '狂风卷袭' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '双旋风刃' },
      { type: 'attack', dmg: [7, 9, 11][a], hits: 1, label: '飓风撕裂' }
    ]
  },
  wind_voice: {
    id: 'wind_voice', name: '声 · The Voice', faction: 'wind', flavor: 'sour', isBoss: false,
    hpByAct: [25, 32, 40], startArmorByAct: [0, 0, 0],
    traitName: '回声忌讳', traitDesc: '同回合打出同名牌会自损 1 血，并令【声】本回合攻击 +2。',
    powersByAct: () => [{ id: 'voice_echo', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '尖啸冲击' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '回声双震' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '共鸣爆音' }
    ]
  },
  wind_sovereign: {
    id: 'wind_sovereign', name: '风 · The Windy', faction: 'wind', flavor: 'salty', isBoss: true,
    hpByAct: [36, 46, 58], startArmorByAct: [0, 0, 0],
    traitName: '乱流洗费', traitDesc: '每回合初将全部手牌费用随机洗为 0–2 费（必含 0 费与 2 费，回合末复原）。',
    powersByAct: () => [{ id: 'wind_shuffle_cost', stacks: 1 }],
    patternByAct: (a) => [
      { type: 'attack', dmg: [5, 7, 9][a], hits: 1, label: '风灵缚阵' },
      { type: 'attack', dmg: [3, 4, 5][a], hits: 2, label: '青岚双刃' },
      { type: 'attack', dmg: [6, 8, 10][a], hits: 1, label: '御风裂空' }
    ]
  }
};

export function getEnemiesByFaction(faction) {
  const subs = Object.values(ENEMY_DB).filter(e => e.faction === faction && !e.isBoss);
  const boss = Object.values(ENEMY_DB).find(e => e.faction === faction && e.isBoss);
  return { subs, boss };
}

export function generateThreeActRoute(rng) {
  const factions = ['water', 'earth', 'fire', 'wind'];
  for (let i = factions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [factions[i], factions[j]] = [factions[j], factions[i]];
  }
  const picked = factions.slice(0, 3);
  const nodes = [];
  let idx = 0;

  picked.forEach((fac, actIdx) => {
    const meta = FACTION_META[fac];
    const { subs, boss } = getEnemiesByFaction(fac);
    const pool = [...subs];
    const chosenSubs = [];
    for (let k = 0; k < 2; k++) {
      const pickI = Math.floor(rng() * pool.length);
      chosenSubs.push(pool.splice(pickI, 1)[0]);
    }
    const chapterBattles = [...chosenSubs, boss];
    chapterBattles.forEach((en, bIdx) => {
      nodes.push({
        index: idx++,
        type: 'combat',
        actIndex: actIdx,
        faction: fac,
        enemyId: en.id,
        flavor: en.flavor,
        isBoss: !!en.isBoss,
        label: `第 ${actIdx + 1} 章 · ${bIdx === 2 ? '统领 ' : ''}${en.name.split(' · ')[0]}`,
        bg: meta.bg,
        bgm: en.isBoss ? 'boss' : meta.bgm
      });
      // Campfire after every battle except the final Act 3 Boss
      if (!(actIdx === 2 && bIdx === 2)) {
        nodes.push({
          index: idx++,
          type: 'campfire',
          actIndex: actIdx,
          faction: fac,
          lastFlavor: en.flavor,
          label: `第 ${actIdx + 1} 章 · 营地休整`
        });
      }
    });
  });

  return { factions: picked, nodes };
}
