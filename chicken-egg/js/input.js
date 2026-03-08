// Input handler - unified touch/mouse/keyboard
export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.tapCallback = null;

        canvas.addEventListener('pointerdown', (e) => {
            e.preventDefault();
            if (this.tapCallback) {
                this.tapCallback(e.clientX, e.clientY);
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.tapCallback) {
                    // Tap at center for keyboard
                    this.tapCallback(canvas.width / 2, canvas.height / 2);
                }
            }
        });
    }

    onTap(callback) {
        this.tapCallback = callback;
    }
}
