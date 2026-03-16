// ============================================================
// boss_system.js — Enhanced Boss Tier & Progression System
// Mevcut düşman/boss sistemine dokunmaz, sadece üstüne ekler.
// Object.assign ile yeni boss tipleri ve davranışlar ekler.
// ============================================================

const BossSystem = {
    // ---- Tier Tanımları ----
    TIERS: {
        NORMAL:    { id: 'normal',    label: 'BOSS',      hpMult: 1.0, dmgMult: 1.0, sizeMult: 1.0, goldMult: 1,   xpMult: 1,   color: '#ff4444' },
        ELITE:     { id: 'elite',     label: 'ELİT BOSS', hpMult: 2.5, dmgMult: 1.5, sizeMult: 1.3, goldMult: 3,   xpMult: 2,   color: '#ff9900' },
        LEGENDARY: { id: 'legendary', label: 'EFSANE BOSS', hpMult: 5.0, dmgMult: 2.0, sizeMult: 1.6, goldMult: 6, xpMult: 4,   color: '#ff00ff' }
    },

    // ---- Harita Bazlı Boss Havuzu ----
    MAP_BOSS_TIERS: {
        neonCity:     { elite: 'NEON_WARLORD',       legendary: 'NEON_EMPEROR' },
        iceCave:      { elite: 'FROST_WARDEN',       legendary: 'CRYO_SOVEREIGN' },
        lavaFactory:  { elite: 'INFERNO_MARSHAL',    legendary: 'VOLCANIC_OVERLORD' },
        darkForest:   { elite: 'FOREST_ARCHON',      legendary: 'NATURE_COLOSSUS' },
        spaceStation: { elite: 'COSMIC_ADMIRAL',     legendary: 'GALACTIC_TITAN' }
    },

    // ============================================================
    // API — LevelSystem tarafından çağrılır
    // ============================================================

    /**
     * Seviye için boss listesi döndürür.
     * @param {number} level - Mevcut seviye
     * @param {string} mapId - Harita ID
     * @returns {{ bosses: Array<{type: string, tier: string}>, count: number }}
     */
    getBossesForLevel(level, mapId) {
        if (level % 5 !== 0) return { bosses: [], count: 0 };

        const mapBosses = Enemies.MAP_BOSSES[mapId] || Enemies.MAP_BOSSES.neonCity;
        const tierBosses = this.MAP_BOSS_TIERS[mapId] || this.MAP_BOSS_TIERS.neonCity;
        const bossList = [];

        if (level >= 30) {
            // Legendary tier: seviye 30+
            const legendaryCount = Math.min(3, Math.floor((level - 25) / 10) + 1);
            const eliteCount = Math.min(2, Math.floor((level - 25) / 15) + 1);
            const normalCount = Math.max(0, Math.min(1, 6 - legendaryCount - eliteCount));

            for (let i = 0; i < legendaryCount; i++) {
                bossList.push({ type: tierBosses.legendary, tier: 'LEGENDARY' });
            }
            for (let i = 0; i < eliteCount; i++) {
                bossList.push({ type: tierBosses.elite, tier: 'ELITE' });
            }
            for (let i = 0; i < normalCount; i++) {
                bossList.push({ type: (i % 2 === 0) ? mapBosses.mega : mapBosses.mini, tier: 'NORMAL' });
            }
        } else if (level >= 15) {
            // Elite tier: seviye 15-29
            const eliteCount = Math.min(4, Math.floor((level - 10) / 5) + 1);
            const normalCount = Math.max(0, Math.min(2, 6 - eliteCount));

            for (let i = 0; i < eliteCount; i++) {
                bossList.push({ type: tierBosses.elite, tier: 'ELITE' });
            }
            for (let i = 0; i < normalCount; i++) {
                bossList.push({ type: (i % 2 === 0) ? mapBosses.mega : mapBosses.mini, tier: 'NORMAL' });
            }
        } else {
            // Normal tier: seviye 5-14
            const count = Math.min(4, Math.floor(level / 5));
            for (let i = 0; i < count; i++) {
                const type = (i % 2 === 0) ? mapBosses.mini : mapBosses.mega;
                bossList.push({ type: type, tier: 'NORMAL' });
            }
        }

        // Max 6 boss
        const capped = bossList.slice(0, 6);
        return { bosses: capped, count: capped.length };
    },

    /**
     * Spawn edilen boss'a tier çarpanlarını uygula
     * @param {object} boss - pool'dan alınan boss entity
     * @param {string} tierKey - 'NORMAL' | 'ELITE' | 'LEGENDARY'
     * @param {number} level - Mevcut seviye
     */
    applyTier(boss, tierKey, level) {
        const tier = this.TIERS[tierKey] || this.TIERS.NORMAL;
        const levelScale = 1 + (level * 0.15);

        boss.hp = Math.floor(boss.hp * tier.hpMult * levelScale);
        boss.maxHp = boss.hp;
        boss.damage = Math.ceil(boss.damage * tier.dmgMult);
        boss.radius = Math.floor(boss.radius * tier.sizeMult);
        boss.gold = Math.ceil(boss.gold * tier.goldMult);
        boss.xp = Math.ceil(boss.xp * tier.xpMult);

        // Tier bilgisini boss'a ekle (ödül ve UI için)
        boss._bossTier = tierKey;
        boss._bossTierData = tier;
    },

    /**
     * Boss öldürüldüğünde ekstra ödül ver
     * @param {object} enemy - Öldürülen boss
     */
    onBossKill(enemy) {
        const tierKey = enemy._bossTier;
        if (!tierKey) return;

        const tier = this.TIERS[tierKey];
        if (!tier || tierKey === 'NORMAL') return;

        // Ekstra altın ödülü (gold zaten tier çarpanı ile artmış, ek bonus)
        const bonusGold = Math.floor(enemy.gold * 0.5);
        if (bonusGold > 0 && typeof Economy !== 'undefined') {
            Economy.addGold(bonusGold);
        }

        // Altın yağmuru efekti
        if (typeof GoldOrbs !== 'undefined' && GoldOrbs.spawn) {
            const orbCount = tierKey === 'LEGENDARY' ? 12 : 6;
            for (let i = 0; i < orbCount; i++) {
                const angle = (Math.PI * 2 / orbCount) * i;
                const dist = 30 + Math.random() * 40;
                GoldOrbs.spawn(
                    enemy.x + Math.cos(angle) * dist,
                    enemy.y + Math.sin(angle) * dist,
                    Math.ceil(bonusGold / orbCount)
                );
            }
        }

        // Ekran efektleri
        if (tierKey === 'LEGENDARY') {
            if (typeof Camera !== 'undefined') Camera.triggerShake(22, 0.35);
            if (typeof Particles !== 'undefined') Particles.burstAt(enemy.x, enemy.y, tier.color, 40);
        } else {
            if (typeof Camera !== 'undefined') Camera.triggerShake(14, 0.25);
            if (typeof Particles !== 'undefined') Particles.burstAt(enemy.x, enemy.y, tier.color, 25);
        }

        // Boss tier UI bildirimi
        const label = tierKey === 'LEGENDARY' ? '🏆 EFSANE BOSS YOK EDİLDİ!' : '⚔️ ELİT BOSS YOK EDİLDİ!';
        if (typeof UI !== 'undefined' && UI.showBossWarning) {
            UI.showBossWarning(label);
        }
    },

    /**
     * Boss spawn warning mesajı oluştur
     * @param {Array} bossList
     * @returns {string}
     */
    getWarningLabel(bossList) {
        const legendaryCount = bossList.filter(b => b.tier === 'LEGENDARY').length;
        const eliteCount = bossList.filter(b => b.tier === 'ELITE').length;
        const normalCount = bossList.filter(b => b.tier === 'NORMAL').length;

        const parts = [];
        if (legendaryCount > 0) parts.push(`👑 ${legendaryCount} Efsane`);
        if (eliteCount > 0) parts.push(`🔥 ${eliteCount} Elit`);
        if (normalCount > 0) parts.push(`⚔️ ${normalCount} Boss`);

        return `⚠️ ${parts.join(' + ')} GELİYOR!`;
    }
};

