export class Message {
  constructor() {
    this._text = '';
    this._timer = 0;
  }

  show(text) {
    this._text = text;
    this._timer = 2.5;
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

    // Alpha: fade out in last 0.5 seconds
    let alpha = 1;
    if (this._timer < 0.5) {
      alpha = this._timer / 0.5;
    }

    ctx.save();
    ctx.globalAlpha = alpha;

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.beginPath();
    ctx.roundRect(x - boxW / 2, y - boxH / 2, boxW, boxH, 20);
    ctx.fill();

    // Text
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
