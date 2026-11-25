// HTML/CSS Interactive UI Shell for all 5 Classes, 36 Elemental Enemies, and Scheme B Class Campfire Rooms

import { CHARACTERS } from '../data/characters.js';
import { CARD_DB } from '../data/cards.js';
import { KEYWORDS } from '../data/keywords.js';
import { LOOT_RARITIES } from '../data/loot.js';
import { FACTION_META } from '../data/enemies.js';
import { POWER_DEFS } from '../core/powers.js';
import { canPlayCard } from '../core/combat-engine.js';
import {
  getCurrentNode, getKnightSparOffers, getChefCookOptions,
  getTeacherUpgradeOptions, getYierReleaseOptions
} from '../core/run-engine.js';
import { STAGE_W, STAGE_H } from '../stage/stage-app.js';
import { renderRouteMap } from './route-map.js';
import { getCardVisualSpec, formatCardDesc, renderCardArtWindow } from './card-visuals.js';

export class UiApp {
  constructor({ rootEl, stage, dragCtrl, callbacks }) {
    this.rootEl = rootEl;
    this.stage = stage;
    this.dragCtrl = dragCtrl;
    this.cb = callbacks;

    this.settingsOpen = false;
    this.mapOpen = false;
    this.titleStep = 'hero'; // 'hero' (Bubu vs Yier) | 'bubu_class' (4 Bubu classes)
    this.selectedHero = 'bubu'; // 'bubu' | 'yier'
    this.selectedBubuClass = 'knight'; // 'knight' | 'thief' | 'chef' | 'teacher'
    this._lastRoomKind = null;
    this.knightSwapOffer = null;
    this.toastTimer = null;
    this.toasts = [];
  }

  setInputLocked(locked) {
    this.rootEl.classList.toggle('input-locked', locked);
    this.dragCtrl.setLocked(locked);
  }

  showBanner(text) {
    const el = document.createElement('div');
    el.className = 'turn-banner';
    el.textContent = text;
    this.rootEl.appendChild(el);
    setTimeout(() => el.remove(), 950);
  }

