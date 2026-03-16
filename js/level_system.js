// ============================================================
// level_system.js — Wave/Level Progression System
// Adds level-based enemy waves on top of existing systems.
// Mevcut spawn, enemy, economy kodlarına dokunmaz.
// ============================================================

const LevelSystem = {
    // ---- State ----
    currentLevel: 1,
    totalEnemiesForLevel: 50,
    remainingEnemies: 50,
    enemiesSpawnedThisLevel: 0,
    active: false,
    levelComplete: false,
    _transitionTimer: 0,
    _transitionDuration: 2.5,   // Seviye arası bekleme süresi (saniye)
    _levelRewardGold: 0,

    // ---- Boss milestones ----
    // Her 5. seviyede boss çıkar. Boss sayısı = seviye / 5
    // Boss'lar remainingEnemies'e dahil
    _bossesForLevel: 0,
    _bossesSpawned: 0,
    _bossesKilled: 0,
    _bossPhaseActive: false,

    // ---- Config ----
    ENEMIES_PER_LEVEL_STEP: 50,  // Her seviyede eklenen düşman sayısı
    MAX_LEVEL: 100,
    BOSS_INTERVAL: 5,            // Her kaç seviyede boss çıkacak
    GOLD_PER_LEVEL_BASE: 25,     // Seviye başına temel altın ödülü
    GOLD_PER_LEVEL_SCALE: 10,    // Seviye × bu kadar ek altın

    // ============================================================
    // API
    // ============================================================

    /**
     * Yeni bir run başlatılınca çağrılır
     */
    start(startLevel) {
        this.currentLevel = startLevel || 1;
        this.active = true;
        this.levelComplete = false;
        this._transitionTimer = 0;
        this._bossPhaseActive = false;
        this._bossesSpawned = 0;
        this._bossesKilled = 0;
        this._setupLevel(this.currentLevel);
        this._updateHUD();
    },

    /**
     * Her frame çağrılır (Game.update içinden)
     */
    update(dt) {
        if (!this.active) return;

        // Seviye geçiş animasyonu
        if (this.levelComplete) {
            this._transitionTimer -= dt;
            if (this._transitionTimer <= 0) {
                this._advanceLevel();
            }
            return;
        }

        // Normal düşmanlar bitti mi kontrol et
        if (this.remainingEnemies <= 0 && !this._bossPhaseActive) {
            // Bu seviyede boss var mı?
            if (this._bossesForLevel > 0 && this._bossesKilled < this._bossesForLevel) {
                // Boss fazına geç
                this._bossPhaseActive = true;
                this._spawnLevelBosses();
            } else {
                // Seviye bitti!
                this._completeLevel();
            }
        }

        // Boss fazındayken: tüm boss'lar ölmüş mü?
        if (this._bossPhaseActive) {
            if (this._bossesKilled >= this._bossesForLevel) {
                this._bossPhaseActive = false;
                this._completeLevel();
            }
        }
    },

    /**
     * Düşman öldürülünce çağrılır (Game.addKill hook)
     */
    onKill(enemy) {
        if (!this.active || this.levelComplete) return;

        const isBoss = enemy && Enemies.TYPES[enemy.type] && Enemies.TYPES[enemy.type].isBoss;

        if (isBoss && this._bossPhaseActive) {
            this._bossesKilled++;
            // BossSystem tier ödülü
            if (typeof BossSystem !== 'undefined') BossSystem.onBossKill(enemy);
        } else if (!isBoss) {
            this.remainingEnemies = Math.max(0, this.remainingEnemies - 1);
        }

        this._updateHUD();
    },

    /**
     * Spawn sistemi bu fonksiyonu kontrol eder.
     * false dönerse enemy.js spawn yapmaz.
     */
    canSpawn() {
        if (!this.active) return true; // Sistem aktif değilse mevcut davranış
        if (this.levelComplete) return false;
        if (this._bossPhaseActive) return false; // Boss fazında normal spawn durur
        if (this.enemiesSpawnedThisLevel >= this.totalEnemiesForLevel) return false;
        return true;
    },

    /**
     * Bir wave'de spawn edilen düşman sayısını kaydet.
     * enemy.js _spawnWave'den çağrılır.
     */
    recordSpawn(count) {
        if (!this.active) return;
        this.enemiesSpawnedThisLevel += count;
    },

    /**
     * Cull/despawn olan düşmanlar kill sayılmaz ama hem spawn kotası
     * hem de kalan düşman sayısı düşürülür — yoksa seviye takılır.
     */
    onEnemyDespawn(count = 1) {
        if (!this.active || this.levelComplete) return;
        this.enemiesSpawnedThisLevel = Math.max(0, this.enemiesSpawnedThisLevel - count);
        this.remainingEnemies = Math.max(0, this.remainingEnemies - count);
    },

    // ============================================================
    // Internal
    // ============================================================

    _setupLevel(level) {
        this.totalEnemiesForLevel = level * this.ENEMIES_PER_LEVEL_STEP;
        this.remainingEnemies = this.totalEnemiesForLevel;
        this.enemiesSpawnedThisLevel = 0;
        this.levelComplete = false;
        this._bossPhaseActive = false;
        this._bossesSpawned = 0;
        this._bossesKilled = 0;
        this._bossList = null;

        // Boss milestone: her 5. seviyede
        if (level % this.BOSS_INTERVAL === 0) {
            // BossSystem varsa gelişmiş tier sistemi kullan
            if (typeof BossSystem !== 'undefined') {
                const mapId = this._getMapId();
                const result = BossSystem.getBossesForLevel(level, mapId);
                this._bossesForLevel = result.count;
                this._bossList = result.bosses;
            } else {
                this._bossesForLevel = Math.min(Math.floor(level / this.BOSS_INTERVAL), 6);
            }
        } else {
            this._bossesForLevel = 0;
        }

        this._levelRewardGold = this.GOLD_PER_LEVEL_BASE + (level * this.GOLD_PER_LEVEL_SCALE);
    },

    _getMapId() {
        const map = (typeof Maps !== 'undefined' && Maps.getSelected) ? Maps.getSelected() : null;
        return (map && map.id) ? map.id : 'neonCity';
    },

    _completeLevel() {
        this.levelComplete = true;
        this._transitionTimer = this._transitionDuration;

        // Ödül ver
        if (typeof Economy !== 'undefined') {
            Economy.addGold(this._levelRewardGold);
        }

        // Seviye tamamlanma UI göster
        this._showLevelCompleteUI();
        this._updateHUD();

        // Ses efekti
        if (typeof Audio !== 'undefined' && Audio.playComboChime) {
            Audio.playComboChime(10);
        }
    },

    _advanceLevel() {
        if (this.currentLevel >= this.MAX_LEVEL) {
            // 100. seviye tamamlandı — oyun kazanıldı
            this._showVictoryUI();
            this.active = false;
            return;
        }

        this.currentLevel++;
        this._setupLevel(this.currentLevel);
        this._hideLevelCompleteUI();
        this._updateHUD();

        // Mevcut düşmanları temizle (yeni seviye temiz başlasın)
        if (typeof Enemies !== 'undefined' && Enemies.clear) {
            Enemies.clear();
        }
    },

    _spawnLevelBosses() {
        if (typeof Enemies === 'undefined') return;

        const mapId = this._getMapId();
        const playerX = (typeof Player !== 'undefined') ? Player.x : 0;
        const playerY = (typeof Player !== 'undefined') ? Player.y : 0;

        // BossSystem varsa gelişmiş spawn, yoksa eski mantık
        if (typeof BossSystem !== 'undefined' && this._bossList && this._bossList.length > 0) {
            this._spawnTieredBosses(playerX, playerY);
        } else {
            this._spawnLegacyBosses(mapId, playerX, playerY);
        }

        // Ses efekti
        if (typeof Audio !== 'undefined' && Audio.playBossWarning) {
            Audio.playBossWarning();
        }
    },

    /** BossSystem tier'li boss spawn */
    _spawnTieredBosses(playerX, playerY) {
        const bossList = this._bossList;
        const bossCount = bossList.length;

        for (let i = 0; i < bossCount; i++) {
            const entry = bossList[i];
            const angle = (Math.PI * 2 / bossCount) * i + Math.random() * 0.5;
            const dist = 600;
            const sx = playerX + Math.cos(angle) * dist;
            const sy = playerY + Math.sin(angle) * dist;

            const boss = Enemies.pool.get(sx, sy, entry.type);
            if (boss) {
                BossSystem.applyTier(boss, entry.tier, this.currentLevel);
                Enemies.activeBoss = boss;
                Enemies._spawnBossHands(boss);
            }
        }

        // Tier bazlı uyarı mesajı
        const bossLabel = BossSystem.getWarningLabel(bossList);
        if (typeof UI !== 'undefined' && UI.showBossWarning) {
            UI.showBossWarning(bossLabel);
        }
    },

    /** Eski boss spawn mantığı (BossSystem yoksa fallback) */
    _spawnLegacyBosses(mapId, playerX, playerY) {
        const bossSet = Enemies.MAP_BOSSES[mapId] || Enemies.MAP_BOSSES.neonCity;
        const bossCount = this._bossesForLevel;

        for (let i = 0; i < bossCount; i++) {
            const bossType = (i % 2 === 0) ? bossSet.mini : bossSet.mega;
            const angle = (Math.PI * 2 / bossCount) * i + Math.random() * 0.5;
            const dist = 600;
            const sx = playerX + Math.cos(angle) * dist;
            const sy = playerY + Math.sin(angle) * dist;

            const hpScale = 1 + (this.currentLevel * 0.15);
            const boss = Enemies.pool.get(sx, sy, bossType);
            if (boss) {
                boss.hp = Math.floor(boss.hp * hpScale);
                boss.maxHp = boss.hp;
                Enemies.activeBoss = boss;
                Enemies._spawnBossHands(boss);
            }
        }

        const bossLabel = bossCount > 1 ? `⚠️ ${bossCount} BOSS GELİYOR!` : '⚠️ BOSS GELİYOR!';
        if (typeof UI !== 'undefined' && UI.showBossWarning) {
            UI.showBossWarning(bossLabel);
        }
    },

    // ============================================================
    // HUD
    // ============================================================

    _updateHUD() {
        const el = document.getElementById('level-hud');
        if (!el) return;

        const levelText = el.querySelector('.level-hud-level');
        const remainText = el.querySelector('.level-hud-remain');
        const bar = el.querySelector('.level-hud-bar-fill');

        if (levelText) levelText.textContent = `⚔️ SEVİYE ${this.currentLevel}`;

        if (this._bossPhaseActive) {
            if (remainText) remainText.textContent = `👹 Boss: ${this._bossesKilled} / ${this._bossesForLevel}`;
            if (bar) bar.style.width = `${(this._bossesKilled / this._bossesForLevel) * 100}%`;
        } else {
            const killed = this.totalEnemiesForLevel - this.remainingEnemies;
            if (remainText) remainText.textContent = `💀 ${killed} / ${this.totalEnemiesForLevel}`;
            if (bar) {
                bar.style.width = `${(killed / this.totalEnemiesForLevel) * 100}%`;
            }
        }

        el.style.display = this.active ? 'flex' : 'none';
    },

    _showLevelCompleteUI() {
        const overlay = document.getElementById('level-complete-overlay');
        if (!overlay) return;

        const bossBonus = this._bossesForLevel > 0 ? ` + 👹 ${this._bossesForLevel} Boss` : '';
        overlay.innerHTML = `
            <div class="level-complete-box">
                <div class="level-complete-title">✅ SEVİYE ${this.currentLevel}</div>
                <div class="level-complete-subtitle">TAMAMLANDI!${bossBonus}</div>
                <div class="level-complete-reward">💰 +${this._levelRewardGold} Altın</div>
                <div class="level-complete-next">⚡ Sonraki: ${this.currentLevel < this.MAX_LEVEL ? (this.currentLevel + 1) * this.ENEMIES_PER_LEVEL_STEP + ' düşman' : 'FİNAL!'}</div>
            </div>
        `;
        overlay.classList.add('visible');
    },

    _hideLevelCompleteUI() {
        const overlay = document.getElementById('level-complete-overlay');
        if (overlay) {
            overlay.classList.remove('visible');
            overlay.innerHTML = '';
        }
    },

    _showVictoryUI() {
        const overlay = document.getElementById('level-complete-overlay');
        if (!overlay) return;

        overlay.innerHTML = `
            <div class="level-complete-box victory">
                <div class="level-complete-title">🏆 TEBRİKLER!</div>
                <div class="level-complete-subtitle">100. SEVİYEYİ TAMAMLADIN!</div>
                <div class="level-complete-reward">Sen bir efsanesin.</div>
            </div>
        `;
        overlay.classList.add('visible');
    },

    /**
     * Sistem sıfırlama (menüye dönünce)
     */
    reset() {
        this.active = false;
        this.currentLevel = 1;
        this.levelComplete = false;
        this._transitionTimer = 0;
        this._bossPhaseActive = false;
        this._hideLevelCompleteUI();
        const el = document.getElementById('level-hud');
        if (el) el.style.display = 'none';
    }
};
