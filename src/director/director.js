// Presentation Queue Director: paces all 5 Classes' signature WebGL VFX, tiered hit-stop/recoil, SFX, and HUD sync

import { SFX } from './audio.js';

export class PresentationDirector {
  constructor({ stage, ui }) {
    this.stage = stage;
    this.ui = ui;
    this.speed = 1.0;
    this.busy = false;
  }

  setSpeed(mult) { this.speed = mult; }
  toggleSpeed() {
    this.speed = this.speed > 1.2 ? 1.0 : 1.8;
    return this.speed;
  }

  _wait(ms) {
    return new Promise(resolve => setTimeout(resolve, Math.max(16, Math.round(ms / this.speed))));
  }

  async playEvents(events, combatSnapshot) {
    if (!events || !events.length) {
      this.ui.syncCombatHud(combatSnapshot);
      return;
    }
    this.busy = true;
    this.ui.setInputLocked(true);

    try {
      for (const ev of events) {
        switch (ev.type) {
          case 'TURN_BANNER':
            if (ev.side === 'player' && ev.turn > 1) SFX.turnStart?.();
            this.ui.showBanner(ev.text, ev.side === 'player' ? 'amber' : 'rose');
            await this._wait(340);
            break;

          case 'CARD_PLAY':
            SFX.playCard?.();
            this.stage.playCardLaunch(ev.target, ev.cardType);
            await this._wait(90);
            break;

          case 'STANCE_CHANGE':
            if (ev.stance === 'offense') SFX.blade?.();
            else SFX.brace?.();
            this.stage.setHeroStance(ev.stance, true);
            this.ui.syncCombatHud(combatSnapshot);
            await this._wait(130);
            break;

          case 'ADJUST_STATE':
            this.stage.setHeroAdjust(ev.delta);
            await this._wait(70);
            break;

          case 'HERO_BUFF_SYNC':
            this.stage.syncHeroBuffVisuals(ev);
            break;

          case 'PRECISION_GUARD':
            SFX.precisionGuard?.();
            this.stage.playPrecisionGuard(ev.target);
            await this._wait(165);
            break;

          case 'STEAL_ARC':
            this.stage.playStealArc(ev.from, ev.rarity);
            await this._wait(160);
            break;

          case 'BOMB_BLAST':
            this.stage.playBombBlast(ev.target);
            await this._wait(110);
            break;

          case 'MATCH_THREE':
            SFX.matchThree?.(ev.color);
            this.stage.playMatchThreeBurst(ev.color, ev.target);
            await this._wait(220);
            break;

          case 'DYE_FLASH':
            SFX.dyeColor?.();
            this.stage.playDyeFlash(ev.color);
            await this._wait(130);
            break;

          case 'STAR_MARK_FX':
            this.stage.playStarMarkApply(ev.target, ev.stacks);
            await this._wait(85);
            break;

          case 'STAR_BURST':
            SFX.precisionStrike?.(ev.stacks || 2);
            this.stage.playStarBurst(ev.target, ev.stacks);
            await this._wait(190);
            break;

          case 'STAR_LOCK':
            SFX.parry?.();
            this.stage.playStarLock(ev.target);
            await this._wait(160);
            break;

          case 'CLOW_SEAL':
            SFX.seal?.();
            this.stage.playClowSeal(ev.target, ev.cardName);
            await this._wait(540);
            break;

          case 'ACTOR_LUNGE':
            this.stage.playLunge(ev.actor, ev.target);
            await this._wait(100);
            break;

          case 'VFX_BURST':
            if (ev.target !== 'hero' && ev.tier) {
              this.stage.playSlash(ev.target, ev.tier);
            }
            this.stage.playBurst(ev.target, ev.element || 'physical', ev.tier || 'light');
            await this._wait(ev.tier === 'precision_break' ? 85 : 55);
            break;

          case 'DAMAGE_HIT':
            if (ev.dmg > 0) {
              if (ev.tier === 'precision_break') {
                SFX.precisionStrike?.(combatSnapshot.knightClashCount || 1);
              } else {
                SFX.hit?.(ev.dmg, 0, ev.target === 'hero');
              }
              this.stage.playHitReaction(ev.target, ev.dmg, {
                pierce: !!ev.pierce,
                tier: ev.tier || 'light'
              });
              if (ev.target === 'hero') {
                const hpRatio = combatSnapshot.hero.hp / combatSnapshot.hero.maxHp;
                this.stage.playHeroHurtVignette(hpRatio < 0.4 ? 0.55 : 0.34);
              }
            } else if (ev.blocked > 0) {
              SFX.shieldHit?.(0);
              this.stage.playBlockImpact(ev.target, ev.blocked);
            }
            this.ui.syncCombatHud(combatSnapshot);
            await this._wait(ev.tier === 'precision_break' ? 210 : (ev.tier === 'heavy' ? 165 : 130));
            break;

          case 'BLOCK_GAIN':
            SFX.block?.();
            this.stage.playShieldPulse(ev.target, ev.amount);
            this.ui.syncCombatHud(combatSnapshot);
            await this._wait(105);
            break;

          case 'ARMOR_BREAK':
            SFX.armorBreak?.();
            this.stage.playArmorShatter(ev.target);
            await this._wait(140);
            break;

          case 'HEAL':
            this.stage.playHeal(ev.target, ev.amount);
            this.ui.syncCombatHud(combatSnapshot);
            await this._wait(110);
            break;

          case 'LOOT_DROP':
            SFX.lootDrop?.(ev.rarity || 'white');
            if (ev.rarity === 'red' || ev.rarity === 'gold') {
              this.stage.playLootPillar(ev.rarity, ev.cardName);
            }
            this.ui.showToast(ev.text, ev.rarity === 'red' ? 'rose' : ev.rarity === 'gold' ? 'amber' : 'sky');
            await this._wait(ev.rarity === 'red' ? 540 : (ev.rarity === 'gold' ? 360 : 210));
            break;

          case 'STATUS_TRIGGER':
            this.ui.showToast(ev.text, ev.tone || 'sky');
            this.ui.syncCombatHud(combatSnapshot);
            await this._wait(160);
            break;

          case 'ACTOR_FORM_CHANGE':
            await this.stage.syncEnemies(combatSnapshot.enemies);
            this.ui.showToast(ev.text, 'sky');
            this.ui.syncCombatHud(combatSnapshot);
            await this._wait(360);
            break;

          case 'ENEMY_DEFEATED':
            this.stage.playDefeat(ev.target);
            await this._wait(220);
            break;

          case 'BATTLE_END':
            if (ev.result === 'victory') SFX.victory?.();
            else SFX.defeat?.();
            await this._wait(420);
            break;

          default:
            break;
        }
      }
    } finally {
      this.busy = false;
      this.ui.setInputLocked(false);
      this.ui.syncCombatHud(combatSnapshot);
    }
  }
}
