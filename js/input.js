// ============================================================
// input.js — Virtual Joystick (Touch + Mouse)
// ============================================================

const Input = {
    // Joystick state
    active: false,
    baseX: 0,
    baseY: 0,
    thumbX: 0,
    thumbY: 0,
    dirX: 0,        // Normalized direction -1 to 1
    dirY: 0,
    magnitude: 0,   // 0 to 1

    // Joystick config
    maxRadius: 60,
    deadZone: 0.15,
    baseRadius: 70,
    thumbRadius: 30,

    // Touch tracking
    _touchId: null,

    // Keyboard state (for PC testing)
    keys: {},
    _dashRequested: false,

    /**
     * Initialize event listeners
     * @param {HTMLCanvasElement} canvas
     */
    init(canvas) {
        this.canvas = canvas;

        // ---- Touch Events ----
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this._touchId !== null) return; // Already tracking a touch

            const touch = e.changedTouches[0];
            const rect = canvas.getBoundingClientRect();
            const tx = touch.clientX - rect.left;
            const ty = touch.clientY - rect.top;

            // Only respond to left half of screen
            if (tx < canvas.width * 0.6) {
                this._touchId = touch.identifier;
                this.active = true;
                this.baseX = tx;
                this.baseY = ty;
                this.thumbX = tx;
                this.thumbY = ty;
                this.dirX = 0;
                this.dirY = 0;
                this.magnitude = 0;
            }
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this._touchId) {
                    const rect = canvas.getBoundingClientRect();
                    const tx = touch.clientX - rect.left;
                    const ty = touch.clientY - rect.top;
                    this._updateJoystick(tx, ty);
                }
            }
        }, { passive: false });

        canvas.addEventListener('touchend', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this._touchId) {
                    this._releaseJoystick();
                }
            }
        });

        canvas.addEventListener('touchcancel', (e) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === this._touchId) {
                    this._releaseJoystick();
                }
            }
        });

        // ---- Mouse Events (PC fallback) ----
        canvas.addEventListener('mousedown', (e) => {
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            if (mx < canvas.width * 0.6) {
                this.active = true;
                this.baseX = mx;
                this.baseY = my;
                this.thumbX = mx;
                this.thumbY = my;
                this.dirX = 0;
                this.dirY = 0;
                this.magnitude = 0;
            }
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!this.active || this._touchId !== null) return;
            const rect = canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            this._updateJoystick(mx, my);
        });

        canvas.addEventListener('mouseup', () => {
            if (this._touchId === null) {
                this._releaseJoystick();
            }
        });

        // ---- Keyboard (WASD + Arrows for PC debug) ----
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if ((e.key === ' ' || e.key.toLowerCase() === 'shift') && !e.repeat) {
                this.requestDash();
            }
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    },

    requestDash() {
        this._dashRequested = true;
    },

    consumeDashRequest() {
        const requested = this._dashRequested;
        this._dashRequested = false;
        return requested;
    },

    /**
     * Update joystick direction from thumb position
     */
    _updateJoystick(tx, ty) {
        const dx = tx - this.baseX;
        const dy = ty - this.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.maxRadius) {
            // Clamp to max radius
            this.thumbX = this.baseX + (dx / dist) * this.maxRadius;
            this.thumbY = this.baseY + (dy / dist) * this.maxRadius;
        } else {
            this.thumbX = tx;
            this.thumbY = ty;
        }

        this.magnitude = Math.min(dist / this.maxRadius, 1);

        if (this.magnitude > this.deadZone) {
            this.dirX = dx / dist;
            this.dirY = dy / dist;
        } else {
            this.dirX = 0;
            this.dirY = 0;
            this.magnitude = 0;
        }
    },

    /**
     * Release joystick
     */
    _releaseJoystick() {
        this.active = false;
        this._touchId = null;
        this.dirX = 0;
        this.dirY = 0;
        this.magnitude = 0;
    },

    /**
     * Get the movement direction (combines joystick + keyboard)
     * @returns {{ x: number, y: number, magnitude: number }}
     */
    getDirection() {
        let x = this.dirX;
        let y = this.dirY;
        let mag = this.magnitude;

        // Keyboard override
        let kx = 0, ky = 0;
        if (this.keys['w'] || this.keys['arrowup']) ky = -1;
        if (this.keys['s'] || this.keys['arrowdown']) ky = 1;
        if (this.keys['a'] || this.keys['arrowleft']) kx = -1;
        if (this.keys['d'] || this.keys['arrowright']) kx = 1;

        if (kx !== 0 || ky !== 0) {
            const kLen = Math.sqrt(kx * kx + ky * ky);
            x = kx / kLen;
            y = ky / kLen;
            mag = 1;
        }

        return { x, y, magnitude: mag };
    },

    /**
     * Draw the virtual joystick overlay
     * @param {CanvasRenderingContext2D} ctx
     */
    draw(ctx) {
        if (!this.active) return;

        // Base circle
        ctx.save();
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(this.baseX, this.baseY, this.baseRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Thumb circle
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(this.thumbX, this.thumbY, this.thumbRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();

        // Glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.thumbX, this.thumbY, this.thumbRadius - 5, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.restore();
    }
};
