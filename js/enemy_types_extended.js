// ============================================================
// enemy_types_extended.js — 100 New Enemy Type Definitions
// ============================================================
// Loaded AFTER enemy_types.js. Extends Enemies.TYPES and
// MAP_ENEMY_POOLS without replacing originals.
// ============================================================

(function () {
    'use strict';

    // ── NEW ENEMY TYPES (100 entries) ──────────────────────
    const EXTENDED_TYPES = {

        // ─── CATEGORY 1: FAST ENEMIES (sides=3, zigzag) ───
        FLASH_MOSQUITO:   { name: 'Flash Mosquito',   hp: 14,  speed: 155, radius: 9,  color: '#ff44cc', sides: 3, xp: 1, gold: 1, damage: 6,  category: 'fast' },
        SONIC_FLEA:       { name: 'Sonic Flea',       hp: 12,  speed: 170, radius: 8,  color: '#ff66aa', sides: 3, xp: 1, gold: 1, damage: 5,  category: 'fast' },
        SPARK_WASP:       { name: 'Spark Wasp',       hp: 20,  speed: 140, radius: 10, color: '#ffaa33', sides: 3, xp: 2, gold: 1, damage: 8,  category: 'fast' },
        BLITZ_HORNET:     { name: 'Blitz Hornet',     hp: 16,  speed: 160, radius: 9,  color: '#ff8844', sides: 3, xp: 2, gold: 1, damage: 7,  category: 'fast' },
        NEON_DART:        { name: 'Neon Dart',        hp: 22,  speed: 135, radius: 10, color: '#00ffcc', sides: 3, xp: 2, gold: 2, damage: 9,  category: 'fast' },
        THUNDER_MITE:     { name: 'Thunder Mite',     hp: 18,  speed: 150, radius: 9,  color: '#44bbff', sides: 3, xp: 2, gold: 2, damage: 8,  category: 'fast' },
        RAZOR_WING:       { name: 'Razor Wing',       hp: 25,  speed: 130, radius: 11, color: '#ff3355', sides: 3, xp: 3, gold: 2, damage: 10, category: 'fast' },
        PLASMA_GNAT:      { name: 'Plasma Gnat',      hp: 15,  speed: 165, radius: 8,  color: '#bb55ff', sides: 3, xp: 2, gold: 1, damage: 7,  category: 'fast' },
        WARP_SPRINTER:    { name: 'Warp Sprinter',    hp: 28,  speed: 145, radius: 11, color: '#55ffaa', sides: 3, xp: 3, gold: 2, damage: 11, category: 'fast' },
        VOID_DASHER:      { name: 'Void Dasher',      hp: 20,  speed: 175, radius: 9,  color: '#aa77ff', sides: 3, xp: 3, gold: 2, damage: 9,  category: 'fast' },

        // ─── CATEGORY 2: TANK ENEMIES (sides=6-9, spin) ───
        IRON_WALL:        { name: 'Iron Wall',        hp: 160, speed: 25,  radius: 26, color: '#aabbcc', sides: 7, xp: 5, gold: 4, damage: 20, category: 'tank' },
        GRANITE_HULK:     { name: 'Granite Hulk',     hp: 200, speed: 22,  radius: 28, color: '#8899aa', sides: 7, xp: 6, gold: 5, damage: 24, category: 'tank' },
        STEEL_MAMMOTH:    { name: 'Steel Mammoth',    hp: 250, speed: 20,  radius: 30, color: '#99aacc', sides: 8, xp: 7, gold: 6, damage: 28, category: 'tank' },
        OBSIDIAN_CRAB:    { name: 'Obsidian Crab',    hp: 180, speed: 28,  radius: 25, color: '#334455', sides: 6, xp: 6, gold: 5, damage: 22, category: 'tank' },
        CHROME_BEETLE:    { name: 'Chrome Beetle',    hp: 220, speed: 24,  radius: 27, color: '#ccddef', sides: 7, xp: 7, gold: 5, damage: 26, category: 'tank' },
        TUNGSTEN_RHINO:   { name: 'Tungsten Rhino',   hp: 300, speed: 18,  radius: 32, color: '#667788', sides: 8, xp: 8, gold: 7, damage: 32, category: 'tank' },
        ADAMANT_SLUG:     { name: 'Adamant Slug',     hp: 350, speed: 15,  radius: 30, color: '#556677', sides: 7, xp: 8, gold: 7, damage: 25, category: 'tank' },
        BASALT_GUARDIAN:  { name: 'Basalt Guardian',  hp: 280, speed: 22,  radius: 28, color: '#445566', sides: 8, xp: 7, gold: 6, damage: 30, category: 'tank' },
        TITAN_SHELL:      { name: 'Titan Shell',      hp: 400, speed: 16,  radius: 33, color: '#778899', sides: 9, xp: 9, gold: 8, damage: 35, category: 'tank' },
        COLOSSUS_WORM:    { name: 'Colossus Worm',    hp: 500, speed: 14,  radius: 35, color: '#556688', sides: 9, xp: 10,gold: 9, damage: 40, category: 'tank' },

        // ─── CATEGORY 3: FLYING ENEMIES (sides=4, drift) ───
        HOVER_DRONE_MK2:  { name: 'Hover Drone MK2',  hp: 24,  speed: 75,  radius: 12, color: '#66ddff', sides: 4, xp: 1, gold: 1, damage: 8,  category: 'flying' },
        RECON_PROBE:      { name: 'Recon Probe',      hp: 18,  speed: 90,  radius: 11, color: '#88eeff', sides: 4, xp: 1, gold: 1, damage: 6,  category: 'flying' },
        BOMBER_HAWK:      { name: 'Bomber Hawk',      hp: 30,  speed: 65,  radius: 14, color: '#ff8833', sides: 4, xp: 2, gold: 2, damage: 12, category: 'flying' },
        SKY_STINGER:      { name: 'Sky Stinger',      hp: 22,  speed: 85,  radius: 11, color: '#ffcc44', sides: 4, xp: 2, gold: 1, damage: 9,  category: 'flying' },
        GHOST_COPTER:     { name: 'Ghost Copter',     hp: 26,  speed: 80,  radius: 12, color: '#aaddff', sides: 4, xp: 2, gold: 2, damage: 10, category: 'flying' },
        PLASMA_EAGLE:     { name: 'Plasma Eagle',     hp: 35,  speed: 70,  radius: 15, color: '#dd44ff', sides: 4, xp: 3, gold: 2, damage: 14, category: 'flying' },
        SWARM_MOTH:       { name: 'Swarm Moth',       hp: 14,  speed: 95,  radius: 9,  color: '#ccff66', sides: 4, xp: 1, gold: 1, damage: 5,  category: 'flying' },
        THUNDER_OWL:      { name: 'Thunder Owl',      hp: 40,  speed: 60,  radius: 16, color: '#4488ff', sides: 4, xp: 3, gold: 3, damage: 16, category: 'flying' },
        MAGNET_RAVEN:     { name: 'Magnet Raven',     hp: 32,  speed: 75,  radius: 13, color: '#9966ff', sides: 4, xp: 3, gold: 2, damage: 12, category: 'flying' },
        STORM_FALCON:     { name: 'Storm Falcon',     hp: 45,  speed: 80,  radius: 16, color: '#55aaff', sides: 4, xp: 4, gold: 3, damage: 18, category: 'flying' },

        // ─── CATEGORY 4: SNIPER ENEMIES (sides=4, slow+shoot) ───
        NEEDLE_TURRET:    { name: 'Needle Turret',    hp: 20,  speed: 30,  radius: 12, color: '#ff5566', sides: 4, xp: 2, gold: 2, damage: 7,  category: 'sniper' },
        PULSE_SNIPER:     { name: 'Pulse Sniper',     hp: 28,  speed: 35,  radius: 13, color: '#ff3344', sides: 4, xp: 3, gold: 2, damage: 12, category: 'sniper' },
        BEAM_SENTINEL:    { name: 'Beam Sentinel',    hp: 35,  speed: 25,  radius: 14, color: '#ff2255', sides: 4, xp: 3, gold: 3, damage: 15, category: 'sniper' },
        FROST_ARCHER:     { name: 'Frost Archer',     hp: 26,  speed: 40,  radius: 12, color: '#88ccff', sides: 4, xp: 3, gold: 2, damage: 10, category: 'sniper' },
        VENOM_SPITTER:    { name: 'Venom Spitter',    hp: 22,  speed: 45,  radius: 11, color: '#66ff44', sides: 4, xp: 2, gold: 2, damage: 8,  category: 'sniper' },
        MORTAR_BUG:       { name: 'Mortar Bug',       hp: 30,  speed: 28,  radius: 14, color: '#dd6633', sides: 4, xp: 3, gold: 3, damage: 18, category: 'sniper' },
        RAIL_SPIDER:      { name: 'Rail Spider',      hp: 38,  speed: 32,  radius: 15, color: '#bb4444', sides: 4, xp: 4, gold: 3, damage: 20, category: 'sniper' },
        HOMING_EYE:       { name: 'Homing Eye',       hp: 24,  speed: 50,  radius: 12, color: '#ff44aa', sides: 4, xp: 3, gold: 2, damage: 11, category: 'sniper' },
        CLUSTER_CANNON:   { name: 'Cluster Cannon',   hp: 42,  speed: 22,  radius: 16, color: '#cc5533', sides: 4, xp: 4, gold: 3, damage: 14, category: 'sniper' },
        DEATH_LENS:       { name: 'Death Lens',       hp: 50,  speed: 20,  radius: 17, color: '#ff1133', sides: 4, xp: 5, gold: 4, damage: 25, category: 'sniper' },

        // ─── CATEGORY 5: KAMIKAZE ENEMIES (sides=3, explode) ───
        FRAG_TICK:        { name: 'Frag Tick',        hp: 10,  speed: 130, radius: 8,  color: '#ff6622', sides: 3, xp: 2, gold: 1, damage: 20, category: 'kamikaze' },
        CLUSTER_MINE:     { name: 'Cluster Mine',     hp: 8,   speed: 100, radius: 9,  color: '#ff4411', sides: 3, xp: 1, gold: 1, damage: 15, category: 'kamikaze' },
        NAPALM_BUG:       { name: 'Napalm Bug',       hp: 15,  speed: 120, radius: 10, color: '#ff8800', sides: 3, xp: 2, gold: 2, damage: 18, category: 'kamikaze' },
        FROST_BOMB:       { name: 'Frost Bomb',       hp: 12,  speed: 110, radius: 9,  color: '#66ccff', sides: 3, xp: 2, gold: 1, damage: 16, category: 'kamikaze' },
        EMP_DRONE_K:      { name: 'EMP Drone',        hp: 18,  speed: 105, radius: 10, color: '#44ddff', sides: 3, xp: 2, gold: 2, damage: 12, category: 'kamikaze' },
        TOXIC_SPORE:      { name: 'Toxic Spore',      hp: 8,   speed: 140, radius: 8,  color: '#44ff22', sides: 3, xp: 1, gold: 1, damage: 10, category: 'kamikaze' },
        PLASMA_CHARGER:   { name: 'Plasma Charger',   hp: 20,  speed: 125, radius: 11, color: '#cc44ff', sides: 3, xp: 3, gold: 2, damage: 22, category: 'kamikaze' },
        VOID_IMPLODER:    { name: 'Void Imploder',    hp: 14,  speed: 115, radius: 10, color: '#8855ff', sides: 3, xp: 3, gold: 2, damage: 25, category: 'kamikaze' },
        NOVA_SEED:        { name: 'Nova Seed',        hp: 22,  speed: 100, radius: 12, color: '#ffdd44', sides: 3, xp: 3, gold: 2, damage: 30, category: 'kamikaze' },
        CHAIN_BOMBER:     { name: 'Chain Bomber',     hp: 16,  speed: 120, radius: 10, color: '#ff5544', sides: 3, xp: 2, gold: 2, damage: 18, category: 'kamikaze' },

        // ─── CATEGORY 6: SPLITTER ENEMIES (sides=5-6, split on death) ───
        GEL_BLOB:         { name: 'Gel Blob',         hp: 60,  speed: 45,  radius: 16, color: '#55ddaa', sides: 5, xp: 3, gold: 2, damage: 10, category: 'splitter', splitCount: 2, splitType: 'GEL_BLOB_MINI' },
        CRYSTAL_SHARD:    { name: 'Crystal Shard',    hp: 80,  speed: 40,  radius: 18, color: '#aaddff', sides: 6, xp: 4, gold: 3, damage: 14, category: 'splitter', splitCount: 3, splitType: 'CRYSTAL_SHARD_MINI' },
        MERCURY_DROP:     { name: 'Mercury Drop',     hp: 50,  speed: 55,  radius: 15, color: '#ccddee', sides: 5, xp: 3, gold: 2, damage: 12, category: 'splitter', splitCount: 4, splitType: 'MERCURY_DROP_MINI' },
        BINARY_CELL:      { name: 'Binary Cell',      hp: 40,  speed: 60,  radius: 14, color: '#44ffcc', sides: 5, xp: 2, gold: 2, damage: 8,  category: 'splitter', splitCount: 2, splitType: 'BINARY_CELL_MINI' },
        FRACTAL_ORB:      { name: 'Fractal Orb',      hp: 100, speed: 35,  radius: 20, color: '#ff88dd', sides: 6, xp: 5, gold: 4, damage: 16, category: 'splitter', splitCount: 3, splitType: 'FRACTAL_ORB_MINI' },
        HYDRA_NUCLEUS:    { name: 'Hydra Nucleus',    hp: 120, speed: 30,  radius: 22, color: '#66ff88', sides: 6, xp: 5, gold: 4, damage: 18, category: 'splitter', splitCount: 3, splitType: 'HYDRA_NUCLEUS_MINI' },
        MITOSIS_CUBE:     { name: 'Mitosis Cube',     hp: 70,  speed: 50,  radius: 16, color: '#88ffaa', sides: 5, xp: 4, gold: 3, damage: 12, category: 'splitter', splitCount: 2, splitType: 'MITOSIS_CUBE_MINI' },
        PRISM_SPLITTER:   { name: 'Prism Splitter',   hp: 90,  speed: 42,  radius: 18, color: '#ff66bb', sides: 6, xp: 4, gold: 3, damage: 15, category: 'splitter', splitCount: 3, splitType: 'PRISM_SPLITTER_MINI' },
        AMOEBA_KING:      { name: 'Amoeba King',      hp: 150, speed: 28,  radius: 24, color: '#33ddaa', sides: 6, xp: 6, gold: 5, damage: 20, category: 'splitter', splitCount: 5, splitType: 'AMOEBA_KING_MINI' },
        QUANTUM_DIVIDE:   { name: 'Quantum Divide',   hp: 110, speed: 38,  radius: 20, color: '#bb88ff', sides: 6, xp: 5, gold: 4, damage: 17, category: 'splitter', splitCount: 3, splitType: 'QUANTUM_DIVIDE_MINI' },

        // Splitter mini versions (spawned when parent dies)
        GEL_BLOB_MINI:          { name: 'Gel Blob Jr',      hp: 20,  speed: 65,  radius: 9,  color: '#55ddaa', sides: 5, xp: 1, gold: 1, damage: 5,  category: 'splitter_mini' },
        CRYSTAL_SHARD_MINI:     { name: 'Crystal Bit',      hp: 18,  speed: 60,  radius: 8,  color: '#aaddff', sides: 5, xp: 1, gold: 1, damage: 5,  category: 'splitter_mini' },
        MERCURY_DROP_MINI:      { name: 'Mercury Droplet',  hp: 12,  speed: 75,  radius: 7,  color: '#ccddee', sides: 5, xp: 1, gold: 1, damage: 4,  category: 'splitter_mini' },
        BINARY_CELL_MINI:       { name: 'Binary Half',      hp: 20,  speed: 60,  radius: 10, color: '#44ffcc', sides: 5, xp: 1, gold: 1, damage: 5,  category: 'splitter_mini' },
        FRACTAL_ORB_MINI:       { name: 'Fractal Bit',      hp: 22,  speed: 55,  radius: 9,  color: '#ff88dd', sides: 5, xp: 1, gold: 1, damage: 6,  category: 'splitter_mini' },
        HYDRA_NUCLEUS_MINI:     { name: 'Hydra Cell',       hp: 30,  speed: 50,  radius: 10, color: '#66ff88', sides: 5, xp: 2, gold: 1, damage: 8,  category: 'splitter_mini' },
        MITOSIS_CUBE_MINI:      { name: 'Mitosis Half',     hp: 25,  speed: 60,  radius: 9,  color: '#88ffaa', sides: 5, xp: 1, gold: 1, damage: 6,  category: 'splitter_mini' },
        PRISM_SPLITTER_MINI:    { name: 'Prism Shard',      hp: 20,  speed: 62,  radius: 8,  color: '#ff66bb', sides: 5, xp: 1, gold: 1, damage: 5,  category: 'splitter_mini' },
        AMOEBA_KING_MINI:       { name: 'Amoeba Jr',        hp: 18,  speed: 55,  radius: 8,  color: '#33ddaa', sides: 5, xp: 1, gold: 1, damage: 5,  category: 'splitter_mini' },
        QUANTUM_DIVIDE_MINI:    { name: 'Quantum Bit',      hp: 22,  speed: 58,  radius: 9,  color: '#bb88ff', sides: 5, xp: 1, gold: 1, damage: 6,  category: 'splitter_mini' },

        // ─── CATEGORY 7: ELITE ENEMIES (sides=7-8, strong) ───
        ELITE_ENFORCER:   { name: 'Elite Enforcer',   hp: 280, speed: 50,  radius: 24, color: '#ffaa22', sides: 7, xp: 8,  gold: 6,  damage: 22, category: 'elite' },
        WARDEN_PRIME:     { name: 'Warden Prime',     hp: 320, speed: 42,  radius: 26, color: '#ff8844', sides: 7, xp: 9,  gold: 7,  damage: 25, category: 'elite' },
        SHADOW_CAPTAIN:   { name: 'Shadow Captain',   hp: 260, speed: 55,  radius: 22, color: '#555577', sides: 7, xp: 8,  gold: 6,  damage: 20, category: 'elite' },
        SIEGE_BREAKER:    { name: 'Siege Breaker',    hp: 400, speed: 35,  radius: 30, color: '#dd5533', sides: 8, xp: 10, gold: 8,  damage: 30, category: 'elite' },
        PHALANX_CHIEF:    { name: 'Phalanx Chief',    hp: 350, speed: 40,  radius: 28, color: '#cc7744', sides: 7, xp: 9,  gold: 7,  damage: 28, category: 'elite' },
        BERSERKER_REX:    { name: 'Berserker Rex',    hp: 300, speed: 60,  radius: 25, color: '#ff2222', sides: 7, xp: 10, gold: 8,  damage: 35, category: 'elite' },
        MEDIC_OVERLORD:   { name: 'Medic Overlord',   hp: 240, speed: 45,  radius: 22, color: '#44ff88', sides: 7, xp: 7,  gold: 6,  damage: 15, category: 'elite' },
        SHOCK_GENERAL:    { name: 'Shock General',    hp: 280, speed: 52,  radius: 24, color: '#4488ff', sides: 8, xp: 8,  gold: 7,  damage: 24, category: 'elite' },
        CRYO_MARSHAL:     { name: 'Cryo Marshal',     hp: 300, speed: 38,  radius: 26, color: '#88ddff', sides: 8, xp: 9,  gold: 7,  damage: 22, category: 'elite' },
        INFERNO_LORD:     { name: 'Inferno Lord',     hp: 360, speed: 44,  radius: 28, color: '#ff4400', sides: 8, xp: 10, gold: 9,  damage: 32, category: 'elite' },

        // ─── CATEGORY 8: ARMORED ENEMIES (sides=6-8, defense) ───
        PLATE_CRAWLER:    { name: 'Plate Crawler',    hp: 140, speed: 32,  radius: 20, color: '#889999', sides: 6, xp: 4, gold: 3, damage: 16, category: 'armored' },
        SHIELD_DRONE:     { name: 'Shield Drone',     hp: 80,  speed: 55,  radius: 14, color: '#66aaff', sides: 6, xp: 3, gold: 2, damage: 10, category: 'armored' },
        MIRROR_GUARD:     { name: 'Mirror Guard',     hp: 100, speed: 45,  radius: 16, color: '#eeeeff', sides: 6, xp: 4, gold: 3, damage: 14, category: 'armored' },
        THORN_ARMOR:      { name: 'Thorn Armor',      hp: 160, speed: 30,  radius: 22, color: '#44aa44', sides: 7, xp: 5, gold: 4, damage: 20, category: 'armored' },
        PHASE_SHELL:      { name: 'Phase Shell',      hp: 120, speed: 50,  radius: 18, color: '#bb99ff', sides: 6, xp: 4, gold: 3, damage: 12, category: 'armored' },
        REGEN_PLATE:      { name: 'Regen Plate',      hp: 180, speed: 28,  radius: 23, color: '#55cc88', sides: 7, xp: 5, gold: 4, damage: 18, category: 'armored' },
        VOID_CLOAK:       { name: 'Void Cloak',       hp: 100, speed: 60,  radius: 16, color: '#7744bb', sides: 6, xp: 4, gold: 3, damage: 15, category: 'armored' },
        ENERGY_BARRIER:   { name: 'Energy Barrier',   hp: 200, speed: 25,  radius: 24, color: '#44aacc', sides: 7, xp: 6, gold: 5, damage: 22, category: 'armored' },
        NANO_REPAIR:      { name: 'Nano Repair',      hp: 150, speed: 35,  radius: 20, color: '#88ddaa', sides: 7, xp: 5, gold: 4, damage: 16, category: 'armored' },
        FORTRESS_NODE:    { name: 'Fortress Node',    hp: 250, speed: 20,  radius: 26, color: '#667799', sides: 8, xp: 7, gold: 6, damage: 28, category: 'armored' },

        // ─── CATEGORY 9: STEALTH ENEMIES (sides=3-4, invisibility) ───
        SHADOW_LURKER:    { name: 'Shadow Lurker',    hp: 20,  speed: 85,  radius: 10, color: '#334455', sides: 3, xp: 2, gold: 2, damage: 10, category: 'stealth' },
        PHANTOM_WISP:     { name: 'Phantom Wisp',     hp: 16,  speed: 100, radius: 9,  color: '#556677', sides: 3, xp: 2, gold: 1, damage: 8,  category: 'stealth' },
        GHOST_WALKER:     { name: 'Ghost Walker',     hp: 24,  speed: 75,  radius: 11, color: '#445566', sides: 4, xp: 3, gold: 2, damage: 12, category: 'stealth' },
        VOID_SHADE:       { name: 'Void Shade',       hp: 28,  speed: 70,  radius: 12, color: '#333355', sides: 4, xp: 3, gold: 2, damage: 14, category: 'stealth' },
        MIRAGE_TWIN:      { name: 'Mirage Twin',      hp: 18,  speed: 90,  radius: 10, color: '#6677aa', sides: 3, xp: 2, gold: 2, damage: 9,  category: 'stealth' },
        ECLIPSE_STALKER:  { name: 'Eclipse Stalker',  hp: 30,  speed: 80,  radius: 12, color: '#222244', sides: 4, xp: 3, gold: 2, damage: 15, category: 'stealth' },
        CHRONO_SHADE:     { name: 'Chrono Shade',     hp: 22,  speed: 95,  radius: 10, color: '#5566bb', sides: 3, xp: 3, gold: 2, damage: 11, category: 'stealth' },
        NULL_SPECTER:     { name: 'Null Specter',     hp: 35,  speed: 65,  radius: 13, color: '#111133', sides: 4, xp: 4, gold: 3, damage: 18, category: 'stealth' },
        DARK_MATTER:      { name: 'Dark Matter',      hp: 40,  speed: 60,  radius: 14, color: '#220044', sides: 4, xp: 4, gold: 3, damage: 20, category: 'stealth' },
        DIMENSIONAL_RIFT: { name: 'Dimensional Rift', hp: 32,  speed: 85,  radius: 12, color: '#7744cc', sides: 3, xp: 4, gold: 3, damage: 16, category: 'stealth' },

        // ─── CATEGORY 10: ROBOT/MECH ENEMIES (sides=4-6, special attacks) ───
        SAWBLADE_BOT:     { name: 'Sawblade Bot',     hp: 45,  speed: 65,  radius: 14, color: '#ccccdd', sides: 5, xp: 3, gold: 2, damage: 14, category: 'robot' },
        DRILL_MECH:       { name: 'Drill Mech',       hp: 70,  speed: 55,  radius: 16, color: '#aabbcc', sides: 5, xp: 4, gold: 3, damage: 18, category: 'robot' },
        TESLA_COIL:       { name: 'Tesla Coil',       hp: 55,  speed: 40,  radius: 14, color: '#44aaff', sides: 5, xp: 3, gold: 2, damage: 12, category: 'robot' },
        FLAME_TURRET:     { name: 'Flame Turret',     hp: 60,  speed: 30,  radius: 15, color: '#ff6622', sides: 5, xp: 3, gold: 3, damage: 15, category: 'robot' },
        SPIDER_MINE:      { name: 'Spider Mine',      hp: 25,  speed: 90,  radius: 10, color: '#dd4444', sides: 4, xp: 2, gold: 2, damage: 20, category: 'robot' },
        ROCKET_POD:       { name: 'Rocket Pod',       hp: 50,  speed: 35,  radius: 15, color: '#cc6633', sides: 4, xp: 4, gold: 3, damage: 22, category: 'robot' },
        GRAVITY_BOT:      { name: 'Gravity Bot',      hp: 65,  speed: 45,  radius: 15, color: '#7755cc', sides: 5, xp: 4, gold: 3, damage: 14, category: 'robot' },
        PULSE_MECH:       { name: 'Pulse Mech',       hp: 80,  speed: 50,  radius: 17, color: '#5577dd', sides: 6, xp: 5, gold: 4, damage: 20, category: 'robot' },
        NEXUS_CORE:       { name: 'Nexus Core',       hp: 100, speed: 30,  radius: 18, color: '#5599ff', sides: 6, xp: 5, gold: 4, damage: 16, category: 'robot' },
        OMEGA_SENTINEL:   { name: 'Omega Sentinel',   hp: 120, speed: 55,  radius: 20, color: '#4466ee', sides: 6, xp: 6, gold: 5, damage: 26, category: 'robot' }
    };

    // ── Register all new types into Enemies.TYPES ──────────
    Object.assign(Enemies.TYPES, EXTENDED_TYPES);

    // ── EXTENDED SPAWN POOLS per map ───────────────────────
    // Append new entries to existing MAP_ENEMY_POOLS arrays
    // Uses higher `from` values so new enemies appear later in runs

    const POOL_EXTENSIONS = {
        neonCity: [
            // Fast
            { type: 'FLASH_MOSQUITO',  weight: 15, from: 30 },
            { type: 'SPARK_WASP',      weight: 12, from: 45 },
            { type: 'NEON_DART',       weight: 10, from: 70 },
            // Flying
            { type: 'HOVER_DRONE_MK2', weight: 14, from: 35 },
            { type: 'SWARM_MOTH',      weight: 12, from: 40 },
            { type: 'PLASMA_EAGLE',    weight: 8,  from: 90 },
            // Sniper
            { type: 'NEEDLE_TURRET',   weight: 10, from: 50 },
            { type: 'PULSE_SNIPER',    weight: 8,  from: 80 },
            // Kamikaze
            { type: 'FRAG_TICK',       weight: 10, from: 55 },
            { type: 'CLUSTER_MINE',    weight: 8,  from: 70 },
            // Robot
            { type: 'SAWBLADE_BOT',    weight: 8,  from: 60 },
            { type: 'TESLA_COIL',      weight: 6,  from: 85 },
            { type: 'SPIDER_MINE',     weight: 7,  from: 75 },
            // Splitter
            { type: 'GEL_BLOB',        weight: 6,  from: 90 },
            { type: 'BINARY_CELL',     weight: 5,  from: 100 },
            // Elite
            { type: 'ELITE_ENFORCER',  weight: 4,  from: 120 },
            { type: 'SHOCK_GENERAL',   weight: 3,  from: 150 },
            // Armored
            { type: 'SHIELD_DRONE',    weight: 6,  from: 80 },
            { type: 'PLATE_CRAWLER',   weight: 5,  from: 100 }
        ],
        iceCave: [
            // Fast
            { type: 'SONIC_FLEA',      weight: 14, from: 30 },
            { type: 'BLITZ_HORNET',    weight: 12, from: 50 },
            { type: 'THUNDER_MITE',    weight: 10, from: 75 },
            // Flying
            { type: 'SKY_STINGER',     weight: 12, from: 35 },
            { type: 'GHOST_COPTER',    weight: 8,  from: 60 },
            { type: 'THUNDER_OWL',     weight: 6,  from: 95 },
            // Sniper
            { type: 'FROST_ARCHER',    weight: 10, from: 45 },
            { type: 'BEAM_SENTINEL',   weight: 7,  from: 85 },
            // Kamikaze
            { type: 'FROST_BOMB',      weight: 10, from: 50 },
            { type: 'EMP_DRONE_K',     weight: 8,  from: 75 },
            // Tank
            { type: 'IRON_WALL',       weight: 6,  from: 70 },
            { type: 'STEEL_MAMMOTH',   weight: 4,  from: 110 },
            // Splitter
            { type: 'CRYSTAL_SHARD',   weight: 6,  from: 80 },
            { type: 'MERCURY_DROP',    weight: 5,  from: 100 },
            // Armored
            { type: 'MIRROR_GUARD',    weight: 5,  from: 90 },
            { type: 'PHASE_SHELL',     weight: 4,  from: 110 },
            // Elite
            { type: 'CRYO_MARSHAL',    weight: 3,  from: 140 },
            { type: 'MEDIC_OVERLORD',  weight: 3,  from: 130 }
        ],
        lavaFactory: [
            // Fast
            { type: 'BLITZ_HORNET',    weight: 14, from: 25 },
            { type: 'RAZOR_WING',      weight: 10, from: 55 },
            { type: 'WARP_SPRINTER',   weight: 8,  from: 80 },
            // Flying
            { type: 'BOMBER_HAWK',     weight: 12, from: 35 },
            { type: 'STORM_FALCON',    weight: 6,  from: 90 },
            // Sniper
            { type: 'VENOM_SPITTER',   weight: 10, from: 40 },
            { type: 'MORTAR_BUG',      weight: 8,  from: 70 },
            { type: 'RAIL_SPIDER',     weight: 5,  from: 100 },
            // Kamikaze
            { type: 'NAPALM_BUG',      weight: 10, from: 45 },
            { type: 'PLASMA_CHARGER',  weight: 7,  from: 80 },
            { type: 'NOVA_SEED',       weight: 5,  from: 110 },
            // Tank
            { type: 'GRANITE_HULK',    weight: 7,  from: 60 },
            { type: 'TUNGSTEN_RHINO',  weight: 4,  from: 100 },
            // Robot
            { type: 'FLAME_TURRET',    weight: 8,  from: 50 },
            { type: 'DRILL_MECH',      weight: 6,  from: 75 },
            { type: 'ROCKET_POD',      weight: 5,  from: 95 },
            // Splitter
            { type: 'HYDRA_NUCLEUS',   weight: 4,  from: 105 },
            // Elite
            { type: 'INFERNO_LORD',    weight: 3,  from: 140 },
            { type: 'BERSERKER_REX',   weight: 3,  from: 160 }
        ],
        darkForest: [
            // Fast
            { type: 'PLASMA_GNAT',     weight: 14, from: 25 },
            { type: 'VOID_DASHER',     weight: 8,  from: 70 },
            // Flying
            { type: 'RECON_PROBE',     weight: 12, from: 30 },
            { type: 'MAGNET_RAVEN',    weight: 7,  from: 75 },
            // Sniper
            { type: 'HOMING_EYE',      weight: 8,  from: 50 },
            { type: 'DEATH_LENS',      weight: 4,  from: 110 },
            // Kamikaze
            { type: 'TOXIC_SPORE',     weight: 12, from: 35 },
            { type: 'CHAIN_BOMBER',    weight: 6,  from: 85 },
            // Stealth — forest is their home biome
            { type: 'SHADOW_LURKER',   weight: 14, from: 20 },
            { type: 'PHANTOM_WISP',    weight: 12, from: 30 },
            { type: 'GHOST_WALKER',    weight: 10, from: 45 },
            { type: 'VOID_SHADE',      weight: 8,  from: 60 },
            { type: 'MIRAGE_TWIN',     weight: 7,  from: 55 },
            { type: 'ECLIPSE_STALKER', weight: 6,  from: 75 },
            { type: 'CHRONO_SHADE',    weight: 5,  from: 90 },
            { type: 'NULL_SPECTER',    weight: 4,  from: 105 },
            { type: 'DARK_MATTER',     weight: 3,  from: 120 },
            { type: 'DIMENSIONAL_RIFT',weight: 3,  from: 130 },
            // Splitter
            { type: 'FRACTAL_ORB',     weight: 5,  from: 80 },
            { type: 'AMOEBA_KING',     weight: 3,  from: 120 },
            // Armored
            { type: 'THORN_ARMOR',     weight: 5,  from: 70 },
            { type: 'VOID_CLOAK',      weight: 4,  from: 90 },
            // Elite
            { type: 'SHADOW_CAPTAIN',  weight: 3,  from: 140 },
            { type: 'PHALANX_CHIEF',   weight: 2,  from: 160 }
        ],
        spaceStation: [
            // Fast
            { type: 'WARP_SPRINTER',   weight: 12, from: 25 },
            { type: 'NEON_DART',       weight: 10, from: 40 },
            { type: 'VOID_DASHER',     weight: 8,  from: 65 },
            // Flying
            { type: 'PLASMA_EAGLE',    weight: 10, from: 35 },
            { type: 'STORM_FALCON',    weight: 7,  from: 80 },
            // Sniper
            { type: 'CLUSTER_CANNON',  weight: 8,  from: 50 },
            { type: 'DEATH_LENS',      weight: 5,  from: 100 },
            // Kamikaze
            { type: 'VOID_IMPLODER',   weight: 8,  from: 45 },
            { type: 'NOVA_SEED',       weight: 5,  from: 90 },
            { type: 'EMP_DRONE_K',     weight: 7,  from: 60 },
            // Tank
            { type: 'OBSIDIAN_CRAB',   weight: 6,  from: 55 },
            { type: 'CHROME_BEETLE',   weight: 5,  from: 80 },
            { type: 'TITAN_SHELL',     weight: 3,  from: 120 },
            { type: 'COLOSSUS_WORM',   weight: 2,  from: 150 },
            // Robot — space is their home biome
            { type: 'SAWBLADE_BOT',    weight: 10, from: 30 },
            { type: 'DRILL_MECH',      weight: 8,  from: 50 },
            { type: 'TESLA_COIL',      weight: 7,  from: 60 },
            { type: 'ROCKET_POD',      weight: 6,  from: 75 },
            { type: 'GRAVITY_BOT',     weight: 5,  from: 90 },
            { type: 'PULSE_MECH',      weight: 4,  from: 105 },
            { type: 'NEXUS_CORE',      weight: 3,  from: 120 },
            { type: 'OMEGA_SENTINEL',  weight: 2,  from: 145 },
            // Stealth
            { type: 'ECLIPSE_STALKER', weight: 5,  from: 70 },
            { type: 'DIMENSIONAL_RIFT',weight: 4,  from: 100 },
            // Splitter
            { type: 'QUANTUM_DIVIDE',  weight: 4,  from: 95 },
            { type: 'PRISM_SPLITTER',  weight: 3,  from: 110 },
            // Armored
            { type: 'ENERGY_BARRIER',  weight: 4,  from: 85 },
            { type: 'FORTRESS_NODE',   weight: 3,  from: 115 },
            { type: 'NANO_REPAIR',     weight: 3,  from: 100 },
            // Elite
            { type: 'SIEGE_BREAKER',   weight: 2,  from: 150 },
            { type: 'ELITE_ENFORCER',  weight: 3,  from: 130 },
            { type: 'WARDEN_PRIME',    weight: 2,  from: 160 }
        ]
    };

    // Extend existing pools (append, not replace)
    for (const [mapId, extensions] of Object.entries(POOL_EXTENSIONS)) {
        if (Enemies.MAP_ENEMY_POOLS[mapId]) {
            Enemies.MAP_ENEMY_POOLS[mapId].push(...extensions);
        }
    }

    console.log('[EnemyTypes Extended] Registered ' + Object.keys(EXTENDED_TYPES).length + ' new enemy types.');
})();
