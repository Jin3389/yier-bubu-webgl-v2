// Procedural Web Audio Combat SFX Engine (Fantasy Chamber × Tactile Card Juice)
const AUDIO_PREFS_KEY = 'yier_bubu_audio_prefs_v1';
function loadSfxPrefs() {
  try {
    if (typeof localStorage === 'undefined') return {};
    return JSON.parse(localStorage.getItem(AUDIO_PREFS_KEY) || '{}') || {};
  } catch { return {}; }
}
function saveSfxPrefs(patch) {
  try {
    if (typeof localStorage === 'undefined') return;
    const cur = loadSfxPrefs();
    localStorage.setItem(AUDIO_PREFS_KEY, JSON.stringify({ ...cur, ...patch }));
  } catch {}
}
const _initSfxPrefs = loadSfxPrefs();

const SFX = {
  ctx: null,
  master: null,
  muted: _initSfxPrefs.sfxEnabled === false,
  volume: typeof _initSfxPrefs.sfxVolume === 'number' ? Math.max(0, Math.min(1, _initSfxPrefs.sfxVolume)) : 0.85,
  noiseBuffer: null,

  get enabled() { return !this.muted; },
  set enabled(val) {
    this.muted = !val;
    saveSfxPrefs({ sfxEnabled: !this.muted });
  },

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  },

  setVolume(val) {
    const v = Math.max(0, Math.min(1, Number(val)));
    if (Number.isNaN(v)) return this.volume;
    this.volume = v;
    saveSfxPrefs({ sfxVolume: v });
    if (this.master) this.master.gain.value = v * 0.95;
    return this.volume;
  },

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        this.ctx = new AC();
        const comp = this.ctx.createDynamicsCompressor();
        comp.threshold.value = -14;
        comp.knee.value = 18;
        comp.ratio.value = 6;
        comp.attack.value = 0.003;
        comp.release.value = 0.14;
        const gain = this.ctx.createGain();
        gain.gain.value = this.volume * 0.95;
        gain.connect(comp).connect(this.ctx.destination);
        this.master = gain;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  },

  tone(freq, dur = 0.09, type = 'triangle', vol = 0.12, slide = null, delay = 0) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(20, freq), now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, slide), now + dur);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(vol, now + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + dur + 0.01);
  },

  noise(freq, endFreq, duration, volume, delay = 0, q = 0.85) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    if (!this.noiseBuffer) {
      this.noiseBuffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * 0.45), ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    const t = ctx.currentTime + delay;
    source.buffer = this.noiseBuffer;
    filter.type = 'bandpass';
    filter.Q.value = q;
    filter.frequency.setValueAtTime(Math.max(40, freq), t);
    filter.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), t + duration);
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter).connect(gain).connect(this.master);
    source.start(t);
    source.stop(t + duration + 0.01);
  },

  // --- Core Card & Combat Foley ---
  playCard() {
    this.noise(1600, 5200, 0.07, 0.20, 0, 1.1);
    this.tone(420, 0.036, 'triangle', 0.05, 210, 0.022);
  },

  turnStart() {
    [0, 0.045, 0.09].forEach((d, i) => {
      this.noise(2100 + i * 320, 4400, 0.042, 0.11, d, 1.3);
    });
  },

  hit(damage, delay = 0, incoming = false) {
    const heavy = damage >= 8;
    const crit = damage >= 14;
    this.noise(incoming ? 1050 : 2800, 480, heavy ? 0.14 : 0.085, heavy ? 0.48 : 0.32, delay);
    this.tone(incoming ? 148 : 235, heavy ? 0.19 : 0.10, 'triangle', heavy ? 0.28 : 0.19, heavy ? 48 : 78, delay);
    if (heavy) {
      this.noise(650, 170, 0.16, 0.30, delay + 0.02);
      this.tone(95, 0.14, 'sine', 0.18, 42, delay + 0.01);
    }
    if (crit) {
      this.tone(660, 0.14, 'sine', 0.10, 990, delay + 0.015);
    }
  },

  shieldHit(delay = 0) {
    this.noise(4400, 1250, 0.055, 0.32, delay, 1.4);
    this.tone(1047, 0.13, 'sine', 0.12, 920, delay);
    this.tone(1680, 0.075, 'sine', 0.065, 1510, delay + 0.005);
  },

  armorBreak() {
    this.noise(3800, 620, 0.16, 0.38, 0, 0.7);
    this.tone(880, 0.10, 'sawtooth', 0.08, 260, 0);
    this.tone(1320, 0.14, 'sine', 0.09, 520, 0.035);
    this.tone(165, 0.15, 'triangle', 0.16, 62, 0.02);
  },

  block() {
    this.noise(1200, 520, 0.06, 0.16);
    this.tone(520, 0.09, 'sine', 0.11, 440);
    this.tone(780, 0.07, 'triangle', 0.05, 720, 0.012);
  },

  precisionGuard() {
    this.noise(5600, 1700, 0.07, 0.28, 0, 1.6);
    this.tone(620, 0.25, 'sine', 0.15, 595);
    this.tone(1520, 0.34, 'sine', 0.10, 1480, 0.014);
    this.tone(2280, 0.22, 'sine', 0.05, 2200, 0.02);
    this.tone(138, 0.14, 'triangle', 0.16, 64, 0.15);
  },

  precisionStrike(chain = 1) {
    const pitch = 1 + Math.min(4, Math.max(0, chain - 1)) * 0.14;
    this.noise(950, 5800, 0.10, 0.28, 0, 1.2);
    this.tone(520 * pitch, 0.15, 'triangle', 0.11, 1020 * pitch, 0.03);
    if (chain > 1) this.tone(1180 * pitch, 0.20, 'sine', 0.09, 1580 * pitch, 0.09);
  },

  parry() {
    this.tone(880, 0.14, 'triangle', 0.15, 1320);
    this.tone(1320, 0.22, 'sine', 0.13, 1360, 0.065);
  },

  blade() {
    this.noise(900, 5600, 0.10, 0.25, 0, 1.4);
    this.tone(1760, 0.10, 'sine', 0.065, 1180, 0.038);
  },

  brace() {
    this.noise(780, 260, 0.085, 0.30);
    this.tone(310, 0.14, 'triangle', 0.13, 158);
    this.tone(880, 0.10, 'sine', 0.06, 820, 0.014);
  },

  // --- Chef 5-Flavor Foley ---
  simmer(flavor = 'bitter', plated = false) {
    const bubbles = {
      sweet: [440, 660, 880],
      bitter: [280, 385, 315],
      sour: [520, 360, 760],
      spicy: [270, 455, 580, 740],
      salty: [400, 480]
    };
    (bubbles[flavor] || bubbles.bitter).forEach((hz, i) => {
      const delay = [0.016, 0.095, 0.16, 0.23][i] || 0.25;
      this.tone(hz * 0.68, 0.06, 'sine', 0.13, hz * 1.4, delay);
      this.noise(hz * 2, hz, 0.035, 0.07, delay + 0.008);
    });
    if (flavor === 'spicy') this.noise(2500, 5600, 0.26, 0.19);
    if (flavor === 'salty') [0, 0.048, 0.092].forEach(t => this.noise(7200, 3400, 0.042, 0.16, t));
    if (plated) this.tone(1480, 0.22, 'sine', 0.095, 1430, 0.29);
  },

  // --- Thief Delta Force 6-Tier Loot Audio ---
  rustle() {
    this.noise(1850, 4500, 0.065, 0.18);
    this.noise(3500, 920, 0.09, 0.17, 0.068);
  },

  coins(selling = true) {
    const notes = selling ? [1568, 1976, 2349] : [2093, 1760];
    notes.forEach((hz, i) => {
      const t = 0.035 + i * 0.068;
      this.noise(6000, 2800, 0.022, 0.13, t, 1.8);
      this.tone(hz, 0.135, 'sine', 0.085, hz * 0.97, t);
      this.tone(hz * 1.5, 0.07, 'sine', 0.036, null, t + 0.004);
    });
  },

  lootDrop(rarity = 'white') {
    if (rarity === 'red') {
      // Iconic "出大红" dramatic heartbeat + shimmering crimson-gold fanfare
      this.tone(92, 0.22, 'triangle', 0.24, 52, 0);
      this.noise(4200, 7600, 0.16, 0.18, 0.03, 2.0);
      [587.3, 739.9, 880, 1174.7, 1479.9].forEach((hz, i) => {
        const t = 0.04 + i * 0.062;
        this.tone(hz, 0.34, 'sine', 0.12, hz * 1.01, t);
        this.tone(hz * 2, 0.18, 'triangle', 0.04, null, t + 0.01);
      });
    } else if (rarity === 'gold') {
      // "出大金" bright golden arpeggio
      [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => {
        const t = 0.03 + i * 0.065;
        this.tone(hz, 0.26, 'sine', 0.11, null, t);
        this.tone(hz * 2, 0.12, 'sine', 0.035, null, t + 0.008);
      });
    } else if (rarity === 'purple') {
      [440, 554.37, 659.25, 880].forEach((hz, i) => {
        this.tone(hz, 0.19, 'triangle', 0.09, null, 0.02 + i * 0.055);
      });
    } else if (rarity === 'blue') {
      [587.3, 880].forEach((hz, i) => this.tone(hz, 0.16, 'sine', 0.095, null, 0.02 + i * 0.06));
    } else if (rarity === 'green') {
      this.tone(523.25, 0.12, 'triangle', 0.085, 659.25, 0.02);
    } else {
      this.coins(true);
    }
  },

  // --- Teacher Match-3 & Chalk Audio ---
  paper() {
    this.noise(4800, 1600, 0.095, 0.13);
    this.noise(1350, 3100, 0.038, 0.09, 0.09);
  },

  chalk() {
    this.noise(3400, 1900, 0.052, 0.18, 0, 1.4);
    this.tone(940, 0.035, 'triangle', 0.048, 660, 0.032);
  },

  dyeColor() {
    this.chalk();
    this.tone(659.25, 0.09, 'sine', 0.08, 987.77, 0.03);
    this.tone(987.77, 0.12, 'sine', 0.06, 1318.5, 0.08);
  },

  matchThree(color = 'red') {
    if (color === 'red') {
      // Fiery chalk slam + punchy burst
      this.tone(180, 0.20, 'triangle', 0.24, 64, 0);
      this.noise(2400, 480, 0.18, 0.32, 0.01);
      [523.25, 659.25, 783.99].forEach((hz, i) => this.tone(hz, 0.18, 'triangle', 0.10, null, 0.03 + i * 0.045));
    } else if (color === 'blue') {
      // Clear classroom bell + soothing heal chime
      [659.25, 880, 1174.7].forEach((hz, i) => {
        this.tone(hz, 0.28, 'sine', 0.10, null, 0.02 + i * 0.065);
        this.tone(hz * 2, 0.12, 'sine', 0.03, null, 0.025 + i * 0.065);
      });
    } else {
      // Yellow: bouncy Match-3 combo ignition arpeggio!
      [587.3, 739.9, 880, 1174.7].forEach((hz, i) => {
        this.tone(hz, 0.16, 'sine', 0.10, hz * 1.04, 0.02 + i * 0.05);
      });
    }
  },

  lessonBell(long = false) {
    (long ? [659, 830, 988, 1318] : [880, 1175]).forEach((hz, i) => {
      this.tone(hz, 0.23, 'sine', 0.10, null, 0.05 + i * 0.08);
      this.tone(hz * 2.39, 0.085, 'sine', 0.03, null, 0.05 + i * 0.08);
    });
  },

  // --- Yier Starlight & Elemental Trait Accents ---
  stars(burst) {
    (burst ? [1568, 1175, 784] : [1047, 1568]).forEach((hz, i) => this.tone(hz, 0.16, 'sine', 0.085, null, i * 0.05));
    if (burst) this.noise(3200, 750, 0.13, 0.15, 0.07);
  },

  elementTrait(faction = 'fire') {
    if (faction === 'water') {
      this.noise(1600, 520, 0.16, 0.20, 0, 1.5);
      this.tone(740, 0.14, 'sine', 0.08, 490, 0.02);
    } else if (faction === 'earth') {
      this.tone(130, 0.18, 'triangle', 0.20, 58, 0);
      this.noise(680, 220, 0.14, 0.22, 0.01);
    } else if (faction === 'fire') {
      this.noise(2800, 620, 0.18, 0.26, 0, 0.9);
      this.tone(240, 0.14, 'sawtooth', 0.07, 110, 0.01);
    } else if (faction === 'wind') {
      this.noise(1200, 4600, 0.16, 0.18, 0, 2.2);
      this.tone(880, 0.13, 'sine', 0.06, 1320, 0.02);
    }
  },

  cardVoice(card) {
    if (card.flavor) this.simmer(card.flavor, card.id.endsWith('_dish'));
    else if (card.owner === 'knight' && card.type === 'offense') this.blade();
    else if (card.owner === 'knight' && card.type === 'defense') this.brace();
    else if (card.owner === 'teacher') this.chalk();
    else if (card.stealLoot) this.rustle();
    else if (card.type === 'loot') this.coins(false);
    else if (card.starMark || card.consumeStar) this.stars(Boolean(card.consumeStar));
    else this.playCard();
  },

  seal() {
    [523.25, 659.25, 783.99, 1046.5].forEach((hz, i) => this.tone(hz, 0.26, 'sine', 0.11, null, i * 0.065));
  },

  victory() {
    // Warm fantasy chamber triumph arpeggio
    [392, 493.88, 587.33, 783.99].forEach((hz, i) => {
      const t = 0.08 + i * 0.085;
      this.tone(hz, 0.34, 'triangle', 0.095, null, t);
      this.tone(hz * 2, 0.20, 'sine', 0.032, null, t + 0.01);
    });
  },

  defeat() {
    // Restrained solemn descending cadence
    [349.23, 311.13, 261.63, 196].forEach((hz, i) => {
      this.tone(hz, 0.32, 'triangle', 0.09, hz * 0.96, 0.06 + i * 0.13);
    });
  },

  warn() {
    this.tone(220, 0.11, 'square', 0.075, 165);
  },

  // --- Slay-the-Spire Style Character Select Switch SFX ---
  selectHero(id = 'bubu') {
    if (this.muted) return;
    if (id === 'knight') {
      // Crisp steel sword draw + warm shield resonance
      this.blade();
      this.tone(330, 0.16, 'triangle', 0.13, 240, 0.04);
      this.tone(660, 0.20, 'sine', 0.08, 620, 0.06);
    } else if (id === 'thief') {
      // Sly cloak swish + gleaming gold coins chime
      this.rustle();
      this.coins(true);
    } else if (id === 'chef') {
      // Sizzling wok heat + bright ladle clink
      this.simmer('spicy', true);
    } else if (id === 'teacher') {
      // Chalk tap + clear classroom bell
      this.chalk();
      this.lessonBell(false);
    } else if (id === 'yier') {
      // Shimmering arcane starlight arpeggio
      [659.25, 880, 1174.66, 1567.98].forEach((hz, i) => {
        this.tone(hz, 0.24, 'sine', 0.09, hz * 1.01, i * 0.055);
      });
    } else {
      // Bubu primary: warm wooden adventurer drum + friendly brass fifth
      this.tone(185, 0.14, 'triangle', 0.16, 110, 0);
      this.tone(392, 0.18, 'triangle', 0.10, null, 0.03);
      this.tone(587.33, 0.22, 'sine', 0.08, null, 0.08);
    }
  },

  confirmStart() {
    if (this.muted) return;
    this.tone(146.83, 0.20, 'triangle', 0.18, 98, 0);
    [440, 554.37, 659.25, 880].forEach((hz, i) => {
      this.tone(hz, 0.26, 'triangle', 0.095, null, 0.03 + i * 0.055);
    });
  }
};

export { SFX };
