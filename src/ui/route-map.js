// Slay-the-Spire Inspired 3-Act 9-Battle Parchment Route Map Component
// Icons: Clow Card = StS Horned Elite Skull | Sovereign Boss = Elemental Crest | Campfire = Crossed-Logs Flame

import { FACTION_META, ENEMY_DB } from '../data/enemies.js';

const FACTION_STYLE = {
  water: { color: '#38bdf8', ink: '#0c4a6e', label: '水之章' },
  earth: { color: '#d97706', ink: '#78350f', label: '地之章' },
  fire:  { color: '#ef4444', ink: '#7f1d1d', label: '火之章' },
  wind:  { color: '#10b981', ink: '#065f46', label: '风之章' },
  light: { color: '#f59e0b', ink: '#78350f', label: '光之章' },
  dark:  { color: '#a855f7', ink: '#4c1d95', label: '暗之章' }
};

// StS-style Horned Elite Skull (for Clow Card sub-battles)
export function svgEliteIcon() {
  return `<svg viewBox="0 0 36 36" class="map-svg map-svg-elite" aria-hidden="true">
    <path d="M8 14 C4 10, 4 5, 9 4 C7 8, 9 10, 12 11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M28 14 C32 10, 32 5, 27 4 C29 8, 27 10, 24 11" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M10 17 C10 10.5, 26 10.5, 26 17 C26 21, 24 23.5, 22.5 25 L22.5 29 L13.5 29 L13.5 25 C12 23.5, 10 21, 10 17 Z" fill="currentColor" fill-opacity="0.16" stroke="currentColor" stroke-width="2.1" stroke-linejoin="round"/>
    <circle cx="14.5" cy="18.2" r="2.2" fill="currentColor"/>
    <circle cx="21.5" cy="18.2" r="2.2" fill="currentColor"/>
    <path d="M18 21.2 L16.7 23.8 L19.3 23.8 Z" fill="currentColor"/>
    <line x1="15.8" y1="26" x2="15.8" y2="29" stroke="currentColor" stroke-width="1.6"/>
    <line x1="18" y1="26" x2="18" y2="29" stroke="currentColor" stroke-width="1.6"/>
    <line x1="20.2" y1="26" x2="20.2" y2="29" stroke="currentColor" stroke-width="1.6"/>
  </svg>`;
}

// StS-style Campfire Icon (Crossed logs + dancing flame)
export function svgCampfireIcon() {
  return `<svg viewBox="0 0 36 36" class="map-svg map-svg-camp" aria-hidden="true">
    <path d="M18 6 C21 11, 25 13.5, 24.5 19 C24.2 22.8, 21.4 25, 18 25 C14.6 25, 11.8 22.8, 11.5 19 C11 14.5, 14.5 12, 15.2 9.5 C16.2 11.2, 16.5 12, 17 12 C16.8 9.8, 17.2 7.8, 18 6 Z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
    <path d="M18 14 C19.8 16.5, 20.6 18.4, 20.2 20.4 C19.9 21.8, 19 22.6, 18 22.6 C17 22.6, 16.1 21.8, 15.8 20.4 C15.4 18.4, 16.2 16.5, 18 14 Z" fill="currentColor"/>
    <line x1="8.5" y1="29.5" x2="27.5" y2="25.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
    <line x1="8.5" y1="25.5" x2="27.5" y2="29.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
  </svg>`;
}

