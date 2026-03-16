// ============================================================
// main.js — Game Loop, State Management, Core Logic
// ============================================================

const Game = {
    state: 'MENU',  // MENU, CHARSELECT, PLAYING, PAUSED, LEVELUP, GAMEOVER, RESULTS
    canvas: null,
    ctx: null,

    // Timing
    lastTime: 0,
    gameTime: 0,    // Total survival time in seconds
    kills: 0,
    bossKills: 0,
    comboCount: 0,
    comboTimer: 0,
    timeScale: 1,
    hitstopTimer: 0,

    // Level-up
    pendingLevelUp: false,

    /**
     * Initialize everything
     */
    init() {
        this.canvas = document.getElementById('game-canvas');
        Renderer.init(this.canvas);
        Input.init(this.canvas);
        Economy.init();

        // Pre-init subsystems so render doesn't crash in menu
        Particles.init();
        Enemies.init();
        Weapons.init();
        XPOrbs.init();
        GoldOrbs.init();

        UI.init();

        // Show menu
        this.state = 'MENU';
        UI.showMenu();

        // Start the render loop (always runs for background animation)
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    },

    /**
     * Start a new game
     */
    startGame() {
        UI.hideMenu();
        UI.hideShop();
        UI.hideCharSelect();
        UI.hideMapSelect();
        this.state = 'PLAYING';
        this.gameTime = 0;
        this.kills = 0;
        this.bossKills = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.timeScale = 1;
        this.hitstopTimer = 0;
        this.pendingLevelUp = false;

        // Init systems
        Player.init();
        Particles.init();
        Enemies.init();
        Weapons.init();
        XPOrbs.init();
        GoldOrbs.init();
        Economy.gold = 0;
        Economy.reviveUsed = false;
        Economy.runGoldMultiplier = 1;

        // Apply shop upgrades to player
        Economy.applyUpgradesToPlayer();

        // Apply character stats (after shop upgrades, so they multiply)
        Characters.applyToPlayer();

        const runMod = Economy.startRunWithModifier ? Economy.startRunWithModifier() : null;
        if (runMod) {
            if (runMod.playerHpMultiplier && runMod.playerHpMultiplier !== 1) {
                Player.maxHp = Math.max(1, Math.floor(Player.maxHp * runMod.playerHpMultiplier));
                Player.hp = Math.min(Player.hp, Player.maxHp);
            }
            if (runMod.playerSpeedMultiplier && runMod.playerSpeedMultiplier !== 1) {
                Player.speed = Math.max(40, Math.floor(Player.speed * runMod.playerSpeedMultiplier));
            }
            if (typeof Enemies !== 'undefined') {
                Enemies.enemySpeedMultiplier = runMod.enemySpeedMultiplier || 1;
                Enemies.spawnRateMultiplier = runMod.spawnRateMultiplier || 1;
                Enemies.bossDamageMultiplier = runMod.bossDamageMultiplier || 1;
            }
        }

        // Init map system
        Maps.init();

        // Give player starting weapon from character
        const charDef = Characters.getSelected();
        let startWeaponId = charDef ? charDef.startWeapon : 'neonLaser';
        if (Economy.isWeaponUnlocked && !Economy.isWeaponUnlocked(startWeaponId)) {
            startWeaponId = 'neonLaser';
        }
        Weapons.addWeapon(startWeaponId);
        const startWeaponLevel = Economy.getStartWeaponLevel();
        for (let i = 0; i < startWeaponLevel; i++) {
            Weapons.upgradeWeapon(startWeaponId);
        }

        // Camera
        Camera.x = 0;
        Camera.y = 0;

        UI.showHUD();
        if (UI.startTutorial) {
            UI.startTutorial();
        }
        const mapId = Maps.getSelected() ? Maps.getSelected().id : 'neonCity';
        Audio.startMusic(mapId);

        // Level System başlat
        if (typeof LevelSystem !== 'undefined') {
            LevelSystem.start(1);
            const levelHud = document.getElementById('level-hud');
            if (levelHud) levelHud.style.display = 'flex';
        }
    },

    /**
     * Reset and start a new game
     */
    resetAndStart() {
        UI.hideAll();
        Enemies.clear();
        Particles.clear();
        XPOrbs.clear();
        Weapons.clear();
        this.startGame();
    },

    /**
     * Main game loop
     */
    loop(timestamp) {
        try {
            const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05); // Cap at 50ms
            this.lastTime = timestamp;
            this._updateHitstop(dt);
            const scaledDt = dt * (this.timeScale || 1);

            // ======= UPDATE =======
            if (this.state === 'PLAYING') {
                this.gameTime += scaledDt;
                this.update(scaledDt);
            } else if (this.state === 'LEVELUP') {
                // Keep LevelSystem transition timers running even while choosing a card
                if (typeof LevelSystem !== 'undefined') LevelSystem.update(scaledDt);
            }

            // ======= RENDER =======
            this.render(scaledDt);
        } catch (err) {
            console.error('Game loop error:', err);
        }

        requestAnimationFrame((t) => this.loop(t));
    },

    _applyHitstop(duration = 0.05, scale = 0.25) {
        this.hitstopTimer = Math.max(this.hitstopTimer, duration);
        this.timeScale = Math.min(this.timeScale || 1, scale);
    },

    _updateHitstop(dt) {
        if (this.hitstopTimer > 0) {
            this.hitstopTimer -= dt;
            if (this.hitstopTimer <= 0) {
                this.hitstopTimer = 0;
                this.timeScale = 1;
            }
        }
    },

    /**
     * Update game logic
     */
    update(dt) {
        // Input
        const dir = Input.getDirection();

        // Player
        Player.update(dt, dir);

        // Character passive update
        Characters.updatePassive(Player, dt);

        // Map hazards update
        Maps.update(dt, Player.x, Player.y);
        Camera.follow(Player.x, Player.y);
        Camera.update(dt);

        // Enemies
        Enemies.update(dt, Player.x, Player.y);

        // Level System update
        if (typeof LevelSystem !== 'undefined') LevelSystem.update(dt);

        // Check player-enemy collision
        const collisionCandidates = (typeof Enemies.getNearby === 'function')
            ? Enemies.getNearby(Player.x, Player.y, Player.radius + 90)
            : Enemies.pool.active;

        for (let i = collisionCandidates.length - 1; i >= 0; i--) {
            const e = collisionCandidates[i];
            if (!e || !e._poolActive) continue;
            if (Enemies.checkCircleCollision(e, Player.x, Player.y, Player.radius)) {
                const enemyDamage = e.isBoss
                    ? Math.ceil(e.damage * (Enemies.bossDamageMultiplier || 1))
                    : e.damage;
                const dead = Player.takeDamage(enemyDamage);
                // Push enemy back slightly
                const dx = e.x - Player.x;
                const dy = e.y - Player.y;
                const distSq = dx * dx + dy * dy;
                if (distSq > 0.0001) {
                    const invDist = 1 / Math.sqrt(distSq);
                    e.x += dx * invDist * 30;
                    e.y += dy * invDist * 30;
                }

                if (dead) {
                    this.gameOver();
                    return;
                }
            }
        }

        // Weapons
        Weapons.update(dt);

        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.comboTimer = 0;
                this.comboCount = 0;
            }
        }

        // XP Orbs
        XPOrbs.update(dt);

        // Particles
        Particles.update(dt);

        // Update HUD
        UI.updateHUD(
            Player.hp, Player.maxHp,
            Player.xp, Player.xpToNext,
            Player.level,
            this.gameTime,
            this.kills,
            Economy.gold,
            this.comboCount
        );
        UI.updateWeaponIcons(Weapons.activeWeapons);
    },

    /**
     * Render everything
     */
    render(dt) {
        Renderer.beginFrame(dt);

        // Map background + parallax particles
        Maps.drawBackground(Renderer.ctx, Camera.x, Camera.y);
        Maps.drawBgParticles(Renderer.ctx, Camera.x, Camera.y);

        // Grid (screen-space, using camera offset)
        Renderer.drawGrid(Camera.x, Camera.y);

        // Begin world-space rendering
        Camera.applyTransform(Renderer.ctx, this.canvas);

        // Map hazards (world-space)
        Maps.drawHazards(Renderer.ctx);

        // Boss telegraphs (world-space, before entities)
        Enemies.drawTelegraphs(Renderer.ctx);

        // Draw in order: XP orbs, enemies, weapons, player, particles
        XPOrbs.draw(Renderer.ctx);
        Enemies.draw(Renderer.ctx);
        Enemies.drawBossHands(Renderer.ctx);
        Weapons.draw(Renderer.ctx);
        Player.draw(Renderer.ctx);
        Enemies.drawBullets(Renderer.ctx);
        Particles.draw(Renderer.ctx);

        Camera.restoreTransform(Renderer.ctx);

        Renderer.drawEnemyBulletEffects(
            Renderer.ctx,
            Enemies.getBulletEffectsForRender ? Enemies.getBulletEffectsForRender() : [],
            Enemies.getBulletImpactImage ? Enemies.getBulletImpactImage() : null,
            {
                x: Camera.x - this.canvas.width * 0.5 - Camera.shakeX,
                y: Camera.y - this.canvas.height * 0.5 - Camera.shakeY
            }
        );

        // Fog of war (screen-space, after world)
        Maps.drawFogOfWar(Renderer.ctx);

        // Post-processing (screen-space)
        Renderer.applyPostProcessing();

        // Joystick overlay (screen-space, always on top)
        if (this.state === 'PLAYING') {
            Input.draw(Renderer.ctx);
        }
    },

    /**
     * Trigger level up (called by XP system)
     */
    triggerLevelUp() {
        this._applyHitstop(0.07, 0.3);
        if (typeof Renderer !== 'undefined' && Renderer.notifyLevelUp) {
            Renderer.notifyLevelUp();
        }
        this.state = 'LEVELUP';

        const playerLv = Player.level;

        if (playerLv >= 11) {
            // At LV11+: show ALL advanced weapons + passives at once
            const options = this._generateAdvancedOptions();
            if (options.length > 0) {
                UI.showLevelUp(options, true); // true = advanced grid mode
                return;
            }
        }

        // Normal: 3 random weapon upgrades
        const options = this._generateUpgradeOptions(3);
        UI.showLevelUp(options, false);
    },

    /**
     * Select an upgrade (called by UI)
     */
    selectUpgrade(option) {
        if (option.type === 'passive') {
            Player.applyPassive(option.passiveId);
        } else if (option.isNew) {
            Weapons.addWeapon(option.weaponId);
        } else {
            Weapons.upgradeWeapon(option.weaponId);
        }

        this.state = 'PLAYING';
    },

    /**
     * Generate ALL advanced options (weapons + passives) for LV11+
     */
    _generateAdvancedOptions() {
        const advancedWeapons = ['vortexBlade', 'rocketBarrage', 'iceBall'];
        const options = [];

        // Base weapons that can be upgraded
        for (const w of Weapons.activeWeapons) {
            if (w.level < Weapons.definitions[w.id].maxLevel && !advancedWeapons.includes(w.id)) {
                options.push({
                    type: 'weapon',
                    weaponId: w.id,
                    isNew: false,
                    currentLevel: w.level,
                    rarityLabel: w.rarityLabel
                });
            }
        }

        // Base weapons not yet acquired
        const weaponIds = Object.keys(Weapons.definitions);
        for (const id of weaponIds) {
            if (advancedWeapons.includes(id)) continue;
            if (Weapons.activeWeapons.find(w => w.id === id)) continue;
            const def = Weapons.definitions[id];
            if (!def || def.evolvedOnly) continue;
            if (Economy.isWeaponUnlocked && !Economy.isWeaponUnlocked(id)) continue;
            options.push({
                type: 'weapon',
                weaponId: id,
                isNew: true,
                currentLevel: 0
            });
        }

        // Advanced weapons not currently active
        for (const id of advancedWeapons) {
            if (!Weapons.activeWeapons.find(w => w.id === id)) {
                options.push({
                    type: 'weapon',
                    weaponId: id,
                    isNew: true,
                    currentLevel: 0,
                    isAdvanced: true
                });
            }
        }

        // All passives that can be upgraded
        const passiveIds = Object.keys(Player.passiveDefinitions);
        for (const id of passiveIds) {
            const level = Player.getPassiveLevel(id);
            if (level < Player.passiveDefinitions[id].maxLevel) {
                options.push({
                    type: 'passive',
                    passiveId: id,
                    isNew: level === 0,
                    currentLevel: level,
                    isAdvanced: true
                });
            }
        }

        if (options.length === 0) return [];

        return options;
    },

    /**
     * Generate normal upgrade options (original 3 weapons only)
     */
    _generateUpgradeOptions(count) {
        const advancedWeapons = ['vortexBlade', 'rocketBarrage', 'iceBall'];
        const weaponIds = Object.keys(Weapons.definitions);

        // Existing weapons that can be upgraded (exclude temp advanced)
        const upgradeable = Weapons.activeWeapons
            .filter(w => w.level < Weapons.definitions[w.id].maxLevel)
            .filter(w => !advancedWeapons.includes(w.id))
            .map(w => ({
                type: 'weapon',
                weaponId: w.id,
                isNew: false,
                currentLevel: w.level,
                rarityLabel: w.rarityLabel
            }));

        // New base weapons only
        const newWeapons = weaponIds
            .filter(id => !Weapons.activeWeapons.find(w => w.id === id))
            .filter(id => !advancedWeapons.includes(id))
            .filter(id => Weapons.definitions[id] && !Weapons.definitions[id].evolvedOnly)
            .filter(id => !Economy.isWeaponUnlocked || Economy.isWeaponUnlocked(id))
            .map(id => ({
                type: 'weapon',
                weaponId: id,
                isNew: true,
                currentLevel: 0
            }));

        const allOptions = [...upgradeable, ...newWeapons];
        this._shuffleArray(allOptions);

        const result = allOptions.slice(0, count);

        while (result.length < count && result.length > 0) {
            result.push({ ...result[0] });
        }

        return result;
    },

    _shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    },

    /**
     * Game Over
     */
    gameOver() {
        // Player dead — trigger Last Breath if active
        if (Player.lastBreath) {
            Particles.burstAt(Player.x, Player.y, '#ff2222', 40);
            Particles.burstAt(Player.x, Player.y, '#ffaa00', 25);
            // Damage all nearby enemies
            for (let i = Enemies.pool.active.length - 1; i >= 0; i--) {
                const e = Enemies.pool.active[i];
                const dx = e.x - Player.x;
                const dy = e.y - Player.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 200) {
                    const killed = Enemies.damageEnemy(e, 200);
                    if (killed) {
                        XPOrbs.spawnAt(e.x, e.y, e.xp);
                        GoldOrbs.trySpawn(e.x, e.y, e.gold);
                        this.kills++;
                        Enemies.pool.releaseActiveAt(i);
                    }
                }
            }
            Camera.triggerShake(15, 0.5);
        }
        this.state = 'GAMEOVER';
        Audio.playDeath();
        Audio.stopMusic();
        Camera.triggerShake(15, 0.4);
        UI.showGameOver();
    },

    /**
     * Resume from revive
     */
    resumeFromRevive() {
        this.state = 'PLAYING';
        const mapId = Maps.getSelected() ? Maps.getSelected().id : 'neonCity';
        Audio.startMusic(mapId);
    },

    /**
     * Show results screen
     */
    showResults() {
        this.state = 'RESULTS';
        Maps.recordRunProgress(this.gameTime, this.kills, this.bossKills);
        Maps.checkUnlocks();
        Economy.endRun(this.gameTime, this.kills, this.bossKills, Characters.selected);
        UI.showResults(this.gameTime, this.kills, Economy.gold);
    },

    /**
     * Count kills (called when an enemy dies)
     */
    addKill(enemy) {
        this.kills++;
        this.comboCount++;
        this.comboTimer = 2.4;
        if (this.comboCount % 5 === 0 && typeof Audio !== 'undefined' && Audio.playComboChime) {
            Audio.playComboChime(this.comboCount);
        }
        if (enemy && Enemies.TYPES[enemy.type] && Enemies.TYPES[enemy.type].isBoss) {
            this.bossKills++;
            this._applyHitstop(0.1, 0.22);
            Camera.triggerShake(18, 0.24);
            if (typeof Audio !== 'undefined' && Audio.playBossDeath) {
                Audio.playBossDeath();
            }
        }
        if (enemy && typeof Economy !== 'undefined' && Economy.recordEnemyKill) {
            Economy.recordEnemyKill(enemy);
        }
        // Vampirism passive: heal on kill
        if (Player.vampirism > 0) {
            Player.hp = Math.min(Player.maxHp, Player.hp + Player.vampirism);
        }
        // Character passive onKill
        if (enemy) Characters.onEnemyKill(enemy);

        // Level System kill kaydı
        if (typeof LevelSystem !== 'undefined') LevelSystem.onKill(enemy);
    },

    /**
     * Pause the game
     */
    pauseGame() {
        if (this.state !== 'PLAYING') return;
        this.state = 'PAUSED';
        Audio.stopMusic();
        UI.showPause();
    },

    /**
     * Resume from pause
     */
    resumeGame() {
        if (this.state !== 'PAUSED') return;
        this.state = 'PLAYING';
        this.lastTime = performance.now();
        const mapId = Maps.getSelected() ? Maps.getSelected().id : 'neonCity';
        Audio.startMusic(mapId);
        UI.hidePause();
    },

    /**
     * Return to main menu from pause
     */
    returnToMenu() {
        this.state = 'MENU';
        Audio.stopMusic();
        UI.hidePause();
        UI.hideResults();
        UI.hideGameOver();
        UI.hideLevelUp();
        UI.hideHUD();
        Enemies.clear();
        Particles.clear();
        XPOrbs.clear();
        Weapons.clear();
        if (typeof LevelSystem !== 'undefined') LevelSystem.reset();
        UI.showMenu();
    }
};

// ---- Boot ----
window.addEventListener('load', () => {
    Game.init();
});