  showToast(text, tone = 'sky') {
    this.toasts.push({ text, tone, id: Math.random() });
    if (this.toasts.length > 3) this.toasts.shift();
    this._renderToastStack();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toasts = [];
      this._renderToastStack();
    }, 2600);
  }

  _renderToastStack() {
    let stack = this.rootEl.querySelector('.toast-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'toast-stack';
      this.rootEl.appendChild(stack);
    }
    stack.innerHTML = this.toasts.map(t => `<div class="toast-item ${t.tone}">${t.text}</div>`).join('');
  }

  renderTitle(hasSave) {
    this._lastRoomKind = 'title';
    const isClassStep = this.titleStep === 'bubu_class';
    const bubuClasses = ['knight', 'thief', 'chef', 'teacher'].map(id => CHARACTERS[id]).filter(Boolean);
    const yier = CHARACTERS.yier;

    let activeSplash = './assets/select/select-bubu.webp';
    let activeKicker = '';
    let activeName = '';
    let activeDesc = '';
    let activeStats = '';
    let activeTags = [];
    let primaryBtnText = '';
    let primaryBtnAction = '';

    if (!isClassStep) {
      if (this.selectedHero === 'yier') {
        activeSplash = './assets/select/select-yier.webp';
        activeKicker = '星光库洛魔导士 · 独立封印构筑';
        activeName = '一二 · Yier';
        activeDesc = yier.summary;
        activeStats = `<span>❤️ 生命 ${yier.maxHp}</span><span>🃏 初始牌 ${yier.starterDeck.length}</span><span>🪄 空白封印 2</span>`;
        activeTags = yier.tags;
        primaryBtnText = '以一二出发试炼 →';
        primaryBtnAction = 'start:yier';
      } else {
        activeSplash = './assets/select/select-bubu.webp';
        activeKicker = '百变职业冒险家 · 4 大专属流派';
        activeName = '布布 · Bubu';
        activeDesc = '圆润可靠的全能冒险主角。选择布布后，可在下级界面任选骑士、小偷、厨师或老师四种截然不同的战斗机制与专属营地成长线。';
        activeStats = `<span>🛡️ 骑士布布</span><span>🏴‍☠️ 小偷布布</span><span>🍲 厨师布布</span><span>🖍️ 老师布布</span>`;
        activeTags = ['攻防双态', '摸金大红', '五味血池', '三消粉笔'];
        primaryBtnText = '选择布布 · 挑选职业 →';
        primaryBtnAction = 'next:bubu_class';
      }
    } else {
      const ch = CHARACTERS[this.selectedBubuClass] || CHARACTERS.knight;
      activeSplash = `./assets/select/select-${ch.id}.webp`;
      activeKicker = `布布职业试炼 · ${ch.title}`;
      activeName = ch.name;
      activeDesc = ch.summary;
      activeStats = `<span>❤️ 生命 ${ch.maxHp}</span><span>🃏 初始牌 ${ch.starterDeck.length}</span><span>⚡ ${ch.activeSkillName}（${ch.activeSkillCost}费）</span>`;
      activeTags = ch.tags;
      primaryBtnText = `以${ch.name}出发试炼 →`;
      primaryBtnAction = `start:${ch.id}`;
    }

    const tilesHtml = !isClassStep
      ? `
        <button class="sts-tile ${this.selectedHero === 'bubu' ? 'is-selected' : ''}" data-pick-hero="bubu" type="button" title="布布（4 大职业）">
          <img src="./assets/select/icon-bubu.webp" alt="布布" />
          <span class="sts-tile-lbl">布布</span>
        </button>
        <button class="sts-tile tile-yier ${this.selectedHero === 'yier' ? 'is-selected' : ''}" data-pick-hero="yier" type="button" title="一二（库洛魔导）">
          <img src="./assets/select/icon-yier.webp" alt="一二" />
          <span class="sts-tile-lbl">一二</span>
        </button>
      `
      : bubuClasses.map(ch => `
        <button class="sts-tile ${this.selectedBubuClass === ch.id ? 'is-selected' : ''}" data-pick-class="${ch.id}" type="button" title="${ch.name} · ${ch.title}">
          <img src="./assets/select/icon-${ch.id}.webp" alt="${ch.name}" />
          <span class="sts-tile-lbl">${ch.name.replace('布布', '')}</span>
        </button>
      `).join('');

    this.rootEl.innerHTML = `
      <div class="sts-select-screen">
        <img class="sts-splash-bg" src="${activeSplash}" alt="${activeName}" />
        <div class="sts-splash-vignette"></div>

        <div class="sts-top-bar">
          <div class="sts-brand">
            <span class="sts-brand-main">一二与布布 · 库洛牌试炼</span>
            <span class="sts-brand-sub">${isClassStep ? '第二步 · 选择布布的冒险职业' : '第一步 · 选择出战主角'}</span>
          </div>
          ${hasSave ? `<button class="btn-bronze" id="btn-continue" type="button">📜 继续上次自动存档</button>` : ''}
        </div>

        <div class="sts-info-card">
          <div class="sts-info-kicker">${activeKicker}</div>
          <h1 class="sts-info-name">${activeName}</h1>
          <div class="sts-info-stats">${activeStats}</div>
          <p class="sts-info-desc">${activeDesc}</p>
          <div class="choice-tags">${activeTags.map(t => `<span>${t}</span>`).join('')}</div>
        </div>

        <div class="sts-bottom-bar">
          <div class="sts-bottom-left">
            ${isClassStep ? `<button class="btn-bronze sts-back-btn" id="btn-back-hero" type="button">← 返回主角</button>` : ''}
          </div>

          <div class="sts-tile-dock">
            <div class="sts-dock-hint">${isClassStep ? '点击方标切换职业预览' : '点击方标切换主角'}</div>
            <div class="sts-tile-row">${tilesHtml}</div>
          </div>

          <div class="sts-bottom-right">
            <button class="btn-end-turn sts-embark-btn" id="btn-embark" data-action="${primaryBtnAction}" type="button">
              ${primaryBtnText}
            </button>
          </div>
        </div>
      </div>
    `;

    this.rootEl.querySelector('#btn-continue')?.addEventListener('click', () => {
      this.titleStep = 'hero';
      this.cb.onContinueRun();
    });

    this.rootEl.querySelectorAll('[data-pick-hero]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.pickHero;
        this.cb.onSelectHeroSfx?.(next);
        if (this.selectedHero !== next) {
          this.selectedHero = next;
          this.renderTitle(hasSave);
        }
      });
    });

    this.rootEl.querySelectorAll('[data-pick-class]').forEach(btn => {
      btn.addEventListener('click', () => {
        const next = btn.dataset.pickClass;
        this.cb.onSelectHeroSfx?.(next);
        if (this.selectedBubuClass !== next) {
          this.selectedBubuClass = next;
          this.renderTitle(hasSave);
        }
      });
    });

    this.rootEl.querySelector('#btn-back-hero')?.addEventListener('click', () => {
      this.cb.onSelectHeroSfx?.('bubu');
      this.titleStep = 'hero';
      this.renderTitle(hasSave);
    });

    this.rootEl.querySelector('#btn-embark')?.addEventListener('click', (e) => {
      const act = e.currentTarget.dataset.action || '';
      if (act === 'next:bubu_class') {
        this.titleStep = 'bubu_class';
        this.cb.onSelectHeroSfx?.(this.selectedBubuClass);
        this.renderTitle(hasSave);
      } else if (act.startsWith('start:')) {
        const charId = act.slice(6);
        this.titleStep = 'hero';
        this.cb.onStartRun(charId);
      }
    });
  }

  _renderTopHud(run, nodeLabel) {
    const ch = CHARACTERS[run.charId];
    const chapNames = (run.factions || []).map(f => FACTION_META[f]?.name.split(' · ')[0] || f).join(' → ');
    return `
      <div class="top-hud">
        <div class="hud-group">
          <span class="hud-title">${ch.avatar} ${ch.name}</span>
          <span class="hud-pill">❤️ ${run.hp} / ${run.maxHp}</span>
          <span class="hud-pill">🪙 ${run.gold} 金</span>
          <span class="hud-pill">🃏 牌组 ${run.deck.length}</span>
          ${run.charId === 'yier' ? `<span class="hud-pill">🪄 空白封印 ${run.yierBlankSeals}</span>` : ''}
          <button class="hud-pill hud-map-btn" id="btn-hud-map" type="button" title="点击展开三章九战路线图（${chapNames}）">🗺️ ${nodeLabel}</button>
        </div>
        <div class="hud-group">
          ${run.relics.map(r => `<span class="relic-chip" title="${r.desc}">${r.icon} ${r.name}</span>`).join('')}
          <div class="gear-wrap">
            <button class="btn-gear" id="btn-gear" title="设置">⚙️</button>
            ${this.settingsOpen ? `
              <div class="settings-popover">
                <button id="set-bgm">🎵 背景音乐：${this.cb.getAudioState().bgm ? '开' : '关'}</button>
                <label class="settings-slider-row">
                  <span>音量</span>
                  <input id="set-bgm-vol" type="range" min="0" max="100" value="${this.cb.getAudioState().bgmVol}" />
                  <span class="vol-num" id="bgm-vol-num">${this.cb.getAudioState().bgmVol}%</span>
                </label>
                <button id="set-sfx">🔊 战斗音效：${this.cb.getAudioState().sfx ? '开' : '关'}</button>
                <label class="settings-slider-row">
                  <span>音量</span>
                  <input id="set-sfx-vol" type="range" min="0" max="100" value="${this.cb.getAudioState().sfxVol}" />
                  <span class="vol-num" id="sfx-vol-num">${this.cb.getAudioState().sfxVol}%</span>
                </label>
                <button id="set-speed">⚡ 演出倍速：${this.cb.getSpeed()}×</button>
                <button id="set-restart">🔄 返回选人封面</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  _renderMapModal(run) {
    if (!this.mapOpen || !run) return '';
    return `
      <div class="room-overlay map-modal-overlay" id="map-modal-backdrop">
        <div class="map-modal-card">
          ${renderRouteMap(run, { compact: false, showExpandBtn: false })}
          <div class="map-modal-foot">
            <span class="map-modal-hint">悬停节点可查看库洛精英与元素统领详情</span>
            <button class="btn-bronze" id="btn-close-map" type="button">✕ 关闭路线图</button>
          </div>
        </div>
      </div>
    `;
  }

  _bindTopHud(rerenderFn) {
    this.rootEl.querySelector('#btn-gear')?.addEventListener('click', () => {
      this.settingsOpen = !this.settingsOpen;
      rerenderFn();
    });
    this.rootEl.querySelector('#set-bgm')?.addEventListener('click', () => { this.cb.onToggleBgm(); rerenderFn(); });
    this.rootEl.querySelector('#set-bgm-vol')?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      this.cb.onSetBgmVolume(v);
      const lbl = this.rootEl.querySelector('#bgm-vol-num');
      if (lbl) lbl.textContent = `${v}%`;
    });
    this.rootEl.querySelector('#set-sfx')?.addEventListener('click', () => { this.cb.onToggleSfx(); rerenderFn(); });
    this.rootEl.querySelector('#set-sfx-vol')?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      this.cb.onSetSfxVolume(v);
      const lbl = this.rootEl.querySelector('#sfx-vol-num');
      if (lbl) lbl.textContent = `${v}%`;
    });
    this.rootEl.querySelector('#set-speed')?.addEventListener('click', () => { this.cb.onToggleSpeed(); rerenderFn(); });
    this.rootEl.querySelector('#set-restart')?.addEventListener('click', () => { this.settingsOpen = false; this.mapOpen = false; this.titleStep = 'hero'; this.cb.onReturnTitle(); });
    this.rootEl.querySelector('#btn-hud-map')?.addEventListener('click', () => { this.mapOpen = !this.mapOpen; rerenderFn(); });
    this.rootEl.querySelector('#btn-open-map')?.addEventListener('click', () => { this.mapOpen = true; rerenderFn(); });
    this.rootEl.querySelector('#btn-close-map')?.addEventListener('click', () => { this.mapOpen = false; rerenderFn(); });
    this.rootEl.querySelector('#map-modal-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'map-modal-backdrop') { this.mapOpen = false; rerenderFn(); }
    });
  }

  syncCombatHud(combat) {
    this._lastRoomKind = 'combat';
    const run = this.cb.getRun();
    if (!run || run.screen !== 'combat' || !combat) return;
    const node = getCurrentNode(run);
    const ch = CHARACTERS[run.charId];
    const heroAnchor = this.stage.getHeroAnchor();
    const enemyMap = this.stage.getEnemyLayoutMap();

    const heroLeftPct = (heroAnchor.x / STAGE_W) * 100;
    const heroTopPct = ((heroAnchor.y + 10) / STAGE_H) * 100;

    const renderPowers = (powers) => powers.map(p => {
      const def = POWER_DEFS[p.id];
      if (!def) return '';
      const val = p.id === 'water_tide' ? ` ${p.stacks}/6` : (p.stacks > 1 || p.id === 'adjust_next' || p.id === 'shot_lock' ? ` ${p.stacks}` : '');
      return `<span class="power-badge" title="${def.desc(p.stacks)}">${def.icon} ${def.name}${val}</span>`;
    }).join('');

    const enemyHuds = combat.enemies.filter(e => e.alive).map(e => {
      const pos = enemyMap[e.uid] || { x: STAGE_W * 0.75, y: 615, topY: 260 };
      const leftPct = (pos.x / STAGE_W) * 100;
      const topBarPct = ((pos.y + 10) / STAGE_H) * 100;
      const intentTopPct = Math.max(9.5, (pos.topY / STAGE_H) * 100 - 3.5);
      const hpPct = Math.max(0, Math.min(100, (e.hp / e.maxHp) * 100));

      let intentCls = '';
      let intentText = e.intent.label;
      if (['split', 'high_fly', 'charge', 'defend'].includes(e.intent.type)) {
        intentCls = 'split';
        intentText = `${e.intent.block ? `🛡️+${e.intent.block} · ` : ''}${e.intent.label}`;
      } else if (e.intent.type === 'stunned' || e.intent.type === 'exhausted') {
        intentCls = 'stunned';
        intentText = `💫 ${e.intent.label}`;
      } else if (e.intent.hits > 0) {
        const blkPart = e.intent.block ? ` 🛡️+${e.intent.block}` : '';
        intentText = `⚔️ ${e.intent.dmg}×${e.intent.hits}${blkPart} · ${e.intent.label}`;
      }

      return `
        <div class="actor-hud" style="left:${leftPct}%;top:${intentTopPct}%;">
          <div class="intent-pill ${intentCls}">${intentText}</div>
        </div>
        <div class="actor-hud" style="left:${leftPct}%;top:${topBarPct}%;">
          <div class="actor-name">${e.name}${e.block > 0 ? ` · 🛡️${e.block}` : ''}</div>
          <div class="hp-bar">
            <div class="hp-fill" style="width:${hpPct}%"></div>
            <div class="hp-text">${e.hp} / ${e.maxHp}</div>
          </div>
          <div class="power-row">${renderPowers(e.powers)}</div>
        </div>
      `;
    }).join('');

    const heroHpPct = Math.max(0, Math.min(100, (combat.hero.hp / combat.hero.maxHp) * 100));

    // Teacher live Match-3 glowing orb gauge (pulses when 2/3 ready to trigger!)
    const renderOrbs = (cnt, cls) => [0, 1, 2].map(i => `<i class="orb-dot ${cls} ${i < cnt ? 'lit' : ''}"></i>`).join('');
    const teacherTrackHtml = combat.hero.id === 'teacher' ? `
      <div class="teacher-orb-panel">
        <div class="orb-row ${combat.teacherTrack.red >= 2 ? 'ready' : ''}"><span>红</span>${renderOrbs(combat.teacherTrack.red, 'red')}</div>
        <div class="orb-row ${combat.teacherTrack.blue >= 2 ? 'ready' : ''}"><span>蓝</span>${renderOrbs(combat.teacherTrack.blue, 'blue')}</div>
        <div class="orb-row ${combat.teacherTrack.yellow >= 2 ? 'ready' : ''}"><span>黄</span>${renderOrbs(combat.teacherTrack.yellow, 'yellow')}</div>
      </div>
    ` : '';

    const n = combat.hand.length;
    const handHtml = combat.hand.map((c, i) => {
      const check = canPlayCard(combat, c);
      const mid = (n - 1) / 2;
      const offset = i - mid;
      const rot = offset * 3.0;
      const dropY = Math.abs(offset) * Math.abs(offset) * 3.2;
      const spec = getCardVisualSpec(c);
      const bubbleCls = c.bubbleWrapped ? 'is-bubble' : '';
      const disabledCls = check.ok ? '' : 'is-disabled';
      const costVal = c.bubbleWrapped ? 1 : (c.tempCost !== null ? c.tempCost : c.cost);
      const costCls = c.bubbleWrapped
        ? 'cost-bubble'
        : (costVal < c.cost ? 'cost-buffed' : (costVal > c.cost ? 'cost-taxed' : ''));

      const kwList = [...(c.keywords || [])];
      if (c.bubbleWrapped && !kwList.includes('bubble')) kwList.unshift('bubble');
      const kwHtml = kwList.map(k => KEYWORDS[k]).filter(Boolean).map(kw => `
        <div class="kw-box">
          <div class="kw-title">${kw.name}</div>
          <div class="kw-desc">${kw.desc}</div>
        </div>
      `).join('');

      const dyeBadge = c.dyedColor ? ` · 染${{ red: '红', blue: '蓝', yellow: '黄' }[c.dyedColor]}` : '';
      const targetTag = c.bubbleWrapped ? '🫧 1费戳破' : (c.target === 'enemy' ? '🎯 拖向敌人' : '⬆️ 上拖打出');

      return `
        <div class="card-ui ${spec.frameCls} ${bubbleCls} ${disabledCls}"
             data-card-uid="${c.uid}"
             style="transform: translateY(${dropY}px) rotate(${rot}deg);"
             title="${check.ok ? targetTag : check.reason}">
          <div class="card-cost ${costCls}">${costVal}</div>
          ${renderCardArtWindow(c, spec)}
          <div class="card-name-ribbon">${c.name}${dyeBadge}</div>
          <div class="card-type-pill">${spec.typeLabel}</div>
          <div class="card-desc">${formatCardDesc(c.desc)}</div>
          <div class="card-tag">${targetTag}${c.uid === combat.retainedUid ? ' · 📌留牌' : ''}</div>
          ${kwHtml ? `<div class="keyword-tooltip">${kwHtml}</div>` : ''}
        </div>
      `;
    }).join('');

    const modalHtml = combat.pendingChoice ? `
      <div class="room-overlay" style="z-index:55;">
        <div class="room-panel" style="max-width:720px;">
          <h2 class="room-h1" style="font-size:24px;">${combat.pendingChoice.title}</h2>
          <p class="room-sub">${combat.pendingChoice.prompt}</p>
          <div class="grid-${combat.pendingChoice.options.length === 2 ? 2 : 3}">
            ${combat.pendingChoice.options.map(opt => `
              <button class="choice-card" data-choice-opt="${opt.id}">
                <h3>${opt.label}</h3>
                <p>${opt.desc}</p>
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    ` : '';

    this.rootEl.innerHTML = `
      ${this._renderTopHud(run, `${node?.label || '战斗'} · 第 ${combat.turn} 回合`)}

      <div class="actor-hud" style="left:${heroLeftPct}%;top:${heroTopPct}%;">
        <div class="actor-name">${combat.hero.name}${combat.hero.block > 0 ? ` · 🛡️${combat.hero.block}` : ''}</div>
        <div class="hp-bar">
          <div class="hp-fill hero" style="width:${heroHpPct}%"></div>
          <div class="hp-text">${combat.hero.hp} / ${combat.hero.maxHp}</div>
        </div>
        <div class="power-row">${renderPowers(combat.hero.powers)}</div>
        ${teacherTrackHtml}
      </div>

      ${enemyHuds}

      <div class="bottom-dock">
        <div class="dock-side left">
          <div class="energy-orb">
            <div class="energy-val">${combat.energy}/${combat.maxEnergy}</div>
            <div class="energy-lbl">费用</div>
          </div>
          <button class="btn-bronze" id="btn-active-skill"
            ${combat.activeUsedThisTurn || combat.energy < ch.activeSkillCost ? 'disabled' : ''}
            title="${ch.activeSkillDesc}">
            ⚡ ${ch.activeSkillName}（${ch.activeSkillCost}费）
          </button>
          <div class="pile-row">
            <span class="pile-badge">抽牌堆 ${combat.drawPile.length}</span>
          </div>
        </div>

        <div class="hand-fan">${handHtml}</div>

        <div class="dock-side right">
          <div class="retain-row">
            <span>留牌</span>
            <select id="sel-retain">
              <option value="">不留</option>
              ${combat.hand.map(c => `<option value="${c.uid}" ${c.uid === combat.retainedUid ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
          <button class="btn-end-turn" id="btn-end-turn">结束回合 [E]</button>
          <div class="pile-row">
            <span class="pile-badge">弃牌 ${combat.discardPile.length}</span>
            <span class="pile-badge">消耗 ${combat.exhaustPile.length}</span>
          </div>
        </div>
      </div>

      ${modalHtml}
      ${this._renderMapModal(run)}
      <div class="toast-stack"></div>
    `;

    this._renderToastStack();
    this._bindTopHud(() => this.syncCombatHud(combat));

    this.rootEl.querySelectorAll('[data-card-uid]').forEach(el => {
      const card = combat.hand.find(c => c.uid === el.dataset.cardUid);
      if (!card) return;
      el.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        this.dragCtrl.startDrag(card, el, e);
      });
    });

    this.rootEl.querySelector('#btn-active-skill')?.addEventListener('click', () => this.cb.onUseActiveSkill());
    this.rootEl.querySelector('#btn-end-turn')?.addEventListener('click', () => this.cb.onEndTurn());
    this.rootEl.querySelector('#sel-retain')?.addEventListener('change', (e) => {
      this.cb.onSetRetain(e.target.value || null);
      this.syncCombatHud(combat);
    });
    this.rootEl.querySelectorAll('[data-choice-opt]').forEach(btn => {
      btn.addEventListener('click', () => this.cb.onResolveChoice(btn.dataset.choiceOpt));
    });
  }

  // Full-Screen Interactive Slay-the-Spire Parchment Map Hub (Entry after Select, Combat & Campfire)
  renderMapHub(run) {
    this._lastRoomKind = 'map';
    const nextNode = getCurrentNode(run);
    const nextDesc = !nextNode
      ? '试炼已全部完成！'
      : (nextNode.type === 'campfire'
          ? `下一节点：🔥 ${nextNode.label}（点击地图中发光篝火进入）`
          : `下一节点：${nextNode.isBoss ? '👑 首领战 · ' : '⚔️ 精英战 · '}${nextNode.label}（点击地图中发光节点开战）`);

    this.rootEl.innerHTML = `
      ${this._renderTopHud(run, '🗺️ 试炼路线图')}
      <div class="sts-map-hub">
        <div class="sts-map-hub-inner">
          ${renderRouteMap(run, { compact: false, showExpandBtn: false, interactive: true })}
          <div class="sts-map-hub-foot">
            <div class="sts-map-hub-next">${nextDesc}</div>
            ${nextNode ? `<button class="btn-end-turn" id="btn-map-enter-shortcut" type="button">${nextNode.type === 'campfire' ? '🔥 踏入篝火营地 →' : '⚔️ 踏入战场 →'}</button>` : ''}
          </div>
        </div>
      </div>
      ${this._renderMapModal(run)}
      <div class="toast-stack"></div>
    `;

    this._renderToastStack();
    this._bindTopHud(() => this.renderMapHub(run));
    this.rootEl.querySelectorAll('[data-enter-node]').forEach(btn => {
      btn.addEventListener('click', () => this.cb.onEnterMapNode());
    });
    this.rootEl.querySelector('#btn-map-enter-shortcut')?.addEventListener('click', () => this.cb.onEnterMapNode());
  }

  // Full-Screen Slay-the-Spire Campfire Hub (Unobstructed Campfire Art + 2 Big Floating Action Icons)
  renderCampfire(run) {
    this._lastRoomKind = 'campfire';
    const ch = CHARACTERS[run.charId];
    const healAction = ch.campfireActions.find(a => a.id === 'rest_heal') || ch.campfireActions[0];
    const classAction = ch.campfireActions.find(a => a.id !== 'rest_heal') || ch.campfireActions[1];
    const isThief = run.charId === 'thief';
    const classDisabled = run.campfireUsed && !isThief;

    this.rootEl.innerHTML = `
      ${this._renderTopHud(run, '🔥 篝火营地')}
      <div class="sts-camp-scene">
        <div class="sts-camp-banner">
          <h1>🔥 篝火营地</h1>
          <p>${run.campfireUsed ? '本次营地休整已完成，随时可返回地图继续试炼。' : '在温暖的火光旁稍作喘息：选择烤火回复生命，或步入你的职业专属房间。'}</p>
        </div>

        <div class="sts-camp-orb-row">
          <button class="sts-camp-orb orb-rest ${run.campfireUsed ? 'is-used' : ''}" id="btn-camp-rest" type="button" ${run.campfireUsed ? 'disabled' : ''}>
            <div class="sts-camp-orb-icon">${healAction.icon}</div>
            <div class="sts-camp-orb-title">${healAction.label}</div>
            <div class="sts-camp-orb-desc">${healAction.desc}</div>
          </button>

          <button class="sts-camp-orb orb-class ${classDisabled ? 'is-used' : ''}" id="btn-camp-class" type="button" ${classDisabled ? 'disabled' : ''}>
            <div class="sts-camp-orb-icon">${classAction.icon}</div>
            <div class="sts-camp-orb-title">${classAction.label}</div>
            <div class="sts-camp-orb-desc">进入【${ch.restTitle}】专属房间</div>
          </button>
        </div>

        <div class="sts-camp-foot">
          <button class="btn-end-turn" id="btn-leave-camp" type="button">离开篝火 · 返回地图 →</button>
        </div>
      </div>
      ${this._renderMapModal(run)}
      <div class="toast-stack"></div>
    `;

    this._renderToastStack();
    this._bindTopHud(() => this.renderCampfire(run));
    this.rootEl.querySelector('#btn-camp-rest')?.addEventListener('click', () => this.cb.onCampfireRest());
    this.rootEl.querySelector('#btn-camp-class')?.addEventListener('click', () => this.cb.onOpenClassRoom());
    this.rootEl.querySelector('#btn-leave-camp')?.addEventListener('click', () => {
      this.knightSwapOffer = null;
      this.cb.onAdvanceFromCampfire();
    });
  }

  // Full-Screen Class-Exclusive Room (Knight Sparring / Chef Hearth / Teacher Study / Yier Altar)
  renderClassRoom(run) {
    const keepScroll = this._lastRoomKind === 'class_room';
    const prevScroll = keepScroll ? (this.rootEl.querySelector('.class-room-scroll')?.scrollTop || 0) : 0;
    this._lastRoomKind = 'class_room';
    const ch = CHARACTERS[run.charId];
    let dockBody = '';

    if (this.knightSwapOffer) {
      const newCard = CARD_DB[this.knightSwapOffer];
      dockBody = `
        <div class="class-dock-hdr">
          <div>
            <h2>⚔️ 选择 1 张旧招替换为【${newCard.name}】</h2>
            <p>${newCard.desc}</p>
          </div>
          <button class="btn-bronze" id="btn-cancel-swap" type="button">← 重新挑选进阶招式</button>
        </div>
        <div class="class-room-scroll">
          <div class="grid-3">
            ${run.deck.map((cid, idx) => {
              const c = CARD_DB[cid];
              return `<button class="choice-card" data-swap-idx="${idx}" type="button"><h3>${c.icon || '🃏'} ${c.name}（${c.cost}费）</h3><p>${c.desc}</p></button>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (run.campfireUsed) {
      dockBody = `
        <div class="class-dock-done">
          <h2>✨ 本次【${ch.restTitle}】成长已完成！</h2>
          <p>准备就绪后点击右下角返回地图，继续推进下一节点。</p>
        </div>
      `;
    } else if (run.charId === 'knight') {
      const offers = getKnightSparOffers(run);
      dockBody = `
        <div class="class-dock-hdr">
          <div><h2>⚔️ ${ch.restTitle}</h2><p>挑选 1 张进阶招式与木偶对练，1 换 1 替换现有套组中的旧招。</p></div>
        </div>
        <div class="class-room-scroll">
          <div class="grid-3">
            ${offers.map(cid => {
              const c = CARD_DB[cid];
              return `<button class="choice-card" data-pick-offer="${cid}" type="button"><h3>${c.icon} ${c.name}（${c.cost}费）</h3><p>${c.desc}</p></button>`;
            }).join('')}
          </div>
        </div>
      `;
    } else if (run.charId === 'chef') {
      const opts = getChefCookOptions(run);
      dockBody = `
        <div class="class-dock-hdr">
          <div><h2>🍲 ${ch.restTitle}</h2><p>将 1 张基础风味调料下锅烹调为强力大菜。</p></div>
        </div>
        <div class="class-room-scroll">
          ${opts.length ? `<div class="grid-3">
            ${opts.map(o => {
              const f = CARD_DB[o.fromId], t = CARD_DB[o.toId];
              return `<button class="choice-card" data-chef-cook="${o.deckIndex}:${o.toId}" type="button"><h3>${t.icon} ${f.name} → ${t.name}</h3><p>${t.desc}</p></button>`;
            }).join('')}
          </div>` : `<p class="room-sub">所有基础调料均已烹调完成！</p>`}
        </div>
      `;
    } else if (run.charId === 'teacher') {
      const opts = getTeacherUpgradeOptions(run);
      dockBody = `
        <div class="class-dock-hdr">
          <div><h2>🖍️ ${ch.restTitle}</h2><p>在暖灯下备课，将 1 张基础单色块升级为双格进阶课程牌。</p></div>
        </div>
        <div class="class-room-scroll">
          ${opts.length ? `<div class="grid-3">
            ${opts.map(o => {
              const f = CARD_DB[o.fromId], t = CARD_DB[o.toId];
              return `<button class="choice-card" data-teacher-upg="${o.deckIndex}:${o.toId}" type="button"><h3>${t.icon} ${f.name} → ${t.name}</h3><p>${t.desc}</p></button>`;
            }).join('')}
          </div>` : `<p class="room-sub">所有基础色块均已备课升级！</p>`}
        </div>
      `;
    } else if (run.charId === 'yier') {
      const clows = getYierReleaseOptions(run);
      dockBody = `
        <div class="class-dock-hdr">
          <div><h2>🪄 ${ch.restTitle}</h2><p>在星光祭坛解放 1 张已封印的库洛牌，腾出 +1 空白封印位（当前空白封印：${run.yierBlankSeals}）。</p></div>
        </div>
        <div class="class-room-scroll">
          ${clows.length ? `<div class="grid-3">
            ${clows.map(o => `<button class="choice-card" data-yier-rel="${o.deckIndex}" type="button"><h3>${o.spec.icon} 解放【${o.spec.name}】</h3><p>移除该牌并使空白封印卡 +1。</p></button>`).join('')}
          </div>` : `<p class="room-sub">当前卡组暂无已封印的库洛牌，可返回篝火进行星光冥想回血！</p>`}
        </div>
      `;
    }

    this.rootEl.innerHTML = `
      ${this._renderTopHud(run, ch.restTitle)}
      <div class="class-room-stage">
        <div class="class-room-top-nav">
          <button class="btn-bronze" id="btn-back-camp" type="button">← 返回篝火</button>
        </div>
        <div class="class-room-dock">
          ${dockBody}
          <div class="class-dock-foot">
            <button class="btn-end-turn" id="btn-next-battle" type="button">离开房间 · 返回地图 →</button>
          </div>
        </div>
      </div>
      ${this._renderMapModal(run)}
      <div class="toast-stack"></div>
    `;

    if (keepScroll && prevScroll > 0) {
      const sc = this.rootEl.querySelector('.class-room-scroll');
      if (sc) sc.scrollTop = prevScroll;
    }
    this._renderToastStack();
    this._bindTopHud(() => this.renderClassRoom(run));

    this.rootEl.querySelectorAll('[data-pick-offer]').forEach(btn => {
      btn.addEventListener('click', () => { this.knightSwapOffer = btn.dataset.pickOffer; this.renderClassRoom(run); });
    });
    this.rootEl.querySelectorAll('[data-swap-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = Number(btn.dataset.swapIdx);
        const addId = this.knightSwapOffer;
        this.knightSwapOffer = null;
        this.cb.onKnightSparSwap(idx, addId);
      });
    });
    this.rootEl.querySelectorAll('[data-chef-cook]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [idxStr, toId] = btn.dataset.chefCook.split(':');
        this.cb.onChefCook(Number(idxStr), toId);
      });
    });
    this.rootEl.querySelectorAll('[data-teacher-upg]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [idxStr, toId] = btn.dataset.teacherUpg.split(':');
        this.cb.onTeacherUpgrade(Number(idxStr), toId);
      });
    });
    this.rootEl.querySelectorAll('[data-yier-rel]').forEach(btn => {
      btn.addEventListener('click', () => this.cb.onYierRelease(Number(btn.dataset.yierRel)));
    });
    this.rootEl.querySelector('#btn-cancel-swap')?.addEventListener('click', () => { this.knightSwapOffer = null; this.renderClassRoom(run); });
    this.rootEl.querySelector('#btn-back-camp')?.addEventListener('click', () => { this.knightSwapOffer = null; this.cb.onBackCampfire(); });
    this.rootEl.querySelector('#btn-next-battle')?.addEventListener('click', () => { this.knightSwapOffer = null; this.cb.onAdvanceFromCampfire(); });
  }

  // Full-Screen Thief Black Market Shop (Leaves Shopkeeper & Crimson Rug Counter Fully Visible!)
  renderShop(run) {
    const keepScroll = this._lastRoomKind === 'shop';
    const prevSellScroll = keepScroll ? (this.rootEl.querySelector('#shop-sell-list')?.scrollTop || 0) : 0;
    const prevBuyScroll = keepScroll ? (this.rootEl.querySelector('#shop-buy-list')?.scrollTop || 0) : 0;
    this._lastRoomKind = 'shop';

    const lootEntries = run.deck
      .map((id, idx) => ({ id, idx, spec: CARD_DB[id] }))
      .filter(x => x.spec?.type === 'loot');

    this.rootEl.innerHTML = `
      ${this._renderTopHud(run, '🏴‍☠️ 地下黑市')}
      <div class="class-room-stage shop-stage">
        <div class="class-room-top-nav">
          <button class="btn-bronze" id="btn-back-camp" type="button">← 返回篝火</button>
          <div class="shopkeeper-bubble">“嘿嘿，带了什么大红好货？放红毯上让我掌掌眼……”</div>
        </div>

        <div class="class-room-dock shop-dock">
          <div class="shop-two-col">
            <div class="shop-col">
              <div class="shop-col-hdr">
                <span>💰 麻袋销赃（${lootEntries.length} 件）</span>
                <span class="shop-gold-pill">🪙 ${run.gold} 金</span>
              </div>
              <div class="shop-list" id="shop-sell-list">
                ${lootEntries.length ? lootEntries.map(({ idx, spec }) => {
                  const rar = LOOT_RARITIES[spec.rarity] || LOOT_RARITIES.white;
                  return `<button class="shop-item-card" data-sell-idx="${idx}" type="button" style="border-color:${rar.color};">
                    <div class="shop-item-top"><strong>${rar.icon} ${spec.name}</strong><span class="shop-price-gain">+${spec.sellPrice}金</span></div>
                    <p>${spec.desc}</p>
                  </button>`;
                }).join('') : `<div class="shop-empty">麻袋里暂无可出售的赃物。</div>`}
              </div>
            </div>

            <div class="shop-col">
              <div class="shop-col-hdr">
                <span>🛒 黑市老板货架</span>
                <span class="shop-sub-hint">点击直接收入麻袋</span>
              </div>
              <div class="shop-list" id="shop-buy-list">
                ${run.shopStock.map((item, idx) => {
                  const spec = CARD_DB[item.cardId];
                  const cantBuy = item.sold || run.gold < item.price;
                  return `<button class="shop-item-card ${item.sold ? 'is-sold' : ''}" data-buy-idx="${idx}" type="button" ${cantBuy ? 'disabled' : ''}>
                    <div class="shop-item-top"><strong>${spec.icon || '🧰'} ${spec.name}</strong><span class="shop-price-tag">${item.sold ? '已售罄' : `🪙 ${item.price}金`}</span></div>
                    <p>${spec.desc}</p>
                  </button>`;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="class-dock-foot">
            <button class="btn-end-turn" id="btn-next-battle" type="button">离开黑市 · 返回地图 →</button>
          </div>
        </div>
      </div>
      ${this._renderMapModal(run)}
      <div class="toast-stack"></div>
    `;

    if (keepScroll) {
      const s1 = this.rootEl.querySelector('#shop-sell-list');
      const s2 = this.rootEl.querySelector('#shop-buy-list');
      if (s1 && prevSellScroll > 0) s1.scrollTop = prevSellScroll;
      if (s2 && prevBuyScroll > 0) s2.scrollTop = prevBuyScroll;
    }
    this._renderToastStack();
    this._bindTopHud(() => this.renderShop(run));

    this.rootEl.querySelectorAll('[data-sell-idx]').forEach(btn => {
      btn.addEventListener('click', () => this.cb.onSellLoot(Number(btn.dataset.sellIdx)));
    });
    this.rootEl.querySelectorAll('[data-buy-idx]').forEach(btn => {
      btn.addEventListener('click', () => this.cb.onBuyShop(Number(btn.dataset.buyIdx)));
    });
    this.rootEl.querySelector('#btn-back-camp')?.addEventListener('click', () => this.cb.onBackCampfire());
    this.rootEl.querySelector('#btn-next-battle')?.addEventListener('click', () => this.cb.onAdvanceFromCampfire());
  }

  renderEnding(run, isVictory) {
    this.rootEl.innerHTML = `
      <div class="room-overlay">
        <div class="room-panel" style="max-width:640px;text-align:center;">
          <h1 class="room-h1">${isVictory ? '🏆 三章九战全通关！' : '💀 挑战失败'}</h1>
          <p class="room-sub">
            ${isVictory
              ? `恭喜通关本局随机三章试炼！剩余生命 ${run.hp}/${run.maxHp}，金币 ${run.gold}，牌组 ${run.deck.length} 张。`
              : '倒在了试炼途中，随时可以换另一个职业或新随机种子再战！'}
          </p>
          <button class="btn-end-turn" id="btn-restart-end">返回封面再来一局</button>
        </div>
      </div>
    `;
    this.rootEl.querySelector('#btn-restart-end')?.addEventListener('click', () => this.cb.onReturnTitle());
  }
}
