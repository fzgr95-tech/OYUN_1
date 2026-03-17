// ============================================================
// ui.js — HUD, Level-Up Cards, Game Over, Menus
// ============================================================

const UI = {
    // DOM elements (populated in init)
    els: {},
    levelUpCards: [],
    currentUpgradeOptions: [],
    _weaponIconsKey: '',
    _powerupTimersKey: '',
    _tutorialStage: 0,
    _tutorialEnabled: false,
    _tutorialCompleted: false,
    _tutorialStageTimer: 0,
    _tutorialLastGameTime: 0,
    _shopTab: 'upgrades',
    _hudCache: {
        hpWidth: '',
        hpColor: '',
        hpText: '',
        xpWidth: '',
        xpText: '',
        levelText: '',
        timerText: '',
        killsText: '',
        killsColor: '',
        killsShadow: '',
        killsBg: '',
        killsBorder: '',
        comboActive: false,
        goldText: '',
        fpsText: '',
        dashText: '',
        dashOpacity: ''
    },
    _fpsHudLastSampleTime: 0,
    TUTORIAL_STORAGE_KEY: 'neonhorde_tutorial_done',
    ACCESS_STORAGE_KEY: 'neonhorde_access_settings',
    DEV_MODE_KEY: 'neonhorde_dev_mode',
    _devMode: false,
    _access: {
        highContrast: false,
        hudLarge: false
    },

    init() {
        try {
        this.els = {
            hud: document.getElementById('hud'),
            hpBar: document.getElementById('hp-bar-fill'),
            hpText: document.getElementById('hp-text'),
            xpBar: document.getElementById('xp-bar-fill'),
            xpText: document.getElementById('xp-text'),
            levelText: document.getElementById('level-text'),
            timerText: document.getElementById('timer-text'),
            killsText: document.getElementById('kills-text'),
            goldText: document.getElementById('gold-text'),
            fpsText: document.getElementById('fps-text'),
            weaponIcons: document.getElementById('weapon-icons'),

            // Screens
            menuScreen: document.getElementById('menu-screen'),
            levelUpScreen: document.getElementById('levelup-screen'),
            cardContainer: document.getElementById('card-container'),
            gameOverScreen: document.getElementById('gameover-screen'),
            resultsScreen: document.getElementById('results-screen'),
            adScreen: document.getElementById('ad-screen'),

            // Menu
            startBtn: document.getElementById('start-btn'),
            menuGoldText: document.getElementById('menu-gold'),
            menuHighScoreText: document.getElementById('menu-highscore'),

            // Game Over
            goReviveBtn: document.getElementById('go-revive-btn'),
            goEndBtn: document.getElementById('go-end-btn'),

            // Results
            resultTime: document.getElementById('result-time'),
            resultKills: document.getElementById('result-kills'),
            resultGold: document.getElementById('result-gold'),
            resultTotalGold: document.getElementById('result-total-gold'),
            doubleGoldBtn: document.getElementById('double-gold-btn'),
            resultRestartBtn: document.getElementById('result-restart-btn'),
            resultMenuBtn: document.getElementById('result-menu-btn'),

            // Audio toggle
            muteBtn: document.getElementById('mute-btn'),

            // Shop
            shopBtn: document.getElementById('shop-btn'),
            shopScreen: document.getElementById('shop-screen'),
            shopGrid: document.getElementById('shop-grid'),
            shopGold: document.getElementById('shop-gold'),
            shopBackBtn: document.getElementById('shop-back-btn'),
            shopCharGrid: document.getElementById('shop-char-grid'),
            shopMapGrid: document.getElementById('shop-map-grid'),
            shopTabUpgrades: document.getElementById('shop-tab-upgrades'),
            shopTabCharacters: document.getElementById('shop-tab-characters'),
            shopTabMaps: document.getElementById('shop-tab-maps'),
            shopPanelUpgrades: document.getElementById('shop-panel-upgrades'),
            shopPanelCharacters: document.getElementById('shop-panel-characters'),
            shopPanelMaps: document.getElementById('shop-panel-maps'),

            // Pause
            dashBtn: document.getElementById('dash-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            pauseScreen: document.getElementById('pause-screen'),
            resumeBtn: document.getElementById('resume-btn'),
            pauseMenuBtn: document.getElementById('pause-menu-btn'),
            qualityToggleBtn: document.getElementById('quality-toggle-btn'),
            bloomToggleBtn: document.getElementById('bloom-toggle-btn'),
            crtToggleBtn: document.getElementById('crt-toggle-btn'),
            chromaticToggleBtn: document.getElementById('chromatic-toggle-btn'),
            contrastToggleBtn: document.getElementById('contrast-toggle-btn'),
            hudsizeToggleBtn: document.getElementById('hudsize-toggle-btn'),

            // Boss
            bossWarning: document.getElementById('boss-warning'),
            bossHPContainer: document.getElementById('boss-hp-container'),
            bossName: document.getElementById('boss-name'),
            bossHPFill: document.getElementById('boss-hp-fill'),

            // Powerup Timers
            powerupTimers: document.getElementById('powerup-timers'),

            // Tutorial
            tutorialOverlay: document.getElementById('tutorial-overlay'),

            // Character Select
            charSelectScreen: document.getElementById('charselect-screen'),
            charGrid: document.getElementById('char-grid'),
            charStartBtn: document.getElementById('char-start-btn'),
            charBackBtn: document.getElementById('char-back-btn'),

            // Map Select
            mapSelectScreen: document.getElementById('mapselect-screen'),
            mapGrid: document.getElementById('map-grid'),
            mapSubtitle: document.querySelector('.mapselect-subtitle'),
            mapStartBtn: document.getElementById('map-start-btn'),
            mapBackBtn: document.getElementById('map-back-btn'),

            // Quest Panel
            questBtn: document.getElementById('quest-btn'),
            questPanel: document.getElementById('quest-panel'),
            questPanelBody: document.getElementById('quest-panel-body'),
            questPanelClose: document.getElementById('quest-panel-close'),

            // Dev Mode
            devModeBtn: document.getElementById('dev-mode-btn')
        };

        // Check critical elements
        const criticalEls = ['startBtn', 'menuScreen', 'charStartBtn', 'charBackBtn', 'mapStartBtn', 'mapBackBtn'];
        for (const name of criticalEls) {
            if (!this.els[name]) {
                console.error('[UI] Critical element missing: ' + name);
            }
        }

        // Helper function for safe event binding
        const safeOn = (el, event, handler) => {
            if (el) el.addEventListener(event, handler);
            else console.warn('[UI] Element not found for event binding');
        };

        // Menu start button → start game immediately
        safeOn(this.els.startBtn, 'click', () => {
            console.log('[UI] Start button clicked!');
            Audio.init();
            Audio.resume();
            Game.startGame();
        });

        // Character select buttons
        safeOn(this.els.charStartBtn, 'click', () => {
            this.hideCharSelect();
            this.showMapSelect();
        });

        safeOn(this.els.charBackBtn, 'click', () => {
            this.hideCharSelect();
            this.showMenu();
        });

        // Map select buttons
        safeOn(this.els.mapStartBtn, 'click', () => {
            const selectedMap = Maps.getSelected();
            if (!selectedMap) return;
            Game.startGame();
        });

        safeOn(this.els.mapBackBtn, 'click', () => {
            this.hideMapSelect();
            this.showCharSelect();
        });

        // Quest panel buttons
        safeOn(this.els.questBtn, 'click', () => {
            this.showQuestPanel();
        });

        safeOn(this.els.questPanelClose, 'click', () => {
            this.hideQuestPanel();
        });

        // Dev mode toggle
        safeOn(this.els.devModeBtn, 'click', () => {
            this._devMode = !this._devMode;
            this._updateDevModeBtn();
            this._saveDevMode();
            console.log('[UI] Dev mode:', this._devMode ? 'ON' : 'OFF');
        });

        // Game over buttons
        safeOn(this.els.goReviveBtn, 'click', () => {
            if (Economy.reviveUsed) return;
            Economy.reviveUsed = true;
            Player.revive(0.5);
            this.hideGameOver();
            Game.resumeFromRevive();
        });

        safeOn(this.els.goEndBtn, 'click', () => {
            this.hideGameOver();
            Game.showResults();
        });

        // Results buttons
        safeOn(this.els.doubleGoldBtn, 'click', () => {
            Economy.doubleGold();
            this.els.resultGold.textContent = Economy.formatGold(Economy.gold);
            this.els.resultTotalGold.textContent = Economy.formatGold(Economy.totalGold);
            this.els.doubleGoldBtn.style.display = 'none';
        });

        safeOn(this.els.resultRestartBtn, 'click', () => {
            this.hideResults();
            Game.resetAndStart();
        });

        safeOn(this.els.resultMenuBtn, 'click', () => {
            Game.returnToMenu();
        });

        // Mute toggle
        safeOn(this.els.muteBtn, 'click', () => {
            Audio.toggleMute();
            this.els.muteBtn.textContent = Audio.muted ? '🔇' : '🔊';
        });

        // Shop buttons
        safeOn(this.els.shopBtn, 'click', () => {
            Audio.init();
            Audio.resume();
            this.hideMenu();
            this.showShop();
        });

        safeOn(this.els.shopBackBtn, 'click', () => {
            this.hideShop();
            this.showMenu();
        });

        safeOn(this.els.shopTabUpgrades, 'click', () => this.showShopTab('upgrades'));
        safeOn(this.els.shopTabCharacters, 'click', () => this.showShopTab('characters'));
        safeOn(this.els.shopTabMaps, 'click', () => this.showShopTab('maps'));

        // Pause buttons
        safeOn(this.els.dashBtn, 'click', () => {
            if (typeof Input !== 'undefined' && Input.requestDash) {
                Input.requestDash();
            }
        });

        safeOn(this.els.pauseBtn, 'click', () => {
            Game.pauseGame();
        });

        safeOn(this.els.resumeBtn, 'click', () => {
            Game.resumeGame();
        });

        safeOn(this.els.pauseMenuBtn, 'click', () => {
            Game.returnToMenu();
        });

        safeOn(this.els.qualityToggleBtn, 'click', () => {
            if (typeof Renderer === 'undefined' || !Renderer.toggleQualityPreset) return;
            Renderer.toggleQualityPreset();
            this._syncPostFXButtons();
        });

        safeOn(this.els.bloomToggleBtn, 'click', () => {
            if (typeof Renderer === 'undefined') return;
            Renderer.setBloomEnabled(!Renderer.bloomEnabled);
            this._syncPostFXButtons();
        });

        safeOn(this.els.crtToggleBtn, 'click', () => {
            if (typeof Renderer === 'undefined') return;
            Renderer.setCRTEnabled(!Renderer.crtEnabled);
            this._syncPostFXButtons();
        });

        safeOn(this.els.chromaticToggleBtn, 'click', () => {
            if (typeof Renderer === 'undefined') return;
            Renderer.setChromaticEnabled(!Renderer.chromaticEnabled);
            this._syncPostFXButtons();
        });

        safeOn(this.els.contrastToggleBtn, 'click', () => {
            this._access.highContrast = !this._access.highContrast;
            this._applyAccessibility();
            this._saveAccessibility();
            this._syncPostFXButtons();
        });

        safeOn(this.els.hudsizeToggleBtn, 'click', () => {
            this._access.hudLarge = !this._access.hudLarge;
            this._applyAccessibility();
            this._saveAccessibility();
            this._syncPostFXButtons();
        });

        this._loadDevMode();
        this._loadAccessibility();
        this._applyAccessibility();
        this._syncPostFXButtons();
        this._tutorialCompleted = this._isTutorialDone();
        console.log('[UI] init completed successfully');
        } catch (e) {
            console.error('[UI] init FAILED:', e);
            alert('UI başlatma hatası: ' + e.message + '\n\nLütfen F12 basıp Console sekmesine bakın.');
        }
    },

    _updateDevModeBtn() {
        if (!this.els.devModeBtn) return;
        const on = this._devMode;
        this.els.devModeBtn.innerHTML = `<span>🔧 GELİŞTİRİCİ MODU: ${on ? 'AÇIK' : 'KAPALI'}</span>`;
        this.els.devModeBtn.classList.toggle('active', on);
    },

    _saveDevMode() {
        try {
            localStorage.setItem(this.DEV_MODE_KEY, this._devMode ? '1' : '0');
        } catch (e) {}
    },

    _loadDevMode() {
        try {
            const val = localStorage.getItem(this.DEV_MODE_KEY);
            this._devMode = val === '1';
        } catch (e) {
            this._devMode = false;
        }
        this._updateDevModeBtn();
    },

    _loadAccessibility() {
        try {
            const raw = localStorage.getItem(this.ACCESS_STORAGE_KEY);
            if (!raw) return;
            const data = JSON.parse(raw);
            this._access.highContrast = !!data.highContrast;
            this._access.hudLarge = !!data.hudLarge;
        } catch (e) {
        }
    },

    _saveAccessibility() {
        try {
            localStorage.setItem(this.ACCESS_STORAGE_KEY, JSON.stringify(this._access));
        } catch (e) {
        }
    },

    _applyAccessibility() {
        if (typeof document === 'undefined' || !document.body) return;
        document.body.classList.toggle('access-contrast', !!this._access.highContrast);
        document.body.classList.toggle('hud-large', !!this._access.hudLarge);
    },

    _syncPostFXButtons() {
        if (typeof Renderer === 'undefined') return;

        if (this.els.bloomToggleBtn) {
            this.els.bloomToggleBtn.innerHTML = `<span>BLOOM: ${Renderer.bloomEnabled ? 'AÇIK' : 'KAPALI'}</span>`;
            this.els.bloomToggleBtn.classList.toggle('off', !Renderer.bloomEnabled);
        }

        if (this.els.qualityToggleBtn) {
            const isHigh = Renderer.qualityPreset !== 'low';
            this.els.qualityToggleBtn.innerHTML = `<span>QUALITY: ${isHigh ? 'HIGH' : 'LOW'}</span>`;
            this.els.qualityToggleBtn.classList.toggle('off', !isHigh);
        }

        if (this.els.crtToggleBtn) {
            this.els.crtToggleBtn.innerHTML = `<span>CRT: ${Renderer.crtEnabled ? 'AÇIK' : 'KAPALI'}</span>`;
            this.els.crtToggleBtn.classList.toggle('off', !Renderer.crtEnabled);
        }

        if (this.els.chromaticToggleBtn) {
            this.els.chromaticToggleBtn.innerHTML = `<span>CHROMATIC: ${Renderer.chromaticEnabled ? 'AÇIK' : 'KAPALI'}</span>`;
            this.els.chromaticToggleBtn.classList.toggle('off', !Renderer.chromaticEnabled);
        }

        if (this.els.contrastToggleBtn) {
            this.els.contrastToggleBtn.innerHTML = `<span>KONTRAST: ${this._access.highContrast ? 'YÜKSEK' : 'NORMAL'}</span>`;
            this.els.contrastToggleBtn.classList.toggle('off', !this._access.highContrast);
        }

        if (this.els.hudsizeToggleBtn) {
            this.els.hudsizeToggleBtn.innerHTML = `<span>HUD BOYUT: ${this._access.hudLarge ? 'BÜYÜK' : 'NORMAL'}</span>`;
            this.els.hudsizeToggleBtn.classList.toggle('off', !this._access.hudLarge);
        }
    },

    _isTutorialDone() {
        try {
            return localStorage.getItem(this.TUTORIAL_STORAGE_KEY) === '1';
        } catch (e) {
            return false;
        }
    },

    _setTutorialDone() {
        this._tutorialCompleted = true;
        try {
            localStorage.setItem(this.TUTORIAL_STORAGE_KEY, '1');
        } catch (e) {
        }
    },

    startTutorial() {
        this._tutorialStage = 0;
        this._tutorialStageTimer = 0;
        this._tutorialLastGameTime = 0;
        this._tutorialEnabled = !this._tutorialCompleted;

        if (!this._tutorialEnabled && this.els.tutorialOverlay) {
            this.els.tutorialOverlay.classList.remove('visible');
            this.els.tutorialOverlay.textContent = '';
        }
    },

    _updateTutorial(gameTime, kills, level) {
        if (!this._tutorialEnabled || !this.els.tutorialOverlay) return;

        const dt = Math.max(0, gameTime - (this._tutorialLastGameTime || 0));
        this._tutorialLastGameTime = gameTime;
        this._tutorialStageTimer += dt;

        const dir = (typeof Input !== 'undefined' && Input.getDirection)
            ? Input.getDirection()
            : { magnitude: 0 };
        const moved = dir && dir.magnitude > 0.12;

        let text = '🕹️ Hareket et: joystick ile kaçın ve pozisyon al.';

        if (this._tutorialStage === 0) {
            text = '🕹️ Hareket et: joystick ile kaçın ve pozisyon al.';
            if (moved) {
                this._tutorialStage = 1;
                this._tutorialStageTimer = 0;
            }
        } else if (this._tutorialStage === 1) {
            text = '🎯 Silahlar otomatik ateş eder. İlk 3 düşmanı öldür.';
            if (kills >= 3) {
                this._tutorialStage = 2;
                this._tutorialStageTimer = 0;
            }
        } else if (this._tutorialStage === 2) {
            text = '💎 XP topla ve seviye atlayınca upgrade seç.';
            if (level >= 2) {
                this._tutorialStage = 3;
                this._tutorialStageTimer = 0;
            }
        } else {
            text = '✅ Harika! Hayatta kal, güçlen ve bossları indir.';
            if (this._tutorialStageTimer >= 4) {
                this._tutorialEnabled = false;
                this._setTutorialDone();
                this.els.tutorialOverlay.classList.remove('visible');
                this.els.tutorialOverlay.textContent = '';
                return;
            }
        }

        if (gameTime >= 30) {
            this._tutorialEnabled = false;
            this._setTutorialDone();
            this.els.tutorialOverlay.classList.remove('visible');
            this.els.tutorialOverlay.textContent = '';
            return;
        }

        this.els.tutorialOverlay.textContent = text;
        this.els.tutorialOverlay.classList.add('visible');
    },

    // ---- HUD Updates ----

    updateHUD(hp, maxHp, xp, xpToNext, level, time, kills, gold, combo = 0) {
        const cache = this._hudCache;

        // HP bar
        const hpPercent = (hp / maxHp) * 100;
        const hpWidth = hpPercent.toFixed(2) + '%';
        const hpColor = hpPercent > 50 ? '#00ff88' : hpPercent > 25 ? '#ffaa00' : '#ff0044';
        const hpText = `${hp} / ${maxHp}`;
        if (cache.hpWidth !== hpWidth) {
            cache.hpWidth = hpWidth;
            this.els.hpBar.style.width = hpWidth;
        }
        if (cache.hpColor !== hpColor) {
            cache.hpColor = hpColor;
            this.els.hpBar.style.backgroundColor = hpColor;
        }
        if (cache.hpText !== hpText) {
            cache.hpText = hpText;
            this.els.hpText.textContent = hpText;
        }

        // XP bar
        const xpPercent = (xp / xpToNext) * 100;
        const xpWidth = xpPercent.toFixed(2) + '%';
        const xpText = `${xp} / ${xpToNext}`;
        if (cache.xpWidth !== xpWidth) {
            cache.xpWidth = xpWidth;
            this.els.xpBar.style.width = xpWidth;
        }
        if (cache.xpText !== xpText) {
            cache.xpText = xpText;
            this.els.xpText.textContent = xpText;
        }

        // Level
        const levelText = `LV ${level}`;
        if (cache.levelText !== levelText) {
            cache.levelText = levelText;
            this.els.levelText.textContent = levelText;
        }

        // Timer
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        const timerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        if (cache.timerText !== timerText) {
            cache.timerText = timerText;
            this.els.timerText.textContent = timerText;
        }

        // Kills + combo
        if (combo >= 3) {
            const mult = Game && Game.getComboMultiplier ? Game.getComboMultiplier() : 1;
            const timerPct = Game && Game.comboTimer ? Math.max(0, (Game.comboTimer / (2.4 + (combo > 30 ? 0.6 : 0))) * 100) : 0;
            const color = mult >= 2.0 ? '#ff00ff' : mult >= 1.5 ? '#ffcc00' : mult >= 1.25 ? '#e0e0e0' : '#cd7f32';
            const killsText = `💀 ${kills} • x${combo} COMBO (${mult}x XP)`;
            const killsShadow = `0 0 10px ${color}`;
            const killsBg = `linear-gradient(90deg, ${color}33 ${timerPct}%, transparent ${timerPct}%)`;
            const killsBorder = `2px solid ${color}`;

            // Generate visual timer bar using background gradient
            if (cache.killsText !== killsText) {
                cache.killsText = killsText;
                this.els.killsText.textContent = killsText;
            }
            if (!cache.comboActive) {
                cache.comboActive = true;
                this.els.killsText.classList.add('combo-active');
            }
            if (cache.killsColor !== color) {
                cache.killsColor = color;
                this.els.killsText.style.color = color;
            }
            if (cache.killsShadow !== killsShadow) {
                cache.killsShadow = killsShadow;
                this.els.killsText.style.textShadow = killsShadow;
            }
            if (cache.killsBg !== killsBg) {
                cache.killsBg = killsBg;
                this.els.killsText.style.background = killsBg;
            }
            if (cache.killsBorder !== killsBorder) {
                cache.killsBorder = killsBorder;
                this.els.killsText.style.borderBottom = killsBorder;
            }
        } else {
            const killsText = `💀 ${kills}`;
            if (cache.killsText !== killsText) {
                cache.killsText = killsText;
                this.els.killsText.textContent = killsText;
            }
            if (cache.comboActive) {
                cache.comboActive = false;
                this.els.killsText.classList.remove('combo-active');
            }
            if (cache.killsColor !== '') {
                cache.killsColor = '';
                this.els.killsText.style.color = '';
            }
            if (cache.killsShadow !== '') {
                cache.killsShadow = '';
                this.els.killsText.style.textShadow = '';
            }
            if (cache.killsBg !== '') {
                cache.killsBg = '';
                this.els.killsText.style.background = '';
            }
            if (cache.killsBorder !== '') {
                cache.killsBorder = '';
                this.els.killsText.style.borderBottom = '';
            }
        }

        // Gold
        const goldText = `💰 ${Economy.formatGold(gold)}`;
        if (cache.goldText !== goldText) {
            cache.goldText = goldText;
            this.els.goldText.textContent = goldText;
        }

        if (this.els.fpsText && typeof Renderer !== 'undefined' && Renderer.getPerfMetrics) {
            if (time - (this._fpsHudLastSampleTime || 0) >= 0.25) {
                this._fpsHudLastSampleTime = time;
                const perf = Renderer.getPerfMetrics();
                const enemyCount = (typeof Enemies !== 'undefined' && Enemies.pool)
                    ? Enemies.pool.active.length
                    : 0;
                const fps = Math.max(0, Math.round(perf.fps || 0));
                const qualityLabel = perf.lowQuality ? 'LOW' : 'HIGH';
                const fpsText = `FPS ${fps} | E ${enemyCount} | ${qualityLabel}`;
                if (cache.fpsText !== fpsText) {
                    cache.fpsText = fpsText;
                    this.els.fpsText.textContent = fpsText;
                }
            }
        }

        if (this.els.dashBtn && typeof Player !== 'undefined') {
            const cd = Math.max(0, Player.dashCooldownTimer || 0);
            if (cd > 0) {
                const dashText = `${Math.ceil(cd)}`;
                if (cache.dashText !== dashText) {
                    cache.dashText = dashText;
                    this.els.dashBtn.textContent = dashText;
                }
                if (cache.dashOpacity !== '0.6') {
                    cache.dashOpacity = '0.6';
                    this.els.dashBtn.style.opacity = '0.6';
                }
            } else {
                if (cache.dashText !== '🌀') {
                    cache.dashText = '🌀';
                    this.els.dashBtn.textContent = '🌀';
                }
                if (cache.dashOpacity !== '1') {
                    cache.dashOpacity = '1';
                    this.els.dashBtn.style.opacity = '1';
                }
            }
        }

        this._updateTutorial(time, kills, level);
    },

    updateWeaponIcons(activeWeapons) {
        const nextKey = activeWeapons
            .map(w => `${w.id}:${w.level}:${w.rarityLabel || 'COMMON'}:${w.rarityColor || ''}`)
            .join('|');
        if (this._weaponIconsKey === nextKey) return;
        this._weaponIconsKey = nextKey;

        this.els.weaponIcons.innerHTML = '';
        for (const w of activeWeapons) {
            const def = Weapons.definitions[w.id];
            const div = document.createElement('div');
            div.className = 'weapon-icon';
            div.innerHTML = `
                <span class="weapon-icon-emoji">${def.icon}</span>
                <span class="weapon-level">Lv${w.level}</span>
                <span class="weapon-rarity" style="color:${w.rarityColor || def.color}">${(w.rarityLabel || 'COMMON').slice(0, 3)}</span>
            `;
            div.style.borderColor = w.rarityColor || def.color;
            div.style.boxShadow = `0 0 10px ${(w.rarityColor || def.color)}66`;
            this.els.weaponIcons.appendChild(div);
        }
    },

    // ---- Menu Screen ----

    showMenu() {
        this.els.menuScreen.classList.add('visible');
        this.els.menuGoldText.textContent = `💰 ${Economy.formatGold(Economy.totalGold)}`;
        const bestText = Economy.highScore > 0
            ? `🏆 Best: ${Math.floor(Economy.highScore / 60)}m ${Math.floor(Economy.highScore % 60)}s`
            : '🏆 Best: 0m 0s';
        this.els.menuHighScoreText.textContent = bestText;
    },

    hideMenu() {
        this.els.menuScreen.classList.remove('visible');
        this.hideQuestPanel();
    },

    // ---- Quest / Achievement Panel ----

    showQuestPanel() {
        let html = '';

        // Daily quest
        const q = Economy.dailyQuest;
        if (q) {
            const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
            const done = q.claimed;
            html += `<div class="meta-section">
                <div class="meta-label">📌 Günlük Görev ${done ? '<span style="color:#00ff88">✓ TAMAMLANDI</span>' : ''}</div>
                <div class="meta-quest-text">${q.text}</div>
                <div class="meta-bar"><div class="meta-bar-fill" style="width:${pct}%;background:${done ? '#00ff88' : '#ffcc00'}"></div></div>
                <div class="meta-bar-label">${q.progress} / ${q.target} ${done ? `• +${q.reward} 💰` : ''}</div>
            </div>`;
        }

        // Weekly quest
        const wq = Economy.weeklyQuest;
        if (wq) {
            const wpct = Math.min(100, Math.round((wq.progress / wq.target) * 100));
            const wdone = wq.claimed;
            html += `<div class="meta-section">
                <div class="meta-label">🗓️ Haftalık Görev ${wdone ? '<span style="color:#00ff88">✓ TAMAMLANDI</span>' : ''}</div>
                <div class="meta-quest-text">${wq.text}</div>
                <div class="meta-bar"><div class="meta-bar-fill" style="width:${wpct}%;background:${wdone ? '#00ff88' : '#66aaff'}"></div></div>
                <div class="meta-bar-label">${wq.progress} / ${wq.target} ${wdone ? `• +${wq.reward} 💰` : ''}</div>
            </div>`;
        }

        // Achievements
        const achList = Object.values(Economy.achievements);
        if (achList.length > 0) {
            html += '<div class="meta-section"><div class="meta-label">🏅 Başarımlar</div>';
            for (const a of achList) {
                html += `<div class="meta-ach">
                    <span class="meta-ach-name">${a.unlocked ? '✅' : '⬜'} ${a.title}</span>
                    <span class="meta-ach-prog">${a.progress}/${a.target}</span>
                </div>`;
            }
            html += '</div>';
        }

        // General stats
        html += `<div class="meta-section">
            <div class="meta-label">📊 Genel İstatistik</div>
            <div class="meta-quest-text">Toplam Run: ${Economy.totalGamesPlayed}</div>
            <div class="meta-quest-text">Toplam Kill: ${Economy.totalKills}</div>
            <div class="meta-quest-text">Toplam Boss: ${Economy.totalBossKills}</div>
        </div>`;

        // Enemy collection count
        const collectionKeys = Economy.enemyCollection ? Object.keys(Economy.enemyCollection) : [];
        if (collectionKeys.length > 0) {
            html += `<div class="meta-section">
                <div class="meta-label">📚 Ansiklopedi</div>
                <div class="meta-quest-text">${collectionKeys.length} farklı düşman keşfedildi</div>
            </div>`;
        }

        this.els.questPanelBody.innerHTML = html;
        this.els.questPanel.classList.add('visible');
    },

    hideQuestPanel() {
        this.els.questPanel.classList.remove('visible');
    },

    // ---- Level-Up Screen ----

    showLevelUp(options, advancedMode) {
        this.currentUpgradeOptions = options;
        this.els.levelUpScreen.classList.add('visible');
        this.els.cardContainer.innerHTML = '';

        // Update title for advanced mode
        const title = this.els.levelUpScreen.querySelector('.levelup-title');
        const subtitle = this.els.levelUpScreen.querySelector('.levelup-subtitle');
        if (advancedMode) {
            title.textContent = 'GELİŞMİŞ YETENEKLER!';
            title.style.color = '#ff8800';
            subtitle.textContent = 'Birini seç (kalıcı güçlendirme)';
            this.els.cardContainer.classList.add('advanced-grid');
        } else {
            title.textContent = 'SEVİYE ATLADIN!';
            title.style.color = '';
            subtitle.textContent = 'Bir yükseltme seç';
            this.els.cardContainer.classList.remove('advanced-grid');
        }

        options.forEach((opt, idx) => {
            const card = document.createElement('div');
            card.className = 'upgrade-card' + (advancedMode ? ' advanced-card' : '');
            card.style.animationDelay = `${idx * 0.05}s`;

            let icon, name, color, levelText, descText;

            if (opt.type === 'passive') {
                const def = Player.passiveDefinitions[opt.passiveId];
                icon = def.icon;
                name = def.name;
                color = def.color;
                levelText = opt.isNew ? 'YENİ!' : `Lv ${opt.currentLevel} → ${opt.currentLevel + 1}`;
                descText = opt.isNew ? def.description : def.upgrades[opt.currentLevel];
            } else {
                const def = Weapons.definitions[opt.weaponId];
                icon = def.icon;
                name = def.name;
                color = def.color;
                levelText = opt.isNew ? 'YENİ!' : `Lv ${opt.currentLevel} → ${opt.currentLevel + 1}`;
                descText = opt.isNew ? def.description : def.upgrades[opt.currentLevel - 1];
                if (opt.rarityLabel) {
                    levelText += ` • ${opt.rarityLabel}`;
                }
            }

            card.innerHTML = `
                <div class="card-icon" style="color:${color};text-shadow:0 0 20px ${color}">${icon}</div>
                <div class="card-name" style="color:${color}">${name}</div>
                <div class="card-level">${levelText}</div>
                <div class="card-desc">${descText}</div>
            `;

            card.addEventListener('click', () => {
                this.hideLevelUp();
                Game.selectUpgrade(opt);
            });

            this.els.cardContainer.appendChild(card);
        });
    },

    // ---- Powerup Timers ----

    updatePowerupTimers(powerups) {
        if (!this.els.powerupTimers) return;

        if (powerups.length === 0) {
            if (this._powerupTimersKey !== '') {
                this.els.powerupTimers.innerHTML = '';
                this._powerupTimersKey = '';
            }
            return;
        }

        const nextKey = powerups
            .map(p => {
                const id = p.type === 'weapon' ? p.weaponId : p.passiveId;
                const percent = Math.max(0, Math.round((p.timer / p.maxTimer) * 100));
                const secs = Math.ceil(p.timer);
                return `${p.type}:${id}:${percent}:${secs}`;
            })
            .join('|');

        if (this._powerupTimersKey === nextKey) return;
        this._powerupTimersKey = nextKey;

        let html = '';
        for (const p of powerups) {
            let name, icon, color;
            if (p.type === 'weapon') {
                const def = Weapons.definitions[p.weaponId];
                name = def.name;
                icon = def.icon;
                color = def.color;
            } else {
                const def = Player.passiveDefinitions[p.passiveId];
                name = def.name;
                icon = def.icon;
                color = def.color;
            }
            const percent = (p.timer / p.maxTimer) * 100;
            const secs = Math.ceil(p.timer);
            html += `
                <div class="powerup-timer-item">
                    <span class="pt-icon">${icon}</span>
                    <div class="pt-bar-bg">
                        <div class="pt-bar-fill" style="width:${percent}%;background:${color}"></div>
                    </div>
                    <span class="pt-time" style="color:${color}">${secs}s</span>
                </div>
            `;
        }
        this.els.powerupTimers.innerHTML = html;
    },

    hideLevelUp() {
        this.els.levelUpScreen.classList.remove('visible');
    },

    // ---- Game Over Screen ----

    showGameOver() {
        this.els.gameOverScreen.classList.add('visible');
        this.els.goReviveBtn.style.display = Economy.reviveUsed ? 'none' : 'flex';
    },

    hideGameOver() {
        this.els.gameOverScreen.classList.remove('visible');
    },

    // ---- Results Screen ----

    showResults(time, kills, gold) {
        this.els.resultsScreen.classList.add('visible');
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        this.els.resultTime.textContent = `${mins}m ${secs}s`;
        this.els.resultKills.textContent = kills;
        this.els.resultGold.textContent = Economy.formatGold(gold);
        this.els.resultTotalGold.textContent = Economy.formatGold(Economy.totalGold);
        this.els.doubleGoldBtn.style.display = 'flex';

        // Meta progress
        const metaEl = document.getElementById('result-meta');
        if (metaEl) {
            let html = '';

            // Daily quest
            const q = Economy.dailyQuest;
            if (q) {
                const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
                const done = q.claimed;
                html += `<div class="meta-section">
                    <div class="meta-label">📌 Günlük Görev ${done ? '<span style="color:#00ff88">✓ TAMAMLANDI</span>' : ''}</div>
                    <div class="meta-quest-text">${q.text}</div>
                    <div class="meta-bar"><div class="meta-bar-fill" style="width:${pct}%;background:${done ? '#00ff88' : '#ffcc00'}"></div></div>
                    <div class="meta-bar-label">${q.progress} / ${q.target} ${done ? `• +${q.reward} 💰` : ''}</div>
                </div>`;
            }

            const wq = Economy.weeklyQuest;
            if (wq) {
                const wpct = Math.min(100, Math.round((wq.progress / wq.target) * 100));
                const wdone = wq.claimed;
                html += `<div class="meta-section">
                    <div class="meta-label">🗓️ Haftalık Görev ${wdone ? '<span style="color:#00ff88">✓ TAMAMLANDI</span>' : ''}</div>
                    <div class="meta-quest-text">${wq.text}</div>
                    <div class="meta-bar"><div class="meta-bar-fill" style="width:${wpct}%;background:${wdone ? '#00ff88' : '#66aaff'}"></div></div>
                    <div class="meta-bar-label">${wq.progress} / ${wq.target} ${wdone ? `• +${wq.reward} 💰` : ''}</div>
                </div>`;
            }

            // Achievements
            const achList = Object.values(Economy.achievements);
            if (achList.length > 0) {
                html += '<div class="meta-section"><div class="meta-label">🏅 Başarımlar</div>';
                for (const a of achList) {
                    const pct = Math.min(100, Math.round((a.progress / a.target) * 100));
                    html += `<div class="meta-ach">
                        <span class="meta-ach-name">${a.unlocked ? '✅' : '⬜'} ${a.title}</span>
                        <span class="meta-ach-prog">${a.progress}/${a.target}</span>
                    </div>`;
                }
                html += '</div>';
            }

            html += `<div class="meta-section">
                <div class="meta-label">📊 Genel İstatistik</div>
                <div class="meta-quest-text">Toplam Run: ${Economy.totalGamesPlayed}</div>
                <div class="meta-quest-text">Toplam Kill: ${Economy.totalKills}</div>
                <div class="meta-quest-text">Toplam Boss: ${Economy.totalBossKills}</div>
            </div>`;

            const discoveries = Economy.getNewDiscoveryNames ? Economy.getNewDiscoveryNames() : [];
            if (discoveries.length > 0) {
                html += '<div class="meta-section"><div class="meta-label" style="color:#66d9ff">📚 Yeni Ansiklopedi Kaydı</div>';
                for (const name of discoveries) {
                    html += `<div class="meta-unlock">• ${name}</div>`;
                }
                html += '</div>';
            }

            // Map unlocks
            const newMaps = Maps.checkUnlocks ? Maps.checkUnlocks() : [];
            if (newMaps.length > 0) {
                html += '<div class="meta-section"><div class="meta-label" style="color:#ffcc00">🗺️ YENİ HARİTA AÇILDI!</div>';
                for (const mapId of newMaps) {
                    const map = Maps.biomes[mapId];
                    if (map) html += `<div class="meta-unlock">${map.icon} ${map.name}</div>`;
                }
                html += '</div>';
            }

            metaEl.innerHTML = html;
        }
    },

    hideResults() {
        this.els.resultsScreen.classList.remove('visible');
    },

    // ---- Utility ----

    showHUD() { this.els.hud.classList.add('visible'); },
    hideHUD() {
        this.els.hud.classList.remove('visible');
        if (this.els.tutorialOverlay) {
            this.els.tutorialOverlay.classList.remove('visible');
            this.els.tutorialOverlay.textContent = '';
        }
    },

    // ---- Boss UI ----

    showBossWarning(text) {
        this.els.bossWarning.textContent = text;
        this.els.bossWarning.classList.add('visible');
        // Show boss HP bar
        this.els.bossHPContainer.classList.add('visible');
        this.els.bossHPFill.style.width = '100%';
        // Auto-hide warning after 2s
        setTimeout(() => {
            this.els.bossWarning.classList.remove('visible');
        }, 2000);
    },

    updateBossHP(hp, maxHp, name) {
        const percent = Math.max(0, (hp / maxHp) * 100);
        this.els.bossHPFill.style.width = percent + '%';
        this.els.bossName.textContent = name;
    },

    hideBossHP() {
        this.els.bossHPContainer.classList.remove('visible');
        this.els.bossWarning.classList.remove('visible');
    },

    // ---- Pause Screen ----

    showPause() {
        this._syncPostFXButtons();
        this.els.pauseScreen.classList.add('visible');
    },

    hidePause() {
        this.els.pauseScreen.classList.remove('visible');
    },

    // ---- Shop Screen ----

    showShop() {
        this.els.shopScreen.classList.add('visible');
        this.showShopTab(this._shopTab || 'upgrades');
    },

    hideShop() {
        this.els.shopScreen.classList.remove('visible');
    },

    _renderShopItems() {
        this.els.shopGold.textContent = Economy.formatGold(Economy.totalGold);
        this.els.shopGrid.innerHTML = '';

        for (const [id, upgrade] of Object.entries(Economy.shopUpgrades)) {
            const level = Economy.getUpgradeLevel(id);
            const maxed = level >= upgrade.maxLevel;
            const cost = maxed ? 0 : Economy.getUpgradeCost(id);
            const canAfford = Economy.totalGold >= cost;

            const item = document.createElement('div');
            item.className = 'shop-item' + (maxed ? ' maxed' : '');

            const levelPercent = (level / upgrade.maxLevel) * 100;

            item.innerHTML = `
                <div class="shop-item-icon">${upgrade.icon}</div>
                <div class="shop-item-name" style="color:${upgrade.color}">${upgrade.name}</div>
                <div class="shop-item-desc">${upgrade.description}</div>
                <div class="shop-item-level-bar">
                    <div class="shop-item-level-fill" style="width:${levelPercent}%;background:${upgrade.color}"></div>
                </div>
                <div class="shop-item-cost ${!canAfford && !maxed ? 'cant-afford' : ''}">
                    ${maxed ? '✅ MAKSİMUM' : '💰 ' + Economy.formatGold(cost)}
                </div>
            `;

            if (!maxed) {
                item.addEventListener('click', () => {
                    if (Economy.purchaseUpgrade(id)) {
                        this._renderShopItems(); // Refresh
                    }
                });
            }

            this.els.shopGrid.appendChild(item);
        }
    },

    showShopTab(tabId) {
        const validTab = (tabId === 'characters' || tabId === 'maps') ? tabId : 'upgrades';
        this._shopTab = validTab;

        if (this.els.shopScreen && this.els.shopScreen.scrollTop > 0) {
            this.els.shopScreen.scrollTo({ top: 0, behavior: 'smooth' });
        }

        const tabs = [
            { btn: this.els.shopTabUpgrades, panel: this.els.shopPanelUpgrades, id: 'upgrades' },
            { btn: this.els.shopTabCharacters, panel: this.els.shopPanelCharacters, id: 'characters' },
            { btn: this.els.shopTabMaps, panel: this.els.shopPanelMaps, id: 'maps' }
        ];

        for (const tab of tabs) {
            const active = tab.id === validTab;
            if (tab.btn) {
                tab.btn.classList.toggle('active', active);
                tab.btn.setAttribute('aria-selected', active ? 'true' : 'false');
            }
            if (tab.panel) {
                tab.panel.classList.toggle('visible', active);
            }
        }

        if (validTab === 'upgrades') {
            this._renderShopItems();
        } else if (validTab === 'characters') {
            this._renderShopCharacters();
        } else if (validTab === 'maps') {
            this._renderShopMaps();
        }
    },

    _renderShopCharacters() {
        const grid = this.els.shopCharGrid;
        if (!grid) return;
        grid.innerHTML = '';

        for (const [id, char] of Object.entries(Characters.roster)) {
            const charStats = char.stats || {};
            const passiveName = char.passive && char.passive.name ? char.passive.name : 'Pasif yok';
            const charColor = char.color || '#00ffff';
            const unlocked = Economy.isCharacterUnlocked(id);
            const isSelected = Characters.selected === id;
            const cost = char.cost || 0;
            const canAfford = Economy.totalGold >= cost;

            // Get effective stats (base + upgrades)
            const hpEff = Economy.getCharStatWithUpgrade ? Economy.getCharStatWithUpgrade(id, 'hp') : (charStats.hp || 1);
            const spdEff = Economy.getCharStatWithUpgrade ? Economy.getCharStatWithUpgrade(id, 'speed') : (charStats.speed || 1);
            const dmgEff = Economy.getCharStatWithUpgrade ? Economy.getCharStatWithUpgrade(id, 'damage') : (charStats.damage || 1);

            const card = document.createElement('div');
            card.className = 'char-card' + (isSelected ? ' selected' : '') + (!unlocked ? ' locked' : '');
            card.style.borderColor = isSelected ? charColor : '';
            card.style.boxShadow = isSelected ? `0 0 20px ${charColor}40, inset 0 0 15px ${charColor}15` : '';

            const hpW = Math.min(100, Math.round(hpEff * 70));
            const spdW = Math.min(100, Math.round(spdEff * 70));
            const dmgW = Math.min(100, Math.round(dmgEff * 70));

            // Build upgrade buttons HTML for unlocked characters
            let upgradeHTML = '';
            if (unlocked) {
                const stats = ['hp', 'speed', 'damage'];
                const statLabels = { hp: '❤️ HP', speed: '⚡ HIZ', damage: '💥 DMG' };
                const maxLv = Economy.CHAR_UPGRADE_MAX_LEVEL || 5;
                upgradeHTML = '<div class="char-upgrades">';
                for (const stat of stats) {
                    const lv = Economy.getCharUpgradeLevel(id, stat);
                    const isMax = lv >= maxLv;
                    const upgCost = isMax ? 0 : Economy.getCharUpgradeCost(id, stat);
                    const canBuy = !isMax && Economy.totalGold >= upgCost;
                    const lvDots = Array.from({length: maxLv}, (_, i) => 
                        `<span class="upg-dot${i < lv ? ' filled' : ''}" style="background:${i < lv ? charColor : ''}"></span>`
                    ).join('');
                    upgradeHTML += `
                        <div class="char-upg-row">
                            <span class="char-upg-label">${statLabels[stat]}</span>
                            <span class="char-upg-dots">${lvDots}</span>
                            <button class="char-upg-btn${isMax ? ' maxed' : (canBuy ? '' : ' disabled')}" data-char="${id}" data-stat="${stat}">
                                ${isMax ? 'MAX' : `⬆ ${upgCost}🪙`}
                            </button>
                        </div>`;
                }
                upgradeHTML += '</div>';
            }

            card.innerHTML = `
                <div class="char-icon" style="color:${charColor};text-shadow:0 0 20px ${charColor}">
                    <img class="char-sprite" src="${char.spriteFile || 'assets/sprites/ufo.png'}" alt="${char.name || id}" style="filter:drop-shadow(0 0 8px ${charColor});${char.spriteRotationOffset ? `transform:rotate(${char.spriteRotationOffset * 180 / Math.PI}deg);` : ''}" onerror="this.src='assets/sprites/ufo.png'">
                </div>
                <div class="char-name" style="color:${charColor}">${char.name || id}</div>
                <div class="char-title">${char.title || ''}</div>
                <div class="char-stats">
                    <div class="char-stat-row">
                        <span>❤️ HP</span>
                        <div class="char-stat-bar"><div class="char-stat-fill" style="width:${hpW}%;background:${charColor}"></div></div>
                    </div>
                    <div class="char-stat-row">
                        <span>⚡ HIZ</span>
                        <div class="char-stat-bar"><div class="char-stat-fill" style="width:${spdW}%;background:${charColor}"></div></div>
                    </div>
                    <div class="char-stat-row">
                        <span>💥 DMG</span>
                        <div class="char-stat-bar"><div class="char-stat-fill" style="width:${dmgW}%;background:${charColor}"></div></div>
                    </div>
                </div>
                <div class="char-passive">${passiveName}</div>
                <div class="char-desc">${char.description || 'Açıklama yok'}</div>
                ${upgradeHTML}
                ${!unlocked ? `
                <div class="char-lock-overlay">
                    <span class="char-lock-icon">🔒</span>
                    <span class="char-lock-price">🪙 ${cost}</span>
                    <button class="char-buy-btn${canAfford ? '' : ' disabled'}">${canAfford ? 'Satın Al' : 'Yetersiz Altın'}</button>
                </div>` : ''}
            `;

            if (unlocked) {
                card.addEventListener('click', (e) => {
                    if (e.target.closest('.char-upg-btn')) return;
                    Characters.selected = id;
                    Economy.save();
                    this._renderShopCharacters();
                });
                // Upgrade button event listeners
                card.querySelectorAll('.char-upg-btn:not(.maxed):not(.disabled)').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const charId = btn.dataset.char;
                        const stat = btn.dataset.stat;
                        if (Economy.purchaseCharUpgrade(charId, stat)) {
                            this._renderShopCharacters();
                        }
                    });
                });
            } else {
                const buyBtn = card.querySelector('.char-buy-btn');
                if (buyBtn && canAfford) {
                    buyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (Economy.buyCharacter(id)) {
                            this._renderShopCharacters();
                        }
                    });
                }
            }

            grid.appendChild(card);
        }
    },

    _renderShopMaps() {
        if (Maps.loadUnlocks) Maps.loadUnlocks();
        const grid = this.els.shopMapGrid;
        if (!grid) return;
        grid.innerHTML = '';

        for (const [id, map] of Object.entries(Maps.biomes)) {
            const card = document.createElement('div');
            const isSelected = Maps.selected === id;
            const isUnlocked = Economy.isMapUnlocked(id);
            const cost = map.cost || 0;
            const canAfford = Economy.totalGold >= cost;

            card.className = 'map-card' + (isSelected ? ' selected' : '') + (!isUnlocked ? ' locked' : '');
            if (isSelected && isUnlocked) {
                card.style.borderColor = map.gridShadowColor;
                card.style.boxShadow = `0 0 20px ${map.gridShadowColor}40`;
            }

            const stars = '\u2B50'.repeat(map.difficulty) + '\u2606'.repeat(5 - map.difficulty);

            card.innerHTML = `
                <div class="map-preview" style="background:${map.previewGradient || map.bgColor}">
                    <div class="map-preview-glow" style="background:${map.gridShadowColor}33"></div>
                </div>
                <div class="map-icon">${map.icon}</div>
                <div class="map-name" style="color:${map.gridShadowColor}">${map.name}</div>
                <div class="map-difficulty">${stars}</div>
                <div class="map-desc">${map.description}</div>
                ${!isUnlocked
                    ? `<div class="map-open-tag" style="color:#ff4466">
                        \uD83D\uDD12 <span style="color:#ffcc00">\uD83E\uDE99 ${cost}</span>
                       </div>
                       <button class="char-buy-btn map-buy-btn" ${!canAfford ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''} data-map-id="${id}">
                        ${canAfford ? 'SATIN AL' : 'YETERSİZ ALTIN'}
                       </button>`
                    : `<div class="map-open-tag" style="color:${map.gridShadowColor}">A\u00c7IK \u2022 ${map.difficulty}. Zorluk</div>`
                }
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    Maps.selected = id;
                    Economy.save();
                    this._renderShopMaps();
                });
            } else {
                const buyBtn = card.querySelector('.map-buy-btn');
                if (buyBtn && canAfford) {
                    buyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (Economy.buyMap(id)) {
                            this._renderShopMaps();
                            this.updateGoldDisplay();
                        }
                    });
                }
            }

            grid.appendChild(card);
        }
    },

    hideAll() {
        this.hideMenu();
        this.hideLevelUp();
        this.hideGameOver();
        this.hideResults();
        this.hideHUD();
        this.hideShop();
        this.hidePause();
        this.hideCharSelect();
        this.hideMapSelect();
        this._weaponIconsKey = '';
        this._powerupTimersKey = '';
    },

    // ---- Character Select Screen ----

    showCharSelect() {
        if (!Characters.roster[Characters.selected]) {
            const fallback = Object.keys(Characters.roster)[0];
            Characters.selected = fallback || 'cipher';
        }
        this.els.charSelectScreen.classList.add('visible');
        this._renderCharGrid();
    },

    hideCharSelect() {
        if (this.els.charSelectScreen) {
            this.els.charSelectScreen.classList.remove('visible');
        }
    },

    _renderCharGrid() {
        const grid = this.els.charGrid;
        grid.innerHTML = '';

        for (const [id, char] of Object.entries(Characters.roster)) {
            const isUnlocked = Economy.isCharacterUnlocked(id);
            const charStats = char.stats || {};
            const hpValue = Number.isFinite(charStats.hp) ? charStats.hp : 1;
            const speedValue = Number.isFinite(charStats.speed) ? charStats.speed : 1;
            const damageValue = Number.isFinite(charStats.damage) ? charStats.damage : 1;
            const passiveName = char.passive && char.passive.name ? char.passive.name : 'Pasif yok';
            const charColor = char.color || '#00ffff';
            const cost = char.cost || 0;
            const canAfford = Economy.totalGold >= cost;
            const isSelected = Characters.selected === id;
            const card = document.createElement('div');
            card.className = 'char-card' + (isSelected ? ' selected' : '') + (!isUnlocked ? ' locked' : '');
            card.style.borderColor = isSelected ? charColor : '';
            card.style.boxShadow = isSelected ? `0 0 20px ${charColor}40, inset 0 0 15px ${charColor}15` : '';

            // Stat bars
            const hpW = Math.round(hpValue * 100);
            const spdW = Math.round(speedValue * 100);
            const dmgW = Math.round(damageValue * 100);

            card.innerHTML = `
                <div class="char-icon" style="color:${charColor};text-shadow:0 0 20px ${charColor}">
                    <img class="char-sprite" src="${char.spriteFile || 'assets/sprites/ufo.png'}" alt="${char.name || id}" style="filter:drop-shadow(0 0 8px ${charColor});${char.spriteRotationOffset ? `transform:rotate(${char.spriteRotationOffset * 180 / Math.PI}deg);` : ''}" onerror="this.src='assets/sprites/ufo.png'">
                </div>
                <div class="char-name" style="color:${charColor}">${char.name || id}</div>
                <div class="char-title">${char.title || ''}</div>
                <div class="char-stats">
                    <div class="char-stat-row">
                        <span>❤️ HP</span>
                        <div class="char-stat-bar"><div class="char-stat-fill" style="width:${hpW}%;background:${charColor}"></div></div>
                    </div>
                    <div class="char-stat-row">
                        <span>⚡ HIZ</span>
                        <div class="char-stat-bar"><div class="char-stat-fill" style="width:${spdW}%;background:${charColor}"></div></div>
                    </div>
                    <div class="char-stat-row">
                        <span>💥 DMG</span>
                        <div class="char-stat-bar"><div class="char-stat-fill" style="width:${dmgW}%;background:${charColor}"></div></div>
                    </div>
                </div>
                <div class="char-passive">${passiveName}</div>
                <div class="char-desc">${char.description || 'Açıklama yok'}</div>
                ${!isUnlocked ? `
                <div class="char-lock-overlay">
                    <span class="char-lock-icon">🔒</span>
                    <span class="char-lock-price">🪙 ${cost}</span>
                    <button class="char-buy-btn${canAfford ? '' : ' disabled'}">${canAfford ? 'Satın Al' : 'Yetersiz Altın'}</button>
                </div>` : ''}
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    Characters.selected = id;
                    Economy.save();
                    this._renderCharGrid();
                });
            } else {
                const buyBtn = card.querySelector('.char-buy-btn');
                if (buyBtn && canAfford) {
                    buyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (Economy.buyCharacter(id)) {
                            this._renderCharGrid();
                        }
                    });
                }
            }

            grid.appendChild(card);
        }

        if (this.els.charStartBtn) {
            const hasSelection = Economy.isCharacterUnlocked(Characters.selected);
            this.els.charStartBtn.disabled = !hasSelection;
            this.els.charStartBtn.style.opacity = hasSelection ? '1' : '0.5';
            this.els.charStartBtn.style.cursor = hasSelection ? 'pointer' : 'not-allowed';
        }
    },

    // ---- Map Select Screen ----

    showMapSelect() {
        Maps.loadUnlocks();
        if (!Maps.biomes[Maps.selected]) {
            const firstMap = Object.values(Maps.biomes)[0];
            Maps.selected = firstMap ? firstMap.id : 'neonCity';
        }
        this.els.mapSelectScreen.classList.add('visible');
        this._renderMapGrid();
    },

    hideMapSelect() {
        if (this.els.mapSelectScreen) {
            this.els.mapSelectScreen.classList.remove('visible');
        }
    },

    _renderMapGrid() {
        const grid = this.els.mapGrid;
        grid.innerHTML = '';

        for (const [id, map] of Object.entries(Maps.biomes)) {
            const card = document.createElement('div');
            const isSelected = Maps.selected === id;
            const isUnlocked = Economy.isMapUnlocked(id);
            const cost = map.cost || 0;
            const canAfford = Economy.totalGold >= cost;

            card.className = 'map-card' + (isSelected ? ' selected' : '') + (!isUnlocked ? ' locked' : '');
            if (isSelected && isUnlocked) {
                card.style.borderColor = map.gridShadowColor;
                card.style.boxShadow = `0 0 20px ${map.gridShadowColor}40`;
            }

            const stars = '\u2B50'.repeat(map.difficulty) + '\u2606'.repeat(5 - map.difficulty);

            card.innerHTML = `
                <div class="map-preview" style="background:${map.previewGradient || map.bgColor}">
                    <div class="map-preview-glow" style="background:${map.gridShadowColor}33"></div>
                </div>
                <div class="map-icon">${map.icon}</div>
                <div class="map-name" style="color:${map.gridShadowColor}">${map.name}</div>
                <div class="map-difficulty">${stars}</div>
                <div class="map-desc">${map.description}</div>
                ${!isUnlocked
                    ? `<div class="map-open-tag" style="color:#ff4466">
                        \uD83D\uDD12 <span style="color:#ffcc00">\uD83E\uDE99 ${cost}</span>
                       </div>
                       <button class="char-buy-btn map-buy-btn" ${!canAfford ? 'disabled style="opacity:0.5;cursor:not-allowed"' : ''} data-map-id="${id}">
                        ${canAfford ? 'SATIN AL' : 'YETERSİZ ALTIN'}
                       </button>`
                    : `<div class="map-open-tag" style="color:${map.gridShadowColor}">A\u00c7IK \u2022 ${map.difficulty}. Zorluk</div>`
                }
            `;

            if (isUnlocked) {
                card.addEventListener('click', () => {
                    Maps.selected = id;
                    Economy.save();
                    this._renderMapGrid();
                });
            } else {
                const buyBtn = card.querySelector('.map-buy-btn');
                if (buyBtn && canAfford) {
                    buyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (Economy.buyMap(id)) {
                            this._renderMapGrid();
                            this.updateGoldDisplay();
                        }
                    });
                }
            }

            grid.appendChild(card);
        }

        this._updateMapStartState();
    },

    _updateMapStartState() {
        const selectedMap = Maps.getSelected();
        const isUnlocked = selectedMap ? Economy.isMapUnlocked(Maps.selected) : false;
        const canStart = !!selectedMap && isUnlocked;

        this.els.mapStartBtn.disabled = !canStart;
        this.els.mapStartBtn.style.opacity = canStart ? '1' : '0.5';
        this.els.mapStartBtn.style.cursor = canStart ? 'pointer' : 'not-allowed';

        if (this.els.mapSubtitle) {
            if (!selectedMap) {
                this.els.mapSubtitle.textContent = 'Nereye düşmek istersin?';
            } else if (!isUnlocked) {
                this.els.mapSubtitle.textContent = `${selectedMap.name} — 🔒 Kilitli`;
            } else {
                this.els.mapSubtitle.textContent = `${selectedMap.name} seçildi • ${selectedMap.description}`;
            }
        }
    }
};
