// ============================================================
// particles.js — Particle System (Neon Explosions, Trails)
// ============================================================

class BuzEfekt {
    constructor({ kareler, kareHizi, sure = 0, dongu = false, x = 0, y = 0, vx = 0, vy = 0, aci = 0, spin = 0, olcek = 1, alpha = 1 }) {
        this.kareler = kareler || [];
        this.kareHizi = kareHizi || 20;
        this.sure = sure;
        this.dongu = !!dongu;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.aci = aci;
        this.spin = spin;
        this.olcek = olcek;
        this.alpha = alpha;
        this.currentFrameIndex = 0;
        this._frameTimer = 0;
        this.bitti = false;
    }

    update(deltaTime) {
        if (this.bitti || this.kareler.length === 0) {
            this.bitti = true;
            return;
        }

        this.sure += deltaTime;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.aci += this.spin * deltaTime;

        this._frameTimer += deltaTime;
        const frameSpan = 1 / Math.max(1, this.kareHizi);
        while (this._frameTimer >= frameSpan) {
            this._frameTimer -= frameSpan;
            this.currentFrameIndex++;
            if (this.currentFrameIndex >= this.kareler.length) {
                if (this.dongu) {
                    this.currentFrameIndex = 0;
                } else {
                    this.bitti = true;
                    this.currentFrameIndex = this.kareler.length - 1;
                    break;
                }
            }
        }
    }

    getCurrentFrame() {
        return this.kareler[this.currentFrameIndex] || null;
    }
}

