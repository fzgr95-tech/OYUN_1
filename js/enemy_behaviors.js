// ============================================================
// enemy_behaviors.js — Extended Enemy Behavior Engine
// ============================================================
// Loaded AFTER enemy_types_extended.js. Adds special behaviors
// by wrapping existing Enemies methods (no original code modified).
// ============================================================

(function () {
    'use strict';

    // ── SPLITTER: spawn mini enemies on death ─────────────
    const _origDamageEnemy = Enemies.damageEnemy.bind(Enemies);

    Enemies.damageEnemy = function (enemy, amount) {
        const killed = _origDamageEnemy(enemy, amount);

        if (killed) {
            const typeDef = this.TYPES[enemy.type];
            // Splitter logic: spawn children when parent dies
            if (typeDef && typeDef.splitCount && typeDef.splitType && this.TYPES[typeDef.splitType]) {
                const count = typeDef.splitCount;
                for (let i = 0; i < count; i++) {
                    if (this.pool.active.length >= this.maxEnemies) break;
                    const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
                    const dist = enemy.radius + 10 + Math.random() * 15;
                    const sx = enemy.x + Math.cos(angle) * dist;
                    const sy = enemy.y + Math.sin(angle) * dist;
                    this.pool.get(sx, sy, typeDef.splitType);
                }
                Particles.burstAt(enemy.x, enemy.y, typeDef.color || enemy.color, 8);
            }
        }

        return killed;
    };

    // ── STEALTH: alpha-cycling for stealth-category enemies ──
    const _origUpdate = Enemies.update.bind(Enemies);

    Enemies.update = function (dt, playerX, playerY) {
        // Run original update first
        _origUpdate(dt, playerX, playerY);

        // Post-update: apply stealth behavior
        for (let i = 0; i < this.pool.active.length; i++) {
            const e = this.pool.active[i];
            const typeDef = this.TYPES[e.type];
            if (!typeDef || typeDef.category !== 'stealth') continue;

            // Initialize stealth state if needed
            if (e._stealthPhase === undefined) {
                e._stealthPhase = Math.random() * Math.PI * 2;
                e._stealthAlpha = 1;
            }

            // Cycle visibility: fade in/out on a sine wave
            e._stealthPhase += dt * 1.8;
            e._stealthAlpha = 0.15 + Math.abs(Math.sin(e._stealthPhase)) * 0.85;

            // When near player (<150px), become more visible (detected)
            const dx = playerX - e.x;
            const dy = playerY - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                e._stealthAlpha = Math.min(1, e._stealthAlpha + 0.4);
            }
        }
    };

    // ── STEALTH DRAW: apply alpha for stealth enemies ────
    const _origDraw = Enemies.draw.bind(Enemies);

    Enemies.draw = function (ctx) {
        // We wrap pool.drawAll temporarily to inject alpha
        const origDrawAll = this.pool.drawAll.bind(this.pool);

        this.pool.drawAll = function (fn, drawCtx) {
            origDrawAll(function (drawCtx2, e) {
                const typeDef = Enemies.TYPES[e.type];
                const isStealth = typeDef && typeDef.category === 'stealth';

                if (isStealth && e._stealthAlpha !== undefined) {
                    drawCtx2.save();
                    drawCtx2.globalAlpha *= e._stealthAlpha;
                    fn(drawCtx2, e);
                    drawCtx2.restore();
                } else {
                    fn(drawCtx2, e);
                }
            }, drawCtx);
        };

        _origDraw(ctx);

        // Restore original drawAll
        this.pool.drawAll = origDrawAll;
    };

    console.log('[EnemyBehaviors] Splitter + Stealth behavior engines active.');
})();