// Elemental Boss Crest SVGs (Water / Earth / Fire / Wind + Light / Dark)
export function svgElementBossIcon(faction) {
  if (faction === 'water') {
    return `<svg viewBox="0 0 44 44" class="map-svg map-svg-boss" aria-hidden="true">
      <path d="M22 5 C22 5, 34 18, 34 26.5 C34 33.2, 28.6 38.5, 22 38.5 C15.4 38.5, 10 33.2, 10 26.5 C10 18, 22 5, 22 5 Z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M13.5 27.5 Q17.8 23.5 22 27.5 T30.5 27.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M16 32.5 Q19 30 22 32.5 T28 32.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="22" cy="18" r="2.2" fill="currentColor"/>
    </svg>`;
  }
  if (faction === 'earth') {
    return `<svg viewBox="0 0 44 44" class="map-svg map-svg-boss" aria-hidden="true">
      <polygon points="22,6 37,35 7,35" fill="currentColor" fill-opacity="0.20" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
      <polyline points="14,35 22,19 27,28 30,24 35,35" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      <polygon points="22,12 25.5,17 22,22 18.5,17" fill="currentColor"/>
    </svg>`;
  }
  if (faction === 'fire') {
    return `<svg viewBox="0 0 44 44" class="map-svg map-svg-boss" aria-hidden="true">
      <path d="M23 5 C27 12, 34 15.5, 34 24.5 C34 32.5, 28.5 38.5, 22 38.5 C15 38.5, 10 33, 10 25.5 C10 19.5, 14.5 16, 15.8 11.5 C17.5 14, 18.2 15.5, 19 16 C18.5 11.5, 20.5 8, 23 5 Z" fill="currentColor" fill-opacity="0.22" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M22 18.5 C25 22.5, 27 25.5, 26.2 29.5 C25.6 32.2, 24 33.8, 22 33.8 C20 33.8, 18.4 32.2, 17.8 29.5 C17 25.5, 19.5 22.5, 22 18.5 Z" fill="currentColor"/>
    </svg>`;
  }
  if (faction === 'wind') {
    return `<svg viewBox="0 0 44 44" class="map-svg map-svg-boss" aria-hidden="true">
      <path d="M8 17 H28 C32 17, 34.5 14.5, 34.5 11.5 C34.5 8.5, 32 6.5, 29 6.5 C26.5 6.5, 24.8 8, 24.5 10" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M6 23.5 H32 C35.5 23.5, 38 26, 38 29 C38 32, 35.5 34.2, 32.5 34.2 C30 34.2, 28.2 32.8, 28 30.8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M11 30 H22 C24.5 30, 26 31.8, 26 33.8 C26 35.8, 24.2 37.2, 22 37.2" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
      <circle cx="15" cy="12" r="2.2" fill="currentColor"/>
    </svg>`;
  }
  if (faction === 'light') {
    return `<svg viewBox="0 0 44 44" class="map-svg map-svg-boss" aria-hidden="true">
      <circle cx="22" cy="22" r="7.5" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2.4"/>
      <path d="M22 5 V11 M22 33 V39 M5 22 H11 M33 22 H39 M10 10 L14.5 14.5 M29.5 29.5 L34 34 M34 10 L29.5 14.5 M14.5 29.5 L10 34" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/>
    </svg>`;
  }
  // dark fallback
  return `<svg viewBox="0 0 44 44" class="map-svg map-svg-boss" aria-hidden="true">
    <path d="M29 10 C22 10, 16 15.5, 16 22.5 C16 29.5, 22 35, 29 35 C22.5 37.5, 13.5 34.5, 10.5 27 C7.5 19.5, 11.5 11, 19.5 9 C23 8.2, 26.2 8.7, 29 10 Z" fill="currentColor" fill-opacity="0.25" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/>
    <circle cx="29" cy="18" r="2" fill="currentColor"/>
  </svg>`;
}

// Hand-drawn Slay-the-Spire crimson ink ring for cleared nodes
function svgClearedInkRing() {
  return `<svg viewBox="0 0 56 56" class="map-cleared-ring" aria-hidden="true">
    <path d="M28 5 C41 4, 52 14, 51 28 C50 42, 40 52, 27 51 C13 50, 4 40, 5 26 C6 13, 17 5, 31 6" fill="none" stroke="#9f1239" stroke-width="3.2" stroke-linecap="round" opacity="0.92"/>
  </svg>`;
}

function describeNode(node) {
  if (node.type === 'campfire') {
    const isInterAct = (node.index === 5 || node.index === 11);
    return {
      short: isInterAct ? '跨章营地' : '篝火',
      title: isInterAct ? `第 ${node.actIndex + 1} 章战后 · 跨章营地休整` : `第 ${node.actIndex + 1} 章 · 篝火营地`
    };
  }
  const en = ENEMY_DB[node.enemyId];
  const shortName = en ? en.name.split(' · ')[0] : node.label;
  if (node.isBoss) {
    return {
      short: `统领 ${shortName}`,
      title: `第 ${node.actIndex + 1} 章首领 · ${en?.name || node.label}`
    };
  }
  return {
    short: shortName,
    title: `第 ${node.actIndex + 1} 章精英 · ${en?.name || node.label}`
  };
}

/**
 * Renders the Slay-the-Spire parchment 3-Act route map.
 * @param {object} run - RunState
 * @param {object} opts - { compact?: boolean, showExpandBtn?: boolean }
 */
