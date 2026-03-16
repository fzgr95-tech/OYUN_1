// ============================================================
// ui_enhanced.js — Enhanced UI: Floating Damage, Kill Feed,
//                  Wave Notifications, Enemy Category Indicators
// ============================================================
// Loaded AFTER ui.js. Extends UI + Game objects additively.
// ============================================================

(function () {
    'use strict';

    // ── 1. FLOATING DAMAGE NUMBERS ────────────────────────
    const _floatingDmg = [];
    const MAX_FLOATING = 30;

    function spawnFloatingDamage(x, y, amount, isCrit) {
        if (_floatingDmg.length >= MAX_FLOATING) _floatingDmg.shift();
        _floatingDmg.push({
            x: x + (Math.random() - 0.5) * 10,
            y: y - 10,
            text: isCrit ? amount + '!' : String(amount),
            color: isCrit ? '#ffff00' : '#ffffff',
            size: isCrit ? 18 : 13,
            life: 0.8,
            maxLife: 0.8,
            vy: -60
        });
    }

    function updateFloatingDamage(dt) {
        for (let i = _floatingDmg.length - 1; i >= 0; i--) {
            const f = _floatingDmg[i];
            f.life -= dt;
            f.y += f.vy * dt;
            f.vy *= 0.96;
            if (f.life <= 0) _floatingDmg.splice(i, 1);
        }
    }

    function drawFloatingDamage(ctx) {
        for (const f of _floatingDmg) {
            const alpha = Math.max(0, f.life / f.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = `bold ${f.size}px Orbitron, monospace`;
            ctx.textAlign = 'center';
            ctx.fillStyle = f.color;
            ctx.shadowColor = f.color;
            ctx.shadowBlur = 6;
            ctx.fillText(f.text, f.x, f.y);
            ctx.restore();
        }
    }

    // Hook into damageEnemy for floating numbers
    const _origDmg = Enemies.damageEnemy.bind(Enemies);
    Enemies.damageEnemy = function (enemy, amount) {
        const effectiveAmount = Math.round(amount);
        const isCrit = Player.critChance > 0 && Math.random() < Player.critChance;
        spawnFloatingDamage(enemy.x, enemy.y, effectiveAmount, isCrit);
        return _origDmg(enemy, amount);
    };

    // ── 2. KILL FEED (recent kills shown top-right) ───────
    const _killFeed = [];
    const MAX_FEED = 5;
    const FEED_LIFETIME = 3;

    function addKillFeedEntry(enemyName, color) {
        if (_killFeed.length >= MAX_FEED) _killFeed.shift();
        _killFeed.push({
            name: enemyName,
            color: color,
            life: FEED_LIFETIME
        });
    }

    // Hook into Game.addKill for kill feed
    const _origAddKill = Game.addKill.bind(Game);
    Game.addKill = function (enemy) {
        _origAddKill(enemy);
        if (enemy) {
            const typeDef = Enemies.TYPES[enemy.type];
            const name = typeDef ? typeDef.name : enemy.type;
            const color = typeDef ? typeDef.color : '#ffffff';
            addKillFeedEntry(name, color);
        }
    };

    // ── 3. WAVE NOTIFICATION ──────────────────────────────
    let _waveNotif = null;
    let _lastWaveTime = 0;
    const WAVE_INTERVAL = 30; // Show wave number every 30 seconds

    function checkWaveNotification(gameTime) {
        const waveNum = Math.floor(gameTime / WAVE_INTERVAL) + 1;
        const elapsed = gameTime - _lastWaveTime;
        if (elapsed >= WAVE_INTERVAL && waveNum > 1) {
            _lastWaveTime = Math.floor(gameTime / WAVE_INTERVAL) * WAVE_INTERVAL;
            _waveNotif = {
                text: `DALGA ${waveNum}`,
                life: 2.5,
                maxLife: 2.5
            };
        }
    }

    // ── 4. ENHANCED BOSS HP BAR (canvas overlay) ──────────
    function drawEnhancedBossHP(ctx, canvasW) {
        const boss = Enemies.activeBoss;
        if (!boss) return;

        const hpRatio = Math.max(0, boss.hp / boss.maxHp);
        const barW = canvasW * 0.4;
        const barH = 14;
        const barX = (canvasW - barW) / 2;
        const barY = 50;

        // Background
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.65)';
        ctx.beginPath();
        ctx.roundRect(barX - 4, barY - 4, barW + 8, barH + 8, 6);
        ctx.fill();

        // HP fill with gradient
        const grad = ctx.createLinearGradient(barX, barY, barX + barW * hpRatio, barY);
        if (hpRatio > 0.5) {
            grad.addColorStop(0, '#ff4400');
            grad.addColorStop(1, '#ff8800');
        } else if (hpRatio > 0.25) {
            grad.addColorStop(0, '#ff2200');
            grad.addColorStop(1, '#ff6600');
        } else {
            grad.addColorStop(0, '#ff0000');
            grad.addColorStop(1, '#ff3300');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW * hpRatio, barH, 4);
        ctx.fill();

        // Border
        ctx.strokeStyle = boss.color + 'aa';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(barX, barY, barW, barH, 4);
        ctx.stroke();

        // Boss name
        ctx.font = 'bold 11px Orbitron, monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = boss.color;
        ctx.shadowColor = boss.color;
        ctx.shadowBlur = 8;
        ctx.fillText(
            (boss.bossName || 'BOSS').toUpperCase(),
            canvasW / 2,
            barY - 8
        );

        // Phase indicator
        if (boss.bossPhase >= 2) {
            const phaseText = boss.bossPhase === 2 ? '⚡ PHASE 2' : '🔥 PHASE 3';
            ctx.font = 'bold 9px Orbitron, monospace';
            ctx.fillStyle = boss.bossPhase === 3 ? '#ff4444' : '#ffaa44';
            ctx.fillText(phaseText, canvasW / 2, barY + barH + 14);
        }

        ctx.restore();
    }

    // ── 5. MASTER UPDATE & DRAW HOOKS ─────────────────────

    // Wrap Game.update to add our per-frame updates
    const _origGameUpdate = Game.update.bind(Game);
    Game.update = function (dt) {
        _origGameUpdate(dt);
        updateFloatingDamage(dt);
        checkWaveNotification(this.gameTime);

        // Kill feed aging
        for (let i = _killFeed.length - 1; i >= 0; i--) {
            _killFeed[i].life -= dt;
            if (_killFeed[i].life <= 0) _killFeed.splice(i, 1);
        }

        // Wave notification aging
        if (_waveNotif) {
            _waveNotif.life -= dt;
            if (_waveNotif.life <= 0) _waveNotif = null;
        }
    };

    // Wrap Game.render to draw our overlays
    const _origGameRender = Game.render.bind(Game);
    Game.render = function (dt) {
        _origGameRender(dt);

        if (this.state !== 'PLAYING' && this.state !== 'LEVELUP') return;

        const ctx = Renderer.ctx;
        const canvasW = this.canvas.width;
        const canvasH = this.canvas.height;

        // Floating damage (world-space → apply camera)
        ctx.save();
        Camera.applyTransform(ctx, this.canvas);
        drawFloatingDamage(ctx);
        Camera.restoreTransform(ctx);

        // Kill feed (screen-space, top-right)
        ctx.save();
        const feedX = canvasW - 16;
        let feedY = 90;
        for (let i = _killFeed.length - 1; i >= 0; i--) {
            const entry = _killFeed[i];
            const alpha = Math.min(1, entry.life / 0.5);
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 10px Orbitron, monospace';
            ctx.textAlign = 'right';
            ctx.fillStyle = entry.color;
            ctx.shadowColor = entry.color;
            ctx.shadowBlur = 4;
            ctx.fillText('✖ ' + entry.name, feedX, feedY);
            feedY += 16;
        }
        ctx.restore();

        // Wave notification (center screen)
        if (_waveNotif) {
            const alpha = _waveNotif.life < 0.5
                ? _waveNotif.life / 0.5
                : (_waveNotif.life > _waveNotif.maxLife - 0.3 ? (_waveNotif.maxLife - _waveNotif.life) / 0.3 : 1);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 28px Orbitron, monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#ffaa22';
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 16;
            ctx.fillText(_waveNotif.text, canvasW / 2, canvasH * 0.35);
            ctx.restore();
        }

        // Enhanced boss HP bar (screen-space)
        drawEnhancedBossHP(ctx, canvasW);
    };

    // Reset state when game restarts
    const _origStartGame = Game.startGame.bind(Game);
    Game.startGame = function () {
        _floatingDmg.length = 0;
        _killFeed.length = 0;
        _waveNotif = null;
        _lastWaveTime = 0;
        _origStartGame();
    };

    console.log('[UI Enhanced] Floating damage, kill feed, wave notifications active.');
})();
