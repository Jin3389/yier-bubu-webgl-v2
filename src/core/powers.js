// Unified Slay-the-Spire Power registry covering all 5 classes and all 36 Elemental enemy traits

export const POWER_DEFS = {
  // === Hero / Shared Powers ===
  stance_defense: { id: 'stance_defense', name: '防御形态', icon: '🛡️', desc: () => '仅可用防御/效果牌；全额格挡触发 5 伤精防反击。' },
  stance_offense: { id: 'stance_offense', name: '进攻形态', icon: '⚔️', desc: () => '仅可用进攻/效果牌；单次伤害 ≥ 敌方预告单段攻触发破防 1.25×。' },
  adjust_next:    { id: 'adjust_next',    name: '收力微调', icon: '⚖️', desc: (s) => `下张牌伤害或护甲 ${s > 0 ? '+' + s : s}。` },
  evade_all:      { id: 'evade_all',      name: '烟雾闪避', icon: '🌫️', desc: () => '本回合完全免疫敌方所有攻击伤害。' },
  next_double:    { id: 'next_double',    name: '暗扣连发', icon: '🧷', desc: () => '本回合下张打出的工具或赃物触发 2 次。' },
  weak_atk:       { id: 'weak_atk',       name: '攻势削弱', icon: '⬇️', desc: (s) => `本回合单段攻击伤害 -${s}。` },
  strength:       { id: 'strength',       name: '力量',     icon: '💪', desc: (s) => `每次攻击额外 +${s} 伤害。` },
  spicy_burn:     { id: 'spicy_burn',     name: '辣灼',     icon: '🌶️', desc: (s) => `回合末受到 ${s} 点穿透伤并衰减 1 层。` },
  self_heat:      { id: 'self_heat',      name: '上火',     icon: '🔥', desc: (s) => `回合末自身失去 ${s} 血并衰减 1 层（苦味可减半）。` },
  bitter_suppress:{ id: 'bitter_suppress',name: '苦味压制', icon: '🍵', desc: () => '本回合自身自损与上火伤害减半。' },
  salty_preserve: { id: 'salty_preserve', name: '咸味保鲜', icon: '🧂', desc: (s) => `下张牌伤害/回血 +${s}（辣灼额外 +1 层）。` },
  star_mark:      { id: 'star_mark',      name: '星印',     icon: '⭐', desc: (s) => `已叠加 ${s} 层星印，可被【星爆】【星锁】引爆。` },
  match_boost:    { id: 'match_boost',    name: '教鞭增幅', icon: '🌈', desc: (s) => `本回合下次三消效果额外 +${s}。` },

  // === Water Traits ===
  bubble_armor:   { id: 'bubble_armor',   name: '泡沫封膜', icon: '🫧', desc: (s) => `护甲击碎时为牌库随机 1 牌裹上泡泡膜（上限 ${s}）。` },
  wave_wash:      { id: 'wave_wash',      name: '海浪冲刷', icon: '🌊', desc: () => '造成生命伤时冲走留牌且下回合少抽 1 牌。' },
  mist_veil:      { id: 'mist_veil',      name: '迷雾遮蔽', icon: '🌫️', desc: () => '部分回合隐藏攻击预告。' },
  rain_ramp:      { id: 'rain_ramp',      name: '骤雨连针', icon: '🌧️', desc: () => '固定 3 段连击，攻势逐拍递增。' },
  freeze_chill:   { id: 'freeze_chill',   name: '冰甲寒潮', icon: '🧊', desc: () => '造成生命伤时冻结玩家下回合 1 点费用。' },
  snow_drop:      { id: 'snow_drop',      name: '落雪塞牌', icon: '❄️', desc: () => '每回合末向弃牌堆塞入 1 张【积雪】。' },
  cloud_split:    { id: 'cloud_split',    name: '云团分裂', icon: '☁️', desc: (s) => `可分裂为多个独立云团；击散分身会为其余分身回复 ${s} 血。` },
  wood_segment:   { id: 'wood_segment',   name: '分段树干', icon: '🌿', desc: () => '每 10 血一段，未斩断残段回合末回满；斩断 1 段本回合敌攻 -2。' },
  water_tide:     { id: 'water_tide',     name: '潮汐',     icon: '🌊', desc: (s) => `当前 ${s}/6；满 6 放海啸，每受 5 血伤降 1，归 0 搁浅。` },
  stranded:       { id: 'stranded',       name: '搁浅',     icon: '🐚', desc: (s) => `受伤 +30%（剩余 ${s} 回合）。` },

  // === Earth Traits ===
  flower_petal:   { id: 'flower_petal',   name: '落英诱惑', icon: '🌸', desc: () => '回合初塞入 0 费虚无【花瓣】，打出使【花】永久 +1 力量。' },
  sand_dampen:    { id: 'sand_dampen',    name: '流沙泄力', icon: '⏳', desc: () => '每回合受到的第 1 次直伤减半。' },
  shield_reduce:  { id: 'shield_reduce',  name: '坚盾减伤', icon: '🛡️', desc: () => '拥有护甲时，每次受到直伤 -1（最低 1）。' },
  lock_edges:     { id: 'lock_edges',     name: '锁链手牌', icon: '🔒', desc: () => '仅可打出最左或最右两端的手牌。' },
  scales_tax:     { id: 'scales_tax',     name: '等量天平', icon: '⚖️', desc: () => '本回合你每打 1 张牌，敌方预告攻击实时 +1。' },
  loop_energy:    { id: 'loop_energy',    name: '轮回费用', icon: '♾️', desc: () => '玩家费用在 2 费（奇）与 4 费（偶）间交替。' },
  maze_draw:      { id: 'maze_draw',      name: '迷宫探路', icon: '🌀', desc: () => '基础抽 3 牌；每打 2 张牌自动额外抽 1 牌。' },
  mirror_copy:    { id: 'mirror_copy',    name: '镜面复刻', icon: '🪞', desc: (s) => `下回合单段攻复制你本回合最高单次直伤（上限 ${s}）。` },
  earth_terrain:  { id: 'earth_terrain',  name: '山岳/裂谷',icon: '⛰️', desc: () => '奇数回合山岳（双方直伤 -2），偶数回合裂谷（双方直伤 +2）。' },

  // === Fire Traits ===
  arrow_step:     { id: 'arrow_step',     name: '断箭削段', icon: '🏹', desc: (s) => `每受 ${s} 点血伤减少 1 段攻击（最低 1 段）。` },
  fight_frenzy:   { id: 'fight_frenzy',   name: '半血狂热', icon: '🥊', desc: () => '半血以下进入狂热：双方每次直伤 +2。' },
  power_inertia:  { id: 'power_inertia',  name: '蓄力惯性', icon: '💪', desc: () => 'T1 蓄力受击减伤 → T2 重锤 → T3 力竭（受伤 +50%）。' },
  shot_lock:      { id: 'shot_lock',      name: '热能锁定', icon: '🎯', desc: (s) => `当前锁定 ${s} 层（每层 +1 攻）；单回合打 ≥3 张牌清空。` },
  sword_first_vuln:{ id: 'sword_first_vuln', name: '破绽剑客', icon: '⚔️', desc: () => '每回合受到的第 1 次直伤 +50%。' },
  through_empty:  { id: 'through_empty',  name: '空手反穿', icon: '🌀', desc: (s) => `余牌每张敌攻 +1；打空手牌反穿敌方 ${s} 伤！` },
  thunder_ground: { id: 'thunder_ground', name: '留费避雷', icon: '⚡', desc: (s) => `结束留 ≥1 费使雷击减半并反震 ${s} 伤！` },
  twin_revive:    { id: 'twin_revive',    name: '双生共鸣', icon: '👯', desc: () => '必须同回合击倒双子，否则存活者回合末以半血复活同伴。' },
  fire_overheat:  { id: 'fire_overheat',  name: '扇风过载', icon: '🔥', desc: (s) => `1–3 牌敌攻叠加；≥4 牌过载敌攻减半并自灼 ${s} 血！` },

  // === Wind Traits ===
  dash_turbo:     { id: 'dash_turbo',     name: '疾速狂飙', icon: '💨', desc: () => '玩家每回合 4 费抽 5 牌，敌方高速多段。' },
  float_zero_g:   { id: 'float_zero_g',   name: '零重力',   icon: '🎈', desc: () => '手牌全部自动浮空保留；次拍起每回合抽 2 牌。' },
  fly_altitude:   { id: 'fly_altitude',   name: '高低空',   icon: '🪽', desc: () => 'T1 高空受伤减半；T2/T3 低空受击每次 +2 伤。' },
  jump_parity:    { id: 'jump_parity',    name: '奇偶弹跳', icon: '🐇', desc: () => '奇数次直伤 -1，偶数次直伤 +2。' },
  move_hide:      { id: 'move_hide',      name: '亚空间藏牌',icon: '🌌', desc: (s) => `藏起 1 张手牌，本回合打满 ${s} 血伤夺回。` },
  song_tax:       { id: 'song_tax',       name: '咏叹增费', icon: '🎵', desc: () => '每回合随机 1 张手牌费用 +1。' },
  storm_sweep:    { id: 'storm_sweep',    name: '二牌飓风', icon: '🌪️', desc: () => '打出第 2 张牌后吹飞余牌并重抽等量新牌。' },
  voice_echo:     { id: 'voice_echo',     name: '回声忌讳', icon: '🗣️', desc: () => '同回合打同名牌自损 1 血且敌攻 +2。' },
  wind_shuffle_cost:{ id: 'wind_shuffle_cost', name: '乱流洗费', icon: '🎐', desc: () => '每回合初将手牌费用随机洗为 0–2 费。' }
};

export function getPower(entity, id) {
  return entity.powers.find(p => p.id === id) || null;
}

export function getPowerStacks(entity, id) {
  const p = getPower(entity, id);
  return p ? p.stacks : 0;
}

export function setPower(entity, id, stacks) {
  const keepZero = id === 'water_tide' || id === 'shot_lock';
  const idx = entity.powers.findIndex(p => p.id === id);
  if (stacks === 0 && !keepZero) {
    if (idx !== -1) entity.powers.splice(idx, 1);
    return;
  }
  if (idx !== -1) entity.powers[idx].stacks = stacks;
  else entity.powers.push({ id, stacks });
}

export function removePower(entity, id) {
  const idx = entity.powers.findIndex(p => p.id === id);
  if (idx !== -1) entity.powers.splice(idx, 1);
}
