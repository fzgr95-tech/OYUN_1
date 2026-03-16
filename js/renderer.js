// ============================================================
// renderer.js — Rendering Pipeline + Post-Processing
// ============================================================

const Renderer = {
    canvas: null,
    ctx: null,
    bloomCanvas: null,
    bloomCtx: null,
    width: 0,
    height: 0,
    SETTINGS_KEY: 'neonhorde_renderer_settings',
    lowSpecDevice: false,
    qualityPreset: 'high',

    // Post-processing settings
    bloomEnabled: true,
    bloomIntensity: 0.6,
    crtEnabled: true,
    crtIntensity: 0.12,
    chromaticEnabled: true,
    chromaticOffset: 1.5,

    // Grid settings
    gridSize: 80,
    gridColor: 'rgba(0, 255, 255, 0.12)',
    gridGlowColor: 'rgba(0, 255, 255, 0.06)',

    // Time for animations
    time: 0,

    // Performance metrics (debug)
    _perfTime: 0,
    _perfFrames: 0,
    fps: 60,
    frameMs: 16.7,

    // Reactive feedback
    damageFlash: 0,
    killFlash: 0,
    bossCastFlash: 0,
    levelUpFlash: 0,
    bossCastColor: '#ff3355',
    _vignetteCache: {
        w: 0,
        h: 0,
        gradient: null
    },

    init(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: true });

        // Bloom offscreen canvas
        this.bloomCanvas = document.createElement('canvas');
        this.bloomCtx = this.bloomCanvas.getContext('2d', { alpha: true });

        this._loadSettings();

        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    _saveSettings() {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({
                qualityPreset: this.qualityPreset,
                bloomEnabled: this.bloomEnabled,
                crtEnabled: this.crtEnabled,
                chromaticEnabled: this.chromaticEnabled
            }));
        } catch (e) {
            console.warn('Renderer settings save failed:', e);
        }
    },

    _loadSettings() {
        try {
            const raw = localStorage.getItem(this.SETTINGS_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                this.qualityPreset = data.qualityPreset === 'low' ? 'low' : 'high';
                this.bloomEnabled = data.bloomEnabled !== false;
                this.crtEnabled = data.crtEnabled !== false;
                this.chromaticEnabled = data.chromaticEnabled !== false;
                return;
            }
        } catch (e) {
            console.warn('Renderer settings load failed:', e);
        }

        const isMobile = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
        const hw = (typeof navigator !== 'undefined' && navigator.hardwareConcurrency) ? navigator.hardwareConcurrency : 8;
        this.lowSpecDevice = isMobile || hw <= 4;
        if (isMobile) {
            this.setQualityPreset('low');
        } else {
            this.setQualityPreset('high');
        }
    },

    isLowQualityMode() {
        const enemyCount = (typeof Enemies !== 'undefined' && Enemies.pool) ? Enemies.pool.active.length : 0;
        return this.lowSpecDevice || enemyCount > 90;
    },

    getShadowBlur(baseBlur, critical = false) {
        if (!this.isLowQualityMode()) return baseBlur;
        const scale = critical ? 0.55 : 0.28;
        return Math.max(0, Math.round(baseBlur * scale));
    },

    setBloomEnabled(enabled) {
        this.bloomEnabled = !!enabled;
        this._saveSettings();
    },

    setCRTEnabled(enabled) {
        this.crtEnabled = !!enabled;
        this._saveSettings();
    },

    setChromaticEnabled(enabled) {
        this.chromaticEnabled = !!enabled;
        this._saveSettings();
    },

    setQualityPreset(preset) {
        this.qualityPreset = preset === 'low' ? 'low' : 'high';
        const high = this.qualityPreset === 'high';
        this.bloomEnabled = high;
        this.crtEnabled = high;
        this.chromaticEnabled = high;
        this._saveSettings();
    },

    toggleQualityPreset() {
        this.setQualityPreset(this.qualityPreset === 'high' ? 'low' : 'high');
    },

    resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = this.width + 'px';
        this.canvas.style.height = this.height + 'px';
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.scale(dpr, dpr);

        this.bloomCanvas.width = Math.floor(this.width / 2);
        this.bloomCanvas.height = Math.floor(this.height / 2);
        this._vignetteCache.w = 0;
        this._vignetteCache.h = 0;
        this._vignetteCache.gradient = null;
    },

    /**
     * Begin frame — clear and set up
     */
    beginFrame(dt) {
        this._updatePerfMetrics(dt);
        this.time += dt;
        this.damageFlash = Math.max(0, this.damageFlash - dt * 2.4);
        this.killFlash = Math.max(0, this.killFlash - dt * 2.8);
        this.bossCastFlash = Math.max(0, this.bossCastFlash - dt * 2.2);
        this.levelUpFlash = Math.max(0, this.levelUpFlash - dt * 3.1);
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Dark background
        this.ctx.fillStyle = '#0a0a14';
        this.ctx.fillRect(0, 0, this.width, this.height);
    },

    _updatePerfMetrics(dt) {
        this._perfTime += dt;
        this._perfFrames++;
        this.frameMs = dt * 1000;

        if (this._perfTime >= 0.25) {
            this.fps = this._perfFrames / this._perfTime;
            this._perfTime = 0;
            this._perfFrames = 0;
        }
    },

    getPerfMetrics() {
        return {
            fps: this.fps,
            frameMs: this.frameMs,
            lowQuality: this.isLowQualityMode()
        };
    },

    /**
     * Draw the infinite neon grid floor
     */
    drawGrid(camX, camY) {
        const ctx = this.ctx;
        const gs = this.gridSize;
        const offsetX = -(camX % gs);
        const offsetY = -(camY % gs);
        const cols = Math.ceil(this.width / gs) + 2;
        const rows = Math.ceil(this.height / gs) + 2;

        ctx.save();

        // Background grid glow
        ctx.strokeStyle = this.gridGlowColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = -1; i <= cols; i++) {
            const x = offsetX + i * gs;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        for (let j = -1; j <= rows; j++) {
            const y = offsetY + j * gs;
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        ctx.stroke();

        // Bright grid lines
        ctx.strokeStyle = this.gridColor;
        ctx.lineWidth = 0.8;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = this.getShadowBlur(4);
        ctx.beginPath();
        for (let i = -1; i <= cols; i++) {
            const x = offsetX + i * gs;
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.height);
        }
        for (let j = -1; j <= rows; j++) {
            const y = offsetY + j * gs;
            ctx.moveTo(0, y);
            ctx.lineTo(this.width, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Intersection dots
        ctx.fillStyle = 'rgba(0, 255, 255, 0.25)';
        for (let i = -1; i <= cols; i++) {
            for (let j = -1; j <= rows; j++) {
                const x = offsetX + i * gs;
                const y = offsetY + j * gs;
                ctx.beginPath();
                ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Pulsing horizon glow line (optional atmosphere)
        const pulseAlpha = 0.04 + Math.sin(this.time * 1.5) * 0.02;
        const gradient = ctx.createLinearGradient(0, this.height * 0.3, 0, this.height);
        gradient.addColorStop(0, 'transparent');
        gradient.addColorStop(0.5, `rgba(0, 255, 255, ${pulseAlpha})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.restore();
    },

    /**
     * Apply post-processing effects
     */
    applyPostProcessing() {
        // Adaptive quality based on enemy count
        const enemyCount = Enemies.pool ? Enemies.pool.active.length : 0;
        const highLoad = enemyCount > 80;
        const veryHighLoad = enemyCount > 100;

        // 1. Bloom pass (skip if high load)
        if (this.bloomEnabled && !highLoad) {
            this._applyBloom();
        }

        // 2. CRT Scanlines (skip if very high load)
        if (this.crtEnabled && !veryHighLoad) {
            this._applyCRT();
        }

        // 3. Chromatic Aberration (skip if high load)
        if (this.chromaticEnabled && !highLoad) {
            this._applyChromaticAberration();
        }

        // 4. Vignette (lightweight, always on)
        this._applyVignette();

        // 5. Reactive feedback overlay
        this._applyReactiveFeedback();
    },

    notifyDamage(amount = 1) {
        this.damageFlash = Math.min(1, this.damageFlash + 0.22 + amount * 0.01);
    },

    notifyKill(streak = 1) {
        this.killFlash = Math.min(1, this.killFlash + 0.08 + Math.min(0.2, streak * 0.015));
    },

    notifyBossCast(color = '#ff3355') {
        this.bossCastColor = color;
        this.bossCastFlash = Math.min(1, this.bossCastFlash + 0.28);
    },

    notifyLevelUp() {
        this.levelUpFlash = Math.min(1, this.levelUpFlash + 0.75);
    },

    _applyBloom() {
        const ctx = this.ctx;

        // Draw brightened copy to bloom canvas (downscaled)
        this.bloomCtx.clearRect(0, 0, this.bloomCanvas.width, this.bloomCanvas.height);
        this.bloomCtx.drawImage(
            this.canvas,
            0, 0, this.canvas.width, this.canvas.height,
            0, 0, this.bloomCanvas.width, this.bloomCanvas.height
        );

        // Apply blur via CSS filter (only works on ctx)
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = this.bloomIntensity;
        ctx.filter = 'blur(12px)';
        ctx.drawImage(
            this.bloomCanvas,
            0, 0, this.bloomCanvas.width, this.bloomCanvas.height,
            0, 0, this.width, this.height
        );
        ctx.filter = 'none';
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.restore();
    },

    _applyCRT() {
        const ctx = this.ctx;
        // Use cached pattern instead of per-line fillRect
        if (!this._crtPattern || this._crtPatternH !== this.height) {
            const lineHeight = 3;
            const pc = document.createElement('canvas');
            pc.width = 1;
            pc.height = lineHeight * 2;
            const pctx = pc.getContext('2d');
            pctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            pctx.fillRect(0, 0, 1, lineHeight);
            this._crtPattern = ctx.createPattern(pc, 'repeat');
            this._crtPatternH = this.height;
        }
        ctx.save();
        ctx.globalAlpha = this.crtIntensity;
        ctx.fillStyle = this._crtPattern;
        ctx.fillRect(0, 0, this.width, this.height);
        ctx.globalAlpha = 1;
        ctx.restore();
    },

    _applyChromaticAberration() {
        // Simple chromatic aberration by overlaying shifted color channels
        const ctx = this.ctx;
        const offset = this.chromaticOffset;
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.03;

        // Red channel shift left
        ctx.drawImage(this.canvas,
            offset, 0, this.canvas.width - offset, this.canvas.height,
            0, 0, this.width - offset / (this.canvas.width / this.width), this.height
        );

        // Blue channel shift right
        ctx.drawImage(this.canvas,
            0, 0, this.canvas.width - offset, this.canvas.height,
            offset / (this.canvas.width / this.width), 0, this.width - offset / (this.canvas.width / this.width), this.height
        );

        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
        ctx.restore();
    },

    _applyVignette() {
        const ctx = this.ctx;
        if (!this._vignetteCache.gradient || this._vignetteCache.w !== this.width || this._vignetteCache.h !== this.height) {
            const cx = this.width / 2;
            const cy = this.height / 2;
            const r = Math.max(cx, cy) * 1.2;
            const gradient = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
            this._vignetteCache.w = this.width;
            this._vignetteCache.h = this.height;
            this._vignetteCache.gradient = gradient;
        }
        ctx.fillStyle = this._vignetteCache.gradient;
        ctx.fillRect(0, 0, this.width, this.height);
    },

    _applyReactiveFeedback() {
        const ctx = this.ctx;

        if (this.killFlash > 0) {
            const pulse = this.killFlash * (0.5 + Math.sin(this.time * 22) * 0.5);
            const grad = ctx.createRadialGradient(this.width * 0.5, this.height * 0.5, this.height * 0.1, this.width * 0.5, this.height * 0.5, this.height * 0.65);
            grad.addColorStop(0, `rgba(40, 255, 180, ${pulse * 0.06})`);
            grad.addColorStop(1, 'rgba(40, 255, 180, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        if (this.damageFlash > 0) {
            const alpha = this.damageFlash * 0.22;
            ctx.fillStyle = `rgba(255, 30, 60, ${alpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        if (this.bossCastFlash > 0) {
            const alpha = this.bossCastFlash * 0.12;
            const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
            grad.addColorStop(0, this._hexToRgba(this.bossCastColor, alpha));
            grad.addColorStop(1, this._hexToRgba(this.bossCastColor, 0));
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, this.width, this.height);
        }

        if (this.levelUpFlash > 0) {
            const alpha = this.levelUpFlash * 0.18;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    },

    _hexToRgba(hex, alpha) {
        if (!hex || hex[0] !== '#') return `rgba(255, 60, 80, ${alpha})`;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    },

    drawEnemyBulletEffects(ctx, effects, effectImage, camera) {
        if (!effects || effects.length === 0 || !effectImage || !camera) return;
        for (const effect of effects) {
            const screenX = effect.x - camera.x;
            const screenY = effect.y - camera.y;

            ctx.save();
            ctx.translate(screenX, screenY);
            ctx.scale(effect.scale, effect.scale);
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.96;
            ctx.drawImage(effectImage, -effectImage.width / 2, -effectImage.height / 2);
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
    },

    // ---- Drawing Helpers ----

    /**
     * Draw a neon-outlined circle entity
     */
    drawNeonCircle(ctx, x, y, radius, color, glowSize = 12) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = glowSize;

        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Inner fill (darker)
        ctx.fillStyle = this._darken(color, 0.6);
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, 0.15)`;
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    },

    /**
     * Draw neon polygon (for character/enemies)
     */
    drawNeonPoly(ctx, x, y, radius, sides, rotation, color, glowSize = 15) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = glowSize;

        ctx.beginPath();
        for (let i = 0; i <= sides; i++) {
            const angle = rotation + (Math.PI * 2 / sides) * i;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.fillStyle = this._darken(color, 0.5);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    },

    /**
     * Draw a neon text
     */
    drawNeonText(ctx, text, x, y, size, color, align = 'center') {
        ctx.save();
        ctx.font = `bold ${size}px 'Orbitron', 'Rajdhani', monospace`;
        ctx.textAlign = align;
        ctx.textBaseline = 'middle';

        // Glow layers
        ctx.shadowColor = color;
        ctx.shadowBlur = 20;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);

        // Bright center
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.fillText(text, x, y);

        ctx.restore();
    },

    drawPixelSprite(ctx, x, y, pixelMap, pixelSize, color, glow = 8) {
        if (!pixelMap || !pixelMap.length) return;
        const rows = pixelMap.length;
        const cols = pixelMap[0].length;
        const startX = x - (cols * pixelSize) / 2;
        const startY = y - (rows * pixelSize) / 2;

        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = glow;
        ctx.fillStyle = color;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (pixelMap[r][c] !== '1') continue;
                ctx.fillRect(startX + c * pixelSize, startY + r * pixelSize, pixelSize, pixelSize);
            }
        }

        ctx.restore();
    },

    /**
     * Darken a hex color
     */
    _darken(hex, factor) {
        if (hex.startsWith('rgb')) return hex;
        const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
        const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
        const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
        return `rgb(${r},${g},${b})`;
    }
};