const Particles = {
    /** @type {ObjectPool} */
    pool: null,

    iceEffects: [],
    _iceSheets: {
        loaded: false,
        failed: false,
        layout: { cols: 11, rows: 6, frameW: 256, frameH: 256 },
        projectileSources: ['Buz_magarası/mermi_efekt.png'],
        burstSources: ['Buz_magarası/buz_patlama.png'],
        projectile: null,
        burst: null,
        alphaValid: { projectile: false, burst: false },
        _alphaWarned: { projectile: false, burst: false }
    },

    _iceSequences: {
        smallArrowFire: { sheet: 'projectile', start: 0, frames: 8, fps: 26, loop: false, size: 54 },
        bigSpearFire: { sheet: 'projectile', start: 11, frames: 9, fps: 22, loop: false, size: 74 },
        novaTravel: { sheet: 'projectile', start: 22, frames: 11, fps: 20, loop: true, size: 78 },
        smallShatter: { sheet: 'burst', start: 0, frames: 10, fps: 22, loop: false, size: 84 },
        mediumNova: { sheet: 'burst', start: 11, frames: 11, fps: 20, loop: false, size: 132 },
        giantCollapse: { sheet: 'burst', start: 22, frames: 33, fps: 18, loop: false, size: 280 }
    },

    init() {
        this.iceEffects = [];
        this._ensureIceSheets();
        this.pool = new ObjectPool(
            // Create
            () => ({
                x: 0, y: 0,
                vx: 0, vy: 0,
                life: 0, maxLife: 0,
                size: 3,
                color: '#ff00ff',
                type: 'circle',   // 'circle', 'spark', 'ring'
                friction: 0.96,
                gravity: 0,
                shrink: true
            }),
            // Reset
            (p, x, y, vx, vy, life, size, color, type) => {
                p.x = x || 0;
                p.y = y || 0;
                p.vx = vx || 0;
                p.vy = vy || 0;
                p.life = life || 1;
                p.maxLife = life || 1;
                p.size = size || 3;
                p.color = color || '#ff00ff';
                p.type = type || 'circle';
                p.friction = 0.96;
                p.gravity = 0;
                p.shrink = true;
            },
            200 // Initial pool size
        );
    },

    _getIntensityScale() {
        let scale = 1;
        const activeCount = this.pool ? this.pool.active.length : 0;
        const lowQuality = typeof Renderer !== 'undefined' && Renderer.isLowQualityMode && Renderer.isLowQualityMode();

        if (lowQuality) scale *= 0.65;
        if (activeCount > 260) scale *= 0.55;
        else if (activeCount > 190) scale *= 0.72;

        return Math.max(0.35, scale);
    },

    _scaledCount(baseCount, min = 1) {
        return Math.max(min, Math.round(baseCount * this._getIntensityScale()));
    },

    _ensureIceSheets() {
        if (this._iceSheets.loaded || this._iceSheets.failed) return;
        if (this._iceSheets.projectile || this._iceSheets.burst) return;

        let loaded = 0;
        const done = () => {
            loaded++;
            if (loaded >= 2) this._iceSheets.loaded = true;
        };
        const fail = () => {
            this._iceSheets.failed = true;
        };

        const loadWithFallback = (sources, targetKey) => {
            const tryAt = (idx) => {
                if (idx >= sources.length) {
                    fail();
                    return;
                }
                const img = new Image();
                img.onload = () => {
                    const validAlpha = this._validateSheetAlpha(img, targetKey);
                    this._iceSheets.alphaValid[targetKey] = validAlpha;
                    this._iceSheets[targetKey] = img;
                    done();
                };
                img.onerror = () => tryAt(idx + 1);
                img.src = sources[idx];
            };
            tryAt(0);
        };

        loadWithFallback(this._iceSheets.projectileSources, 'projectile');
        loadWithFallback(this._iceSheets.burstSources, 'burst');
    },

    _validateSheetAlpha(img, key) {
        try {
            const c = document.createElement('canvas');
            c.width = img.width;
            c.height = img.height;
            const cx = c.getContext('2d', { willReadFrequently: true });
            cx.clearRect(0, 0, c.width, c.height);
            cx.drawImage(img, 0, 0);

            const data = cx.getImageData(0, 0, c.width, c.height).data;
            let hasTransparent = false;
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] < 245) {
                    hasTransparent = true;
                    break;
                }
            }

            if (!hasTransparent && !this._iceSheets._alphaWarned[key]) {
                this._iceSheets._alphaWarned[key] = true;
                console.error(`[IceFX] ${key} sheet alpha channel not detected. Effect will be hidden to avoid checker/white box rendering.`);
            }

            return hasTransparent;
        } catch (err) {
            if (!this._iceSheets._alphaWarned[key]) {
                this._iceSheets._alphaWarned[key] = true;
                console.error(`[IceFX] ${key} alpha validation failed:`, err);
            }
            return false;
        }
    },

    _makeFrameList(start, count, sheetKey, size) {
        const frames = [];
        for (let i = 0; i < count; i++) {
            const atlasIndex = start + i;
            const src = this._iceFrameRect(atlasIndex);
            frames.push({ sheet: sheetKey, x: src.x, y: src.y, w: src.w, h: src.h, size });
        }
        return frames;
    },

    _isIceCaveActive() {
        return typeof Maps !== 'undefined' && Maps.getSelected && Maps.getSelected() && Maps.getSelected().id === 'iceCave';
    },

    _spawnIceEffect(kind, x, y, opts = {}) {
        if (!this._isIceCaveActive()) return;
        this._ensureIceSheets();
        const seq = this._iceSequences[kind];
        if (!seq) return;
        if (!this._iceSheets.loaded || this._iceSheets.failed) return;
        if (!this._iceSheets.alphaValid[seq.sheet]) return;

        const kareler = this._makeFrameList(seq.start, seq.frames, seq.sheet, seq.size);
        this.iceEffects.push(new BuzEfekt({
            kareler,
            kareHizi: seq.fps,
            sure: 0,
            dongu: !!seq.loop,
            x,
            y,
            vx: opts.vx || 0,
            vy: opts.vy || 0,
            aci: opts.angle || 0,
            spin: opts.spin || 0,
            olcek: opts.scale || 1,
            alpha: opts.alpha == null ? 1 : opts.alpha
        }));
    },

    spawnIceShotMuzzle(x, y, vx, vy, variant = 'small') {
        const speed = Math.sqrt(vx * vx + vy * vy) || 1;
        const angle = Math.atan2(vy, vx);
        this._spawnIceEffect(variant === 'big' ? 'bigSpearFire' : 'smallArrowFire', x, y, {
            vx: (vx / speed) * 24,
            vy: (vy / speed) * 24,
            angle,
            scale: variant === 'big' ? 1.08 : 0.95
        });
    },

    spawnIceSlowImpact(x, y) {
        this._spawnIceEffect('smallShatter', x, y, { scale: 0.9 });
    },

    spawnIceEnemyBurst(enemy) {
        if (!enemy) return;
        if (enemy.isBoss) {
            this._spawnIceEffect('giantCollapse', enemy.x, enemy.y, { scale: 1.25, alpha: 1 });
            return;
        }
        if (enemy.radius <= 14) {
            this._spawnIceEffect('smallShatter', enemy.x, enemy.y, { scale: 0.95 });
            return;
        }
        this._spawnIceEffect('mediumNova', enemy.x, enemy.y, { scale: 1.05 });
    },

    drawIceProjectile(ctx, projectile) {
        if (!this._isIceCaveActive()) return false;
        if (!projectile) return false;
        this._ensureIceSheets();
        if (!this._iceSheets.loaded || this._iceSheets.failed) return false;

        if (typeof Player !== 'undefined' && Player.level < 5) return false;

        const seq = this._iceSequences.novaTravel;
        const frames = this._makeFrameList(seq.start, seq.frames, seq.sheet, seq.size);
        if (frames.length === 0) return false;

        const t = projectile._iceAnim || 0;
        const frameIndex = Math.floor(t * seq.fps) % frames.length;
        const frame = frames[frameIndex];
        const sheet = this._iceSheets[frame.sheet];
        if (!sheet) return false;
        if (!this._iceSheets.alphaValid[frame.sheet]) return false;

        const angle = Math.atan2(projectile.vy, projectile.vx) + t * 4.2;
        const baseSize = (projectile.radius * 7.2);
        const drawSize = baseSize * (0.92 + Math.sin(t * 8) * 0.08);

        ctx.save();
        ctx.translate(projectile.x, projectile.y);
        ctx.rotate(angle);
        ctx.globalAlpha = 0.92;
        ctx.shadowColor = '#a9e9ff';
        ctx.shadowBlur = 14;
        ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
        ctx.restore();
        return true;
    },

    _iceFrameRect(index) {
        const cols = this._iceSheets.layout.cols;
        const frameW = this._iceSheets.layout.frameW;
        const frameH = this._iceSheets.layout.frameH;
        const col = index % cols;
        const row = Math.floor(index / cols);
        return { x: col * frameW, y: row * frameH, w: frameW, h: frameH };
    },

    /**
     * Spawn a burst of particles (enemy death explosion)
     */
    burstAt(x, y, color, count = 12) {
        const burstCount = this._scaledCount(count, 2);
        const colors = [color, '#ffffff', this._lighten(color)];
        for (let i = 0; i < burstCount; i++) {
            const angle = (Math.PI * 2 / burstCount) * i + (Math.random() - 0.5) * 0.5;
            const speed = 80 + Math.random() * 180;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            const life = 0.4 + Math.random() * 0.5;
            const size = 2 + Math.random() * 5;
            const c = colors[Math.floor(Math.random() * colors.length)];
            const type = Math.random() > 0.5 ? 'circle' : 'spark';
            this.pool.get(x, y, vx, vy, life, size, c, type);
        }
    },

    /**
     * Spawn XP pickup sparkle
     */
    xpPickup(x, y) {
        const count = this._scaledCount(6, 2);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 60;
            this.pool.get(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.3 + Math.random() * 0.2,
                2 + Math.random() * 3,
                '#00ffcc',
                'circle'
            );
        }
    },

    /**
     * Spawn gold pickup sparkle
     */
    goldPickup(x, y) {
        const count = this._scaledCount(8, 2);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 70;
            this.pool.get(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.35 + Math.random() * 0.2,
                2 + Math.random() * 3,
                '#ffd700',
                'spark'
            );
        }
    },

    /**
     * Spawn damage flash particles
     */
    damageFlash(x, y) {
        const count = this._scaledCount(4, 1);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 40;
            this.pool.get(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.15,
                4 + Math.random() * 3,
                '#ffffff',
                'circle'
            );
        }
    },

    // Spawn muzzle flash particles (weapon fire effect)
    muzzleFlash(x, y, angle, color) {
        const count = this._scaledCount(3, 2);
        for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.5) * 0.6;
            const a = angle + spread;
            const speed = 80 + Math.random() * 120;
            this.pool.get(
                x + Math.cos(a) * 8,
                y + Math.sin(a) * 8,
                Math.cos(a) * speed,
                Math.sin(a) * speed,
                color, 2 + Math.random() * 2,
                0.15 + Math.random() * 0.1
            );
        }
    },

    /**
     * Spawn weapon hit spark
     */
    weaponSpark(x, y, color) {
        const count = this._scaledCount(5, 1);
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 100;
            this.pool.get(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                0.2 + Math.random() * 0.2,
                1.5 + Math.random() * 2,
                color,
                'spark'
            );
        }
    },

    /**
     * Update all particles
     */
    update(dt) {
        for (let i = this.iceEffects.length - 1; i >= 0; i--) {
            const fx = this.iceEffects[i];
            fx.update(dt);
            if (fx.bitti) {
                this.iceEffects.splice(i, 1);
            }
        }

        this.pool.updateAll((p, dt) => {
            p.life -= dt;
            if (p.life <= 0) return true; // Release

            p.vx *= p.friction;
            p.vy *= p.friction;
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            return false;
        }, dt);

        if (this.floatingTexts) {
            for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
                const ft = this.floatingTexts[i];
                ft.life -= dt;
                if (ft.life <= 0) {
                    this.floatingTexts.splice(i, 1);
                    continue;
                }
                ft.y -= 25 * dt; // Float up
            }
        }
    },

    /**
     * Create floating text (e.g. for bonus XP or Gold)
     */
    createFloatingText(x, y, text, color) {
        if (!this.floatingTexts) this.floatingTexts = [];
        this.floatingTexts.push({
            x: x,
            y: y,
            text: text,
            color: color || '#ffffff',
            life: 1.5,
            maxLife: 1.5
        });
    },

    /**
     * Draw all particles
     */
    draw(ctx) {
        if (this._iceSheets.loaded && !this._iceSheets.failed) {
            for (const fx of this.iceEffects) {
                const frame = fx.getCurrentFrame();
                if (!frame) continue;
                const sheet = this._iceSheets[frame.sheet];
                if (!sheet) continue;
                if (!this._iceSheets.alphaValid[frame.sheet]) continue;

                const drawSize = frame.size * fx.olcek;
                const alphaFalloff = fx.dongu ? fx.alpha : fx.alpha * Math.max(0.15, 1 - (fx.currentFrameIndex / Math.max(1, fx.kareler.length)) * 0.2);

                ctx.save();
                ctx.translate(fx.x, fx.y);
                ctx.rotate(fx.aci);
                ctx.globalAlpha = alphaFalloff;
                ctx.shadowColor = '#b8ecff';
                ctx.shadowBlur = 18;
                ctx.drawImage(sheet, frame.x, frame.y, frame.w, frame.h, -drawSize * 0.5, -drawSize * 0.5, drawSize, drawSize);
                ctx.restore();
            }
        }

        this.pool.drawAll((ctx, p) => {
            const alpha = p.life / p.maxLife;
            const size = p.shrink ? p.size * alpha : p.size;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;

            if (p.type === 'circle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, Math.max(size, 0.5), 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            } else if (p.type === 'spark') {
                const len = size * 3;
                const angle = Math.atan2(p.vy, p.vx);
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(
                    p.x - Math.cos(angle) * len,
                    p.y - Math.sin(angle) * len
                );
                ctx.strokeStyle = p.color;
                ctx.lineWidth = Math.max(size * 0.5, 0.5);
                ctx.stroke();
            } else if (p.type === 'ring') {
                const radius = (1 - alpha) * p.size * 3;
                ctx.beginPath();
                ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = 2 * alpha;
                ctx.stroke();
            }

            ctx.restore();
        }, ctx);

        if (this.floatingTexts) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = 'bold 16px "Orbitron", monospace';
            for (const ft of this.floatingTexts) {
                const alpha = Math.min(1, ft.life * 2); // Fade out at the end
                ctx.globalAlpha = alpha;
                ctx.fillStyle = ft.color;
                ctx.shadowColor = ft.color;
                ctx.shadowBlur = 8;
                ctx.fillText(ft.text, ft.x, ft.y);
            }
            ctx.restore();
        }
    },

    /**
     * Lighten a hex color
     */
    _lighten(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const lr = Math.min(255, r + 80);
        const lg = Math.min(255, g + 80);
        const lb = Math.min(255, b + 80);
        return `#${lr.toString(16).padStart(2, '0')}${lg.toString(16).padStart(2, '0')}${lb.toString(16).padStart(2, '0')}`;
    },

    /** Release all */
    clear() {
        this.pool.releaseAll();
    }
};
