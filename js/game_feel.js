// ============================================================
// game_feel.js — AAA Game Feel, Atmosphere, Minimap, DPS Meter
// ============================================================
// Loaded AFTER all game systems. Enhances game via wrapping.
// No original file is modified.
// ============================================================

(function () {
    'use strict';

    // ════════════════════════════════════════════════════════
    // 1. DASH TRAIL — Afterimage ghost when player dashes
    // ════════════════════════════════════════════════════════

    const _dashGhosts = [];
    const MAX_GHOSTS = 6;

    const _origTryDash = Player.tryDash.bind(Player);
    Player.tryDash = function (inputDir) {
        const startX = this.x, startY = this.y;
        const result = _origTryDash(inputDir);
        if (result) {
            // Spawn afterimage ghosts along the dash path
            const dx = this.x - startX;
            const dy = this.y - startY;
            const steps = Math.min(MAX_GHOSTS, 5);
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                _dashGhosts.push({
                    x: startX + dx * t,
                    y: startY + dy * t,
                    rotation: this.rotation,
                    radius: this.radius,
                    alpha: 0.5 - t * 0.3,
                    life: 0.25
                });
            }
            if (_dashGhosts.length > MAX_GHOSTS * 2) {
                _dashGhosts.splice(0, _dashGhosts.length - MAX_GHOSTS);
            }
        }
        return result;
    };

    // ════════════════════════════════════════════════════════
    // 2. SPEED LINES — Directional streaks when moving fast
    // ════════════════════════════════════════════════════════

    const _speedLines = [];
    const MAX_SPEED_LINES = 12;
    let _lastPlayerX = 0, _lastPlayerY = 0;

    function updateSpeedLines(dt) {
        const pdx = Player.x - _lastPlayerX;
        const pdy = Player.y - _lastPlayerY;
        const playerSpeed = Math.sqrt(pdx * pdx + pdy * pdy) / Math.max(0.001, dt);
        _lastPlayerX = Player.x;
        _lastPlayerY = Player.y;

        // Only spawn lines when moving fast (>180 px/s)
        if (playerSpeed > 180 && _speedLines.length < MAX_SPEED_LINES) {
            const angle = Math.atan2(pdy, pdx) + Math.PI;
            const spread = (Math.random() - 0.5) * 1.2;
            const dist = 120 + Math.random() * 80;
            _speedLines.push({
                x: Player.x + Math.cos(angle + spread) * dist,
                y: Player.y + Math.sin(angle + spread) * dist,
                angle: angle,
                length: 20 + Math.random() * 30,
                alpha: 0.1 + Math.random() * 0.15,
                life: 0.15 + Math.random() * 0.1
            });
        }

        // Update
        for (let i = _speedLines.length - 1; i >= 0; i--) {
            const l = _speedLines[i];
            l.life -= dt;
            l.alpha *= 0.92;
            if (l.life <= 0) _speedLines.splice(i, 1);
        }

        // Dash ghosts
        for (let i = _dashGhosts.length - 1; i >= 0; i--) {
            const g = _dashGhosts[i];
            g.life -= dt;
            g.alpha *= 0.88;
            if (g.life <= 0) _dashGhosts.splice(i, 1);
        }
    }

    function drawSpeedLines(ctx) {
        for (const l of _speedLines) {
            ctx.save();
            ctx.globalAlpha = l.alpha;
            ctx.strokeStyle = Player.color || '#00ffff';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(
                l.x + Math.cos(l.angle) * l.length,
                l.y + Math.sin(l.angle) * l.length
            );
            ctx.stroke();
            ctx.restore();
        }
    }

    function drawDashGhosts(ctx) {
        for (const g of _dashGhosts) {
            ctx.save();
            ctx.globalAlpha = g.alpha;
            ctx.translate(g.x, g.y);
            ctx.rotate(g.rotation);

            // Ghost silhouette — simple character outline
            const sprite = (typeof Characters !== 'undefined' && Characters._getPlayerSprite)
                ? Characters._getPlayerSprite()
                : null;
            if (sprite && sprite.complete && sprite.naturalWidth > 0) {
                const s = g.radius * 5;
                ctx.drawImage(sprite, -s / 2, -s / 2, s, s);
            } else {
                ctx.beginPath();
                ctx.arc(0, 0, g.radius, 0, Math.PI * 2);
                ctx.fillStyle = Player.color || '#00ffff';
                ctx.fill();
            }

            ctx.restore();
        }
    }

    // ════════════════════════════════════════════════════════
    // 3. ENHANCED DAMAGE VIGNETTE — Pulsing red edges on low HP
    // ════════════════════════════════════════════════════════

    function drawLowHPVignette(ctx, canvasW, canvasH) {
        if (Player.hp <= 0 || Player.maxHp <= 0) return;
        const hpRatio = Player.hp / Player.maxHp;
        if (hpRatio > 0.35) return;

        // Pulse intensity increases as HP drops
        const urgency = 1 - (hpRatio / 0.35);
        const pulse = 0.5 + Math.sin(Renderer.time * (4 + urgency * 4)) * 0.5;
        const alpha = urgency * 0.25 * pulse;

        ctx.save();
        const grad = ctx.createRadialGradient(
            canvasW / 2, canvasH / 2, canvasW * 0.25,
            canvasW / 2, canvasH / 2, canvasW * 0.7
        );
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, `rgba(255, 0, 30, ${alpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvasW, canvasH);
        ctx.restore();
    }

    // ════════════════════════════════════════════════════════
    // 4. MINIMAP RADAR — Top-left HUD overlay showing enemies
    // ════════════════════════════════════════════════════════

    const MINIMAP_SIZE = 100;
    const MINIMAP_RANGE = 800;
    const MINIMAP_MARGIN = 12;

    function drawMinimap(ctx, canvasW) {
        if (!Enemies.pool || Game.state !== 'PLAYING') return;

        const mx = canvasW - MINIMAP_SIZE - MINIMAP_MARGIN;
        const my = MINIMAP_MARGIN;
        const cx = mx + MINIMAP_SIZE / 2;
        const cy = my + MINIMAP_SIZE / 2;
        const scale = MINIMAP_SIZE / (MINIMAP_RANGE * 2);

        // Background
        ctx.save();
        ctx.globalAlpha = 0.35;
        ctx.beginPath();
        ctx.arc(cx, cy, MINIMAP_SIZE / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a1a';
        ctx.fill();
        ctx.strokeStyle = '#00ffff33';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Clip to circle
        ctx.beginPath();
        ctx.arc(cx, cy, MINIMAP_SIZE / 2 - 1, 0, Math.PI * 2);
        ctx.clip();

        // Range rings
        ctx.globalAlpha = 0.12;
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 0.5;
        for (let ring = 1; ring <= 3; ring++) {
            ctx.beginPath();
            ctx.arc(cx, cy, (MINIMAP_SIZE / 2) * (ring / 3), 0, Math.PI * 2);
            ctx.stroke();
        }

        // Enemies as dots
        ctx.globalAlpha = 0.7;
        const enemies = Enemies.pool.active;
        for (let i = 0; i < enemies.length; i++) {
            const e = enemies[i];
            const dx = e.x - Player.x;
            const dy = e.y - Player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > MINIMAP_RANGE) continue;

            const sx = cx + dx * scale;
            const sy = cy + dy * scale;
            const dotR = e.isBoss ? 3.5 : 1.5;

            ctx.beginPath();
            ctx.arc(sx, sy, dotR, 0, Math.PI * 2);
            ctx.fillStyle = e.isBoss ? '#ff4444' : e.color || '#ff00ff';
            ctx.fill();
        }

        // Player dot (center)
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();

        // Direction indicator
        const dirAngle = Player.rotation || 0;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
            cx + Math.cos(dirAngle) * 8,
            cy + Math.sin(dirAngle) * 8
        );
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.8;
        ctx.stroke();

        ctx.restore();
    }

    // ════════════════════════════════════════════════════════
    // 5. DPS METER — Rolling 3-second DPS display
    // ════════════════════════════════════════════════════════

    const DPS_WINDOW = 3; // seconds
    const _damageLog = [];
    let _cachedDPS = 0;
    let _dpsUpdateTimer = 0;

    // Hook into damageEnemy to log damage
    const _origDmgForDPS = Enemies.damageEnemy;
    Enemies.damageEnemy = function (enemy, amount) {
        const now = (typeof Game !== 'undefined') ? Game.gameTime : 0;
        _damageLog.push({ time: now, amount: amount });
        return _origDmgForDPS.call(this, enemy, amount);
    };

    function updateDPS(dt, gameTime) {
        _dpsUpdateTimer += dt;
        if (_dpsUpdateTimer < 0.3) return; // Update every 300ms
        _dpsUpdateTimer = 0;

        const cutoff = gameTime - DPS_WINDOW;
        // Clean old entries
        while (_damageLog.length > 0 && _damageLog[0].time < cutoff) {
            _damageLog.shift();
        }
        // Sum
        let total = 0;
        for (let i = 0; i < _damageLog.length; i++) {
            total += _damageLog[i].amount;
        }
        _cachedDPS = Math.round(total / DPS_WINDOW);
    }

    function drawDPS(ctx, canvasW) {
        if (_cachedDPS <= 0 || Game.state !== 'PLAYING') return;

        ctx.save();
        ctx.font = 'bold 10px Orbitron, monospace';
        ctx.textAlign = 'right';
        ctx.globalAlpha = 0.6;
        ctx.fillStyle = '#ffaa44';
        ctx.shadowColor = '#ff6600';
        ctx.shadowBlur = 4;
        ctx.fillText('DPS: ' + _cachedDPS, canvasW - MINIMAP_MARGIN, MINIMAP_SIZE + MINIMAP_MARGIN + 18);
        ctx.restore();
    }

    // ════════════════════════════════════════════════════════
    // 6. COMBO SCREEN EFFECTS — Flash on high combos
    // ════════════════════════════════════════════════════════

    let _lastCombo = 0;

    function drawComboEffects(ctx, canvasW, canvasH) {
        if (!Game.comboCount || Game.state !== 'PLAYING') return;

        // On combo milestone (every 10), trigger a subtle screen glow
        if (Game.comboCount >= 10 && Game.comboCount !== _lastCombo && Game.comboCount % 10 === 0) {
            _lastCombo = Game.comboCount;
            if (Renderer.killFlash !== undefined) {
                Renderer.killFlash = Math.min(1, Renderer.killFlash + 0.15);
            }
        }

        // High combo: subtle pulsing border glow
        if (Game.comboCount >= 20) {
            const intensity = Math.min(1, (Game.comboCount - 20) / 80);
            const pulse = 0.5 + Math.sin(Renderer.time * 6) * 0.5;
            const alpha = intensity * 0.08 * pulse;

            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = Game.comboCount >= 50 ? '#ff00ff' : '#ffaa00';
            ctx.lineWidth = 3;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 15;
            ctx.strokeRect(4, 4, canvasW - 8, canvasH - 8);
            ctx.restore();
        }
    }

    // ════════════════════════════════════════════════════════
    // 7. AMBIENT ATMOSPHERE — Subtle floating particles
    // ════════════════════════════════════════════════════════

    const _ambientParticles = [];
    const MAX_AMBIENT = 20;

    function updateAmbient(dt) {
        // Spawn
        if (_ambientParticles.length < MAX_AMBIENT && Math.random() < dt * 2) {
            const canvasW = Renderer.width || 800;
            const canvasH = Renderer.height || 600;
            _ambientParticles.push({
                x: Math.random() * canvasW,
                y: Math.random() * canvasH,
                vx: (Math.random() - 0.5) * 8,
                vy: -5 - Math.random() * 10,
                size: 1 + Math.random() * 2,
                alpha: 0.05 + Math.random() * 0.1,
                life: 4 + Math.random() * 4
            });
        }

        // Update
        for (let i = _ambientParticles.length - 1; i >= 0; i--) {
            const p = _ambientParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt;
            if (p.life <= 0) {
                _ambientParticles.splice(i, 1);
            }
        }
    }

    function drawAmbient(ctx) {
        const map = (typeof Maps !== 'undefined' && Maps.getSelected) ? Maps.getSelected() : null;
        const color = map ? (map.gridColor || '#00ffff') : '#00ffff';
        const hexColor = color.replace(/rgba?\([^)]+\)/i, '#00ffff');
        const drawColor = hexColor.startsWith('#') ? hexColor : '#00ffff';

        for (const p of _ambientParticles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = drawColor;
            ctx.fill();
            ctx.restore();
        }
    }

    // ════════════════════════════════════════════════════════
    // 8. MASTER HOOKS — Wire everything into the game loop
    // ════════════════════════════════════════════════════════

    const _origGameUpdate2 = Game.update;
    Game.update = function (dt) {
        _origGameUpdate2.call(this, dt);
        updateSpeedLines(dt);
        updateDPS(dt, this.gameTime);
        updateAmbient(dt);
    };

    const _origGameRender2 = Game.render;
    Game.render = function (dt) {
        _origGameRender2.call(this, dt);

        if (this.state !== 'PLAYING' && this.state !== 'LEVELUP') return;

        const ctx = Renderer.ctx;
        const canvasW = Renderer.width;
        const canvasH = Renderer.height;

        // World-space overlays
        ctx.save();
        Camera.applyTransform(ctx, this.canvas);
        drawSpeedLines(ctx);
        drawDashGhosts(ctx);
        Camera.restoreTransform(ctx);

        // Screen-space overlays
        drawLowHPVignette(ctx, canvasW, canvasH);
        drawComboEffects(ctx, canvasW, canvasH);
        drawAmbient(ctx);
        drawMinimap(ctx, canvasW);
        drawDPS(ctx, canvasW);
    };

    // Reset on game start
    const _origStartGame2 = Game.startGame;
    Game.startGame = function () {
        _dashGhosts.length = 0;
        _speedLines.length = 0;
        _ambientParticles.length = 0;
        _damageLog.length = 0;
        _cachedDPS = 0;
        _dpsUpdateTimer = 0;
        _lastCombo = 0;
        _lastPlayerX = 0;
        _lastPlayerY = 0;
        _origStartGame2.call(this);
    };

    console.log('[GameFeel] Dash trail, speed lines, low-HP vignette, minimap, DPS meter, combo effects, ambient particles active.');
})();
