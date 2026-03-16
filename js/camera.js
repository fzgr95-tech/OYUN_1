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
        const cw = canvas.clientWidth || canvas.width;
        const ch = canvas.clientHeight || canvas.height;
        ctx.translate(
            cw / 2 - this.x + this.shakeX,
            ch / 2 - this.y + this.shakeY
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
        const cw = canvas.clientWidth || canvas.width;
        const ch = canvas.clientHeight || canvas.height;
        return {
            x: wx - this.x + cw / 2 + this.shakeX,
            y: wy - this.y + ch / 2 + this.shakeY
        };
    },

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(sx, sy, canvas) {
        const cw = canvas.clientWidth || canvas.width;
        const ch = canvas.clientHeight || canvas.height;
        return {
            x: sx + this.x - cw / 2 - this.shakeX,
            y: sy + this.y - ch / 2 - this.shakeY
        };
    },

    /**
     * Check if a world position is visible on screen (with margin)
     */
    isVisible(wx, wy, margin, canvas) {
        const cw = canvas.clientWidth || canvas.width;
        const ch = canvas.clientHeight || canvas.height;
        const sx = wx - this.x + cw / 2;
        const sy = wy - this.y + ch / 2;
        return sx > -margin && sx < cw + margin &&
            sy > -margin && sy < ch + margin;
    }
};
