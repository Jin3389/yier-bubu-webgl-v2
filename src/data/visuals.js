// Complete Data-Driven Visual Manifest for all 5 Heroes and all 36 Elemental Enemies

const SPRITE_FILE_MAP = {
  // Water (9)
  w_bubbles: 'water/w-bubbles.webp',
  w_wave:    'water/w-wave.webp',
  w_mist:    'water/w-mist.webp',
  w_rain:    'water/w-rain.webp',
  w_freeze:  'water/w-freeze.webp',
  w_snow:    'water/w-snow.webp',
  w_cloud:   'water/w-cloud.webp',
  w_wood:    'water/w-wood.webp',
  w_watery:  'water/w-watery.webp',
  // Earth (9)
  earth_flower:    'earth/earth-flower.webp',
  earth_sand:      'earth/earth-sand.webp',
  earth_shield:    'earth/earth-shield.webp',
  earth_lock:      'earth/earth-lock.webp',
  earth_scales:    'earth/earth-scales.webp',
  earth_loop:      'earth/earth-loop.webp',
  earth_maze:      'earth/earth-maze.webp',
  earth_mirror:    'earth/earth-mirror.webp',
  earth_sovereign: 'earth/earth-sovereign.webp',
  // Fire (9)
  fire_arrow:     'fire/fire-arrow.webp',
  fire_fight:     'fire/fire-fight.webp',
  fire_power:     'fire/fire-power.webp',
  fire_shot:      'fire/fire-shot.webp',
  fire_sword:     'fire/fire-sword.webp',
  fire_through:   'fire/fire-through.webp',
  fire_thunder:   'fire/fire-thunder.webp',
  fire_twin:      'fire/fire-twin.webp',
  fire_sovereign: 'fire/fire-sovereign.webp',
  // Wind (9)
  wind_dash:      'wind/wind-dash.webp',
  wind_float:     'wind/wind-float.webp',
  wind_fly:       'wind/wind-fly.webp',
  wind_jump:      'wind/wind-jump.webp',
  wind_move:      'wind/wind-move.webp',
  wind_song:      'wind/wind-song.webp',
  wind_storm:     'wind/wind-storm.webp',
  wind_voice:     'wind/wind-voice.webp',
  wind_sovereign: 'wind/wind-sovereign.webp'
};

const BOSS_IDS = new Set(['w_watery', 'earth_sovereign', 'fire_sovereign', 'wind_sovereign']);

const enemiesVisuals = {};
for (const [id, rel] of Object.entries(SPRITE_FILE_MAP)) {
  const isBoss = BOSS_IDS.has(id);
  enemiesVisuals[id] = {
    sprite: `./assets/enemies/${rel}`,
    targetHeight: isBoss ? 455 : (id === 'fire_twin' ? 320 : 380),
    anchor: { x: 0.5, y: 0.92 },
    floatAmp: isBoss ? 12 : 9,
    floatSpeed: isBoss ? 1.9 : 1.7
  };
}

// Tier 2: Bubbles + Separate Aligned Additive FX Layer
enemiesVisuals.w_bubbles.fxLayers = [
  {
    sprite: './assets/enemies/water/w-bubbles-fx.webp',
    zOrder: 'front',
    blend: 'add',
    alpha: 0.88,
    floatAmp: 16,
    floatSpeed: 2.3,
    pulseAmp: 0.04
  }
];

// Tier 3: Cloud Multi-Form Split Family (1 -> 2 -> 4)
enemiesVisuals.w_cloud.formSprites = {
  m1: { sprite: './assets/enemies/water/w-cloud-m1.webp', targetHeight: 300 },
  m2: { sprite: './assets/enemies/water/w-cloud-m2.webp', targetHeight: 300 },
  s1: { sprite: './assets/enemies/water/w-cloud-s1.webp', targetHeight: 230 },
  s2: { sprite: './assets/enemies/water/w-cloud-s2.webp', targetHeight: 230 },
  s3: { sprite: './assets/enemies/water/w-cloud-s3.webp', targetHeight: 230 },
  s4: { sprite: './assets/enemies/water/w-cloud-s4.webp', targetHeight: 230 }
};

export const VISUAL_MANIFEST = {
  heroes: {
    knight:  { sprite: './assets/heroes/hero-knight.webp',  targetHeight: 280, anchor: { x: 0.5, y: 0.92 }, breathAmp: 0.018, breathSpeed: 2.2 },
    thief:   { sprite: './assets/heroes/hero-thief.webp',   targetHeight: 270, anchor: { x: 0.5, y: 0.92 }, breathAmp: 0.022, breathSpeed: 2.6 },
    chef:    { sprite: './assets/heroes/hero-chef.webp',    targetHeight: 280, anchor: { x: 0.5, y: 0.92 }, breathAmp: 0.020, breathSpeed: 2.3 },
    teacher: { sprite: './assets/heroes/hero-teacher.webp', targetHeight: 280, anchor: { x: 0.5, y: 0.92 }, breathAmp: 0.018, breathSpeed: 2.1 },
    yier:    { sprite: './assets/heroes/hero-yier.webp',    targetHeight: 275, anchor: { x: 0.5, y: 0.92 }, breathAmp: 0.020, breathSpeed: 2.4 }
  },
  enemies: enemiesVisuals
};
