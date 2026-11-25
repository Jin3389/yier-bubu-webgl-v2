// PixiJS v8 WebGL 16:9 Stage (Logical 1920x1080)
// Upgraded with Knight Character Polish: Persistent Stance Auras, Adjust Orb, 4-Tier Procedural Slash Arcs,
// Shockwave Rings, True Hit-Stop & Knockback Recoil, Shield Dome / Armor Shatter, Card Launch Streaks, & Hurt Vignette

import { Application, Assets, Container, Graphics, Sprite, Text, ColorMatrixFilter } from 'pixi.js';
import { VISUAL_MANIFEST } from '../data/visuals.js';

export const STAGE_W = 1920;
export const STAGE_H = 1080;
export const GROUND_Y = 648;
const ACTOR_SCALE = 0.84;

const textureCache = new Map();

async function loadTextureSafe(url, fallbackUrl = null) {
  if (!url) return null;
  if (textureCache.has(url)) return textureCache.get(url);
  try {
    const tex = await Assets.load(url);
    textureCache.set(url, tex);
    return tex;
  } catch {
    if (fallbackUrl && fallbackUrl !== url) return loadTextureSafe(fallbackUrl, null);
    return null;
  }
}

export class WebGLStageApp {
  constructor(hostEl) {
    this.hostEl = hostEl;
    this.app = null;
    this.root = new Container();
    this.bgLayer = new Container();
    this.ambientLayer = new Container();
    this.actorLayer = new Container();
    this.vfxLayer = new Container();
    this.textLayer = new Container();
    this.overlayLayer = new Container();

    this.bgSprite = null;
    this.heroView = null;
    this.enemyViews = new Map();
    this.particles = [];
    this.effects = []; // procedural slash arcs, rings, streaks, domes
    this.floatTexts = [];
    this.tweens = [];
    this.ambientMotes = [];

    this.hurtVignette = null;
    this.hurtAlpha = 0;

    this.hitStopTime = 0;
    this.shakeTime = 0;
    this.shakeDur = 0.16;
    this.shakeMag = 0;
    this.elapsed = 0;
    this.highlightedEnemyUid = null;
  }

  async init() {
    this.app = new Application();
    await this.app.init({
      width: STAGE_W,
      height: STAGE_H,
      backgroundColor: 0x0b0e16,
      antialias: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: false
    });
    this.app.canvas.style.width = '100%';
    this.app.canvas.style.height = '100%';
    this.app.canvas.style.display = 'block';
    this.hostEl.innerHTML = '';
    this.hostEl.appendChild(this.app.canvas);

    this.root.addChild(
      this.bgLayer,
      this.ambientLayer,
      this.actorLayer,
      this.vfxLayer,
      this.textLayer,
      this.overlayLayer
    );
    this.app.stage.addChild(this.root);

    this._initAmbientMotes();
    this._initHurtVignette();
    this.app.ticker.add((ticker) => this._update(ticker.deltaMS / 1000));
  }

  _initHurtVignette() {
    const g = new Graphics();
    const border = 64;
    g.rect(0, 0, STAGE_W, border).fill({ color: 0xdc2626, alpha: 0.75 });
    g.rect(0, STAGE_H - border, STAGE_W, border).fill({ color: 0xdc2626, alpha: 0.75 });
    g.rect(0, border, border, STAGE_H - border * 2).fill({ color: 0xdc2626, alpha: 0.75 });
    g.rect(STAGE_W - border, border, border, STAGE_H - border * 2).fill({ color: 0xdc2626, alpha: 0.75 });
    g.alpha = 0;
    this.hurtVignette = g;
    this.overlayLayer.addChild(g);
  }

