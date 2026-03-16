// ============================================================
// xp.js — XP Orbs + Gold Orbs (Drop, Magnet, Collection)
// ============================================================

const XPOrbs = {
    /** @type {ObjectPool} */
    pool: null,

    init() {
        this.pool = new ObjectPool(
            () => ({
                x: 0, y: 0,
                value: 1,
                radius: 6,
                color: '#00ffcc',
                magnetized: false,
                pulseTimer: Math.random() * Math.PI * 2,
                life: 30 // disappear after 30 seconds
            }),
            (o, x, y, value) => {
                o.x = x;
                o.y = y;
                o.value = value || 1;
                o.radius = 4 + Math.min(value, 5);
                o.color = value >= 5 ? '#00ff88' : value >= 3 ? '#00ffaa' : '#00ffcc';
                o.magnetized = false;
                o.pulseTimer = Math.random() * Math.PI * 2;
                o.life = 30;
            },
            200
        );
    },

    /**
     * Spawn XP orbs at a position
     */
    spawnAt(x, y, totalXP) {
        // Split into multiple orbs for visual appeal
        const orbCount = Math.min(totalXP, 5);
        const xpPerOrb = Math.ceil(totalXP / orbCount);

        for (let i = 0; i < orbCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 5 + Math.random() * 15;
            const ox = x + Math.cos(angle) * dist;
            const oy = y + Math.sin(angle) * dist;
            this.pool.get(ox, oy, xpPerOrb);
        }
    },

    /**
     * Update all orbs — magnet effect + collection
     */
    update(dt) {
        const px = Player.x;
        const py = Player.y;
        const magnetR = Player.magnetRadius;
        const collectR = 20; // Collection radius
        const magnetRSq = magnetR * magnetR;
        const collectRSq = collectR * collectR;

        this.pool.updateAll((o, dt) => {
            o.life -= dt;
            if (o.life <= 0) return true;

            o.pulseTimer += dt * 4;

            // Distance to player
            const dx = px - o.x;
            const dy = py - o.y;
            const distSq = dx * dx + dy * dy;

            // Magnet effect
            if (distSq < magnetRSq) {
                o.magnetized = true;
            }

            if (o.magnetized) {
                // Accelerate towards player
                const speed = 400;
                if (distSq > 0.0001) {
                    const invDist = 1 / Math.sqrt(distSq);
                    o.x += dx * invDist * speed * dt;
                    o.y += dy * invDist * speed * dt;
                }
            }

            // Collection check
            if (distSq < collectRSq) {
                // Apply combo multiplier
                const comboMult = Game && Game.getComboMultiplier ? Game.getComboMultiplier() : 1;
                let finalXp = o.value * comboMult;

                const leveledUp = Player.addXP(finalXp);
                Particles.xpPickup(o.x, o.y);

                // Show bonus text if combo active
                if (comboMult > 1) {
                    const bonusStr = `+${Math.round(finalXp)} XP`;
                    const color = comboMult >= 2.0 ? '#ff00ff' : comboMult >= 1.5 ? '#ffcc00' : '#cccccc';
                    Particles.createFloatingText(o.x, o.y - 10, bonusStr, color);
                }

                Audio.playXPPickup();

                if (leveledUp) {
                    Game.triggerLevelUp();
                }
                return true; // Release orb
            }

            return false;
        }, dt);

        // Also update gold orbs
        GoldOrbs.update(dt);
    },

    /**
     * Draw all orbs
     */
    draw(ctx) {
        this.pool.drawAll((ctx, o) => {
            const pulse = 1 + Math.sin(o.pulseTimer) * 0.2;
            const r = o.radius * pulse;

            ctx.save();
            ctx.shadowColor = o.color;
            ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                ? Renderer.getShadowBlur(12)
                : 12;

            // Outer glow
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(o.x, o.y, r * 2, 0, Math.PI * 2);
            ctx.fillStyle = o.color;
            ctx.fill();

            // Core
            ctx.globalAlpha = 0.9;
            ctx.beginPath();
            ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
            ctx.fillStyle = o.color;
            ctx.fill();

            // Bright center
            ctx.beginPath();
            ctx.arc(o.x, o.y, r * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();
        }, ctx);

        // Also draw gold orbs
        GoldOrbs.draw(ctx);
    },

    /** Clear all */
    clear() {
        this.pool.releaseAll();
        GoldOrbs.clear();
    }
};


// ============================================================
// GoldOrbs — Collectible Gold Drops (1/3 chance per kill)
// ============================================================

const GoldOrbs = {
    /** @type {ObjectPool} */
    pool: null,
    dropChance: 0.33,  // 1 in 3 enemies drops gold

    init() {
        this.pool = new ObjectPool(
            () => ({
                x: 0, y: 0,
                value: 1,
                radius: 7,
                magnetized: false,
                pulseTimer: Math.random() * Math.PI * 2,
                spinAngle: 0,
                life: 25
            }),
            (o, x, y, value) => {
                o.x = x;
                o.y = y;
                o.value = value || 1;
                o.radius = 6 + Math.min(value, 4);
                o.magnetized = false;
                o.pulseTimer = Math.random() * Math.PI * 2;
                o.spinAngle = Math.random() * Math.PI * 2;
                o.life = 25;
            },
            80
        );
    },

    /**
     * Try to spawn gold at enemy death position.
     * Only spawns with dropChance probability.
     */
    trySpawn(x, y, goldValue) {
        const gameTime = (typeof Game !== 'undefined' && Game.gameTime) ? Game.gameTime : 0;
        let dynamicDropChance = this.dropChance;
        if (gameTime < 180) {
            dynamicDropChance += 0.1;
        } else if (gameTime > 600) {
            dynamicDropChance -= 0.06;
        }
        dynamicDropChance = Math.max(0.22, Math.min(0.48, dynamicDropChance));

        if (Math.random() > dynamicDropChance) return; // No drop

        const angle = Math.random() * Math.PI * 2;
        const dist = 3 + Math.random() * 10;
        const ox = x + Math.cos(angle) * dist;
        const oy = y + Math.sin(angle) * dist;

        let value = goldValue || 1;
        if (gameTime < 180) {
            value += 1;
        } else if (gameTime > 540) {
            value += 2;
        }

        this.pool.get(ox, oy, value);
    },

    /**
     * Update gold orbs — magnet + collection
     */
    update(dt) {
        const px = Player.x;
        const py = Player.y;
        const magnetR = Player.magnetRadius * 0.7; // Gold magnet slightly smaller
        const collectR = 22;
        const magnetRSq = magnetR * magnetR;
        const collectRSq = collectR * collectR;

        this.pool.updateAll((o, dt) => {
            o.life -= dt;
            if (o.life <= 0) return true;

            o.pulseTimer += dt * 3;
            o.spinAngle += dt * 2.5;

            const dx = px - o.x;
            const dy = py - o.y;
            const distSq = dx * dx + dy * dy;

            // Magnet effect
            if (distSq < magnetRSq) {
                o.magnetized = true;
            }

            if (o.magnetized) {
                const speed = 350;
                if (distSq > 0.0001) {
                    const invDist = 1 / Math.sqrt(distSq);
                    o.x += dx * invDist * speed * dt;
                    o.y += dy * invDist * speed * dt;
                }
            }

            // Collect
            if (distSq < collectRSq) {
                Economy.addGold(o.value);
                Particles.goldPickup(o.x, o.y);
                Audio.playXPPickup(); // Reuse pickup sound
                return true;
            }

            return false;
        }, dt);
    },

    // Pre-rendered coin sprite cache (avoids 16+ draw calls per orb per frame)
    _coinCache: {},
    _renderCoinSprite(radius) {
        const key = radius;
        if (this._coinCache[key]) return this._coinCache[key];

        const r = radius;
        const pad = Math.ceil(r * 2.5);
        const size = pad * 2;
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cx = c.getContext('2d');
        const ox = pad, oy = pad;

        // Soft aura
        cx.globalAlpha = 0.35;
        const aura = cx.createRadialGradient(ox, oy, r * 0.25, ox, oy, r * 2.3);
        aura.addColorStop(0, 'rgba(255, 224, 120, 0.55)');
        aura.addColorStop(1, 'rgba(255, 215, 0, 0)');
        cx.beginPath(); cx.arc(ox, oy, r * 2.3, 0, Math.PI * 2);
        cx.fillStyle = aura; cx.fill();

        // Coin body
        cx.globalAlpha = 1;
        const body = cx.createRadialGradient(ox - r * 0.28, oy - r * 0.35, r * 0.2, ox, oy, r);
        body.addColorStop(0, '#fff7c2');
        body.addColorStop(0.45, '#ffd95a');
        body.addColorStop(1, '#e3a400');
        cx.beginPath(); cx.arc(ox, oy, r, 0, Math.PI * 2);
        cx.fillStyle = body; cx.fill();

        // Metallic rim
        const rim = cx.createLinearGradient(ox - r, oy - r, ox + r, oy + r);
        rim.addColorStop(0, '#fff0a0');
        rim.addColorStop(0.5, '#f0b800');
        rim.addColorStop(1, '#fff3b5');
        cx.lineWidth = Math.max(1.1, r * 0.18);
        cx.strokeStyle = rim; cx.stroke();

        // Thin polished edge
        cx.beginPath(); cx.arc(ox, oy, r * 0.86, -Math.PI * 0.95, Math.PI * 0.15);
        cx.lineWidth = Math.max(0.8, r * 0.06);
        cx.strokeStyle = 'rgba(255, 255, 230, 0.65)'; cx.stroke();

        // Inner emboss ring
        cx.beginPath(); cx.arc(ox, oy, r * 0.56, 0, Math.PI * 2);
        cx.lineWidth = Math.max(0.9, r * 0.08);
        cx.strokeStyle = 'rgba(255, 247, 190, 0.75)'; cx.stroke();

        // Center mark
        cx.beginPath(); cx.arc(ox, oy, r * 0.18, 0, Math.PI * 2);
        cx.fillStyle = '#fffef2'; cx.fill();

        this._coinCache[key] = c;
        return c;
    },

    /**
     * Draw gold orbs — cached sprite + minimal per-frame work
     */
    draw(ctx) {
        this.pool.drawAll((ctx, o) => {
            const pulse = 1 + Math.sin(o.pulseTimer) * 0.12;
            const baseR = Math.round(o.radius);
            const sprite = this._renderCoinSprite(baseR);
            const drawScale = pulse;
            const sw = sprite.width * drawScale;
            const sh = sprite.height * drawScale;

            ctx.save();
            ctx.translate(o.x, o.y);
            ctx.rotate(o.spinAngle * 0.3);
            ctx.drawImage(sprite, -sw / 2, -sh / 2, sw, sh);

            // Lightweight rotating gloss overlay
            const twinkle = (Math.sin(o.pulseTimer * 1.7 + o.spinAngle) + 1) * 0.5;
            ctx.globalAlpha = 0.22 + twinkle * 0.2;
            ctx.rotate(o.spinAngle * 0.6);
            ctx.strokeStyle = '#fff9db';
            ctx.lineWidth = Math.max(0.7, baseR * 0.05);
            ctx.beginPath();
            ctx.moveTo(0, -baseR * 0.42);
            ctx.lineTo(0, -baseR * 0.24);
            ctx.moveTo(-baseR * 0.09, -baseR * 0.33);
            ctx.lineTo(baseR * 0.09, -baseR * 0.33);
            ctx.stroke();

            ctx.restore();
        }, ctx);
    },

    clear() {
        this.pool.releaseAll();
    }
};
