// Main bootstrap connecting 5-Class RunEngine <-> PresentationDirector <-> WebGLStageApp <-> UiApp

import { CHARACTERS } from './data/characters.js';
import {
  SAVE_KEY, createNewRun, getCurrentNode, enterCurrentMapNode, startNodeCombat, applyCombatVictory,
  performCampfireRest, performKnightSparSwap, performChefCook, performTeacherUpgrade,
  performYierRelease, sellLootInShop, buyShopItem, advanceFromCampfire,
  serializeRun, deserializeRun
} from './core/run-engine.js';
import { playCard, useActiveSkill, resolvePendingChoice, setRetainCard, endPlayerTurn } from './core/combat-engine.js';
import { PresentationDirector } from './director/director.js';
import { SFX } from './director/audio.js';
import { MUSIC } from './director/music.js';
import { WebGLStageApp } from './stage/stage-app.js';
import { CardDragController } from './ui/card-drag.js';
import { UiApp } from './ui/ui-app.js';

let run = null;
let combat = null;
let combatRng = null;

function saveRun() {
  if (!run) return;
  try { localStorage.setItem(SAVE_KEY, serializeRun(run)); } catch {}
}
function clearSave() {
  try { localStorage.removeItem(SAVE_KEY); } catch {}
}
function loadSavedRun() {
  try { return deserializeRun(localStorage.getItem(SAVE_KEY)); } catch { return null; }
}