  _initAmbientMotes() {
    for (let i = 0; i < 28; i++) {
      const g = new Graphics();
      const r = 2 + Math.random() * 4;
      g.circle(0, 0, r).fill({ color: 0xbae6fd, alpha: 0.25 + Math.random() * 0.35 });
      g.x = Math.random() * STAGE_W;
      g.y = Math.random() * (STAGE_H * 0.72);
      this.ambientLayer.addChild(g);
      this.ambientMotes.push({
        g,
        vx: -12 - Math.random() * 18,
        vy: -8 - Math.random() * 16,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  async setBackground(url, fallbackUrl = './assets/bg/bg-campfire-default.webp') {
    const tex = await loadTextureSafe(url, fallbackUrl);
    this.bgLayer.removeChildren();
    if (!tex) return;
    const sp = new Sprite(tex);
    const scale = Math.max(STAGE_W / tex.width, STAGE_H / tex.height);
    sp.scale.set(scale);
    sp.anchor.set(0.5);
    sp.x = STAGE_W / 2;
    sp.y = STAGE_H / 2;
    this.bgSprite = sp;
    this.bgLayer.addChild(sp);

    // Full-bleed battleground art: no dark bottom curtain behind hand cards
  }

  clearActors() {
    this.actorLayer.removeChildren();
    this.heroView = null;
    this.enemyViews.clear();
  }

  async setupBattleActors(charId, enemies) {
    this.clearActors();
    await this._spawnHero(charId);
    if (charId === 'knight') {
      this.setHeroStance('defense', false);
    }
    await this.syncEnemies(enemies);
  }

  async _spawnHero(charId) {
    const cfg = VISUAL_MANIFEST.heroes[charId] || VISUAL_MANIFEST.heroes.knight;
    const tex = await loadTextureSafe(cfg.sprite);
    const container = new Container();
    container.x = STAGE_W * 0.21;
    container.y = GROUND_Y;

    const shadow = new Graphics();
    shadow.ellipse(0, 6, 76, 18).fill({ color: 0x000000, alpha: 0.42 });
    container.addChild(shadow);

    // Persistent Knight Stance Ground Aura
    const stanceAura = new Graphics();
    stanceAura.blendMode = 'add';
    stanceAura.visible = false;
    container.addChild(stanceAura);

    const bodyWrap = new Container();
    if (tex) {
      const sp = new Sprite(tex);
      sp.anchor.set(cfg.anchor.x, cfg.anchor.y);
      const scaledHeroH = Math.round(cfg.targetHeight * ACTOR_SCALE);
      const s = scaledHeroH / tex.height;
      sp.scale.set(s);
      bodyWrap.addChild(sp);
    }
    container.addChild(bodyWrap);

    // Knight Adjust Floating Orb (+1 / -1)
    const adjustWrap = new Container();
    adjustWrap.x = 96;
    adjustWrap.y = -160;
    adjustWrap.visible = false;
    const adjBg = new Graphics();
    const adjText = new Text({
      text: '+1',
      style: {
        fontFamily: 'Georgia, serif',
        fontSize: 28,
        fontWeight: 'bold',
        fill: '#fef08a',
        stroke: { color: '#140c06', width: 5 }
      }
    });
    adjText.anchor.set(0.5);
    adjustWrap.addChild(adjBg, adjText);
    container.addChild(adjustWrap);

    this.actorLayer.addChild(container);

    // Thief Smoke / Chef Bitter aura & Chef Salt / Thief x2 floating orb
    const buffAura = new Graphics();
    buffAura.blendMode = 'add';
    buffAura.visible = false;
    container.addChild(buffAura);

    this.heroView = {
      uid: 'hero',
      container,
      bodyWrap,
      stanceAura,
      buffAura,
      stance: null,
      adjustWrap,
      adjBg,
      adjText,
      baseX: container.x,
      baseY: container.y,
      recoilX: 0,
      cfg,
      height: Math.round(cfg.targetHeight * ACTOR_SCALE),
      fxSprites: [],
      flashTime: 0,
      flashFilter: new ColorMatrixFilter()
    };
    this.heroView.flashFilter.brightness(3.0, false);
  }

  setHeroStance(stance, burst = true) {
    if (!this.heroView) return;
    const hv = this.heroView;
    hv.stance = stance;
    const g = hv.stanceAura;
    g.clear();
    if (!stance) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const isOff = stance === 'offense';
    const colOuter = isOff ? 0xf59e0b : 0x38bdf8;
    const colInner = isOff ? 0xfef08a : 0x93c5fd;
    g.ellipse(0, 6, 118, 30).fill({ color: colOuter, alpha: 0.16 });
    g.ellipse(0, 6, 114, 28).stroke({ color: colOuter, width: 4, alpha: 0.78 });
    g.ellipse(0, 6, 86, 20).stroke({ color: colInner, width: 2, alpha: 0.65 });

    if (burst) {
      if (isOff) {
        // Horizontal golden blade-draw gleam
        this._spawnSlashArc(hv.baseX + 35, hv.baseY - hv.height * 0.52, -0.08, 220, 0xfbbf24, 0xfef08a, 14, 0.24);
        this._spawnRing(hv.baseX, hv.baseY - 40, 24, 150, 0xf59e0b, 6, 0.28);
      } else {
        // Steel-blue shield dome ripple
        this._spawnRing(hv.baseX, hv.baseY - 95, 36, 165, 0x38bdf8, 8, 0.3);
        this._spawnShieldDome(hv.baseX, hv.baseY - hv.height * 0.48, 0x38bdf8);
      }
    }
  }

  setHeroAdjust(delta) {
    if (!this.heroView) return;
    const hv = this.heroView;
    if (!delta) {
      if (hv.adjustWrap.visible) {
        this._spawnRing(hv.baseX + hv.adjustWrap.x, hv.baseY + hv.adjustWrap.y, 12, 62, 0xfbbf24, 4, 0.2);
      }
      hv.adjustWrap.visible = false;
      return;
    }
    hv.adjustWrap.visible = true;
    const isPlus = delta > 0;
    const col = isPlus ? 0xfbbf24 : 0x38bdf8;
    hv.adjBg.clear();
    hv.adjBg.circle(0, 0, 28).fill({ color: 0x16110c, alpha: 0.92 }).stroke({ color: col, width: 4 });
    hv.adjText.text = isPlus ? `+${delta}` : `${delta}`;
    hv.adjText.style.fill = isPlus ? '#fef08a' : '#bae6fd';
    this._spawnRing(hv.baseX + hv.adjustWrap.x, hv.baseY + hv.adjustWrap.y, 10, 56, col, 4, 0.22);
  }

  async syncEnemies(enemies) {
    for (const view of this.enemyViews.values()) {
      this.actorLayer.removeChild(view.container);
    }
    this.enemyViews.clear();

    const aliveList = enemies.filter(e => e.alive);
    const slots = this._computeEnemySlots(aliveList.length);
    for (let i = 0; i < aliveList.length; i++) {
      const unit = aliveList[i];
      const pos = slots[i];
      const view = await this._createEnemyView(unit, pos.x, pos.y);
      this.enemyViews.set(unit.uid, view);
      this.actorLayer.addChild(view.container);
    }
  }

  _computeEnemySlots(count) {
    if (count <= 1) return [{ x: STAGE_W * 0.75, y: GROUND_Y }];
    if (count === 2) return [{ x: STAGE_W * 0.62, y: GROUND_Y - 12 }, { x: STAGE_W * 0.81, y: GROUND_Y + 8 }];
    if (count === 3) return [{ x: STAGE_W * 0.57, y: GROUND_Y - 20 }, { x: STAGE_W * 0.72, y: GROUND_Y + 10 }, { x: STAGE_W * 0.86, y: GROUND_Y - 12 }];
    return [
      { x: STAGE_W * 0.56, y: GROUND_Y - 34 },
      { x: STAGE_W * 0.68, y: GROUND_Y + 14 },
      { x: STAGE_W * 0.79, y: GROUND_Y - 26 },
      { x: STAGE_W * 0.89, y: GROUND_Y + 12 }
    ];
  }

  async _createEnemyView(unit, x, y) {
    const baseCfg = VISUAL_MANIFEST.enemies[unit.id] || VISUAL_MANIFEST.enemies.w_bubbles;
    const formOverride = unit.formKey && baseCfg.formSprites?.[unit.formKey];
    const spriteUrl = formOverride ? formOverride.sprite : baseCfg.sprite;
    const rawTargetHeight = formOverride ? formOverride.targetHeight : baseCfg.targetHeight;
    const targetHeight = Math.round(rawTargetHeight * ACTOR_SCALE);

    const container = new Container();
    container.x = x;
    container.y = y;

    const shadow = new Graphics();
    shadow.ellipse(0, 8, Math.max(66, targetHeight * 0.28), 20).fill({ color: 0x000000, alpha: 0.45 });
    container.addChild(shadow);

    const targetRing = new Graphics();
    targetRing.ellipse(0, 6, Math.max(82, targetHeight * 0.34), 26).stroke({ color: 0xf87171, width: 5, alpha: 0.92 });
    targetRing.visible = false;
    container.addChild(targetRing);

    const bodyWrap = new Container();
    const fxSprites = [];

    const addFxLayers = async (order) => {
      if (!baseCfg.fxLayers || formOverride) return;
      for (const fxCfg of baseCfg.fxLayers) {
        if ((fxCfg.zOrder || 'front') !== order) continue;
        const fxTex = await loadTextureSafe(fxCfg.sprite);
        if (!fxTex) continue;
        const fxSp = new Sprite(fxTex);
        fxSp.anchor.set(baseCfg.anchor.x, baseCfg.anchor.y);
        const s = targetHeight / fxTex.height;
        fxSp.scale.set(s);
        fxSp.alpha = fxCfg.alpha ?? 0.9;
        fxSp.blendMode = fxCfg.blend || 'normal';
        bodyWrap.addChild(fxSp);
        fxSprites.push({ sp: fxSp, baseScale: s, cfg: fxCfg });
      }
    };

    await addFxLayers('back');
    const tex = await loadTextureSafe(spriteUrl);
    let width = targetHeight * 0.7;
    if (tex) {
      const sp = new Sprite(tex);
      sp.anchor.set(baseCfg.anchor.x, baseCfg.anchor.y);
      const s = targetHeight / tex.height;
      sp.scale.set(s);
      width = tex.width * s;
      bodyWrap.addChild(sp);
    }
    await addFxLayers('front');

    container.addChild(bodyWrap);

    const flashFilter = new ColorMatrixFilter();
    flashFilter.brightness(3.3, false);

    return {
      uid: unit.uid,
      container,
      bodyWrap,
      targetRing,
      baseX: x,
      baseY: y,
      recoilX: 0,
      width: Math.max(150, width),
      height: targetHeight,
      cfg: baseCfg,
      fxSprites,
      flashTime: 0,
      flashFilter,
      phase: Math.random() * Math.PI * 2
    };
  }

  getEnemyLayoutMap() {
    const map = {};
    for (const [uid, v] of this.enemyViews.entries()) {
      map[uid] = { x: v.baseX, y: v.baseY, topY: v.baseY - v.height - 16, width: v.width, height: v.height };
    }
    return map;
  }

  getHeroAnchor() {
    if (!this.heroView) return { x: STAGE_W * 0.23, y: GROUND_Y, topY: GROUND_Y - 280 };
    return { x: this.heroView.baseX, y: this.heroView.baseY, topY: this.heroView.baseY - this.heroView.height - 16 };
  }

  setHighlightedEnemy(uid) {
    this.highlightedEnemyUid = uid;
    for (const [key, view] of this.enemyViews.entries()) {
      view.targetRing.visible = key === uid;
    }
  }

  pickEnemyAtLogicalPoint(lx, ly) {
    let best = null;
    let bestDist = Infinity;
    for (const [uid, v] of this.enemyViews.entries()) {
      const cx = v.baseX;
      const cy = v.baseY - v.height * 0.48;
      const halfW = Math.max(95, v.width * 0.55);
      const halfH = Math.max(110, v.height * 0.56);
      if (Math.abs(lx - cx) <= halfW && Math.abs(ly - cy) <= halfH) {
        const d = Math.hypot(lx - cx, ly - cy);
        if (d < bestDist) { bestDist = d; best = uid; }
      }
    }
    return best;
  }

  _getView(targetId) {
    if (targetId === 'hero') return this.heroView;
    return this.enemyViews.get(targetId) || null;
  }

  // === Combat Juice VFX Primitives ===

  playCardLaunch(targetId, cardType = 'attack') {
    const tv = this._getView(targetId) || this.heroView;
    if (!tv) return;
    const x0 = STAGE_W * 0.5;
    const y0 = STAGE_H * 0.86;
    const x1 = tv.baseX;
    const y1 = tv.baseY - tv.height * 0.5;
    const col = cardType === 'defense' ? 0x38bdf8 : (cardType === 'offense' || cardType === 'attack' ? 0xfbbf24 : 0xe2e8f0);

    const g = new Graphics();
    g.roundRect(-24, -10, 48, 20, 10).fill({ color: col, alpha: 0.92 });
    g.blendMode = 'add';
    g.x = x0;
    g.y = y0;
    g.rotation = Math.atan2(y1 - y0, x1 - x0);
    this.vfxLayer.addChild(g);

    this.effects.push({
      g,
      life: 0,
      maxLife: 0.16,
      update: (p) => {
        const ease = 1 - Math.pow(1 - p, 2);
        g.x = x0 + (x1 - x0) * ease;
        g.y = y0 + (y1 - y0) * ease - Math.sin(p * Math.PI) * 90;
        g.scale.set(1.3 - p * 0.6, 1 - p * 0.4);
        g.alpha = 1 - p;
      }
    });
  }

  _spawnSlashArc(cx, cy, angle, radius, outerColor, coreColor, thickness = 18, maxLife = 0.22) {
    const g = new Graphics();
    g.blendMode = 'add';
    g.x = cx;
    g.y = cy;
    g.rotation = angle;
    // Crescent blade geometry
    g.moveTo(-radius, 0)
      .quadraticCurveTo(0, -thickness * 1.9, radius, 0)
      .quadraticCurveTo(0, -thickness * 0.45, -radius, 0)
      .fill({ color: outerColor, alpha: 0.95 });
    g.moveTo(-radius * 0.85, -2)
      .quadraticCurveTo(0, -thickness * 1.25, radius * 0.85, -2)
      .quadraticCurveTo(0, -thickness * 0.65, -radius * 0.85, -2)
      .fill({ color: coreColor, alpha: 1 });
    this.vfxLayer.addChild(g);

    this.effects.push({
      g,
      life: 0,
      maxLife,
      update: (p) => {
        g.scale.set(0.65 + p * 0.55, 1.15 - p * 0.5);
        g.alpha = p < 0.25 ? 1 : 1 - (p - 0.25) / 0.75;
      }
    });
  }

  _spawnRing(cx, cy, r0, r1, color, strokeW = 7, maxLife = 0.26) {
    const g = new Graphics();
    g.blendMode = 'add';
    g.x = cx;
    g.y = cy;
    this.vfxLayer.addChild(g);
    this.effects.push({
      g,
      life: 0,
      maxLife,
      update: (p) => {
        const ease = 1 - Math.pow(1 - p, 2);
        const r = r0 + (r1 - r0) * ease;
        g.clear();
        g.circle(0, 0, r).stroke({ color, width: Math.max(1.5, strokeW * (1 - p * 0.7)), alpha: 1 - p });
      }
    });
  }

  _spawnShieldDome(cx, cy, color = 0x38bdf8) {
    const g = new Graphics();
    g.blendMode = 'add';
    g.x = cx;
    g.y = cy;
    g.circle(0, 0, 128).fill({ color, alpha: 0.18 }).stroke({ color: 0xbae6fd, width: 6, alpha: 0.9 });
    this.vfxLayer.addChild(g);
    this.effects.push({
      g,
      life: 0,
      maxLife: 0.34,
      update: (p) => {
        g.scale.set(0.85 + p * 0.28);
        g.alpha = 1 - p;
      }
    });
  }

  playSlash(targetId, tier = 'light') {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX;
    const cy = v.baseY - v.height * 0.5;

    if (tier === 'precision_break') {
      // Crossed Gold-Crimson X-Slash + Shockwave Ring!
      this._spawnSlashArc(cx, cy, -0.58, 215, 0xfb7185, 0xfef08a, 24, 0.28);
      this._spawnSlashArc(cx, cy, 0.58, 215, 0xf59e0b, 0xffffff, 22, 0.28);
      this._spawnRing(cx, cy, 24, 210, 0xfbbf24, 9, 0.32);
    } else if (tier === 'heavy') {
      this._spawnSlashArc(cx, cy, -0.45, 195, 0xfbbf24, 0xffffff, 22, 0.25);
      this._spawnRing(cx, cy, 18, 135, 0xfef08a, 5, 0.24);
    } else if (tier === 'counter') {
      this._spawnSlashArc(cx, cy, 0.35, 185, 0x38bdf8, 0xfef08a, 20, 0.24);
      this._spawnRing(cx, cy, 16, 130, 0x7dd3fc, 6, 0.24);
    } else {
      // Crisp silver-white light crescent
      this._spawnSlashArc(cx, cy, -0.32 + (Math.random() - 0.5) * 0.35, 145, 0xe2e8f0, 0xffffff, 14, 0.19);
    }
  }

  playPrecisionGuard(targetId) {
    const hv = this.heroView;
    if (!hv) return;
    const cx = hv.baseX;
    const cy = hv.baseY - hv.height * 0.48;
    this._spawnShieldDome(cx, cy, 0xfbbf24);
    this._spawnRing(cx, cy, 32, 225, 0xfef08a, 10, 0.34);
    this._spawnRing(cx, cy, 20, 175, 0x38bdf8, 7, 0.3);
    this._spawnFloatingText(cx, cy - 75, '精防反击！', '#fef08a', 46);
    this.hitStopTime = 0.065;
    this._triggerShake(10, 0.2);
  }

  playLunge(actorId, targetId) {
    const v = this._getView(actorId);
    if (!v) return;
    const dir = actorId === 'hero' ? 1 : -1;
    this.tweens.push({
      view: v,
      t: 0,
      dur: 0.20,
      update: (p) => {
        const arch = Math.sin(p * Math.PI);
        v.container.x = v.baseX + dir * 105 * arch + (v.recoilX || 0);
      },
      done: () => { v.container.x = v.baseX + (v.recoilX || 0); }
    });
  }

  _triggerShake(mag, dur = 0.18) {
    this.shakeMag = Math.max(this.shakeMag, mag);
    this.shakeDur = dur;
    this.shakeTime = Math.max(this.shakeTime, dur);
  }

  playHitReaction(targetId, dmg, opts = {}) {
    const v = this._getView(targetId);
    if (!v) return;
    const tier = typeof opts === 'boolean' ? (opts ? 'heavy' : 'light') : (opts.tier || 'light');
    const pierce = typeof opts === 'boolean' ? opts : !!opts.pierce;

    const cfg = {
      light:           { stop: 0.035, recoil: 16, shake: 4.5, flash: 0.11, size: 52, color: '#fb7185', prefix: '-' },
      heavy:           { stop: 0.062, recoil: 28, shake: 9.5, flash: 0.15, size: 64, color: pierce ? '#fbbf24' : '#fb7185', prefix: '-' },
      precision_break: { stop: 0.085, recoil: 38, shake: 14,  flash: 0.19, size: 74, color: '#fef08a', prefix: '破防 -' },
      counter:         { stop: 0.060, recoil: 26, shake: 9,   flash: 0.15, size: 60, color: '#7dd3fc', prefix: '反击 -' }
    }[tier] || { stop: 0.035, recoil: 16, shake: 4.5, flash: 0.11, size: 52, color: '#fb7185', prefix: '-' };

    v.flashTime = cfg.flash;
    v.bodyWrap.filters = [v.flashFilter];
    v.recoilX = (targetId === 'hero' ? -1 : 1) * cfg.recoil;
    this.hitStopTime = Math.max(this.hitStopTime, cfg.stop);
    this._triggerShake(cfg.shake, tier === 'precision_break' ? 0.24 : 0.17);

    this._spawnFloatingText(
      v.baseX,
      v.baseY - v.height * 0.66,
      `${cfg.prefix}${dmg}`,
      cfg.color,
      cfg.size
    );
  }

  playHeroHurtVignette(intensity = 0.38) {
    this.hurtAlpha = Math.max(this.hurtAlpha, intensity);
  }

  playBlockImpact(targetId, blocked) {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX;
    const cy = v.baseY - v.height * 0.5;
    this._spawnRing(cx, cy, 24, 130, 0x38bdf8, 8, 0.24);
    this.playBurst(targetId, 'ice', 'light');
    this._spawnFloatingText(cx, cy - 30, `格挡 ${blocked}`, '#7dd3fc', 42);
  }

  playArmorShatter(targetId) {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX;
    const cy = v.baseY - v.height * 0.5;
    this.hitStopTime = Math.max(this.hitStopTime, 0.08);
    this._triggerShake(11, 0.22);
    this._spawnRing(cx, cy, 20, 175, 0x7dd3fc, 9, 0.3);
    for (let i = 0; i < 16; i++) {
      const g = new Graphics();
      g.poly([0, -10, 8, 0, 0, 10, -8, 0]).fill({ color: i % 2 === 0 ? 0xbae6fd : 0x38bdf8, alpha: 0.95 });
      g.blendMode = 'add';
      g.x = cx;
      g.y = cy;
      this.vfxLayer.addChild(g);
      const ang = (Math.PI * 2 * i) / 16 + Math.random() * 0.3;
      const spd = 240 + Math.random() * 280;
      this.particles.push({ g, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 90, life: 0, maxLife: 0.44 });
    }
    this._spawnFloatingText(cx, cy - 55, '破甲！', '#bae6fd', 50);
  }

  playShieldPulse(targetId, amount) {
    const v = this._getView(targetId);
    if (!v) return;
    this._spawnShieldDome(v.baseX, v.baseY - v.height * 0.48, 0x38bdf8);
    this.playBurst(targetId, 'water', 'light');
    this._spawnFloatingText(v.baseX, v.baseY - v.height * 0.65, `+${amount} 甲`, '#60a5fa', 44);
  }

  playHeal(targetId, amount) {
    const v = this._getView(targetId);
    if (!v) return;
    this.playBurst(targetId, 'heal', 'light');
    this._spawnFloatingText(v.baseX, v.baseY - v.height * 0.68, `+${amount}`, '#4ade80', 48);
  }

  playDefeat(targetId) {
    const v = this._getView(targetId);
    if (!v) return;
    this.playBurst(targetId, 'water', 'heavy');
    this.tweens.push({
      view: v,
      t: 0,
      dur: 0.35,
      update: (p) => { v.container.alpha = 1 - p; v.container.y = v.baseY - p * 35; },
      done: () => { v.container.visible = false; }
    });
  }

  playBurst(targetId, element = 'physical', tier = 'light') {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX;
    const cy = v.baseY - v.height * 0.48;
    const palette = {
      physical: [0xfef08a, 0xfb923c, 0xffffff],
      pierce:   [0xfde047, 0xfb7185, 0xffffff],
      water:    [0x38bdf8, 0xbae6fd, 0x60a5fa],
      ice:      [0xe0f2fe, 0x7dd3fc, 0xffffff],
      fire:     [0xfb7185, 0xf97316, 0xfde047],
      earth:    [0xd4af68, 0xa16207, 0xfef08a],
      wind:     [0x6ee7b7, 0x99f6e4, 0xffffff],
      heal:     [0x4ade80, 0x86efac, 0xffffff]
    }[element] || [0xffffff, 0xfef08a];

    const count = tier === 'precision_break' ? 32 : (tier === 'heavy' ? 22 : 12);
    for (let i = 0; i < count; i++) {
      const g = new Graphics();
      const color = palette[i % palette.length];
      const r = (tier === 'precision_break' ? 5 : 3.5) + Math.random() * 6;
      g.circle(0, 0, r).fill({ color, alpha: 0.95 });
      g.blendMode = 'add';
      g.x = cx;
      g.y = cy;
      this.vfxLayer.addChild(g);
      const ang = Math.random() * Math.PI * 2;
      const spd = (tier === 'precision_break' ? 240 : 150) + Math.random() * 340;
      this.particles.push({ g, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 70, life: 0, maxLife: 0.28 + Math.random() * 0.24 });
    }
  }

  syncHeroBuffVisuals({ evade, doubleNext, bitter, salt } = {}) {
    if (!this.heroView) return;
    const hv = this.heroView;
    if (evade !== undefined || bitter !== undefined) {
      hv.buffAura.clear();
      if (evade) {
        hv.buffAura.visible = true;
        hv.buffAura.circle(0, -hv.height * 0.45, 132).fill({ color: 0x94a3b8, alpha: 0.22 }).stroke({ color: 0xe2e8f0, width: 4, alpha: 0.75 });
        this._spawnRing(hv.baseX, hv.baseY - hv.height * 0.45, 40, 175, 0xcbd5e1, 7, 0.3);
      } else if (bitter) {
        hv.buffAura.visible = true;
        hv.buffAura.circle(0, -hv.height * 0.45, 128).fill({ color: 0x34d399, alpha: 0.16 }).stroke({ color: 0x6ee7b7, width: 4, alpha: 0.78 });
        this._spawnRing(hv.baseX, hv.baseY - hv.height * 0.45, 36, 165, 0x34d399, 6, 0.28);
      } else {
        hv.buffAura.visible = false;
      }
    }
    if (doubleNext !== undefined) {
      if (doubleNext) {
        hv.adjustWrap.visible = true;
        hv.adjBg.clear();
        hv.adjBg.circle(0, 0, 29).fill({ color: 0x1b1026, alpha: 0.94 }).stroke({ color: 0xc084fc, width: 4 });
        hv.adjText.text = '×2';
        hv.adjText.style.fill = '#e9d5ff';
        this._spawnRing(hv.baseX + hv.adjustWrap.x, hv.baseY + hv.adjustWrap.y, 12, 68, 0xc084fc, 5, 0.24);
      } else if (hv.adjText.text === '×2') {
        this._spawnRing(hv.baseX + hv.adjustWrap.x, hv.baseY + hv.adjustWrap.y, 14, 90, 0xc084fc, 6, 0.24);
        hv.adjustWrap.visible = false;
      }
    }
    if (salt !== undefined) {
      if (salt > 0) {
        hv.adjustWrap.visible = true;
        hv.adjBg.clear();
        hv.adjBg.circle(0, 0, 29).fill({ color: 0x0f1a24, alpha: 0.94 }).stroke({ color: 0x7dd3fc, width: 4 });
        hv.adjText.text = `+${salt}`;
        hv.adjText.style.fill = '#e0f2fe';
        this._spawnRing(hv.baseX + hv.adjustWrap.x, hv.baseY + hv.adjustWrap.y, 10, 62, 0x7dd3fc, 4, 0.22);
      } else if (hv.adjText.text.startsWith('+')) {
        hv.adjustWrap.visible = false;
      }
    }
  }

  // Thief: Loot Steal Arc flying from enemy back to Thief
  playStealArc(fromId, rarity = 'white') {
    const fv = this._getView(fromId);
    const hv = this.heroView;
    if (!fv || !hv) return;
    const colMap = { white: 0xe2e8f0, green: 0x4ade80, blue: 0x60a5fa, purple: 0xc084fc, gold: 0xfbbf24, red: 0xfb7185 };
    const col = colMap[rarity] || 0xfbbf24;
    const x0 = fv.baseX, y0 = fv.baseY - fv.height * 0.5;
    const x1 = hv.baseX, y1 = hv.baseY - hv.height * 0.5;
    const g = new Graphics();
    g.circle(0, 0, rarity === 'red' || rarity === 'gold' ? 16 : 11).fill({ color: col, alpha: 0.95 });
    g.blendMode = 'add';
    g.x = x0; g.y = y0;
    this.vfxLayer.addChild(g);
    this.effects.push({
      g, life: 0, maxLife: 0.28,
      update: (p) => {
        g.x = x0 + (x1 - x0) * p;
        g.y = y0 + (y1 - y0) * p - Math.sin(p * Math.PI) * 170;
        g.scale.set(1.2 - p * 0.4);
      }
    });
  }

  // Thief: Black Powder / Bomb Explosion
  playBombBlast(targetId) {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX, cy = v.baseY - v.height * 0.48;
    const core = new Graphics();
    core.circle(0, 0, 120).fill({ color: 0xf97316, alpha: 0.72 });
    core.circle(0, 0, 68).fill({ color: 0xfef08a, alpha: 0.95 });
    core.blendMode = 'add';
    core.x = cx; core.y = cy;
    this.vfxLayer.addChild(core);
    this.effects.push({
      g: core, life: 0, maxLife: 0.28,
      update: (p) => { core.scale.set(0.45 + p * 1.15); core.alpha = 1 - p; }
    });
    this._spawnRing(cx, cy, 24, 240, 0xfb923c, 10, 0.34);
    this.hitStopTime = Math.max(this.hitStopTime, 0.075);
    this._triggerShake(13, 0.22);
  }

  // Teacher: Red/Blue/Yellow Match-3 Full-Stage Highlight Burst
  playMatchThreeBurst(color, targetId) {
    const tv = this._getView(targetId) || this.heroView;
    if (!tv) return;
    const cx = tv.baseX, cy = tv.baseY - tv.height * 0.5;
    if (color === 'red') {
      const beam = new Graphics();
      beam.rect(cx - 56, 0, 112, tv.baseY + 20).fill({ color: 0xfb7185, alpha: 0.65 });
      beam.rect(cx - 22, 0, 44, tv.baseY + 20).fill({ color: 0xfef08a, alpha: 0.9 });
      beam.blendMode = 'add';
      this.vfxLayer.addChild(beam);
      this.effects.push({ g: beam, life: 0, maxLife: 0.36, update: (p) => { beam.alpha = 1 - p; } });
      this._spawnRing(cx, cy, 28, 240, 0xfb7185, 10, 0.34);
      this._spawnFloatingText(cx, cy - 90, '红×3 重点轰炸！', '#fecdd3', 56);
      this.hitStopTime = Math.max(this.hitStopTime, 0.08);
      this._triggerShake(13, 0.22);
    } else if (color === 'blue') {
      this._spawnRing(STAGE_W * 0.58, GROUND_Y - 140, 40, 460, 0x38bdf8, 10, 0.42);
      this._spawnFloatingText(STAGE_W * 0.5, GROUND_Y - 260, '蓝×3 模范课堂！', '#bae6fd', 54);
    } else {
      const hv = this.heroView;
      this._spawnRing(hv.baseX, hv.baseY - 140, 26, 230, 0xfbbf24, 9, 0.36);
      this._spawnFloatingText(hv.baseX, hv.baseY - 250, '黄×3 灵感迸发！', '#fef08a', 52);
      this.playBurst('hero', 'physical', 'heavy');
    }
  }

  playDyeFlash(color) {
    const hv = this.heroView;
    if (!hv) return;
    const col = { red: 0xfb7185, blue: 0x38bdf8, yellow: 0xfbbf24 }[color] || 0xfbbf24;
    this._spawnRing(hv.baseX, hv.baseY - 120, 18, 145, col, 7, 0.26);
  }

  // Yier: Star Mark, Star Burst, Star Lock, and Clow Magic Seal Circle
  playStarMarkApply(targetId, stacks) {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX, cy = v.baseY - v.height * 0.55;
    this._spawnRing(cx, cy, 16, 95, 0xfde047, 5, 0.24);
    this._spawnFloatingText(cx, cy - 40, `⭐ 星印 ${stacks}`, '#fef08a', 38);
  }

  playStarBurst(targetId, stacks) {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX, cy = v.baseY - v.height * 0.5;
    this._spawnSlashArc(cx, cy, -0.75, 225, 0xc084fc, 0xfef08a, 24, 0.3);
    this._spawnSlashArc(cx, cy, 0.75, 225, 0xfbbf24, 0xffffff, 24, 0.3);
    this._spawnRing(cx, cy, 24, 245, 0xc084fc, 10, 0.35);
    this._spawnRing(cx, cy, 12, 180, 0xfde047, 7, 0.3);
    this._spawnFloatingText(cx, cy - 95, `星爆 ×${stacks}！`, '#fef08a', 60);
    this.hitStopTime = Math.max(this.hitStopTime, 0.085);
    this._triggerShake(14, 0.24);
  }

  playStarLock(targetId) {
    const v = this._getView(targetId);
    const hv = this.heroView;
    if (v) this._spawnRing(v.baseX, v.baseY - v.height * 0.5, 160, 26, 0x60a5fa, 8, 0.32);
    if (hv) this._spawnShieldDome(hv.baseX, hv.baseY - hv.height * 0.48, 0xc084fc);
  }

  playClowSeal(targetId, cardName = '库洛牌') {
    const v = this._getView(targetId);
    if (!v) return;
    const cx = v.baseX, cy = v.baseY - v.height * 0.45;
    // Contracting purple-gold magic seal circle + sky pillar
    this._spawnRing(cx, cy, 290, 24, 0xc084fc, 12, 0.52);
    this._spawnRing(cx, cy, 230, 18, 0xfbbf24, 8, 0.48);
    const beam = new Graphics();
    beam.rect(cx - 75, 0, 150, v.baseY + 30).fill({ color: 0xc084fc, alpha: 0.52 });
    beam.rect(cx - 28, 0, 56, v.baseY + 30).fill({ color: 0xfef08a, alpha: 0.88 });
    beam.blendMode = 'add';
    this.vfxLayer.addChild(beam);
    this.effects.push({ g: beam, life: 0, maxLife: 0.62, update: (p) => { beam.alpha = 1 - p; } });
    this._spawnFloatingText(cx, cy - 110, `🪄 封印·${cardName}！`, '#f5d0fe', 58);
    this.hitStopTime = Math.max(this.hitStopTime, 0.09);
    this._triggerShake(12, 0.28);
  }

  playLootPillar(rarity = 'red', cardName = '') {
    const color = rarity === 'red' ? 0xfb7185 : 0xfbbf24;
    if (rarity === 'red') {
      this._triggerShake(11, 0.26);
      this._spawnFloatingText(STAGE_W * 0.5, GROUND_Y - 260, `🔴 大红！${cardName}`, '#fecdd3', 62);
    } else if (rarity === 'gold') {
      this._spawnFloatingText(STAGE_W * 0.5, GROUND_Y - 250, `🟡 大金！${cardName}`, '#fef08a', 54);
    }
    const beam = new Graphics();
    beam.rect(STAGE_W * 0.5 - 70, 0, 140, GROUND_Y + 40).fill({ color, alpha: 0.55 });
    beam.blendMode = 'add';
    this.vfxLayer.addChild(beam);
    this.particles.push({ g: beam, vx: 0, vy: 0, life: 0, maxLife: 0.65, isBeam: true });
    for (let i = 0; i < 32; i++) {
      const g = new Graphics();
      g.circle(0, 0, 5 + Math.random() * 7).fill({ color: i % 2 === 0 ? color : 0xfef08a, alpha: 0.95 });
      g.blendMode = 'add';
      g.x = STAGE_W * 0.5 + (Math.random() - 0.5) * 160;
      g.y = GROUND_Y - Math.random() * 120;
      this.vfxLayer.addChild(g);
      this.particles.push({ g, vx: (Math.random() - 0.5) * 260, vy: -260 - Math.random() * 360, life: 0, maxLife: 0.55 + Math.random() * 0.3 });
    }
  }

  _spawnFloatingText(x, y, text, color, fontSize = 52) {
    const t = new Text({
      text,
      style: {
        fontFamily: 'Georgia, "Noto Serif SC", serif',
        fontSize,
        fontWeight: 'bold',
        fill: color,
        stroke: { color: '#110a0d', width: 7 }
      }
    });
    t.anchor.set(0.5);
    t.x = x + (Math.random() - 0.5) * 32;
    t.y = y;
    this.textLayer.addChild(t);
    this.floatTexts.push({ t, life: 0, maxLife: 0.82 });
  }

  _update(rawDt) {
    // True Hit-Stop freeze for impact weight (keeps screen shake alive!)
    if (this.hitStopTime > 0) {
      this.hitStopTime -= rawDt;
      if (this.shakeTime > 0) {
        this.shakeTime -= rawDt;
        const ratio = Math.max(0, this.shakeTime / this.shakeDur);
        this.root.x = (Math.random() - 0.5) * 2 * this.shakeMag * ratio;
        this.root.y = (Math.random() - 0.5) * 2 * this.shakeMag * ratio;
      }
      return;
    }

    const dt = Math.min(rawDt, 0.05);
    this.elapsed += dt;

    // Hurt vignette fade
    if (this.hurtAlpha > 0) {
      this.hurtAlpha = Math.max(0, this.hurtAlpha - dt * 1.4);
      this.hurtVignette.alpha = this.hurtAlpha;
    }

    for (const m of this.ambientMotes) {
      m.g.x += m.vx * dt;
      m.g.y += m.vy * dt + Math.sin(this.elapsed * 1.5 + m.phase) * 8 * dt;
      if (m.g.x < -10) m.g.x = STAGE_W + 10;
      if (m.g.y < -10) m.g.y = STAGE_H * 0.72;
    }

    if (this.heroView) {
      const hv = this.heroView;
      const b = 1 + Math.sin(this.elapsed * hv.cfg.breathSpeed) * hv.cfg.breathAmp;
      hv.bodyWrap.scale.set(1 / b, b);
      if (hv.stanceAura.visible) {
        const pulse = 1 + Math.sin(this.elapsed * (hv.stance === 'offense' ? 4.2 : 2.4)) * 0.05;
        hv.stanceAura.scale.set(pulse);
      }
      if (hv.adjustWrap.visible) {
        hv.adjustWrap.y = -190 + Math.sin(this.elapsed * 3.8) * 8;
      }
      if (Math.abs(hv.recoilX) > 0.2) {
        hv.recoilX *= Math.pow(0.0015, dt);
        hv.container.x = hv.baseX + hv.recoilX;
      } else if (hv.recoilX !== 0) {
        hv.recoilX = 0;
        hv.container.x = hv.baseX;
      }
      if (hv.flashTime > 0) {
        hv.flashTime -= dt;
        if (hv.flashTime <= 0) hv.bodyWrap.filters = null;
      }
    }

    for (const v of this.enemyViews.values()) {
      const amp = v.cfg.floatAmp || 10;
      const spd = v.cfg.floatSpeed || 1.8;
      v.bodyWrap.y = Math.sin(this.elapsed * spd + v.phase) * amp;
      if (Math.abs(v.recoilX) > 0.2) {
        v.recoilX *= Math.pow(0.0012, dt);
        v.container.x = v.baseX + v.recoilX;
      } else if (v.recoilX !== 0) {
        v.recoilX = 0;
        v.container.x = v.baseX;
      }
      for (const fx of v.fxSprites) {
        fx.sp.y = Math.sin(this.elapsed * (fx.cfg.floatSpeed || 2.2) + v.phase + 1.1) * (fx.cfg.floatAmp || 14);
        const pulse = 1 + Math.sin(this.elapsed * 2.5 + v.phase) * (fx.cfg.pulseAmp || 0.03);
        fx.sp.scale.set(fx.baseScale * pulse);
      }
      if (v.flashTime > 0) {
        v.flashTime -= dt;
        if (v.flashTime <= 0) v.bodyWrap.filters = null;
      }
    }

    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      tw.t += dt;
      const p = Math.min(1, tw.t / tw.dur);
      tw.update(p);
      if (p >= 1) { tw.done?.(); this.tweens.splice(i, 1); }
    }

    for (let i = this.effects.length - 1; i >= 0; i--) {
      const ef = this.effects[i];
      ef.life += dt;
      const p = ef.life / ef.maxLife;
      if (p >= 1) {
        this.vfxLayer.removeChild(ef.g);
        ef.g.destroy();
        this.effects.splice(i, 1);
      } else {
        ef.update(p);
      }
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life += dt;
      const p = pt.life / pt.maxLife;
      if (p >= 1) {
        this.vfxLayer.removeChild(pt.g);
        pt.g.destroy();
        this.particles.splice(i, 1);
      } else {
        if (!pt.isBeam) { pt.g.x += pt.vx * dt; pt.g.y += pt.vy * dt; pt.vy += 420 * dt; }
        pt.g.alpha = 1 - p;
      }
    }

    for (let i = this.floatTexts.length - 1; i >= 0; i--) {
      const ft = this.floatTexts[i];
      ft.life += dt;
      const p = ft.life / ft.maxLife;
      if (p >= 1) {
        this.textLayer.removeChild(ft.t);
        ft.t.destroy();
        this.floatTexts.splice(i, 1);
      } else {
        ft.t.y -= 95 * dt;
        ft.t.alpha = p < 0.6 ? 1 : 1 - (p - 0.6) / 0.4;
      }
    }

    if (this.shakeTime > 0) {
      this.shakeTime -= dt;
      const ratio = Math.max(0, this.shakeTime / this.shakeDur);
      this.root.x = (Math.random() - 0.5) * 2 * this.shakeMag * ratio;
      this.root.y = (Math.random() - 0.5) * 2 * this.shakeMag * ratio;
    } else {
      this.shakeMag = 0;
      this.root.x = 0;
      this.root.y = 0;
    }
  }
}
