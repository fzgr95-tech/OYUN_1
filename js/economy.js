// ============================================================
// economy.js — Gold, Local Storage, Shop, Simulated Ads
// ============================================================

const Economy = {
    gold: 0,             // Gold earned this run
    totalGold: 0,        // Saved total gold
    highScore: 0,        // Best survival time
    totalKills: 0,
    totalBossKills: 0,
    totalGamesPlayed: 0,
    reviveUsed: false,    // Only 1 revive per run
    achievements: {},
    dailyQuest: null,
    weeklyQuest: null,
    characterMastery: {},
    runModifier: null,
    activeRunModifier: null,
    runGoldMultiplier: 1,
    enemyCollection: {},
    runNewDiscoveries: [],
    unlocks: {
        characters: {},
        weapons: {},
        maps: {}
    },
    characterUpgrades: {},

    // Character upgrade config
    CHAR_UPGRADE_MAX_LEVEL: 5,
    CHAR_UPGRADE_COSTS: [300, 600, 1200, 2000, 3500],
    CHAR_UPGRADE_BONUSES: {
        hp: 0.06,
        speed: 0.05,
        damage: 0.05
    },

    STORAGE_KEY: 'neonhorde_save',

    // ---- SHOP UPGRADES ----
    shopUpgrades: {
        maxHp: {
            name: 'Zırh Güçlendirme',
            description: 'Maksimum can +20',
            icon: '❤️',
            color: '#ff4488',
            baseCost: 50,
            costMultiplier: 1.56,
            maxLevel: 10,
            effect: 20,       // +20 HP per level
            stat: 'maxHp'
        },
        speed: {
            name: 'Hız İmplantı',
            description: 'Hareket hızı +15',
            icon: '⚡',
            color: '#00ffff',
            baseCost: 40,
            costMultiplier: 1.52,
            maxLevel: 8,
            effect: 15,       // +15 speed per level
            stat: 'speed'
        },
        magnetRadius: {
            name: 'Mıknatıs Modül',
            description: 'XP çekim alanı +30',
            icon: '🧲',
            color: '#00ff88',
            baseCost: 30,
            costMultiplier: 1.45,
            maxLevel: 8,
            effect: 30,       // +30px per level
            stat: 'magnetRadius'
        },
        armor: {
            name: 'Nano Kalkan',
            description: 'Hasar -%10 (kümülatif)',
            icon: '🛡️',
            color: '#8888ff',
            baseCost: 80,
            costMultiplier: 1.62,
            maxLevel: 5,
            effect: 0.10,     // 10% damage reduction per level
            stat: 'armor'
        },
        xpBoost: {
            name: 'XP Amplifikatör',
            description: 'Kazanılan XP +%15',
            icon: '💎',
            color: '#00ffcc',
            baseCost: 60,
            costMultiplier: 1.58,
            maxLevel: 5,
            effect: 0.15,     // 15% XP boost per level
            stat: 'xpBoost'
        },
        startWeapon: {
            name: 'Silah Antrenmanı',
            description: 'Başlangıç silahı +1 seviye',
            icon: '🔫',
            color: '#ffaa00',
            baseCost: 100,
            costMultiplier: 1.8,
            maxLevel: 3,
            effect: 1,
            stat: 'startWeaponLevel'
        }
    },

    // Purchased levels { upgradeId: level }
    purchasedLevels: {},

    init() {
        this.gold = 0;
        this.reviveUsed = false;
        this.load();
        this._initUnlockDefaults();
        this.save(); // Düzeltilen unlock'ları hemen kaydet
        this._updateAchievements(0, 0, 0);
        this._ensureDailyQuest();
        this._ensureWeeklyQuest();
        this._ensureRunModifier();
    },

    _getWeekKey() {
        const now = new Date();
        const utc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
        const day = utc.getUTCDay() || 7;
        utc.setUTCDate(utc.getUTCDate() + 4 - day);
        const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
        return `${utc.getUTCFullYear()}-W${weekNo}`;
    },

    _initUnlockDefaults() {
        // Sadece CIPHER ücretsiz — diğer tüm karakterler altınla satın alınır

        // Bir kerelik migration: debug/test'ten kalan sahte unlock'ları temizle
        if (!localStorage.getItem('_unlockResetV2')) {
            // Cipher dışındaki TÜM karakterleri kilitle
            const allChars = typeof Characters !== 'undefined' ? Object.keys(Characters.roster) : [];
            for (const charId of allChars) {
                if (charId !== 'cipher') {
                    delete this.unlocks.characters[charId];
                }
            }
            localStorage.setItem('_unlockResetV2', '1');
        }

        // Cipher her zaman açık
        this.unlocks.characters.cipher = true;

        const defaultWeapons = {
            neonLaser: true,
            plasmaOrbit: true,
            chainLightning: true,
            vortexBlade: true,
            rocketBarrage: true,
            iceBall: true,
            pulseCarbine: false,
            toxicBeam: false,
            quasarNeedle: false,
            droneHalo: false,
            thunderTotem: false,
            sawRing: false,
            meteorCore: false,
            shardLauncher: false,
            cryoNova: false,
            quantumLance: false,
            absoluteZero: false,
            apocalypseBarrage: false,
            tempestRelic: false,
            voidSaw: false,
            astralHalo: false
        };

        this.unlocks.weapons = { ...defaultWeapons, ...this.unlocks.weapons };
    },

    isCharacterUnlocked(id) {
        // Dev mode: all characters unlocked
        if (typeof UI !== 'undefined' && UI._devMode) return true;
        if (id === 'cipher') return true;
        return !!this.unlocks.characters[id];
    },

    buyCharacter(id) {
        const char = Characters.roster[id];
        if (!char || !char.cost) return false;
        if (this.isCharacterUnlocked(id)) return false;
        if (this.totalGold < char.cost) return false;
        this.totalGold -= char.cost;
        this._unlockCharacter(id);
        this.save();
        return true;
    },

    // ---- MAP UNLOCKS ----

    isMapUnlocked(mapId) {
        // Dev mode: all maps unlocked
        if (typeof UI !== 'undefined' && UI._devMode) return true;
        if (mapId === 'neonCity') return true; // Neon Şehir her zaman açık
        return !!this.unlocks.maps[mapId];
    },

    buyMap(mapId) {
        if (this.isMapUnlocked(mapId)) return false;
        const map = (typeof Maps !== 'undefined' && Maps.biomes) ? Maps.biomes[mapId] : null;
        if (!map) return false;
        const cost = map.cost || 0;
        if (this.totalGold < cost) return false;
        this.totalGold -= cost;
        if (!this.unlocks.maps) this.unlocks.maps = {};
        this.unlocks.maps[mapId] = true;
        this.save();
        return true;
    },

    // ---- CHARACTER UPGRADES ----

    getCharUpgradeLevel(charId, stat) {
        if (!this.characterUpgrades[charId]) return 0;
        return this.characterUpgrades[charId][stat] || 0;
    },

    getCharUpgradeCost(charId, stat) {
        const level = this.getCharUpgradeLevel(charId, stat);
        if (level >= this.CHAR_UPGRADE_MAX_LEVEL) return Infinity;
        return this.CHAR_UPGRADE_COSTS[level];
    },

    purchaseCharUpgrade(charId, stat) {
        if (!['hp', 'speed', 'damage'].includes(stat)) return false;
        if (!this.isCharacterUnlocked(charId)) return false;
        const level = this.getCharUpgradeLevel(charId, stat);
        if (level >= this.CHAR_UPGRADE_MAX_LEVEL) return false;
        const cost = this.CHAR_UPGRADE_COSTS[level];
        if (this.totalGold < cost) return false;
        this.totalGold -= cost;
        if (!this.characterUpgrades[charId]) {
            this.characterUpgrades[charId] = { hp: 0, speed: 0, damage: 0 };
        }
        this.characterUpgrades[charId][stat] = level + 1;
        this.save();
        return true;
    },

    getCharStatWithUpgrade(charId, stat) {
        const char = Characters.roster[charId];
        if (!char) return 1;
        const base = char.stats[stat] || 1;
        const level = this.getCharUpgradeLevel(charId, stat);
        const bonus = this.CHAR_UPGRADE_BONUSES[stat] || 0;
        return base + (level * bonus);
    },

    isWeaponUnlocked(id) {
        // Dev mode: all weapons unlocked
        if (typeof UI !== 'undefined' && UI._devMode) return true;
        return !!this.unlocks.weapons[id];
    },

    _unlockCharacter(id) {
        if (!this.unlocks.characters[id]) {
            this.unlocks.characters[id] = true;
        }
    },

    _unlockWeapon(id) {
        if (!this.unlocks.weapons[id]) {
            this.unlocks.weapons[id] = true;
        }
    },

    _ensureDailyQuest() {
        const today = new Date();
        const key = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        if (this.dailyQuest && this.dailyQuest.dayKey === key) return;

        const questPool = [
            { id: 'killDaily', text: 'Bugün 120 düşman öldür', target: 120, type: 'kills', reward: 90 },
            { id: 'surviveDaily', text: 'Bugün 6 dakika hayatta kal', target: 360, type: 'time', reward: 110 },
            { id: 'bossDaily', text: 'Bugün 2 boss kes', target: 2, type: 'boss', reward: 140 }
        ];
        const pick = questPool[Math.floor(Math.random() * questPool.length)];
        this.dailyQuest = {
            dayKey: key,
            id: pick.id,
            text: pick.text,
            type: pick.type,
            target: pick.target,
            progress: 0,
            reward: pick.reward,
            claimed: false
        };
    },

    _ensureWeeklyQuest() {
        const weekKey = this._getWeekKey();
        if (this.weeklyQuest && this.weeklyQuest.weekKey === weekKey) return;

        const questPool = [
            { id: 'weeklyKills', text: 'Bu hafta 600 düşman öldür', target: 600, type: 'kills', reward: 420 },
            { id: 'weeklySurvive', text: 'Bu hafta toplam 30 dakika hayatta kal', target: 1800, type: 'time', reward: 460 },
            { id: 'weeklyBoss', text: 'Bu hafta 8 boss kes', target: 8, type: 'boss', reward: 520 },
            { id: 'weeklyRuns', text: 'Bu hafta 12 run tamamla', target: 12, type: 'games', reward: 380 },
            { id: 'weeklyGold', text: 'Bu hafta runlardan 2500 gold topla', target: 2500, type: 'runGold', reward: 500 }
        ];

        const pick = questPool[Math.floor(Math.random() * questPool.length)];
        this.weeklyQuest = {
            weekKey,
            id: pick.id,
            text: pick.text,
            type: pick.type,
            target: pick.target,
            progress: 0,
            reward: pick.reward,
            claimed: false
        };
    },

    _ensureRunModifier() {
        const today = new Date();
        const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        if (this.runModifier && this.runModifier.dayKey === dayKey) return;

        const pool = [
            {
                id: 'surge',
                text: 'Düşman hızı +%20, spawn temposu +%12, gold +%55',
                enemySpeedMultiplier: 1.2,
                spawnRateMultiplier: 1.12,
                playerHpMultiplier: 1,
                playerSpeedMultiplier: 1,
                bossDamageMultiplier: 1,
                goldMultiplier: 1.55
            },
            {
                id: 'glassCannon',
                text: 'Maks HP -%15, hareket +%8, gold +%65',
                enemySpeedMultiplier: 1,
                spawnRateMultiplier: 1,
                playerHpMultiplier: 0.85,
                playerSpeedMultiplier: 1.08,
                bossDamageMultiplier: 1,
                goldMultiplier: 1.65
            },
            {
                id: 'storm',
                text: 'Boss hasarı +%18, düşman hızı +%10, gold +%50',
                enemySpeedMultiplier: 1.1,
                spawnRateMultiplier: 1,
                playerHpMultiplier: 1,
                playerSpeedMultiplier: 1,
                bossDamageMultiplier: 1.18,
                goldMultiplier: 1.5
            }
        ];

        const pick = pool[Math.floor(Math.random() * pool.length)];
        this.runModifier = { ...pick, dayKey };
    },

    getRunModifier() {
        this._ensureRunModifier();
        return this.runModifier;
    },

    startRunWithModifier() {
        const mod = this.getRunModifier();
        this.activeRunModifier = mod;
        this.runGoldMultiplier = (mod && mod.goldMultiplier) ? mod.goldMultiplier : 1;
        this.runNewDiscoveries = [];
        return mod;
    },

    _ensureCollectionEntry(typeId) {
        if (!typeId) return null;
        if (!this.enemyCollection[typeId]) {
            const def = (typeof Enemies !== 'undefined' && Enemies.TYPES) ? Enemies.TYPES[typeId] : null;
            this.enemyCollection[typeId] = {
                type: typeId,
                name: def && def.name ? def.name : typeId,
                discovered: false,
                kills: 0,
                isBoss: !!(def && def.isBoss)
            };
        }
        return this.enemyCollection[typeId];
    },

    recordEnemyKill(enemy) {
        if (!enemy || !enemy.type) return;
        const entry = this._ensureCollectionEntry(enemy.type);
        if (!entry) return;

        entry.kills += 1;
        if (!entry.discovered) {
            entry.discovered = true;
            entry.discoveredAtRun = this.totalGamesPlayed + 1;
            if (!this.runNewDiscoveries.includes(enemy.type)) {
                this.runNewDiscoveries.push(enemy.type);
            }
        }
    },

    getCollectionSummary() {
        const totalTypes = (typeof Enemies !== 'undefined' && Enemies.TYPES)
            ? Object.keys(Enemies.TYPES).length
            : Object.keys(this.enemyCollection).length;
        const discovered = Object.values(this.enemyCollection).filter(e => e.discovered).length;
        return {
            discovered,
            total: Math.max(1, totalTypes)
        };
    },

    getNewDiscoveryNames() {
        if (!this.runNewDiscoveries || this.runNewDiscoveries.length === 0) return [];
        const names = [];
        for (const typeId of this.runNewDiscoveries) {
            const entry = this.enemyCollection[typeId];
            if (entry && entry.name) names.push(entry.name);
        }
        return names;
    },

    /**
     * Get the current cost for an upgrade
     */
    getUpgradeCost(upgradeId) {
        const upgrade = this.shopUpgrades[upgradeId];
        const level = this.purchasedLevels[upgradeId] || 0;
        let cost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, level);

        if (level < 3) {
            cost *= 0.8;
        } else if (level >= 6) {
            cost *= Math.pow(1.12, level - 5);
        }

        return Math.floor(cost);
    },

    /**
     * Get the current level of an upgrade
     */
    getUpgradeLevel(upgradeId) {
        return this.purchasedLevels[upgradeId] || 0;
    },

    /**
     * Purchase an upgrade, returns true if successful
     */
    purchaseUpgrade(upgradeId) {
        const upgrade = this.shopUpgrades[upgradeId];
        const currentLevel = this.getUpgradeLevel(upgradeId);

        if (currentLevel >= upgrade.maxLevel) return false;

        const cost = this.getUpgradeCost(upgradeId);
        if (this.totalGold < cost) return false;

        this.totalGold -= cost;
        this.purchasedLevels[upgradeId] = currentLevel + 1;
        this.save();
        return true;
    },

    /**
     * Apply purchased upgrades to player stats
     * Called at the start of each game
     */
    applyUpgradesToPlayer() {
        const hpLevel = this.getUpgradeLevel('maxHp');
        const speedLevel = this.getUpgradeLevel('speed');
        const magnetLevel = this.getUpgradeLevel('magnetRadius');
        const armorLevel = this.getUpgradeLevel('armor');
        const xpLevel = this.getUpgradeLevel('xpBoost');

        Player.maxHp = 100 + hpLevel * 20;
        Player.hp = Player.maxHp;
        Player.speed = 200 + speedLevel * 15;
        Player.magnetRadius = 100 + magnetLevel * 30;
        Player.armor = armorLevel * 0.10;     // 0 to 0.5  (damage reduction)
        Player.xpMultiplier = 1 + xpLevel * 0.15;
    },

    /**
     * Get starting weapon level from shop
     */
    getStartWeaponLevel() {
        return this.getUpgradeLevel('startWeapon');
    },

    /**
     * Add gold earned during the run
     */
    addGold(amount) {
        const mult = this.runGoldMultiplier || 1;
        this.gold += Math.max(1, Math.floor(amount * mult));
    },

    /**
     * Save to Local Storage
     */
    save() {
        const data = {
            totalGold: this.totalGold,
            highScore: this.highScore,
            totalKills: this.totalKills,
            totalBossKills: this.totalBossKills,
            totalGamesPlayed: this.totalGamesPlayed,
            purchasedLevels: this.purchasedLevels,
            achievements: this.achievements,
            dailyQuest: this.dailyQuest,
            weeklyQuest: this.weeklyQuest,
            characterMastery: this.characterMastery,
            runModifier: this.runModifier,
            enemyCollection: this.enemyCollection,
            unlocks: this.unlocks,
            characterUpgrades: this.characterUpgrades,
            selectedCharacter: (typeof Characters !== 'undefined') ? Characters.selected : 'cipher',
            selectedMap: (typeof Maps !== 'undefined') ? Maps.selected : 'neonCity'
        };
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            // Quota exceeded — try clearing old data and retry once
            if (e.name === 'QuotaExceededError' || e.code === 22) {
                try {
                    localStorage.removeItem(this.STORAGE_KEY);
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                } catch (e2) {
                    console.warn('LocalStorage save failed (quota):', e2);
                }
            } else {
                console.warn('LocalStorage save failed:', e);
            }
        }
    },

    /**
     * Load from Local Storage
     */
    load() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const data = JSON.parse(raw);
                this.totalGold = data.totalGold || 0;
                this.highScore = data.highScore || 0;
                this.totalKills = data.totalKills || 0;
                this.totalBossKills = data.totalBossKills || 0;
                this.totalGamesPlayed = data.totalGamesPlayed || 0;
                this.purchasedLevels = data.purchasedLevels || {};
                this.achievements = data.achievements || {};
                this.dailyQuest = data.dailyQuest || null;
                this.weeklyQuest = data.weeklyQuest || null;
                this.characterMastery = data.characterMastery || {};
                this.runModifier = data.runModifier || null;
                this.enemyCollection = data.enemyCollection || {};
                this.unlocks = data.unlocks || { characters: {}, weapons: {}, maps: {} };
                if (!this.unlocks.maps) this.unlocks.maps = {};
                this.characterUpgrades = data.characterUpgrades || {};

                // Restore character and map selection
                if (data.selectedCharacter && typeof Characters !== 'undefined') {
                    if (Characters.roster && Characters.roster[data.selectedCharacter]) {
                        Characters.selected = data.selectedCharacter;
                    }
                }
                // Reset to cipher if selected character is locked
                if (typeof Characters !== 'undefined' && !this.isCharacterUnlocked(Characters.selected)) {
                    Characters.selected = 'cipher';
                }
                if (data.selectedMap && typeof Maps !== 'undefined') {
                    if (Maps.biomes && Maps.biomes[data.selectedMap]) {
                        Maps.selected = data.selectedMap;
                    }
                }
            }
        } catch (e) {
            console.warn('LocalStorage load failed:', e);
        }

        this._ensureDailyQuest();
        this._ensureWeeklyQuest();
        this._ensureRunModifier();
    },

    /**
     * End run — finalize gold and stats
     * @param {number} survivalTime - seconds survived
     * @param {number} kills - enemies killed this run
     */
    endRun(survivalTime, kills, bossKills = 0, selectedChar = 'cipher') {
        this.totalGold += this.gold;
        this.totalKills += kills;
        this.totalBossKills += bossKills;
        this.totalGamesPlayed++;
        if (survivalTime > this.highScore) {
            this.highScore = survivalTime;
        }

        this._updateQuestProgress(survivalTime, kills, bossKills);
        this._updateAchievements(survivalTime, kills, bossKills);
        this._updateUnlocks(survivalTime, kills, bossKills, selectedChar);
        this._updateMastery(selectedChar, survivalTime, kills, bossKills);

        this.save();
    },

    _ensureMasteryEntry(charId) {
        if (!charId) charId = 'cipher';
        if (!this.characterMastery[charId]) {
            this.characterMastery[charId] = {
                xp: 0,
                level: 0,
                totalKills: 0,
                totalRuns: 0
            };
        }
        return this.characterMastery[charId];
    },

    _getMasteryXpForLevel(level) {
        return 120 + level * 90;
    },

    _updateMastery(charId, survivalTime, kills, bossKills) {
        const entry = this._ensureMasteryEntry(charId);
        entry.totalKills += kills;
        entry.totalRuns += 1;

        const gainedXp = Math.floor(kills * 0.35 + survivalTime * 0.12 + bossKills * 25);
        entry.xp += Math.max(5, gainedXp);

        while (entry.level < 25) {
            const need = this._getMasteryXpForLevel(entry.level);
            if (entry.xp < need) break;
            entry.xp -= need;
            entry.level += 1;
        }
    },

    getMastery(charId) {
        const entry = this._ensureMasteryEntry(charId);
        const need = this._getMasteryXpForLevel(entry.level);
        return {
            level: entry.level,
            xp: entry.xp,
            nextXp: need,
            totalKills: entry.totalKills,
            totalRuns: entry.totalRuns
        };
    },

    getMasteryBonus(charId) {
        const mastery = this.getMastery(charId);
        const level = mastery.level;
        return {
            damageMultiplier: 1 + Math.min(0.12, level * 0.006),
            speedMultiplier: 1 + Math.min(0.08, level * 0.004),
            magnetMultiplier: 1 + Math.min(0.1, level * 0.005)
        };
    },

    _updateQuestProgress(survivalTime, kills, bossKills) {
        this._ensureDailyQuest();
        this._ensureWeeklyQuest();

        const runGold = this.gold;

        if (this.dailyQuest && !this.dailyQuest.claimed) {
            this._accumulateQuestProgress(this.dailyQuest, survivalTime, kills, bossKills, runGold);
        }

        if (this.weeklyQuest && !this.weeklyQuest.claimed) {
            this._accumulateQuestProgress(this.weeklyQuest, survivalTime, kills, bossKills, runGold);
        }
    },

    _accumulateQuestProgress(quest, survivalTime, kills, bossKills, runGold) {
        if (!quest) return;

        if (quest.type === 'kills') {
            quest.progress += kills;
        } else if (quest.type === 'time') {
            quest.progress += survivalTime;
        } else if (quest.type === 'boss') {
            quest.progress += bossKills;
        } else if (quest.type === 'games') {
            quest.progress += 1;
        } else if (quest.type === 'runGold') {
            quest.progress += runGold;
        }

        if (quest.progress >= quest.target) {
            quest.progress = quest.target;
            if (!quest.claimed) {
                quest.claimed = true;
                this.totalGold += quest.reward;
            }
        }
    },

    _ensureAchievement(id, title, target, value, reward) {
        if (!this.achievements[id]) {
            this.achievements[id] = { title, target, progress: 0, unlocked: false, reward, rewarded: false };
        }
        const a = this.achievements[id];
        a.title = title;
        a.target = target;
        a.reward = reward;
        a.progress = Math.max(a.progress, Math.min(target, value));
        if (!a.unlocked && a.progress >= target) {
            a.unlocked = true;
            if (!a.rewarded) {
                this.totalGold += reward;
                a.rewarded = true;
            }
        }
    },

    _updateAchievements(survivalTime, kills, bossKills) {
        const weaponUnlockedCount = Object.values(this.unlocks.weapons || {}).filter(Boolean).length;
        const characterUnlockedCount = Object.values(this.unlocks.characters || {}).filter(Boolean).length;
        const purchasedUpgradeLevels = Object.values(this.purchasedLevels || {}).reduce((sum, level) => sum + (level || 0), 0);

        const defs = [
            { id: 'kill_20', title: 'İlk Kan', target: 20, value: this.totalKills, reward: 80 },
            { id: 'kill_100', title: 'Sokak Temizleyici', target: 100, value: this.totalKills, reward: 110 },
            { id: 'kill_250', title: 'Avcı', target: 250, value: this.totalKills, reward: 145 },
            { id: 'kill_500', title: 'Kasırga', target: 500, value: this.totalKills, reward: 190 },
            { id: 'kill_1000', title: 'Slayer', target: 1000, value: this.totalKills, reward: 260 },

            { id: 'survive_180', title: '3 Dakika Duvarı', target: 180, value: this.highScore, reward: 120 },
            { id: 'survive_300', title: '5 Dakika Operatörü', target: 300, value: this.highScore, reward: 150 },
            { id: 'survive_480', title: '8 Dakika Dayanıklılık', target: 480, value: this.highScore, reward: 200 },
            { id: 'survive_720', title: '12 Dakika Efsanesi', target: 720, value: this.highScore, reward: 260 },
            { id: 'survive_900', title: 'Survivor', target: 900, value: this.highScore, reward: 320 },

            { id: 'boss_1', title: 'Boss Tadı', target: 1, value: this.totalBossKills, reward: 120 },
            { id: 'boss_5', title: 'Boss Avcısı I', target: 5, value: this.totalBossKills, reward: 170 },
            { id: 'boss_12', title: 'Boss Avcısı II', target: 12, value: this.totalBossKills, reward: 230 },
            { id: 'boss_20', title: 'Boss Avcısı III', target: 20, value: this.totalBossKills, reward: 300 },

            { id: 'run_5', title: 'Sahaya Dönüş', target: 5, value: this.totalGamesPlayed, reward: 100 },
            { id: 'run_15', title: 'Daimi Pilot', target: 15, value: this.totalGamesPlayed, reward: 160 },

            { id: 'gold_1000', title: 'Biriktirici', target: 1000, value: this.totalGold, reward: 150 },
            { id: 'gold_5000', title: 'Neon Banker', target: 5000, value: this.totalGold, reward: 260 },

            { id: 'weapon_unlock_10', title: 'Arsenal Kurucu', target: 10, value: weaponUnlockedCount, reward: 180 },
            { id: 'char_upgrade_10', title: 'Operasyon Genişliyor', target: 10, value: characterUnlockedCount + purchasedUpgradeLevels, reward: 210 }
        ];

        for (const def of defs) {
            this._ensureAchievement(def.id, def.title, def.target, def.value, def.reward);
        }
    },

    _updateUnlocks(survivalTime, kills, bossKills, selectedChar) {
        // Karakterler SADECE altınla satın alınarak açılır — otomatik açılma yok

        // Silah unlock'ları (koşul bazlı devam ediyor)
        if (this.totalKills >= 80) this._unlockWeapon('pulseCarbine');
        if (this.totalKills >= 140) this._unlockWeapon('droneHalo');
        if (this.totalKills >= 220) this._unlockWeapon('thunderTotem');
        if (this.highScore >= 300) this._unlockWeapon('meteorCore');
        if (this.totalKills >= 320) this._unlockWeapon('sawRing');
        if (bossKills >= 1 || this.highScore >= 360) this._unlockWeapon('shardLauncher');
        if (this.totalKills >= 500) this._unlockWeapon('toxicBeam');
        if (this.totalGamesPlayed >= 12) this._unlockWeapon('quasarNeedle');
        if (this.highScore >= 540) this._unlockWeapon('cryoNova');
    },

    getMetaSummary() {
        this._ensureDailyQuest();
        this._ensureWeeklyQuest();
        this._ensureRunModifier();
        const achList = Object.values(this.achievements);
        const unlocked = achList.filter(a => a.unlocked).length;
        const total = achList.length;
        const daily = this.dailyQuest;
        const weekly = this.weeklyQuest;
        const modifier = this.runModifier;
        const selectedCharId = (typeof Characters !== 'undefined' && Characters.selected) ? Characters.selected : 'cipher';
        const mastery = this.getMastery(selectedCharId);
        const collection = this.getCollectionSummary();
        const questTextParts = [];
        if (daily) {
            questTextParts.push(`📌 Günlük: ${daily.text} (${daily.progress}/${daily.target})`);
        }
        if (weekly) {
            questTextParts.push(`🗓️ Haftalık: ${weekly.text} (${weekly.progress}/${weekly.target})`);
        }
        return {
            achievementsText: `🏅 Başarım: ${unlocked}/${total}`,
            questText: questTextParts.join('<br>'),
            masteryText: `🧠 Mastery ${selectedCharId.toUpperCase()}: Lv${mastery.level} (${mastery.xp}/${mastery.nextXp})`,
            modifierText: modifier ? `🎲 Bugünün Modifier: ${modifier.text}` : '',
            statsText: `📊 Toplam: ${this.totalGamesPlayed} run • ${this.totalKills} kill • ${this.totalBossKills} boss`,
            collectionText: `📚 Ansiklopedi: ${collection.discovered}/${collection.total}`
        };
    },

    /**
     * Double the gold earned this run (simulated ad)
     */
    doubleGold() {
        const bonus = this.gold; // Already added once
        this.totalGold += bonus;
        this.gold *= 2;
        this.save();
    },

    /**
     * Format gold number with commas
     */
    formatGold(amount) {
        return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
};