async function bootstrap() {
  const stage = new WebGLStageApp(document.getElementById('stage-host'));
  await stage.init();
  await stage.setBackground('./assets/bg/bg-water.webp');

  let ui;
  let director;

  const dragCtrl = new CardDragController({
    viewportEl: document.getElementById('viewport-16-9'),
    arrowSvg: document.getElementById('drag-arrow-svg'),
    arrowPath: document.getElementById('drag-arrow-path'),
    stage,
    getHand: () => combat?.hand || [],
    onPlayCard: async (cardUid, targetEnemyUid) => {
      if (!combat || director.busy) return;
      const res = playCard(combat, cardUid, targetEnemyUid, combatRng);
      if (!res.ok) {
        SFX.warn?.();
        ui.showToast(res.reason || '当前无法打出', 'rose');
        return;
      }
      if (res.pendingChoice) {
        ui.syncCombatHud(combat);
        return;
      }
      await director.playEvents(res.events, combat);
      await checkBattleFinish();
    },
    onEndTurn: () => handleEndTurn()
  });

  async function handleEndTurn() {
    if (!combat || director.busy || combat.pendingChoice) return;
    const res = endPlayerTurn(combat, combatRng);
    if (!res.ok) return;
    await director.playEvents(res.events, combat);
    await checkBattleFinish();
  }

  async function checkBattleFinish() {
    if (!combat || !combat.finished) return;
    if (combat.finished === 'victory') {
      applyCombatVictory(run, combat);
      saveRun();
      await enterCurrentScreen();
    } else if (combat.finished === 'defeat') {
      run.screen = 'defeat';
      clearSave();
      stage.clearActors();
      MUSIC.stop(500);
      ui.renderEnding(run, false);
    }
  }

  async function enterCurrentScreen() {
    if (!run) {
      stage.clearActors();
      await stage.setBackground('./assets/bg/bg-water.webp');
      MUSIC.play('title');
      ui.renderTitle(!!loadSavedRun());
      return;
    }

    if (run.screen === 'combat') {
      const node = getCurrentNode(run);
      const started = startNodeCombat(run);
      combat = started.combat;
      combatRng = started.rng;
      await stage.setBackground(node.bg);
      await stage.setupBattleActors(run.charId, combat.enemies);
      MUSIC.play(node.bgm || 'water');
      ui.syncCombatHud(combat);
      await director.playEvents(started.events, combat);
      return;
    }

    if (run.screen === 'map') {
      combat = null;
      stage.clearActors();
      const nextNode = getCurrentNode(run);
      await stage.setBackground(nextNode?.bg || './assets/bg/bg-campfire-default.webp');
      MUSIC.play('rest');
      ui.renderMapHub(run);
      return;
    }

    if (run.screen === 'campfire') {
      combat = null;
      stage.clearActors();
      await stage.setBackground('./assets/bg/bg-campfire-default.webp');
      MUSIC.play('rest');
      ui.renderCampfire(run);
      return;
    }

    if (run.screen === 'class_room' || run.screen === 'shop') {
      combat = null;
      stage.clearActors();
      const ch = CHARACTERS[run.charId];
      await stage.setBackground(ch.restBg, './assets/bg/bg-campfire-default.webp');
      MUSIC.play(run.screen === 'shop' ? 'shop' : 'rest');
      if (run.screen === 'shop') ui.renderShop(run);
      else ui.renderClassRoom(run);
      return;
    }

    if (run.screen === 'victory') {
      combat = null;
      clearSave();
      stage.clearActors();
      MUSIC.play('rest');
      ui.renderEnding(run, true);
    }
  }

  ui = new UiApp({
    rootEl: document.getElementById('ui-root'),
    stage,
    dragCtrl,
    callbacks: {
      getRun: () => run,
      getSpeed: () => director.speed,
      getAudioState: () => ({
        bgm: MUSIC.enabled,
        bgmVol: Math.round(MUSIC.volume * 100),
        sfx: SFX.enabled,
        sfxVol: Math.round(SFX.volume * 100)
      }),
      onSelectHeroSfx: (id) => SFX.selectHero(id),
      onStartRun: async (charId) => { SFX.confirmStart(); run = createNewRun(charId); saveRun(); await enterCurrentScreen(); },
      onContinueRun: async () => { const s = loadSavedRun(); if (!s) return; run = s; await enterCurrentScreen(); },
      onReturnTitle: async () => { run = null; combat = null; await enterCurrentScreen(); },
      onUseActiveSkill: async () => {
        if (!combat || director.busy) return;
        const res = useActiveSkill(combat, combatRng);
        if (!res.ok) { SFX.warn?.(); ui.showToast(res.reason || '无法发动主动技', 'amber'); return; }
        if (res.pendingChoice) { ui.syncCombatHud(combat); return; }
        await director.playEvents(res.events, combat);
        await checkBattleFinish();
      },
      onResolveChoice: async (optId) => {
        if (!combat || director.busy) return;
        const res = resolvePendingChoice(combat, optId, combatRng);
        if (!res.ok) return;
        if (res.pendingChoice) { ui.syncCombatHud(combat); return; }
        await director.playEvents(res.events, combat);
        await checkBattleFinish();
      },
      onSetRetain: (uid) => { if (combat) setRetainCard(combat, uid); },
      onEndTurn: () => handleEndTurn(),
      onCampfireRest: () => {
        const res = performCampfireRest(run);
        if (res.ok) { saveRun(); SFX.stars(false); ui.showToast(`🔥 营火休整：回复 ${res.healed} 点生命`, 'emerald'); ui.renderCampfire(run); }
      },
      onKnightSparSwap: (removeIdx, addId) => {
        const res = performKnightSparSwap(run, removeIdx, addId);
        if (res.ok) { saveRun(); SFX.blade(); ui.showToast('⚔️ 木偶对练完成：已替换为进阶招式！', 'amber'); ui.renderClassRoom(run); }
      },
      onChefCook: (deckIdx, toId) => {
        const res = performChefCook(run, deckIdx, toId);
        if (res.ok) { saveRun(); SFX.simmer('spicy', true); ui.showToast('🍲 篝火烹调完成：菜肴已入袋！', 'amber'); ui.renderClassRoom(run); }
      },
      onTeacherUpgrade: (deckIdx, toId) => {
        const res = performTeacherUpgrade(run, deckIdx, toId);
        if (res.ok) { saveRun(); SFX.lessonBell(false); ui.showToast('🖍️ 备课升级完成：双格进阶牌已就绪！', 'sky'); ui.renderClassRoom(run); }
      },
      onYierRelease: (deckIdx) => {
        const res = performYierRelease(run, deckIdx);
        if (res.ok) { saveRun(); SFX.seal(); ui.showToast('✨ 已解放库洛牌，空白封印卡 +1！', 'purple'); ui.renderClassRoom(run); }
      },
      onEnterMapNode: async () => { SFX.playCard(); enterCurrentMapNode(run); saveRun(); await enterCurrentScreen(); },
      onOpenClassRoom: async () => { SFX.playCard(); run.screen = run.charId === 'thief' ? 'shop' : 'class_room'; saveRun(); await enterCurrentScreen(); },
      onOpenShop: async () => { SFX.playCard(); run.screen = 'shop'; saveRun(); await enterCurrentScreen(); },
      onBackCampfire: async () => { run.screen = 'campfire'; saveRun(); await enterCurrentScreen(); },
      onSellLoot: (deckIdx) => {
        const res = sellLootInShop(run, deckIdx);
        if (res.ok) { saveRun(); ui.showToast(`💰 销赃【${res.cardName}】，获得 ${res.earned} 金！`, 'amber'); ui.renderShop(run); }
      },
      onBuyShop: (stockIdx) => {
        const res = buyShopItem(run, stockIdx);
        if (res.ok) { saveRun(); ui.showToast('🛒 已收入麻袋！', 'sky'); ui.renderShop(run); }
      },
      onAdvanceFromCampfire: async () => { advanceFromCampfire(run); saveRun(); await enterCurrentScreen(); },
      onToggleBgm: () => MUSIC.toggle(),
      onSetBgmVolume: (pct) => MUSIC.setVolume(pct / 100),
      onToggleSfx: () => SFX.toggle(),
      onSetSfxVolume: (pct) => SFX.setVolume(pct / 100),
      onToggleSpeed: () => director.toggleSpeed()
    }
  });

  director = new PresentationDirector({ stage, ui });
  await enterCurrentScreen();
}

bootstrap();
