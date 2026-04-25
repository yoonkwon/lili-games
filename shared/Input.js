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
        // clientX/Y are viewport coords; canvas is offset by safe-area insets, so subtract its rect
        const rect = canvas.getBoundingClientRect();
        this.tapCallback(e.clientX - rect.left, e.clientY - rect.top);
      }
    });

    // Default: Space key triggers tap at center (in CSS pixels — canvas.width may be DPR-scaled)
    const tapKey = options.tapKey || 'Space';
    document.addEventListener('keydown', (e) => {
      if (e.code === tapKey) {
        e.preventDefault();
        if (this.tapCallback) {
          this.tapCallback(canvas.clientWidth / 2, canvas.clientHeight / 2);
        }
      }
    });
  }

  onTap(callback) {
    this.tapCallback = callback;
  }
}
