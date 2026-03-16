// ============================================================
// player.js — Player Entity
// ============================================================

const Player = {
    x: 0,
    y: 0,
    radius: 18,
    speed: 200,       // pixels per second
    color: '#00ffff',
    glowColor: '#00ffff',

    // HP
    hp: 100,
    maxHp: 100,
    invincible: false,
    invincibleTimer: 0,
    invincibleDuration: 0.5, // seconds of invincibility after hit

    // Visuals
    rotation: -Math.PI / 2,
    pulseTimer: 0,
    flashTimer: 0,

    // Stats
    magnetRadius: 100,
    armor: 0,           // Damage reduction (0.0 to 0.5)
    xpMultiplier: 1,    // XP gain multiplier
    dashCooldown: 2.6,
    dashCooldownTimer: 0,
    dashDistance: 130,
    dashInvincibleDuration: 0.22,
    level: 1,
    xp: 0,
    xpToNext: 10,

    // Weapons (indices into Weapons array)
    weapons: [],

    init() {
        this.x = 0;
        this.y = 0;
        this.hp = 100;
        this.maxHp = 100;
        this.speed = 200;
        this.level = 1;
        this.xp = 0;
        this.xpToNext = 10;
        this.invincible = false;
        this.invincibleTimer = 0;
        this.rotation = -Math.PI / 2;
        this.pulseTimer = 0;
        this.flashTimer = 0;
        this.weapons = [];
        this.armor = 0;
        this.xpMultiplier = 1;
        this.magnetRadius = 100;
        this.critChance = 0;
        this.vampirism = 0;
        this.lastBreath = false;
        this.dashCooldownTimer = 0;
        this.passiveLevels = {};
        this._mapSpeedMult = 1;
    },

    // ---- Passive Ability Definitions ----

    passiveDefinitions: {
        speedBoost: {
            name: 'Hız Artışı',
            icon: '💨',
            color: '#44ff88',
            maxLevel: 3,
            description: 'Hareket hızı +%12',
            upgrades: ['Hız +%12', 'Hız +%12', 'Hız +%15'],
            apply(player, level) {
                const boosts = [0.12, 0.12, 0.15];
                player.speed += 200 * boosts[level - 1];
            }
        },
        vampirism: {
            name: 'Vampirizm',
            icon: '🧛',
            color: '#ff4488',
            maxLevel: 3,
            description: '10 düşman öldür = 1 HP kazan',
            upgrades: ['+0.1 HP / kill', '+0.15 HP / kill', '+0.2 HP / kill'],
            apply(player, level) {
                const amounts = [0.1, 0.15, 0.2];
                player.vampirism += amounts[level - 1];
            }
        },
        criticalHit: {
            name: 'Kritik Vuruş',
            icon: '💥',
            color: '#ffaa00',
            maxLevel: 3,
            description: '%15 şansla 2x hasar',
            upgrades: ['%15 kritik şansı', '+%10 kritik', '+%10 kritik'],
            apply(player, level) {
                const chances = [0.15, 0.10, 0.10];
                player.critChance += chances[level - 1];
            }
        },
        lastBreath: {
            name: 'Son Nefes',
            icon: '💀',
            color: '#ff2222',
            maxLevel: 1,
            description: 'Ölürken etrafına büyük patlama',
            upgrades: ['Son Nefes aktif!'],
            apply(player, level) {
                player.lastBreath = true;
            }
        },
        xpMagnet: {
            name: 'XP Mıknatısı',
            icon: '🧲',
            color: '#00ffcc',
            maxLevel: 3,
            description: 'Mıknatıs alanı +%30',
            upgrades: ['Çekim +%30', 'Çekim +%30', 'Çekim +%40'],
            apply(player, level) {
                const boosts = [0.30, 0.30, 0.40];
                player.magnetRadius += 100 * boosts[level - 1];
            }
        }
    },

    getPassiveLevel(passiveId) {
        return this.passiveLevels[passiveId] || 0;
    },

    applyPassive(passiveId) {
        const def = this.passiveDefinitions[passiveId];
        if (!def) return false;
        const currentLevel = this.getPassiveLevel(passiveId);
        if (currentLevel >= def.maxLevel) return false;

        const newLevel = currentLevel + 1;
        this.passiveLevels[passiveId] = newLevel;
        def.apply(this, newLevel);
        return true;
    },

    /**
     * Remove a passive (when temporary powerup expires)
     */
    removePassive(passiveId) {
        const level = this.getPassiveLevel(passiveId);
        if (level <= 0) return;

        // Reverse effects based on passive type
        if (passiveId === 'speedBoost') {
            const boosts = [0.12, 0.12, 0.15];
            for (let i = 0; i < level; i++) {
                this.speed -= 200 * boosts[i];
            }
        } else if (passiveId === 'vampirism') {
            this.vampirism = 0;
        } else if (passiveId === 'criticalHit') {
            this.critChance = 0;
        } else if (passiveId === 'lastBreath') {
            this.lastBreath = false;
        } else if (passiveId === 'xpMagnet') {
            const boosts = [0.30, 0.30, 0.40];
            for (let i = 0; i < level; i++) {
                this.magnetRadius -= 100 * boosts[i];
            }
        }

        this.passiveLevels[passiveId] = 0;
    },

    update(dt, inputDir) {
        if (this.dashCooldownTimer > 0) {
            this.dashCooldownTimer -= dt;
            if (this.dashCooldownTimer < 0) this.dashCooldownTimer = 0;
        }

        if (typeof Input !== 'undefined' && Input.consumeDashRequest && Input.consumeDashRequest()) {
            this.tryDash(inputDir);
        }

        // Movement
        if (inputDir.magnitude > 0) {
            const effectiveSpeed = this.speed * (this._mapSpeedMult || 1);
            this.x += inputDir.x * effectiveSpeed * inputDir.magnitude * dt;
            this.y += inputDir.y * effectiveSpeed * inputDir.magnitude * dt;

            // Smooth rotation toward movement direction
            const targetRotation = Math.atan2(inputDir.y, inputDir.x);
            // Shortest-angle interpolation to avoid spinning the long way
            let diff = targetRotation - this.rotation;
            // Normalize diff to [-PI, PI]
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            const rotationLerpSpeed = 10; // higher = snappier turn
            this.rotation += diff * Math.min(1, rotationLerpSpeed * dt);
        }

        // Pulse animation
        this.pulseTimer += dt * 3;

        // Invincibility
        if (this.invincible) {
            this.invincibleTimer -= dt;
            if (this.invincibleTimer <= 0) {
                this.invincible = false;
            }
        }

        // Flash decay
        if (this.flashTimer > 0) {
            this.flashTimer -= dt;
        }
    },

    tryDash(inputDir) {
        if (this.dashCooldownTimer > 0) return false;

        let dx = inputDir && inputDir.magnitude > 0 ? inputDir.x : Math.cos(this.rotation || 0);
        let dy = inputDir && inputDir.magnitude > 0 ? inputDir.y : Math.sin(this.rotation || 0);
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len <= 0.001) {
            dx = 1;
            dy = 0;
        } else {
            dx /= len;
            dy /= len;
        }

        const dashLen = this.dashDistance * (this._mapSpeedMult || 1);
        this.x += dx * dashLen;
        this.y += dy * dashLen;
        this.rotation = Math.atan2(dy, dx);

        this.invincible = true;
        this.invincibleTimer = Math.max(this.invincibleTimer, this.dashInvincibleDuration);
        this.dashCooldownTimer = this.dashCooldown;

        if (typeof Camera !== 'undefined' && Camera.triggerShake) {
            Camera.triggerShake(5, 0.1);
        }
        if (typeof Particles !== 'undefined' && Particles.burstAt) {
            Particles.burstAt(this.x, this.y, '#00eaff', 8);
        }

        return true;
    },

    /**
     * Take damage
     * @returns {boolean} true if dead
     */
    takeDamage(amount) {
        if (this.invincible) return false;

        // Apply armor damage reduction
        const effectiveDamage = Math.max(1, Math.floor(amount * (1 - this.armor)));
        this.hp -= effectiveDamage;
        this.flashTimer = 0.25;
        this.invincible = true;
        this.invincibleTimer = this.invincibleDuration;

        // Scale shake intensity by damage proportion (bigger hits = bigger shake)
        const dmgRatio = Math.min(1, effectiveDamage / this.maxHp);
        const shakeIntensity = 8 + dmgRatio * 12;   // 8–20 range
        const shakeDuration = 0.2 + dmgRatio * 0.15; // 0.2–0.35s
        Camera.triggerShake(shakeIntensity, shakeDuration);

        if (typeof Renderer !== 'undefined' && Renderer.notifyDamage) {
            Renderer.notifyDamage(effectiveDamage);
        }
        Audio.playHit();

        if (this.hp <= 0) {
            this.hp = 0;
            return true; // Dead
        }
        return false;
    },

    /**
     * Add XP, returns true if leveled up
     */
    addXP(amount) {
        this.xp += Math.floor(amount * this.xpMultiplier);
        if (this.xp >= this.xpToNext) {
            this.xp -= this.xpToNext;
            this.level++;
            this.xpToNext = Math.floor(10 + this.level * 5 + Math.pow(this.level, 1.5));
            Audio.playLevelUp();
            return true;
        }
        return false;
    },

    /**
     * Revive with a percentage of max HP
     */
    revive(hpPercent = 0.5) {
        this.hp = Math.floor(this.maxHp * hpPercent);
        this.invincible = true;
        this.invincibleTimer = 2.0; // 2 seconds of invincibility after revive
    },

    /**
     * Draw the player character — delegates to Characters system
     */
    draw(ctx) {
        // Try character-specific drawing first
        if (typeof Characters !== 'undefined' && Characters.drawPlayer(ctx)) {
            return; // Character system handled drawing
        }

        // Fallback: default hexagon
        const pulse = 1 + Math.sin(this.pulseTimer) * 0.05;
        const r = this.radius * pulse;

        if (this.invincible && Math.sin(this.invincibleTimer * 20) > 0) {
            ctx.globalAlpha = 0.4;
        }

        if (this.flashTimer > 0) {
            Renderer.drawNeonPoly(ctx, this.x, this.y, r + 3, 6, this.rotation, '#ffffff', 25);
        }

        Renderer.drawNeonPoly(ctx, this.x, this.y, r, 6, this.rotation, this.color, 18);

        ctx.save();
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 5;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const angle = this.rotation + (Math.PI * 2 / 3) * i;
            const px = this.x + Math.cos(angle) * (r * 0.4);
            const py = this.y + Math.sin(angle) * (r * 0.4);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        const indX = this.x + Math.cos(this.rotation) * (r + 8);
        const indY = this.y + Math.sin(this.rotation) * (r + 8);
        ctx.save();
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(indX, indY, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();

        ctx.globalAlpha = 1;
    }
};