export function renderRouteMap(run, opts = {}) {
  const { compact = false, showExpandBtn = false, interactive = false } = opts;
  const nodes = run?.nodes || [];
  const curIdx = run?.nodeIndex ?? 0;
  const factions = run?.factions || [];

  // Group nodes into 3 acts; inter-act campfire (idx 5 and idx 11) sits between acts visually
  const actBlocks = [0, 1, 2].map(actIdx => {
    const fac = factions[actIdx] || 'water';
    const meta = FACTION_META[fac];
    const sty = FACTION_STYLE[fac] || FACTION_STYLE.water;
    const actNodes = nodes.filter(n => n.actIndex === actIdx);
    // Separate intra-chapter nodes (elite, camp, elite, camp, boss) and trailing inter-act campfire
    const mainNodes = actNodes.filter((n, k) => !(k === 5 && n.type === 'campfire'));
    const bridgeCamp = actNodes.find((n, k) => k === 5 && n.type === 'campfire') || null;
    const actDone = mainNodes.every(n => n.index < curIdx);
    const actActive = actNodes.some(n => n.index === curIdx);

    const renderNodeItem = (n) => {
      const stateCls = n.index < curIdx ? 'is-cleared' : (n.index === curIdx ? 'is-current' : 'is-upcoming');
      const isNext = (run.screen === 'campfire' || run.screen === 'shop') && n.index === curIdx + 1;
      const roleCls = n.type === 'campfire' ? 'node-camp' : (n.isBoss ? 'node-boss' : 'node-elite');
      const info = describeNode(n);
      const iconHtml = n.type === 'campfire'
        ? svgCampfireIcon()
        : (n.isBoss ? svgElementBossIcon(n.faction) : svgEliteIcon());

      const canClick = interactive && n.index === curIdx;
      const tag = canClick ? 'button' : 'div';
      const clickAttr = canClick ? 'type="button" data-enter-node="1"' : '';
      const pinText = canClick ? (n.type === 'campfire' ? '点此进营地' : '点此开战') : '当前';
      return `
        <${tag} class="sts-node ${roleCls} ${stateCls} ${isNext ? 'is-next' : ''} ${canClick ? 'is-clickable' : ''}"
             ${clickAttr}
             style="--fac-color:${sty.color};--fac-ink:${sty.ink};"
             title="${canClick ? '点击进入：' : ''}${info.title}">
          <div class="sts-node-disc">
            ${iconHtml}
            ${n.index < curIdx ? svgClearedInkRing() : ''}
          </div>
          <div class="sts-node-lbl">${info.short}</div>
          ${n.index === curIdx ? `<span class="sts-pin current">${pinText}</span>` : ''}
          ${isNext ? `<span class="sts-pin next">下一战</span>` : ''}
        </${tag}>
      `;
    };

    const mainHtml = mainNodes.map((n, k) => {
      const doneEdge = n.index < curIdx ? 'is-cleared' : '';
      const edge = k < mainNodes.length - 1 ? `<div class="sts-edge ${doneEdge}"></div>` : '';
      return renderNodeItem(n) + edge;
    }).join('');

    const bridgeHtml = bridgeCamp ? `
      <div class="sts-act-bridge">
        <div class="sts-edge ${bridgeCamp.index < curIdx ? 'is-cleared' : ''}"></div>
        ${renderNodeItem(bridgeCamp)}
        <div class="sts-edge ${bridgeCamp.index < curIdx ? 'is-cleared' : ''}"></div>
      </div>
    ` : '';

    return `
      <div class="sts-act-col ${actActive ? 'is-active' : ''} ${actDone ? 'is-done' : ''}" style="--fac-color:${sty.color};--fac-ink:${sty.ink};">
        <div class="sts-act-hdr">
          <span class="sts-act-num">第 ${actIdx + 1} 章</span>
          <span class="sts-act-name">${meta ? meta.name.split(' · ')[0] : sty.label}</span>
        </div>
        <div class="sts-act-track">${mainHtml}</div>
      </div>
      ${bridgeHtml}
    `;
  }).join('');

  const combatTotal = nodes.filter(n => n.type === 'combat').length;
  const combatCleared = nodes.filter(n => n.type === 'combat' && n.index < curIdx).length;

  return `
    <div class="sts-map-scroll ${compact ? 'is-compact' : 'is-full'}">
      <div class="sts-map-head">
        <div class="sts-map-title">
          <span>🗺️ 三章九战试炼路线图</span>
          <span class="sts-map-progress">已破 ${combatCleared} / ${combatTotal} 战</span>
        </div>
        <div class="sts-map-legend">
          <span class="leg-item">${svgEliteIcon()}<em>库洛精英</em></span>
          <span class="leg-item">${svgCampfireIcon()}<em>篝火营地</em></span>
          <span class="leg-item">${svgElementBossIcon(factions[0] || 'water')}<em>元素统领</em></span>
          ${showExpandBtn ? `<button class="btn-map-expand" id="btn-open-map" type="button">展开全图</button>` : ''}
        </div>
      </div>
      <div class="sts-map-canvas">${actBlocks}</div>
    </div>
  `;
}
