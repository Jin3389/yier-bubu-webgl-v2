// Unified Dark-Fantasy Card Visual Spec (Frame Tier Palette + Art Window Slot + Bespoke Emblem SVGs)
// Supports seamless drop-in real card art via `card.art` (e.g. './assets/cards/k_heavy.webp') when ready.

import { LOOT_RARITIES } from '../data/loot.js';

const FLAVOR_META = {
  sour:  { cls: 'frame-flavor-sour',  label: '酸', accent: '#a3e635' },
  spicy: { cls: 'frame-flavor-spicy', label: '辣', accent: '#f97316' },
  sweet: { cls: 'frame-flavor-sweet', label: '甜', accent: '#f472b6' },
  bitter:{ cls: 'frame-flavor-bitter',label: '苦', accent: '#34d399' },
  salty: { cls: 'frame-flavor-salty', label: '咸', accent: '#93c5fd' }
};

const COLOR_META = {
  red:    { cls: 'frame-lesson-red',    label: '红·课程', dot: '#fb7185' },
  blue:   { cls: 'frame-lesson-blue',   label: '蓝·课程', dot: '#38bdf8' },
  yellow: { cls: 'frame-lesson-yellow', label: '黄·课程', dot: '#fbbf24' },
  wild:   { cls: 'frame-lesson-wild',   label: '彩·粉笔', dot: '#e879f9' }
};

