/**
 * Center-screen message overlay with fade-out
 * Reusable across all games
 */
export class Message {
  constructor(options = {}) {
    this._text = '';
    this._timer = 0;
    this._duration = options.duration || 2.5;
    this._fadeTime = options.fadeTime || 0.5;
  }

  show(text, duration) {
    this._text = text;
    this._timer = duration || this._duration;
  }

  update(dt) {
    if (this._timer > 0) {
      this._timer -= dt;
    }
  }

  draw(ctx, canvasWidth, canvasHeight) {
    if (this._timer <= 0) return;

    const x = canvasWidth / 2;
    const y = canvasHeight * 0.3;
    const boxW = Math.min(400, canvasWidth - 40);
    const boxH = 60;

    let alpha = 1;
    if (this._timer < this._fadeTime) {
      alpha = this._timer / this._fadeTime;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 20);
    ctx.fill();

    ctx.font = 'Bold 28px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(this._text, x, y);

    ctx.restore();
  }

  isActive() {
    return this._timer > 0;
  }
}
