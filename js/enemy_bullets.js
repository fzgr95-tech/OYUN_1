// ============================================================
// enemy_bullets.js — Enemy Bullet Fire, Update, Draw & Impact FX
// ============================================================
// This file is loaded AFTER enemy.js + enemy_sprites.js and
// extends the Enemies object with bullet methods.
// ============================================================

Object.assign(Enemies, {
    _ensureBulletImpactPool() {
        if (this._bulletFx.impactPool) return;
        this._bulletFx.impactPool = new ObjectPool(
            () => ({
                x: 0,
                y: 0,
                life: 0,
                maxLife: 0.2,
                scale: 1,
                currentFrameIndex: 0,
                frameTimer: 0,
                frameRate: 22
            }),
            (imp, data) => {
                imp.x = data.x;
                imp.y = data.y;
                imp.life = 0;
                imp.maxLife = 0.2;
                imp.scale = data.scale;
                imp.currentFrameIndex = 0;
                imp.frameTimer = 0;
                imp.frameRate = data.frameRate || this._bulletFx.impactFrameRate;
            },
            this._bulletFx.maxImpacts
        );
    },

    _getImpactCapByPerf() {
        return this._bulletFx.lastDt > this._bulletFx.lowFpsDtThreshold
            ? this._bulletFx.lowFpsImpactCap
            : this._bulletFx.maxImpacts;
    },

    _destroyBulletImpact(imp) {
        if (!imp || !this._bulletFx.impactPool || !imp._poolActive) return;
        this._bulletFx.impactPool.releaseActive(imp);
    },

    _clearBulletImpactPool() {
        if (!this._bulletFx.impactPool) return;
        this._bulletFx.impactPool.releaseAll();
    },

    spawnBulletEffect(bullet) {
        if (!bullet || !this._bulletFx.ready || !this._bulletFx.impactSprite) return;
        this._ensureBulletImpactPool();
        if (!this._bulletFx.anchorCentered) {
            console.warn('[EnemyBullets] Impact anchor/pivot is not centered. Expected center pivot.');
            return;
        }

        const cap = this._getImpactCapByPerf();
        if (this._bulletFx.impactPool.active.length >= cap) {
            this._destroyBulletImpact(this._bulletFx.impactPool.active[0]);
        }

        const rawScale = Math.max(0.1, (bullet.radius || 4) * 0.07);
        const maxScale = Math.max(0.12, ((bullet.radius || 4) * 0.07) * 1.5);
        const effectScale = Math.min(rawScale, maxScale);

        this._bulletFx.impactPool.get({
            x: bullet.x,
            y: bullet.y,
            scale: effectScale,
            frameRate: this._bulletFx.impactFrameRate
        });
    },

    _fireEnemyBullet(enemy, playerX, playerY) {
        if (this.bullets.length >= this.maxBullets) return;
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const dirX = dx / dist;
        const dirY = dy / dist;
        const parallax = Maps.getParallaxMetrics ? Maps.getParallaxMetrics() : null;
        const tunnelSpeed = parallax && parallax.enabled ? parallax.normalizedSpeed : 0;
        const speed = 180 * (1 + Math.min(0.35, tunnelSpeed * 0.15));
        const palette = Maps.getNeonTunnelPalette ? Maps.getNeonTunnelPalette() : null;
        const bulletColor = palette && palette.accent ? palette.accent : enemy.color;
        const pulseColor = palette && palette.pulse ? palette.pulse : '#ffffff';
        const muzzle = this._getBulletMuzzle(enemy, dirX, dirY);
        const spawnX = muzzle.x;
        const spawnY = muzzle.y;
        const scale = enemy.sides === 3 ? 0.58 : enemy.sides >= 5 ? 0.72 : 0.64;
        const width = 26 * scale;
        const height = 26 * scale;
        const animFps = this._bulletFx.bulletFrameRate * (0.85 + (speed / 220) * 0.55);
        const hitRadius = Math.max(2.4, Math.min(width, height) * 0.22);

        this.bullets.push({
            x: spawnX,
            y: spawnY,
            vx: dirX * speed,
            vy: dirY * speed,
            damage: Math.ceil(enemy.damage * 0.4),
            color: bulletColor,
            pulseColor,
            radius: 4,
            life: 3.0,
            width,
            height,
            scale,
            currentFrameIndex: 0,
            frameTimer: 0,
            frameRate: animFps,
            hitRadius
        });
    },

    _updateBullets(dt, playerX, playerY) {
        this._bulletFx.lastDt = dt;
        if (this._bulletFx.impactPool) {
            this._bulletFx.impactPool.updateAll((imp, delta) => {
                imp.life += delta;
                if (imp.life >= imp.maxLife) {
                    return true;
                }
                imp.scale += delta * 3.5;
                imp.frameTimer += delta;
                const step = 1 / Math.max(1, imp.frameRate || this._bulletFx.impactFrameRate);
                while (imp.frameTimer >= step) {
                    imp.frameTimer -= step;
                    imp.currentFrameIndex++;
                    if (imp.currentFrameIndex >= this._bulletFx.impactFrameCount) {
                        return true;
                    }
                }
                return false;
            }, dt);
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;

            b.frameTimer += dt;
            const frameStep = 1 / Math.max(1, b.frameRate || 14);
            while (b.frameTimer >= frameStep) {
                b.frameTimer -= frameStep;
                b.currentFrameIndex = (b.currentFrameIndex + 1) % Math.max(1, this._bulletFx.bulletFrameCount);
            }

            if (b.life <= 0) {
                this._destroyBullet(i);
                continue;
            }

            // Collision with player
            const dx = Player.x - b.x;
            const dy = Player.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < Player.radius + (b.hitRadius || b.radius)) {
                this._onBulletCollision(b, i);
                Player.takeDamage(b.damage);
                const lowFps = this._bulletFx.lastDt > this._bulletFx.lowFpsDtThreshold;
                if (!lowFps || Math.random() < 0.45) {
                    Particles.damageFlash(b.x, b.y);
                }
            }
        }
    },

    _onBulletCollision(bullet, index) {
        this.spawnBulletEffect(bullet);
        this._destroyBullet(index);
    },

    _destroyBullet(index) {
        if (index < 0 || index >= this.bullets.length) return;
        this.bullets.splice(index, 1);
    },

    drawBullets(ctx) {
        this._ensureBulletFx();
        const hasFx = this._bulletFx.ready && this._bulletFx.bulletSprite;
        if (!hasFx && this.bullets.length === 0) return;

        ctx.save();
        if (hasFx) {
            ctx.globalCompositeOperation = 'lighter';
            ctx.globalAlpha = 0.95;
        }

        for (const b of this.bullets) {
            const drawAngle = Math.atan2(b.vy, b.vx);
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(drawAngle);

            if (hasFx) {
                const src = this._bulletFx.bulletSprite.getSourceRect(b.currentFrameIndex);
                ctx.drawImage(
                    this._bulletFx.bulletSprite.image,
                    src.sourceX, src.sourceY, src.sourceWidth, src.sourceHeight,
                    -b.width * 0.5, -b.height * 0.5, b.width, b.height
                );
            } else {
                // Fallback: simple circle
                ctx.beginPath();
                ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
                ctx.fillStyle = b.color || '#ff4466';
                ctx.fill();
            }
            ctx.restore();
        }

        ctx.restore();
    },

    drawBulletEffects(ctx) {
        if (!this._bulletFx.ready || !this._bulletFx.impactSprite) return;
        const impacts = this.getBulletEffectsForRender();
        if (impacts.length === 0) return;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.96;

        for (const imp of impacts) {
            const src = this._bulletFx.impactSprite.getSourceRect(imp.currentFrameIndex);
            const size = this._bulletFx.frameWidth * imp.scale;
            ctx.drawImage(
                this._bulletFx.impactSprite.image,
                src.sourceX, src.sourceY, src.sourceWidth, src.sourceHeight,
                imp.x - size * 0.5, imp.y - size * 0.5, size, size
            );
        }

        ctx.restore();
    },

    getBulletEffectsForRender() {
        if (!this._bulletFx.impactPool) return this._bulletFx.impacts;
        return this._bulletFx.impactPool.active;
    },

    getBulletImpactImage() {
        return this._bulletFx.impactImage;
    }
});
