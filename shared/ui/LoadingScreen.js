/**
 * Shared loading screen - shows themed loading animation while assets load
 */
export class LoadingScreen {
  constructor(canvas, ctx, theme) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.gradientStart = theme.gradientStart;
    this.gradientEnd = theme.gradientEnd;
    this.icon = theme.icon;
    this.phase = 0;
    this.cachedGrad = null;
    this.cachedH = 0;
  }

  draw(dt) {
    const { ctx, canvas } = this;
    const w = canvas.width, h = canvas.height;
    this.phase += dt;

    if (!this.cachedGrad || this.cachedH !== h) {
      this.cachedGrad = ctx.createLinearGradient(0, 0, 0, h);
      this.cachedGrad.addColorStop(0, this.gradientStart);
      this.cachedGrad.addColorStop(1, this.gradientEnd);
      this.cachedH = h;
    }

    ctx.fillStyle = this.cachedGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.font = '40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.icon, w / 2, h / 2 - 30);
    ctx.font = 'Bold 20px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
    ctx.fillStyle = '#FFF';
    const dots = '.'.repeat(Math.floor(this.phase % 4));
    ctx.fillText('\uB85C\uB529\uC911' + dots, w / 2, h / 2 + 20);
  }

  /**
   * Run loading loop until assetsPromise resolves, then call onReady
   */
  start(assetsPromise, onReady) {
    let lastTime = 0;
    const loop = (timestamp) => {
      const dt = lastTime ? (timestamp - lastTime) / 1000 : 0.016;
      lastTime = timestamp;
      this.draw(Math.min(dt, 0.05));
      if (!this.done) requestAnimationFrame(loop);
    };
    this.done = false;
    requestAnimationFrame(loop);

    assetsPromise
      .then(() => {
        this.done = true;
        onReady();
      })
      .catch(() => {
        this.done = true;
        this.draw(0);
        const { ctx, canvas } = this;
        ctx.font = 'Bold 18px "Segoe UI", "Apple SD Gothic Neo", sans-serif';
        ctx.fillStyle = '#FF6B6B';
        ctx.fillText('\uB85C\uB529 \uC2E4\uD328', canvas.width / 2, canvas.height / 2 + 50);
      });
  }
}
