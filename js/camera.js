// ============================================================
// camera.js — Camera System (follows player)
// ============================================================

const Camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smoothing: 0.08,    // Lerp factor (lower = smoother)
    shake: 0,           // Screen shake intensity
    shakeTimer: 0,
    shakeX: 0,
    shakeY: 0,

    /**
     * Set the target for the camera to follow
     */
    follow(x, y) {
        this.targetX = x;
        this.targetY = y;
    },

    /**
     * Trigger screen shake
     * @param {number} intensity - Shake amplitude in pixels
     * @param {number} duration  - Shake duration in seconds
     */
    triggerShake(intensity = 5, duration = 0.2) {
        this.shake = intensity;
        this.shakeTimer = duration;
    },

    /**
     * Update camera position
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        // Smooth follow with lerp
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;

        // Screen shake
        if (this.shakeTimer > 0) {
            this.shakeTimer -= dt;
            this.shakeX = (Math.random() - 0.5) * 2 * this.shake;
            this.shakeY = (Math.random() - 0.5) * 2 * this.shake;
            this.shake *= 0.92; // Decay
        } else {
            this.shakeX = 0;
            this.shakeY = 0;
        }
    },

    /**
     * Apply camera transform to canvas context
     * @param {CanvasRenderingContext2D} ctx
     * @param {HTMLCanvasElement} canvas
     */
    applyTransform(ctx, canvas) {
        ctx.save();
        ctx.translate(
            canvas.width / 2 - this.x + this.shakeX,
            canvas.height / 2 - this.y + this.shakeY
        );
    },

    /**
     * Restore canvas context after drawing world objects
     * @param {CanvasRenderingContext2D} ctx
     */
    restoreTransform(ctx) {
        ctx.restore();
    },

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(wx, wy, canvas) {
        return {
            x: wx - this.x + canvas.width / 2 + this.shakeX,
            y: wy - this.y + canvas.height / 2 + this.shakeY
        };
    },

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(sx, sy, canvas) {
        return {
            x: sx + this.x - canvas.width / 2 - this.shakeX,
            y: sy + this.y - canvas.height / 2 - this.shakeY
        };
    },

    /**
     * Check if a world position is visible on screen (with margin)
     */
    isVisible(wx, wy, margin, canvas) {
        const sx = wx - this.x + canvas.width / 2;
        const sy = wy - this.y + canvas.height / 2;
        return sx > -margin && sx < canvas.width + margin &&
            sy > -margin && sy < canvas.height + margin;
    }
};
