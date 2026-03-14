/**
 * Unified input handler - touch/mouse/keyboard
 * Reusable across all games
 */
export class Input {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.tapCallback = null;

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (this.tapCallback) {
        this.tapCallback(e.clientX, e.clientY);
      }
    });

    // Default: Space key triggers tap at center
    const tapKey = options.tapKey || 'Space';
    document.addEventListener('keydown', (e) => {
      if (e.code === tapKey) {
        e.preventDefault();
        if (this.tapCallback) {
          this.tapCallback(canvas.width / 2, canvas.height / 2);
        }
      }
    });
  }

  onTap(callback) {
    this.tapCallback = callback;
  }
}