// ============================================================
// YENİ BOSS TİPLERİ — Object.assign ile Enemies.TYPES'a eklenir
// Mevcut tipler değiştirilmez.
// ============================================================

(function () {
    'use strict';

    if (typeof Enemies === 'undefined') return;

    // ---- ELİT BOSS TİPLERİ ----
    Object.assign(Enemies.TYPES, {

        // --- Neon City Elite ---
        NEON_WARLORD: {
            name: 'Neon Warlord', hp: 2400, speed: 48, radius: 52, color: '#ff20c0',
            sides: 9, xp: 55, gold: 180, damage: 34, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 5.0, duration: 0.5, speedMult: 3.5 },
                { id: 'novaPulse', interval: 4.8, radius: 190, damage: 22, color: '#ff20c0' },
                { id: 'summonWave', interval: 7.5, count: 4, summonType: 'NEON_BRUTE' },
                { id: 'shieldPhase', interval: 14.0, duration: 4.0 }
            ]
        },

        // --- Ice Cave Elite ---
        FROST_WARDEN: {
            name: 'Frost Warden', hp: 2600, speed: 44, radius: 54, color: '#40d4ff',
            sides: 9, xp: 58, gold: 190, damage: 36, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 5.5, radius: 210, damage: 20, color: '#40d4ff' },
                { id: 'gravityWell', interval: 6.5, radius: 250, pull: 160, damage: 12, color: '#40d4ff' },
                { id: 'summonWave', interval: 8.0, count: 4, summonType: 'ICE_GOLEM' },
                { id: 'shieldPhase', interval: 15.0, duration: 4.5 }
            ]
        },

        // --- Lava Factory Elite ---
        INFERNO_MARSHAL: {
            name: 'Inferno Marshal', hp: 2800, speed: 50, radius: 55, color: '#ff4400',
            sides: 9, xp: 60, gold: 200, damage: 38, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 4.5, duration: 0.55, speedMult: 3.8 },
                { id: 'novaPulse', interval: 4.5, radius: 200, damage: 24, color: '#ff4400' },
                { id: 'summonWave', interval: 7.0, count: 5, summonType: 'LAVA_SMELTER' },
                { id: 'multiDash', interval: 12.0, dashes: 3, dashDuration: 0.35, dashPause: 0.3, speedMult: 3.2 }
            ]
        },

        // --- Dark Forest Elite ---
        FOREST_ARCHON: {
            name: 'Forest Archon', hp: 2900, speed: 43, radius: 56, color: '#44dd33',
            sides: 9, xp: 62, gold: 210, damage: 36, isBoss: true,
            patterns: [
                { id: 'gravityWell', interval: 5.8, radius: 260, pull: 150, damage: 11, color: '#44dd33' },
                { id: 'summonWave', interval: 6.5, count: 5, summonType: 'SPORE_RUNNER' },
                { id: 'regenPulse', interval: 8.5, healRatio: 0.06 },
                { id: 'shieldPhase', interval: 16.0, duration: 5.0 }
            ]
        },

        // --- Space Station Elite ---
        COSMIC_ADMIRAL: {
            name: 'Cosmic Admiral', hp: 3000, speed: 52, radius: 55, color: '#9955ff',
            sides: 9, xp: 65, gold: 220, damage: 38, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 4.8, duration: 0.45, speedMult: 3.8 },
                { id: 'ringBurst', interval: 5.5, radius: 230, damage: 22, color: '#9955ff' },
                { id: 'summonWave', interval: 7.5, count: 5, summonType: 'PHASE_STINGER' },
                { id: 'multiDash', interval: 11.0, dashes: 3, dashDuration: 0.3, dashPause: 0.25, speedMult: 3.5 }
            ]
        },

        // ---- EFSANE (LEGENDARY) BOSS TİPLERİ ----

        // --- Neon City Legendary ---
        NEON_EMPEROR: {
            name: 'Neon Emperor', hp: 6000, speed: 40, radius: 72, color: '#ff0088',
            sides: 12, xp: 140, gold: 450, damage: 52, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 4.2, duration: 0.55, speedMult: 3.6 },
                { id: 'ringBurst', interval: 4.5, radius: 280, damage: 28, color: '#ff0088' },
                { id: 'summonWave', interval: 6.0, count: 6, summonType: 'NEON_BRUTE' },
                { id: 'shieldPhase', interval: 12.0, duration: 5.0 },
                { id: 'minionSurge', interval: 0, count: 8, summonType: 'NEON_RUSHER' }
            ]
        },

        // --- Ice Cave Legendary ---
        CRYO_SOVEREIGN: {
            name: 'Cryo Sovereign', hp: 6500, speed: 36, radius: 74, color: '#22bbff',
            sides: 12, xp: 145, gold: 470, damage: 54, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 4.0, radius: 290, damage: 26, color: '#22bbff' },
                { id: 'gravityWell', interval: 5.5, radius: 280, pull: 180, damage: 14, color: '#22bbff' },
                { id: 'summonWave', interval: 6.5, count: 5, summonType: 'ICE_GOLEM' },
                { id: 'shieldPhase', interval: 13.0, duration: 5.0 },
                { id: 'minionSurge', interval: 0, count: 7, summonType: 'ICE_WRAITH' }
            ]
        },

        // --- Lava Factory Legendary ---
        VOLCANIC_OVERLORD: {
            name: 'Volcanic Overlord', hp: 7000, speed: 38, radius: 76, color: '#ff2200',
            sides: 12, xp: 150, gold: 500, damage: 58, isBoss: true,
            patterns: [
                { id: 'novaPulse', interval: 3.8, radius: 260, damage: 30, color: '#ff2200' },
                { id: 'multiDash', interval: 9.0, dashes: 4, dashDuration: 0.4, dashPause: 0.25, speedMult: 3.5 },
                { id: 'summonWave', interval: 6.0, count: 6, summonType: 'LAVA_JUGGERNAUT' },
                { id: 'regenPulse', interval: 8.0, healRatio: 0.04 },
                { id: 'minionSurge', interval: 0, count: 8, summonType: 'LAVA_IMP' }
            ]
        },

        // --- Dark Forest Legendary ---
        NATURE_COLOSSUS: {
            name: 'Nature Colossus', hp: 7500, speed: 34, radius: 78, color: '#22cc22',
            sides: 12, xp: 155, gold: 520, damage: 56, isBoss: true,
            patterns: [
                { id: 'gravityWell', interval: 4.8, radius: 300, pull: 200, damage: 15, color: '#22cc22' },
                { id: 'ringBurst', interval: 5.0, radius: 270, damage: 24, color: '#66ff44' },
                { id: 'summonWave', interval: 5.5, count: 6, summonType: 'ROOT_BEHEMOTH' },
                { id: 'regenPulse', interval: 7.0, healRatio: 0.055 },
                { id: 'minionSurge', interval: 0, count: 8, summonType: 'SPORE_RUNNER' }
            ]
        },

        // --- Space Station Legendary ---
        GALACTIC_TITAN: {
            name: 'Galactic Titan', hp: 8000, speed: 36, radius: 80, color: '#7722ff',
            sides: 12, xp: 160, gold: 550, damage: 60, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 3.8, duration: 0.6, speedMult: 4.0 },
                { id: 'ringBurst', interval: 4.2, radius: 300, damage: 30, color: '#7722ff' },
                { id: 'summonWave', interval: 6.0, count: 6, summonType: 'ASTRO_TITAN' },
                { id: 'multiDash', interval: 10.0, dashes: 4, dashDuration: 0.35, dashPause: 0.2, speedMult: 3.8 },
                { id: 'minionSurge', interval: 0, count: 9, summonType: 'VOID_SCOUT' }
            ]
        }
    });

    console.log('[BossSystem] 10 new boss types registered (5 Elite + 5 Legendary).');
})();
