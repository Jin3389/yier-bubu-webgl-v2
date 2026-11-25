// PC Slay-the-Spire Drag-and-Release Card Controller
// Targeted cards: drag out curved red Bezier arrow -> release over enemy sprite to play
// Non-targeted cards: drag smoothly 1:1 with cursor above release line -> release to play
// Also supports click-to-select, right-click cancel, 1-9 hotkeys, and E to end turn

import { STAGE_W, STAGE_H } from '../stage/stage-app.js';

export class CardDragController {
  constructor({ viewportEl, arrowSvg, arrowPath, stage, onPlayCard, onEndTurn, getHand }) {
    this.viewportEl = viewportEl;
    this.arrowSvg = arrowSvg;
    this.arrowPath = arrowPath;
    this.stage = stage;
    this.onPlayCard = onPlayCard;
    this.onEndTurn = onEndTurn;
    this.getHand = getHand;

    this.locked = false;
    this.dragging = null;
    this.selectedCardUid = null;

    this._bindGlobalEvents();
  }

  setLocked(flag) {
    this.locked = flag;
    if (flag) this.cancel();
  }

  clientToLogical(clientX, clientY) {
    const rect = this.viewportEl.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * STAGE_W,
      y: ((clientY - rect.top) / rect.height) * STAGE_H
    };
  }

  startDrag(card, cardEl, pointerEvent) {
    if (this.locked) return;
    pointerEvent.preventDefault();
    const rect = cardEl.getBoundingClientRect();
    const arrowStart = this.clientToLogical(rect.left + rect.width / 2, rect.top + rect.height * 0.25);
    const cur = this.clientToLogical(pointerEvent.clientX, pointerEvent.clientY);
    this.dragging = {
      card,
      cardEl,
      baseTransform: cardEl.style.transform || '',
      startClientX: pointerEvent.clientX,
      startClientY: pointerEvent.clientY,
      arrowStartX: arrowStart.x,
      arrowStartY: arrowStart.y,
      curLogicalX: cur.x,
      curLogicalY: cur.y,
      moved: false
    };
    document.body.classList.add('is-dragging-card');
    cardEl.classList.add('is-dragging');
  }

  cancel() {
    document.body.classList.remove('is-dragging-card');
    if (this.dragging?.cardEl) {
      this.dragging.cardEl.classList.remove('is-dragging');
      this.dragging.cardEl.style.transform = this.dragging.baseTransform || '';
    }
    this.dragging = null;
    this.selectedCardUid = null;
    this.arrowSvg.classList.remove('active');
    this.arrowPath.setAttribute('d', '');
    this.stage.setHighlightedEnemy(null);
  }

  _updateArrow(x0, y0, x1, y1) {
    const cx = (x0 + x1) * 0.5;
    const cy = Math.min(y0, y1) - 180;
    this.arrowPath.setAttribute('d', `M ${x0.toFixed(1)} ${y0.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    this.arrowSvg.classList.add('active');
  }

  _bindGlobalEvents() {
    window.addEventListener('pointermove', (e) => {
      if (this.locked) return;
      const pos = this.clientToLogical(e.clientX, e.clientY);

      // Click-selected targeted card mode
      if (!this.dragging && this.selectedCardUid) {
        const hand = this.getHand();
        const card = hand.find(c => c.uid === this.selectedCardUid);
        if (!card) { this.cancel(); return; }
        this._updateArrow(STAGE_W * 0.5, STAGE_H * 0.82, pos.x, pos.y);
        const hovered = this.stage.pickEnemyAtLogicalPoint(pos.x, pos.y);
        this.stage.setHighlightedEnemy(hovered);
        return;
      }

      if (!this.dragging) return;
      this.dragging.curLogicalX = pos.x;
      this.dragging.curLogicalY = pos.y;
      const dxPx = e.clientX - this.dragging.startClientX;
      const dyPx = e.clientY - this.dragging.startClientY;
      if (Math.hypot(dxPx, dyPx) > 12) {
        this.dragging.moved = true;
      }

      const { card } = this.dragging;
      if (card.target === 'enemy' && !card.bubbleWrapped) {
        this._updateArrow(this.dragging.arrowStartX, this.dragging.arrowStartY, pos.x, pos.y);
        const hovered = this.stage.pickEnemyAtLogicalPoint(pos.x, pos.y);
        this.stage.setHighlightedEnemy(hovered);
      } else if (this.dragging.moved) {
        this.dragging.cardEl.style.transform = `translate3d(${dxPx}px, ${dyPx - 24}px, 0) scale(1.08)`;
      }
    });

    window.addEventListener('pointerup', (e) => {
      if (this.locked) return;

      // Click-selected targeted card release on enemy
      if (!this.dragging && this.selectedCardUid) {
        const pos = this.clientToLogical(e.clientX, e.clientY);
        const targetUid = this.stage.pickEnemyAtLogicalPoint(pos.x, pos.y);
        const uid = this.selectedCardUid;
        this.cancel();
        if (targetUid) this.onPlayCard(uid, targetUid);
        return;
      }

      if (!this.dragging) return;
      const { card, moved, curLogicalX, curLogicalY } = this.dragging;
      const uid = card.uid;

      if (!moved) {
        this.cancel();
        if (card.target === 'enemy' && !card.bubbleWrapped) {
          this.selectedCardUid = uid;
        } else {
          this.onPlayCard(uid, null);
        }
        return;
      }

      if (card.target === 'enemy' && !card.bubbleWrapped) {
        const targetUid = this.stage.pickEnemyAtLogicalPoint(curLogicalX, curLogicalY);
        this.cancel();
        if (targetUid) this.onPlayCard(uid, targetUid);
      } else {
        this.cancel();
        if (curLogicalY < STAGE_H * 0.68) {
          this.onPlayCard(uid, null);
        }
      }
    });

    window.addEventListener('contextmenu', (e) => {
      if (this.dragging || this.selectedCardUid) {
        e.preventDefault();
        this.cancel();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (this.locked) return;
      if (e.key === 'Escape') {
        this.cancel();
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        this.cancel();
        this.onEndTurn();
        return;
      }
      if (/^[1-9]$/.test(e.key)) {
        const idx = Number(e.key) - 1;
        const hand = this.getHand();
        const card = hand[idx];
        if (!card) return;
        this.cancel();
        if (card.target === 'enemy' && !card.bubbleWrapped) {
          this.selectedCardUid = card.uid;
        } else {
          this.onPlayCard(card.uid, null);
        }
      }
    });
  }
}
