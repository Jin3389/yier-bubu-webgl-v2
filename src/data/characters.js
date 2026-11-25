// Complete 5 Classes with Scheme B Class-Specific Campfire Room Configs

export const CHARACTERS = {
  knight: {
    id: 'knight',
    name: '骑士布布',
    title: '双态对拼骑士',
    avatar: '🛡️',
    maxHp: 32,
    hasArmor: true,
    startGold: 0,
    activeSkillName: '换阵',
    activeSkillCost: 1,
    activeSkillDesc: '每回合限 1 次，切换防御/进攻形态（切防御 +2 甲；切进攻抽 1 牌）。',
    summary: '唯一护甲职业，固定 10 张牌不膨胀。攻防双态切换，精防反击、精攻破防连段。',
    tags: ['唯一护甲', '攻防双态', '固定10张'],
    restBg: './assets/bg/bg-camp-knight.webp',
    restBgFallback: './assets/bg/bg-campfire-default.webp',
    restTitle: '军帐木偶营地',
    restDesc: '火盆旁立着刻满剑痕的练功木偶。你可以营火休整，或用木偶对练 1 换 1 打磨招式。',
    campfireActions: [
      { id: 'rest_heal', icon: '🔥', label: '营火休整', desc: '回复 6 点生命值。' },
      { id: 'knight_spar', icon: '⚔️', label: '木偶对练', desc: '选 1 张旧招替换为进阶招式（保持 10 张套组）。' }
    ],
    starterDeck: ['k_hshield','k_hshield','k_rshield','k_rshield','k_hslash','k_hslash','k_lthrust','k_lthrust','k_shift','k_adjust'],
    starterRelics: [
      { id: 'relic_knight_oath', icon: '🛡️', name: '铁壁骑士誓', desc: '开战默认进入防御形态；防御态全额格挡敌攻触发 5 伤精防反击。' }
    ]
  },

  thief: {
    id: 'thief',
    name: '小偷布布',
    title: '黑市赃物大盗',
    avatar: '🦝',
    maxHp: 30,
    hasArmor: false,
    startGold: 25,
    activeSkillName: '翻包',
    activeSkillCost: 1,
    activeSkillDesc: '每回合限 1 次，从抽牌堆检视最多 3 张消耗牌（含赃物与工具），选 1 张入手。',
    summary: '零护甲大牌组。战中摸白→大红六阶赃物（36 件专属大红），砸掉救急或活着背进黑市销赃买神装！',
    tags: ['六阶摸金', '36件专属大红', '黑市销赃'],
    restBg: './assets/bg/bg-camp-thief.webp',
    restBgFallback: './assets/bg/bg-campfire-default.webp',
    restTitle: '地下暗室暖炉',
    restDesc: '麻袋里叮当作响。你可以在暖炉旁包扎，或者直接进地下黑市销赃扫货。',
    campfireActions: [
      { id: 'rest_heal', icon: '🔥', label: '暖炉休整', desc: '回复 6 点生命值。' },
      { id: 'thief_market', icon: '🏴‍☠️', label: '进入黑市', desc: '出售赃物换金币，购入高充能装备与永久强化。' }
    ],
    starterDeck: ['th_dagger','th_dagger','th_steal','th_steal','th_dodge','th_dodge','th_rope','th_rope','th_powder','th_powder','th_clasp','th_smoke'],
    starterRelics: [
      { id: 'relic_thief_bag', icon: '🎒', name: '无底麻袋', desc: '战中未砸掉的赃物会永久背回营地，可在黑市高价变现。' }
    ]
  },

  chef: {
    id: 'chef',
    name: '厨师布布',
    title: '五味血池大厨',
    avatar: '🍳',
    maxHp: 42,
    hasArmor: false,
    startGold: 0,
    activeSkillName: '控火',
    activeSkillCost: 1,
    activeSkillDesc: '每回合限 1 次，选 1 张手牌放回牌库顶并另抽 1 张，精准掌控五味节奏。',
    summary: '零护甲高血池，固定 10 张牌。酸辣卖血爆发、甜回血、苦减半自损、咸保鲜放大下张正面效果。',
    tags: ['高血池', '五味联动', '篝火烹调'],
    restBg: './assets/bg/bg-camp-chef.webp',
    restBgFallback: './assets/bg/bg-campfire-default.webp',
    restTitle: '魔法铁锅营地',
    restDesc: '铁锅咕嘟作响。你可以喝碗热汤回血，或将刚收集的风味调料烹成进阶菜肴。',
    campfireActions: [
      { id: 'rest_heal', icon: '🔥', label: '热汤休整', desc: '回复 8 点生命值。' },
      { id: 'chef_cook', icon: '🍲', label: '篝火烹调', desc: '把对应口味的基础调料升级为进阶菜肴（或大师料理）。' }
    ],
    starterDeck: ['c_sour','c_sour','c_spicy','c_spicy','c_sweet','c_sweet','c_bitter','c_bitter','c_salty','c_salty'],
    starterRelics: [
      { id: 'relic_chef_pot', icon: '🍲', name: '五味铁锅', desc: '高血量血池作战；每战后可按敌方风味烹制专属菜肴。' }
    ]
  },

  teacher: {
    id: 'teacher',
    name: '老师布布',
    title: '三消板书导师',
    avatar: '📐',
    maxHp: 32,
    hasArmor: false,
    startGold: 0,
    activeSkillName: '彩色粉笔',
    activeSkillCost: 0,
    activeSkillDesc: '每回合限 1 次（0 费），选 1 张手牌色块改染为红/蓝/黄，丝滑凑满三消！',
    summary: '红蓝黄三消构筑，固定 10 张牌。红×3 重点轰炸、蓝×3 减攻回血、黄×3 回费爆抽。',
    tags: ['红蓝黄三消', '0费改色', '单轨升级'],
    restBg: './assets/bg/bg-camp-teacher.webp',
    restBgFallback: './assets/bg/bg-campfire-default.webp',
    restTitle: '灯下备课书桌',
    restDesc: '油灯映着小黑板与彩色粉笔盒。你可以稍作小憩，或批改教案将基础色块升级为双格进阶牌。',
    campfireActions: [
      { id: 'rest_heal', icon: '🔥', label: '灯下小憩', desc: '回复 6 点生命值。' },
      { id: 'teacher_prep', icon: '🖍️', label: '灯下备课', desc: '将 1 张基础色块升级为双格进阶牌（一次计 2 格）。' }
    ],
    starterDeck: ['t_red','t_red','t_red','t_blue','t_blue','t_blue','t_yellow','t_yellow','t_yellow','t_wild'],
    starterRelics: [
      { id: 'relic_teacher_chalk', icon: '🖍️', name: '三色粉笔盒', desc: '同色满 3 格自动触发三消爆发：红打 8 伤 / 蓝减攻 6 回 3 血 / 黄回 1 费抽 2 牌。' }
    ]
  },

  yier: {
    id: 'yier',
    name: '一二',
    title: '库洛封印师',
    avatar: '🐼',
    maxHp: 32,
    hasArmor: false,
    startGold: 0,
    activeSkillName: '魔杖封印',
    activeSkillCost: 1,
    activeSkillDesc: '当敌方生命 ≤ 40% 且有空白封印卡时，花 1 费直接收服敌方并获得强力库洛牌！',
    summary: '叠【星印】引爆穿透伤害或打断敌攻，看准残血窗口用魔杖直接封印库洛牌加入卡组！',
    tags: ['星印引爆', '残血封印', '库洛收集'],
    restBg: './assets/bg/bg-camp-yier.webp',
    restBgFallback: './assets/bg/bg-campfire-default.webp',
    restTitle: '星阵封印石台',
    restDesc: '星光在石台纹路间流转。你可以冥想回复生命，或解放已封印的库洛牌以腾出新的空白封印位。',
    campfireActions: [
      { id: 'rest_heal', icon: '🔥', label: '星光冥想', desc: '回复 6 点生命值。' },
      { id: 'yier_release', icon: '✨', label: '魔杖解封', desc: '解放 1 张旧库洛牌腾出空白封印位，或强化星印牌。' }
    ],
    starterDeck: ['y_bolt','y_bolt','y_bolt','y_shield','y_shield','y_shield','y_dot','y_dot','y_burst','y_lock'],
    starterRelics: [
      { id: 'relic_yier_wand', icon: '🪄', name: '梦之魔杖', desc: '初始携带 2 张空白封印卡；敌方 ≤ 40% 血时可发动【魔杖封印】直接收服。' }
    ]
  }
};
