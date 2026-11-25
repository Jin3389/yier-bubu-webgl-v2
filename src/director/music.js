const TRACKS = {
  title: './assets/audio/bgm-title.mp3',
  water: './assets/audio/bgm-water.mp3',
  earth: './assets/audio/bgm-earth.mp3',
  fire:  './assets/audio/bgm-fire.mp3',
  wind:  './assets/audio/bgm-wind.mp3',
  boss:  './assets/audio/bgm-boss.mp3',
  rest:  './assets/audio/bgm-rest.mp3',
  shop:  './assets/audio/bgm-shop.mp3',
  // Future Light/Dark fallback until Phase 2 tracks are added
  light: './assets/audio/bgm-title.mp3',
  dark:  './assets/audio/bgm-boss.mp3'
};

const PREFS_KEY = 'yier_bubu_audio_prefs_v1';

function loadPrefs() {
  try {
    if (typeof localStorage === 'undefined') return {};
    return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}') || {};
  } catch {
    return {};
  }
}

function savePrefs(patch) {
  try {
    if (typeof localStorage === 'undefined') return;
    const cur = loadPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...cur, ...patch }));
  } catch {}
}

class MusicController {
  constructor() {
    const prefs = loadPrefs();
    this.enabled = prefs.bgmEnabled !== false;
    this.volume = typeof prefs.bgmVolume === 'number' ? Math.max(0, Math.min(1, prefs.bgmVolume)) : 0.45;
    this.currentKey = null;
    this.audio = null;
    this._fadeTimer = null;
    this._fadingOut = new Set();
    this._bindUnlock();
  }

  _bindUnlock() {
    if (typeof window === 'undefined') return;
    const unlock = () => {
      if (this.enabled && this.audio && this.audio.paused) {
        this.audio.play().catch(() => {});
      }
    };
    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
  }

  _clearFadeIn() {
    if (this._fadeTimer) {
      clearInterval(this._fadeTimer);
      this._fadeTimer = null;
    }
  }

  _fadeOutAudio(audioEl, durationMs = 550) {
    if (!audioEl) return;
    if (audioEl.paused || durationMs <= 0) {
      audioEl.pause();
      audioEl.currentTime = 0;
      return;
    }
    const startVol = audioEl.volume;
    const steps = Math.max(1, Math.round(durationMs / 35));
    let step = 0;
    const timer = setInterval(() => {
      step += 1;
      const ratio = Math.max(0, 1 - step / steps);
      audioEl.volume = Math.max(0, startVol * ratio);
      if (step >= steps) {
        clearInterval(timer);
        this._fadingOut.delete(timer);
        audioEl.pause();
        audioEl.currentTime = 0;
      }
    }, 35);
    this._fadingOut.add(timer);
  }

  play(key, fadeMs = 650) {
    if (typeof Audio === 'undefined') return;
    const resolvedKey = TRACKS[key] ? key : 'water';
    if (this.currentKey === resolvedKey && this.audio) {
      if (this.enabled && this.audio.paused) {
        this.audio.volume = this.volume;
        this.audio.play().catch(() => {});
      }
      return;
    }

    this._clearFadeIn();
    if (this.audio) {
      this._fadeOutAudio(this.audio, fadeMs);
      this.audio = null;
    }

    const url = TRACKS[resolvedKey];
    this.currentKey = resolvedKey;
    const nextAudio = new Audio(url);
    nextAudio.loop = true;
    nextAudio.volume = this.enabled && fadeMs > 0 ? 0.001 : this.volume;
    this.audio = nextAudio;

    if (!this.enabled) return;

    nextAudio.play().then(() => {
      if (this.audio !== nextAudio || !this.enabled) return;
      if (fadeMs <= 0) {
        nextAudio.volume = this.volume;
        return;
      }
      const steps = Math.max(1, Math.round(fadeMs / 35));
      let step = 0;
      this._fadeTimer = setInterval(() => {
        if (this.audio !== nextAudio || !this.enabled) {
          this._clearFadeIn();
          return;
        }
        step += 1;
        nextAudio.volume = Math.min(this.volume, this.volume * (step / steps));
        if (step >= steps) {
          nextAudio.volume = this.volume;
          this._clearFadeIn();
        }
      }, 35);
    }).catch(() => {
      // Waiting for first user gesture to unlock autoplay
      if (this.audio === nextAudio) nextAudio.volume = this.volume;
    });
  }

  stop(fadeMs = 450) {
    this._clearFadeIn();
    if (this.audio) {
      this._fadeOutAudio(this.audio, fadeMs);
      this.audio = null;
    }
    this.currentKey = null;
  }

  setVolume(val) {
    const v = Math.max(0, Math.min(1, Number(val)));
    if (Number.isNaN(v)) return this.volume;
    this.volume = v;
    savePrefs({ bgmVolume: v });
    if (this.audio && this.enabled && !this._fadeTimer) {
      this.audio.volume = v;
    }
    return this.volume;
  }

  toggle() {
    this.enabled = !this.enabled;
    savePrefs({ bgmEnabled: this.enabled });
    this._clearFadeIn();
    if (!this.enabled && this.audio) {
      this.audio.pause();
    } else if (this.enabled && this.audio) {
      this.audio.volume = this.volume;
      this.audio.play().catch(() => {});
    }
    return this.enabled;
  }
}

export const MUSIC = new MusicController();
