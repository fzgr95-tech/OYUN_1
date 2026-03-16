// ============================================================
// enemy_types.js — Enemy Type Definitions & Map Pools
// ============================================================
// This file is loaded AFTER enemy.js and extends the Enemies
// object with type data using Object.assign.
// ============================================================

Object.assign(Enemies, {
    TYPES: {
        NEON_DRONE: { name: 'Neon Drone', hp: 26, speed: 70, radius: 13, color: '#ff3cff', sides: 4, xp: 1, gold: 1, damage: 9 },
        NEON_RUSHER: { name: 'Neon Rusher', hp: 18, speed: 126, radius: 10, color: '#ff8a00', sides: 3, xp: 1, gold: 1, damage: 8 },
        NEON_BRUTE: { name: 'Neon Brute', hp: 95, speed: 40, radius: 23, color: '#ff2366', sides: 5, xp: 3, gold: 3, damage: 18 },

        ICE_SHARDLING: { name: 'Ice Shardling', hp: 28, speed: 72, radius: 13, color: '#8ed8ff', sides: 4, xp: 1, gold: 1, damage: 10 },
        ICE_WRAITH: { name: 'Ice Wraith', hp: 24, speed: 110, radius: 12, color: '#8ff3ff', sides: 3, xp: 2, gold: 2, damage: 10 },
        ICE_GOLEM: { name: 'Ice Golem', hp: 130, speed: 34, radius: 25, color: '#6da7ff', sides: 6, xp: 4, gold: 4, damage: 22 },

        LAVA_IMP: { name: 'Lava Imp', hp: 30, speed: 80, radius: 14, color: '#ff6a21', sides: 4, xp: 1, gold: 1, damage: 11 },
        LAVA_SMELTER: { name: 'Lava Smelter', hp: 60, speed: 76, radius: 18, color: '#ff4a22', sides: 5, xp: 3, gold: 3, damage: 15 },
        LAVA_JUGGERNAUT: { name: 'Lava Juggernaut', hp: 180, speed: 30, radius: 28, color: '#ff1f1f', sides: 7, xp: 6, gold: 6, damage: 28 },

        THORN_STALKER: { name: 'Thorn Stalker', hp: 32, speed: 74, radius: 14, color: '#5bd34f', sides: 5, xp: 2, gold: 2, damage: 11 },
        SPORE_RUNNER: { name: 'Spore Runner', hp: 22, speed: 125, radius: 11, color: '#89ff71', sides: 3, xp: 2, gold: 2, damage: 9 },
        ROOT_BEHEMOTH: { name: 'Root Behemoth', hp: 210, speed: 28, radius: 30, color: '#3cae45', sides: 8, xp: 7, gold: 7, damage: 30 },

        VOID_SCOUT: { name: 'Void Scout', hp: 34, speed: 96, radius: 13, color: '#a073ff', sides: 4, xp: 2, gold: 2, damage: 12 },
        PHASE_STINGER: { name: 'Phase Stinger', hp: 26, speed: 138, radius: 10, color: '#c18fff', sides: 3, xp: 3, gold: 3, damage: 11 },
        ASTRO_TITAN: { name: 'Astro Titan', hp: 240, speed: 32, radius: 32, color: '#8550ff', sides: 9, xp: 9, gold: 9, damage: 34 },

        NEON_OVERSEER: {
            name: 'Neon Overseer', hp: 900, speed: 50, radius: 42, color: '#ff3ae0', sides: 6, xp: 25, gold: 30, damage: 24, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 6.2, duration: 0.45, speedMult: 3.2 },
                { id: 'novaPulse', interval: 5.5, radius: 165, damage: 16, color: '#ff3ae0' },
                { id: 'summonWave', interval: 8.5, count: 3, summonType: 'NEON_RUSHER' }
            ]
        },
        NEON_CITADEL: {
            name: 'Neon Citadel', hp: 3200, speed: 34, radius: 62, color: '#ff0077', sides: 8, xp: 80, gold: 100, damage: 40, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 7.2, radius: 230, damage: 22, color: '#ff4c9e' },
                { id: 'summonWave', interval: 9.4, count: 4, summonType: 'NEON_BRUTE' },
                { id: 'regenPulse', interval: 11.0, healRatio: 0.04 }
            ]
        },

        ICE_HOWL: {
            name: 'Ice Howl', hp: 980, speed: 48, radius: 44, color: '#78e8ff', sides: 6, xp: 26, gold: 32, damage: 24, isBoss: true,
            patterns: [
                { id: 'novaPulse', interval: 5.2, radius: 175, damage: 15, color: '#78e8ff' },
                { id: 'summonWave', interval: 8.8, count: 3, summonType: 'ICE_WRAITH' },
                { id: 'dashStrike', interval: 7.5, duration: 0.4, speedMult: 3.0 }
            ]
        },
        GLACIER_CORE: {
            name: 'Glacier Core', hp: 3400, speed: 31, radius: 64, color: '#76b8ff', sides: 9, xp: 82, gold: 104, damage: 42, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 7.8, radius: 235, damage: 20, color: '#95ddff' },
                { id: 'regenPulse', interval: 10.2, healRatio: 0.05 },
                { id: 'summonWave', interval: 9.0, count: 4, summonType: 'ICE_GOLEM' }
            ]
        },

        FORGE_TYRANT: {
            name: 'Forge Tyrant', hp: 1040, speed: 52, radius: 45, color: '#ff5a2d', sides: 7, xp: 28, gold: 34, damage: 26, isBoss: true,
            patterns: [
                { id: 'novaPulse', interval: 4.9, radius: 170, damage: 17, color: '#ff5a2d' },
                { id: 'summonWave', interval: 8.3, count: 3, summonType: 'LAVA_SMELTER' },
                { id: 'dashStrike', interval: 6.8, duration: 0.45, speedMult: 3.3 }
            ]
        },
        MAGMA_REACTOR: {
            name: 'Magma Reactor', hp: 3600, speed: 33, radius: 65, color: '#ff2a1a', sides: 10, xp: 85, gold: 108, damage: 44, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 6.9, radius: 245, damage: 23, color: '#ff7a22' },
                { id: 'summonWave', interval: 8.7, count: 5, summonType: 'LAVA_IMP' },
                { id: 'regenPulse', interval: 10.8, healRatio: 0.035 }
            ]
        },

        THORN_QUEEN: {
            name: 'Thorn Queen', hp: 1100, speed: 46, radius: 46, color: '#67dc50', sides: 7, xp: 30, gold: 36, damage: 26, isBoss: true,
            patterns: [
                { id: 'summonWave', interval: 7.5, count: 4, summonType: 'SPORE_RUNNER' },
                { id: 'gravityWell', interval: 6.8, radius: 230, pull: 120, damage: 9, color: '#67dc50' },
                { id: 'dashStrike', interval: 8.2, duration: 0.4, speedMult: 2.8 }
            ]
        },
        ELDER_MYCELIUM: {
            name: 'Elder Mycelium', hp: 3800, speed: 30, radius: 66, color: '#3bad4e', sides: 10, xp: 88, gold: 112, damage: 45, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 7.6, radius: 250, damage: 21, color: '#7feb7f' },
                { id: 'summonWave', interval: 8.4, count: 4, summonType: 'ROOT_BEHEMOTH' },
                { id: 'regenPulse', interval: 9.8, healRatio: 0.05 }
            ]
        },

        VOID_ORACLE: {
            name: 'Void Oracle', hp: 1180, speed: 55, radius: 47, color: '#b07dff', sides: 8, xp: 32, gold: 38, damage: 27, isBoss: true,
            patterns: [
                { id: 'dashStrike', interval: 5.8, duration: 0.38, speedMult: 3.6 },
                { id: 'gravityWell', interval: 6.0, radius: 240, pull: 140, damage: 10, color: '#b07dff' },
                { id: 'summonWave', interval: 8.2, count: 4, summonType: 'PHASE_STINGER' }
            ]
        },
        STELLAR_COLOSSUS: {
            name: 'Stellar Colossus', hp: 4000, speed: 34, radius: 68, color: '#8954ff', sides: 11, xp: 92, gold: 120, damage: 48, isBoss: true,
            patterns: [
                { id: 'ringBurst', interval: 6.7, radius: 265, damage: 24, color: '#be95ff' },
                { id: 'summonWave', interval: 8.1, count: 5, summonType: 'VOID_SCOUT' },
                { id: 'regenPulse', interval: 10.4, healRatio: 0.04 }
            ]
        }
    },

    MAP_ENEMY_POOLS: {
        neonCity: [
            { type: 'NEON_DRONE', weight: 48, from: 0 },
            { type: 'NEON_RUSHER', weight: 32, from: 20 },
            { type: 'NEON_BRUTE', weight: 20, from: 65 }
        ],
        iceCave: [
            { type: 'ICE_SHARDLING', weight: 44, from: 0 },
            { type: 'ICE_WRAITH', weight: 34, from: 20 },
            { type: 'ICE_GOLEM', weight: 22, from: 65 }
        ],
        lavaFactory: [
            { type: 'LAVA_IMP', weight: 42, from: 0 },
            { type: 'LAVA_SMELTER', weight: 34, from: 18 },
            { type: 'LAVA_JUGGERNAUT', weight: 24, from: 60 }
        ],
        darkForest: [
            { type: 'THORN_STALKER', weight: 40, from: 0 },
            { type: 'SPORE_RUNNER', weight: 36, from: 15 },
            { type: 'ROOT_BEHEMOTH', weight: 24, from: 58 }
        ],
        spaceStation: [
            { type: 'VOID_SCOUT', weight: 38, from: 0 },
            { type: 'PHASE_STINGER', weight: 38, from: 12 },
            { type: 'ASTRO_TITAN', weight: 24, from: 55 }
        ]
    },

    MAP_BOSSES: {
        neonCity: { mini: 'NEON_OVERSEER', mega: 'NEON_CITADEL' },
        iceCave: { mini: 'ICE_HOWL', mega: 'GLACIER_CORE' },
        lavaFactory: { mini: 'FORGE_TYRANT', mega: 'MAGMA_REACTOR' },
        darkForest: { mini: 'THORN_QUEEN', mega: 'ELDER_MYCELIUM' },
        spaceStation: { mini: 'VOID_ORACLE', mega: 'STELLAR_COLOSSUS' }
    }
});