// Crisp dark-fantasy card art emblems (used cleanly inside art window until real card.art images are painted)
function svgCardEmblem(kind) {
  switch (kind) {
    case 'clow':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <circle cx="32" cy="22" r="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2.5" opacity="0.8"/>
        <circle cx="32" cy="22" r="11" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.5"/>
        <path d="M32 7 L35 18 L46 22 L35 26 L32 37 L29 26 L18 22 L29 18 Z" fill="currentColor" fill-opacity="0.88"/>
      </svg>`;
    case 'attack':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <path d="M16 34 L44 8 L48 12 L20 38 Z" fill="currentColor" fill-opacity="0.24" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
        <path d="M48 34 L20 8 L16 12 L44 38 Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" opacity="0.72"/>
        <line x1="14" y1="29" x2="25" y2="39" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        <line x1="50" y1="29" x2="39" y2="39" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`;
    case 'defense':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <path d="M32 6 L47 12 V23 C47 31, 40 36.5, 32 39.5 C24 36.5, 17 31, 17 23 V12 Z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <path d="M32 11 V34 M22 18 H42" stroke="currentColor" stroke-width="1.6" opacity="0.75"/>
      </svg>`;
    case 'flavor':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <path d="M18 22 H46 C46 31, 40 37, 32 37 C24 37, 18 31, 18 22 Z" fill="currentColor" fill-opacity="0.24" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <line x1="15" y1="22" x2="49" y2="22" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M25 16 Q23 12 26 8 M32 15 Q30 11 33 7 M39 16 Q37 12 40 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      </svg>`;
    case 'lesson':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <circle cx="22" cy="24" r="7" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2"/>
        <circle cx="42" cy="24" r="7" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2"/>
        <circle cx="32" cy="14" r="7.5" fill="currentColor" fill-opacity="0.35" stroke="currentColor" stroke-width="2.2"/>
      </svg>`;
    case 'loot':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <polygon points="32,6 48,18 42,36 22,36 16,18" fill="currentColor" fill-opacity="0.24" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <polyline points="16,18 32,24 48,18" fill="none" stroke="currentColor" stroke-width="1.7"/>
        <line x1="32" y1="24" x2="32" y2="36" stroke="currentColor" stroke-width="1.7"/>
      </svg>`;
    case 'status':
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <path d="M32 7 V37 M17 15 L47 29 M47 15 L17 29" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
        <circle cx="32" cy="22" r="5" fill="currentColor" fill-opacity="0.3" stroke="currentColor" stroke-width="1.8"/>
      </svg>`;
    default: // tool / skill / power
      return `<svg viewBox="0 0 64 44" class="card-emblem-svg" aria-hidden="true">
        <polygon points="32,7 44,22 32,37 20,22" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>
        <circle cx="32" cy="22" r="4.5" fill="currentColor"/>
      </svg>`;
  }
}

export function getCardVisualSpec(card) {
  // 1. Clow Sealed Card
  if (card.isClow) {
    return {
      frameCls: 'frame-clow',
      typeLabel: '库洛封印',
      emblemKind: 'clow',
      accentDot: ''
    };
  }
  // 2. Thief 6-Tier Loot
  if (card.type === 'loot' || card.rarity) {
    const rar = LOOT_RARITIES[card.rarity] || LOOT_RARITIES.white;
    return {
      frameCls: `frame-loot rarity-${card.rarity || 'white'}`,
      typeLabel: `${rar.label}·战利品`,
      emblemKind: 'loot',
      accentDot: ''
    };
  }
  // 3. Status / Derivative Card (Snow / Petal)
  if (card.type === 'status') {
    return {
      frameCls: 'frame-status',
      typeLabel: '衍生状态',
      emblemKind: 'status',
      accentDot: ''
    };
  }
  // 4. Teacher Match-3 Lesson Cards (respects live dyedColor!)
  if (card.type === 'lesson' || card.color || card.dyedColor) {
    const effColor = card.dyedColor || card.color || 'wild';
    const cm = COLOR_META[effColor] || COLOR_META.wild;
    const count = card.colorCount || 1;
    const dots = Array.from({ length: Math.min(2, count) }, () => `<i class="card-color-dot" style="background:${cm.dot};box-shadow:0 0 6px ${cm.dot};"></i>`).join('');
    return {
      frameCls: cm.cls,
      typeLabel: card.dyedColor ? `${cm.label}(染)` : cm.label,
      emblemKind: 'lesson',
      accentDot: dots
    };
  }
  // 5. Chef 5-Flavor Cards
  if (card.flavor) {
    const fm = FLAVOR_META[card.flavor] || FLAVOR_META.spicy;
    const isDish = card.id?.endsWith('_dish');
    return {
      frameCls: fm.cls,
      typeLabel: `${fm.label}·${isDish ? '菜肴' : '风味'}`,
      emblemKind: 'flavor',
      accentDot: ''
    };
  }
  // 6. Standard Attack / Defense / Power / Tool
  if (card.type === 'attack' || card.type === 'offense') {
    return { frameCls: 'frame-attack', typeLabel: '进攻', emblemKind: 'attack', accentDot: '' };
  }
  if (card.type === 'defense' || card.type === 'skill') {
    return { frameCls: 'frame-defense', typeLabel: card.type === 'defense' ? '防御' : '技巧', emblemKind: 'defense', accentDot: '' };
  }
  return {
    frameCls: 'frame-power',
    typeLabel: card.type === 'tool' ? '摸金具' : '能力',
    emblemKind: 'power',
    accentDot: ''
  };
}

// Highlight numbers and key bracketed terms inside card descriptions for instant scannability
export function formatCardDesc(desc = '') {
  return String(desc)
    .replace(/【([^】]+)】/g, '<span class="kw-hl">【$1】</span>')
    .replace(/([+-]?\d+(?:×\d+)?%?)/g, '<strong class="num-hl">$1</strong>');
}

export function renderCardArtWindow(card, spec) {
  if (card.art) {
    return `
      <div class="card-art-window has-art">
        <img class="card-art-img" src="${card.art}" alt="${card.name}" loading="lazy" />
        <div class="card-art-vignette"></div>
      </div>
    `;
  }
  return `
    <div class="card-art-window">
      <div class="card-art-backdrop"></div>
      <div class="card-art-emblem">
        ${svgCardEmblem(spec.emblemKind)}
      </div>
      ${spec.accentDot ? `<div class="card-art-dots">${spec.accentDot}</div>` : ''}
      <div class="card-art-vignette"></div>
    </div>
  `;
}
