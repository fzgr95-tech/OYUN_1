// ============================================================
// enemy.js — Enemy System (Spawner, AI, Pool)
// ============================================================

class SpriteSheet {
    constructor(image, frameWidth, frameHeight, frameCount) {
        this.image = image;
        this.frameWidth = frameWidth;
        this.frameHeight = frameHeight;
        this.frameCount = frameCount;
        this.cols = Math.max(1, Math.floor(image.width / frameWidth));
    }

    getSourceRect(frameIndex) {
        const idx = ((frameIndex % this.frameCount) + this.frameCount) % this.frameCount;
        const sourceX = (idx % this.cols) * this.frameWidth;
        const sourceY = Math.floor(idx / this.cols) * this.frameHeight;
        return { sourceX, sourceY, sourceWidth: this.frameWidth, sourceHeight: this.frameHeight };
    }
}

const Enemies = {
    /** @type {ObjectPool} */
    pool: null,

    // Spawn settings
    spawnTimer: 0,
    spawnInterval: 1.5,
    spawnCount: 2,
    spawnRadius: 500,
    gameTime: 0,
    enemySpeedMultiplier: 1,
    spawnRateMultiplier: 1,
    bossDamageMultiplier: 1,
    maxEnemies: 150,
    cullDistance: 1200,

    // Boss tracking
    activeBoss: null,
    miniBossTimer: 120,
    megaBossTimer: 300,
    miniBossInterval: 120,
    megaBossInterval: 300,
    bossWarningTimer: 0,
    telegraphs: [],

    // Enemy bullets (fired at player when level >= 5)
    bullets: [],
    maxBullets: 200,

    // Spatial partitioning (uniform grid) for fast nearby queries
    spatialCellSize: 150,
    _spatialMap: null,
    _nearbyBuffer: [],

    // Boss robotic hands
    bossHands: [],

    // Individual enemy sprites
    _sprites: {},
    _spritesReady: false,
    _spriteHoverTime: 0,

    // Enemy bullet sprite animation
    _bulletFx: {
        ready: false,
        failed: false,
        loading: false,
        frameWidth: 256,
        frameHeight: 256,
        bulletFrameCount: 6,
        impactFrameCount: 12,
        bulletFrameRate: 18,
        impactFrameRate: 22,
        bulletSprite: null,
        impactSprite: null,
        impactImage: null,
        impacts: [],
        impactPool: null,
        maxImpacts: 20,
        lowFpsImpactCap: 12,
        lowFpsDtThreshold: 0.024,
        lastDt: 0.016,
        anchorCentered: true,
        warnedNoAlpha: false,
        bulletSources: ['Buz_magarası/mermi_efekt.png', 'Buz_magarası/mermi_efektleri.png'],
        impactSources: ['Buz_magarası/buz_patlama.png']
    },

    _ensureSprites() {
        if (this._spritesReady || this._sprites._loading) return;
        this._sprites._loading = true;
        let loaded = 0;
        const total = 4;
        const markDone = () => { loaded++; if (loaded >= total) this._spritesReady = true; };

        this._sprites.kare = new Image();
        this._sprites.kare.onload = markDone;
        this._sprites.kare.onerror = markDone;
        this._sprites.kare.src = 'assets/sprites/kare_dusman.png';

        this._sprites.ucak = new Image();
        this._sprites.ucak.onload = markDone;
        this._sprites.ucak.onerror = markDone;
        this._sprites.ucak.src = 'assets/sprites/ucak_dusman.png';

        this._sprites.ufo = new Image();
        this._sprites.ufo.onload = markDone;
        this._sprites.ufo.onerror = markDone;
        this._sprites.ufo.src = 'assets/sprites/ufo_dusman.png';

        this._sprites.boss = new Image();
        this._sprites.boss.onload = markDone;
        this._sprites.boss.onerror = markDone;
        this._sprites.boss.src = 'assets/sprites/boss_dusman.png';
    },

    _ensureBulletFx() {
        if (this._bulletFx.ready || this._bulletFx.failed || this._bulletFx.loading) return;
        this._bulletFx.loading = true;

        let remaining = 2;
        let hasError = false;
        const finish = () => {
            remaining--;
            if (remaining > 0) return;
            this._bulletFx.loading = false;
            this._bulletFx.ready = !!(this._bulletFx.bulletSprite && this._bulletFx.impactSprite && !hasError);
            if (!this._bulletFx.ready) {
                this._bulletFx.failed = true;
                console.warn('[EnemyBullets] Sprite sheets are unavailable or invalid alpha. Rendering hidden to avoid white-box artifacts.');
            }
        };

        this._loadImageWithFallback(this._bulletFx.bulletSources, (img) => {
            this._bulletFx.bulletSprite = this._buildSpriteSheetFromImage(img, this._bulletFx.bulletFrameCount);
            if (!this._bulletFx.bulletSprite) hasError = true;
            finish();
        }, () => {
            hasError = true;
            finish();
        });

        this._loadImageWithFallback(this._bulletFx.impactSources, (img) => {
            this._bulletFx.impactSprite = this._buildSpriteSheetFromImage(img, this._bulletFx.impactFrameCount);
            this._bulletFx.impactImage = this._buildImpactImageFromSheet(this._bulletFx.impactSprite);
            if (!this._bulletFx.impactSprite) hasError = true;
            finish();
        }, () => {
            hasError = true;
            finish();
        });
    },

    _loadImageWithFallback(sources, onSuccess, onFail) {
        const tryAt = (idx) => {
            if (idx >= sources.length) {
                onFail();
                return;
            }
            const img = new Image();
            img.onload = () => onSuccess(img);
            img.onerror = () => tryAt(idx + 1);
            img.src = sources[idx];
        };
        tryAt(0);
    },

    _buildSpriteSheetFromImage(img, frameCount) {
        const fw = this._bulletFx.frameWidth;
        const fh = this._bulletFx.frameHeight;
        if (fw <= 0 || fh <= 0 || !img) return null;

        if (img.width !== img.height) {
            console.warn(`[EnemyBullets] Effect PNG is not square (${img.width}x${img.height}). Recommended square sprites.`);
        }
        if (img.width > 256 || img.height > 256) {
            console.warn(`[EnemyBullets] Effect PNG is large (${img.width}x${img.height}). Recommended 128x128 for performance.`);
        }

        const cleanCanvas = document.createElement('canvas');
        cleanCanvas.width = img.width;
        cleanCanvas.height = img.height;
        const ctx = cleanCanvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, cleanCanvas.width, cleanCanvas.height);
        ctx.drawImage(img, 0, 0);

        const data = ctx.getImageData(0, 0, cleanCanvas.width, cleanCanvas.height);
        const px = data.data;
        let hasVisible = false;
        let hasTransparency = false;
        for (let i = 0; i < px.length; i += 4) {
            const r = px[i];
            const g = px[i + 1];
            const b = px[i + 2];
            const a = px[i + 3];
            if (a < 250) hasTransparency = true;
            if (a <= 4) continue;
            const nearBlack = r < 18 && g < 18 && b < 18;
            const nearWhite = r > 242 && g > 242 && b > 242;
            if (nearBlack || nearWhite) {
                px[i + 3] = 0;
            } else {
                hasVisible = true;
            }
        }
        ctx.putImageData(data, 0, 0);

        if (!hasTransparency && !this._bulletFx.warnedNoAlpha) {
            this._bulletFx.warnedNoAlpha = true;
            console.warn('[EnemyBullets] Impact/Bullet PNG seems to have no transparent background (alpha).');
        }
        if (!hasVisible) return null;
        return new SpriteSheet(cleanCanvas, fw, fh, frameCount);
    },

    _buildImpactImageFromSheet(sheet) {
        if (!sheet || !sheet.image) return null;
        const src = sheet.getSourceRect(0);
        const c = document.createElement('canvas');
        c.width = src.sourceWidth;
        c.height = src.sourceHeight;
        const cx = c.getContext('2d', { alpha: true });
        cx.clearRect(0, 0, c.width, c.height);
        cx.drawImage(
            sheet.image,
            src.sourceX, src.sourceY, src.sourceWidth, src.sourceHeight,
            0, 0, src.sourceWidth, src.sourceHeight
        );
        return c;
    },

    _ensureBulletImpactPool() {
        if (this._bulletFx.impactPool) return;
        this._bulletFx.impactPool = new ObjectPool(
            () => ({
                x: 0,
                y: 0,
                life: 0,
                maxLife: 0.2,
                scale: 1,
                currentFrameIndex: 0,
                frameTimer: 0,
                frameRate: 22
            }),
            (imp, data) => {
                imp.x = data.x;
                imp.y = data.y;
                imp.life = 0;
                imp.maxLife = 0.2;
                imp.scale = data.scale;
                imp.currentFrameIndex = 0;
                imp.frameTimer = 0;
                imp.frameRate = data.frameRate || this._bulletFx.impactFrameRate;
            },
            this._bulletFx.maxImpacts
        );
    },

    _getImpactCapByPerf() {
        return this._bulletFx.lastDt > this._bulletFx.lowFpsDtThreshold
            ? this._bulletFx.lowFpsImpactCap
            : this._bulletFx.maxImpacts;
    },

    _destroyBulletImpact(imp) {
        if (!imp || !this._bulletFx.impactPool || !imp._poolActive) return;
        this._bulletFx.impactPool.releaseActive(imp);
    },

    _clearBulletImpactPool() {
        if (!this._bulletFx.impactPool) return;
        this._bulletFx.impactPool.releaseAll();
    },

    spawnBulletEffect(bullet) {
        if (!bullet || !this._bulletFx.ready || !this._bulletFx.impactSprite) return;
        this._ensureBulletImpactPool();
        if (!this._bulletFx.anchorCentered) {
            console.warn('[EnemyBullets] Impact anchor/pivot is not centered. Expected center pivot.');
            return;
        }

        const cap = this._getImpactCapByPerf();
        if (this._bulletFx.impactPool.active.length >= cap) {
            this._destroyBulletImpact(this._bulletFx.impactPool.active[0]);
        }

        const rawScale = Math.max(0.1, (bullet.radius || 4) * 0.07);
        const maxScale = Math.max(0.12, ((bullet.radius || 4) * 0.07) * 1.5);
        const effectScale = Math.min(rawScale, maxScale);

        this._bulletFx.impactPool.get({
            x: bullet.x,
            y: bullet.y,
            scale: effectScale,
            frameRate: this._bulletFx.impactFrameRate
        });
    },

    _getBulletMuzzle(enemy, dirX, dirY) {
        const angle = Math.atan2(dirY, dirX);
        const rightX = Math.cos(angle + Math.PI / 2);
        const rightY = Math.sin(angle + Math.PI / 2);

        let forward = enemy.radius + 8;
        let side = 0;

        if (enemy.sides === 4) {
            forward = enemy.radius + 10;
        } else if (enemy.sides === 3) {
            forward = enemy.radius + 12;
            side = Math.sin(enemy._zigzagPhase || 0) * 2.5;
        } else {
            forward = enemy.radius + 9;
        }

        return {
            x: enemy.x + dirX * forward + rightX * side,
            y: enemy.y + dirY * forward + rightY * side
        };
    },

    // Get the correct sprite image for an enemy
    _getSpriteForEnemy(e) {
        if (!this._spritesReady) return null;
        if (e.isBoss) return this._sprites.boss;
        if (e.sides === 3) return this._sprites.ucak;   // Rusher/Fighter → uçak
        if (e.sides === 4) return this._sprites.kare;   // Drone → kare
        return this._sprites.ufo;                        // Brute/Spinner (5+) → ufo
    },

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
    },

    init() {
        this.pool = new ObjectPool(
            // Create
            () => ({
                x: 0, y: 0,
                vx: 0, vy: 0,
                hp: 20, maxHp: 20,
                speed: 60,
                radius: 14,
                color: '#ff00ff',
                sides: 4,
                xp: 1,
                gold: 1,
                damage: 10,
                rotation: 0,
                flashTimer: 0,
                type: 'NEON_DRONE',
                isBoss: false,
                bossName: '',
                bossPatterns: null,
                patternTimers: {},
                bossPhase: 1,
                bossPhaseSpeedMult: 1,
                bossPhaseDamageMult: 1,
                _phaseNotified: {},
                dashTimer: 0,
                dashVx: 0,
                dashVy: 0,
                dashSpeedMult: 1,
                // Boss tier fields
                _shieldActive: false,
                _shieldTimer: 0,
                _multiDashCount: 0,
                _multiDashState: null,
                _multiDashTimer: 0,
                _multiDashDuration: 0,
                _multiDashPause: 0,
                _multiDashSpeed: 1,
                _bossTier: null,
                _bossTierData: null,
                // New fields for movement/shooting
                _faceAngle: 0,
                _zigzagPhase: 0,
                _spinAngle: 0,
                _shootTimer: 0,
                _lastMoveX: 0,
                _tilt: 0,
                _electroChargedTimer: 0,
                _heatedTimer: 0
            }),
            // Reset
            (e, x, y, type) => {
                const t = this.TYPES[type] || this.TYPES.NEON_DRONE;
                e.x = x;
                e.y = y;
                e.hp = t.hp;
                e.maxHp = t.hp;
                e.speed = t.speed;
                e.radius = t.radius;
                e.color = t.color;
                e.sides = t.sides;
                e.xp = t.xp;
                e.gold = t.gold;
                e.damage = t.damage;
                e.rotation = Math.random() * Math.PI * 2;
                e.flashTimer = 0;
                e.type = type || 'NEON_DRONE';
                e.isBoss = !!t.isBoss;
                e.bossName = t.name || e.type;
                e.bossPatterns = t.patterns || null;
                e.patternTimers = {};
                e.bossPhase = 1;
                e.bossPhaseSpeedMult = 1;
                e.bossPhaseDamageMult = 1;
                e._phaseNotified = {};
                e.dashTimer = 0;
                e.dashVx = 0;
                e.dashVy = 0;
                e.dashSpeedMult = 1;
                // Boss tier fields reset
                e._shieldActive = false;
                e._shieldTimer = 0;
                e._multiDashCount = 0;
                e._multiDashState = null;
                e._multiDashTimer = 0;
                e._multiDashDuration = 0;
                e._multiDashPause = 0;
                e._multiDashSpeed = 1;
                e._bossTier = null;
                e._bossTierData = null;
                // New fields
                e._faceAngle = 0;
                e._zigzagPhase = Math.random() * Math.PI * 2;
                e._spinAngle = Math.random() * Math.PI * 2;
                e._shootTimer = 2 + Math.random() * 3;
                e._lastMoveX = 0;
                e._tilt = 0;
                e._electroChargedTimer = 0;
                e._heatedTimer = 0;
            },
            160
        );

        this.spawnTimer = 0;
        this.spawnInterval = 1.5;
        this.spawnCount = 2;
        this.gameTime = 0;
        this.enemySpeedMultiplier = 1;
        this.spawnRateMultiplier = 1;
        this.bossDamageMultiplier = 1;
        this.activeBoss = null;
        this.miniBossTimer = 120;
        this.megaBossTimer = 300;
        this.bossWarningTimer = 0;
        this.telegraphs = [];
        this._spatialMap = this._spatialMap || new Map();
        this._spatialMap.clear();
        this._ensureBulletFx();
        this._ensureBulletImpactPool();
    },

    _rebuildSpatialIndex() {
        if (!this._spatialMap) this._spatialMap = new Map();
        this._spatialMap.clear();

        const size = this.spatialCellSize;
        for (let i = 0; i < this.pool.active.length; i++) {
            const e = this.pool.active[i];
            const cx = Math.floor(e.x / size);
            const cy = Math.floor(e.y / size);
            const key = cx + ',' + cy;
            let cell = this._spatialMap.get(key);
            if (!cell) {
                cell = [];
                this._spatialMap.set(key, cell);
            }
            cell.push(e);
        }
    },

    getNearby(x, y, radius = 0, outBuffer = null) {
        const out = outBuffer || this._nearbyBuffer;
        out.length = 0;

        if (!this._spatialMap || this.pool.active.length === 0) return out;

        const size = this.spatialCellSize;
        const minCx = Math.floor((x - radius) / size);
        const maxCx = Math.floor((x + radius) / size);
        const minCy = Math.floor((y - radius) / size);
        const maxCy = Math.floor((y + radius) / size);

        for (let cx = minCx; cx <= maxCx; cx++) {
            for (let cy = minCy; cy <= maxCy; cy++) {
                const cell = this._spatialMap.get(cx + ',' + cy);
                if (!cell) continue;
                for (let i = 0; i < cell.length; i++) {
                    out.push(cell[i]);
                }
            }
        }

        return out;
    },

    /**
     * Update spawner and all enemies
     */
    update(dt, playerX, playerY) {
        this.gameTime += dt;
        const map = Maps.getSelected ? Maps.getSelected() : null;
        const mapEnemySpeed = map && map.enemySpeedMultiplier ? map.enemySpeedMultiplier : 1;
        const parallax = Maps.getParallaxMetrics ? Maps.getParallaxMetrics() : null;
        const tunnelSpeed = parallax && parallax.enabled ? parallax.normalizedSpeed : 0;
        const tunnelMoveSync = 1 + Math.min(0.45, tunnelSpeed * 0.18);
        const fireRamp = (typeof Player !== 'undefined' && Player.level >= 5)
            ? Math.min(0.55, (Player.level - 4) * 0.04)
            : 0;

        // Difficulty scaling
        this._updateDifficulty();

        // Boss spawn logic
        this._updateBossSpawn(playerX, playerY);

        // Boss warning timer
        if (this.bossWarningTimer > 0) {
            this.bossWarningTimer -= dt;
        }

        // Spawn timer — only spawn if under cap
        this.spawnTimer -= dt * (this.spawnRateMultiplier || 1);
        if (this.spawnTimer <= 0 && this.pool.active.length < this.maxEnemies) {
            this.spawnTimer = this.spawnInterval;
            this._spawnWave(playerX, playerY);
        }

        this._updateTelegraphs(dt);

        // Update all enemies
        this.pool.updateAll((e, dt) => {
            // Cull far-away enemies to save performance (NOT bosses)
            const dx = playerX - e.x;
            const dy = playerY - e.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const isBoss = e.isBoss;
            if (dist > this.cullDistance && !isBoss) {
                if (typeof LevelSystem !== 'undefined' && LevelSystem.onEnemyDespawn) {
                    LevelSystem.onEnemyDespawn(1);
                }
                return true;
            }

            if (isBoss) {
                this._updateBossPatterns(e, dt, playerX, playerY, dist);
                // Shield timer güncelleme
                if (e._shieldActive && e._shieldTimer > 0) {
                    e._shieldTimer -= dt;
                    if (e._shieldTimer <= 0) {
                        e._shieldActive = false;
                        e._shieldTimer = 0;
                    }
                }
                // MultiDash devam mantığı
                if (e._multiDashCount > 0 && e.dashTimer <= 0) {
                    if (e._multiDashState === 'dash') {
                        e._multiDashState = 'pause';
                        e._multiDashTimer = e._multiDashPause;
                    } else {
                        e._multiDashCount--;
                        if (e._multiDashCount > 0) {
                            e._multiDashState = 'dash';
                            e._multiDashTimer = e._multiDashDuration;
                            // Yeni dash yönü (oyuncuya doğru)
                            const mdx2 = playerX - e.x;
                            const mdy2 = playerY - e.y;
                            const mlen2 = Math.sqrt(mdx2 * mdx2 + mdy2 * mdy2) || 1;
                            e.dashVx = mdx2 / mlen2;
                            e.dashVy = mdy2 / mlen2;
                            e.dashTimer = e._multiDashDuration;
                            e.dashSpeedMult = e._multiDashSpeed;
                            Particles.burstAt(e.x, e.y, e.color, 8);
                        } else {
                            e._multiDashState = null;
                        }
                    }
                }
            }

            // ---- Face Player: rotate to look at player ----
            e._faceAngle = Math.atan2(dy, dx) + Math.PI;

            // Move towards player — apply slow effect if active
            let speedMult = 1;
            if (e.slowTimer && e.slowTimer > 0) {
                e.slowTimer -= dt;
                speedMult = e.slowFactor || 0.5;
            }
            if (e._frostSlow && e._frostSlowFactor) {
                speedMult *= e._frostSlowFactor;
            }
            if (e._slowTimer && e._slowTimer > 0) {
                e._slowTimer -= dt;
                speedMult *= 0.4;
            }
            if (e._electroChargedTimer && e._electroChargedTimer > 0) {
                e._electroChargedTimer -= dt;
            }
            if (e._heatedTimer && e._heatedTimer > 0) {
                e._heatedTimer -= dt;
            }

            const moveSpeed = e.speed * speedMult * mapEnemySpeed * tunnelMoveSync * (this.enemySpeedMultiplier || 1);

            if (e.dashTimer > 0) {
                // Dash override (boss patterns)
                e.dashTimer -= dt;
                e.x += e.dashVx * moveSpeed * e.dashSpeedMult * dt;
                e.y += e.dashVy * moveSpeed * e.dashSpeedMult * dt;
            } else if (dist > 1 && !isBoss) {
                // ---- Per-type movement ----
                if (e.sides === 4) {
                    // SQUARE DRONE: slow drift towards player
                    const driftSpeed = moveSpeed * (0.45 + Math.min(0.2, tunnelSpeed * 0.08));
                    e.x += (dx / dist) * driftSpeed * dt;
                    e.y += (dy / dist) * driftSpeed * dt;
                } else if (e.sides === 3) {
                    // TRIANGLE FIGHTER: fast zigzag
                    e._zigzagPhase += dt * 5;
                    const perpX = -dy / dist;
                    const perpY = dx / dist;
                    const zigzag = Math.sin(e._zigzagPhase) * 80;
                    e.x += (dx / dist) * moveSpeed * dt + perpX * zigzag * dt;
                    e.y += (dy / dist) * moveSpeed * dt + perpY * zigzag * dt;
                } else {
                    // CIRCLE SPINNER (sides >= 5): straight line + spin
                    e.x += (dx / dist) * moveSpeed * dt;
                    e.y += (dy / dist) * moveSpeed * dt;
                    e._spinAngle += dt * 6;  // fast spin
                }
            } else if (dist > 1 && isBoss) {
                // Boss: standard movement toward player
                e.x += (dx / dist) * moveSpeed * dt;
                e.y += (dy / dist) * moveSpeed * dt;
            }

            // Rotation: spinner spins, others face player
            if (e.sides >= 5 && !isBoss) {
                e.rotation = e._spinAngle;
            } else {
                e.rotation = e._faceAngle;
            }

            // ---- Shooting (Level 5+) ----
            if (typeof Player !== 'undefined' && Player.level >= 5 && !isBoss) {
                e._shootTimer -= dt;
                if (e._shootTimer <= 0 && dist < 500) {
                    const cadenceScale = 1 + fireRamp + Math.min(0.35, tunnelSpeed * 0.14);
                    e._shootTimer = (2.5 + Math.random() * 2) / cadenceScale;
                    this._fireEnemyBullet(e, playerX, playerY);
                }
            }

            // Flash decay
            if (e.flashTimer > 0) {
                e.flashTimer -= dt;
            }

            return false;
        }, dt);

        // Update enemy bullets
        this._rebuildSpatialIndex();

        // Update enemy bullets
        this._updateBullets(dt, playerX, playerY);

        // Update boss hands
        this._updateBossHands(dt, playerX, playerY);
    },

    /**
     * Spawn a wave of enemies around the player
     */
    _spawnWave(playerX, playerY) {
        // Level System: spawn izni kontrolü
        if (typeof LevelSystem !== 'undefined' && !LevelSystem.canSpawn()) return;

        let spawnedCount = 0;
        for (let i = 0; i < this.spawnCount; i++) {
            // Level System: fazla spawn engelle
            if (typeof LevelSystem !== 'undefined' && LevelSystem.active) {
                if (LevelSystem.enemiesSpawnedThisLevel + spawnedCount >= LevelSystem.totalEnemiesForLevel) break;
            }

            const angle = Math.random() * Math.PI * 2;
            const dist = this.spawnRadius + Math.random() * 100;
            const sx = playerX + Math.cos(angle) * dist;
            const sy = playerY + Math.sin(angle) * dist;

            const type = this._rollEnemyType();

            this.pool.get(sx, sy, type);
            spawnedCount++;
        }

        // Level System: spawn kaydı
        if (typeof LevelSystem !== 'undefined' && spawnedCount > 0) {
            LevelSystem.recordSpawn(spawnedCount);
        }
    },

    _rollEnemyType() {
        const map = Maps.getSelected ? Maps.getSelected() : null;
        const mapId = map && map.id ? map.id : 'neonCity';
        const pool = this.MAP_ENEMY_POOLS[mapId] || this.MAP_ENEMY_POOLS.neonCity;

        const available = pool.filter(p => this.gameTime >= p.from);
        const total = available.reduce((sum, p) => sum + p.weight, 0);
        if (total <= 0) return 'NEON_DRONE';

        let roll = Math.random() * total;
        for (const entry of available) {
            roll -= entry.weight;
            if (roll <= 0) return entry.type;
        }
        return available[0].type;
    },

    /**
     * Scale difficulty over time
     */
    _updateDifficulty() {
        const minutes = this.gameTime / 60;
        const map = Maps.getSelected ? Maps.getSelected() : null;
        const pressure = map && map.spawnPressure ? map.spawnPressure : 1;

        const baseInterval = Math.max(0.5, 1.5 - minutes * 0.1);
        const baseCount = Math.min(8, Math.floor(2 + minutes * 0.8));

        this.spawnInterval = Math.max(0.35, baseInterval / pressure);
        this.spawnCount = Math.min(10, Math.floor(baseCount * pressure));
    },

    /**
     * Boss spawn logic — timed spawns with warning
     */
    _updateBossSpawn(playerX, playerY) {
        // Level System aktifken zamanlı boss spawn'ı devre dışı
        if (typeof LevelSystem !== 'undefined' && LevelSystem.active) {
            // Sadece mevcut boss HP bar kontrolü yap
            if (this.activeBoss && !this.activeBoss._poolActive) {
                this.activeBoss = null;
                this.bossHands = [];
                UI.hideBossHP();
            }
            if (this.activeBoss) {
                UI.updateBossHP(this.activeBoss.hp, this.activeBoss.maxHp, this.activeBoss.bossName || this.activeBoss.type);
            }
            return;
        }

        // Check if boss is dead (removed from pool)
        if (this.activeBoss && !this.activeBoss._poolActive) {
            this.activeBoss = null;
            this.bossHands = [];
            UI.hideBossHP();
        }

        // Don't spawn boss if one is already alive
        if (this.activeBoss) {
            // Update boss HP bar in UI
            UI.updateBossHP(this.activeBoss.hp, this.activeBoss.maxHp, this.activeBoss.bossName || this.activeBoss.type);
            return;
        }

        const map = Maps.getSelected ? Maps.getSelected() : null;
        const mapId = map && map.id ? map.id : 'neonCity';
        const bossSet = this.MAP_BOSSES[mapId] || this.MAP_BOSSES.neonCity;

        // Mega boss has priority
        if (this.gameTime >= this.megaBossTimer) {
            this._spawnBoss(bossSet.mega, playerX, playerY);
            this.megaBossTimer = this.gameTime + this.megaBossInterval;
            return;
        }

        // Mini boss
        if (this.gameTime >= this.miniBossTimer) {
            this._spawnBoss(bossSet.mini, playerX, playerY);
            this.miniBossTimer = this.gameTime + this.miniBossInterval;
        }
    },

    /**
     * Spawn a boss enemy
     */
    _spawnBoss(type, playerX, playerY) {
        const angle = Math.random() * Math.PI * 2;
        const dist = this.spawnRadius + 100;
        const sx = playerX + Math.cos(angle) * dist;
        const sy = playerY + Math.sin(angle) * dist;

        // Scale boss HP with game time
        const minutes = this.gameTime / 60;
        const hpScale = 1 + minutes * 0.3;

        const boss = this.pool.get(sx, sy, type);
        if (boss) {
            boss.hp = Math.floor(boss.hp * hpScale);
            boss.maxHp = boss.hp;
            this.activeBoss = boss;

            // Spawn robotic hands for boss
            this._spawnBossHands(boss);

            // Show warning
            this.bossWarningTimer = 2.0;
            UI.showBossWarning(`⚠️ ${boss.bossName.toUpperCase()} GELİYOR!`);
            if (typeof Audio !== 'undefined' && Audio.playBossWarning) Audio.playBossWarning();
        }
    },

    _updateBossPatterns(boss, dt, playerX, playerY, distToPlayer) {
        if (!boss.bossPatterns || boss.bossPatterns.length === 0) return;

        this._updateBossPhaseState(boss);

        for (const pattern of boss.bossPatterns) {
            // interval: 0 olan kalıplar (minionSurge) faz değişiminde tetiklenir, timer'dan atla
            if (!pattern.interval || pattern.interval <= 0) continue;

            const key = pattern.id;
            const current = boss.patternTimers[key] == null ? pattern.interval * (0.5 + Math.random() * 0.35) : boss.patternTimers[key];
            let next = current - dt * (boss.bossPhaseSpeedMult || 1);
            if (next <= 0) {
                this._castBossPattern(boss, pattern, playerX, playerY, distToPlayer);
                next = pattern.interval * (0.85 + Math.random() * 0.3);
            }
            boss.patternTimers[key] = next;
        }
    },

    _updateBossPhaseState(boss) {
        const hpRatio = boss.maxHp > 0 ? boss.hp / boss.maxHp : 1;
        let phase = 1;
        if (hpRatio <= 0.25) phase = 3;
        else if (hpRatio <= 0.5) phase = 2;

        if (phase === boss.bossPhase) return;

        boss.bossPhase = phase;
        boss.bossPhaseSpeedMult = phase === 1 ? 1 : phase === 2 ? 1.16 : 1.32;
        boss.bossPhaseDamageMult = phase === 1 ? 1 : phase === 2 ? 1.12 : 1.24;

        if (!boss._phaseNotified[phase]) {
            boss._phaseNotified[phase] = true;
            const phaseText = phase === 2 ? 'ÖFKELENDİ' : 'DELİRDİ';
            UI.showBossWarning(`⚠️ ${boss.bossName.toUpperCase()} ${phaseText}!`);
            if (typeof Audio !== 'undefined' && Audio.playBossWarning) Audio.playBossWarning();
            if (typeof Renderer !== 'undefined' && Renderer.notifyBossCast) Renderer.notifyBossCast(boss.color);
            Camera.triggerShake(10 + phase * 2, 0.2);
            Particles.burstAt(boss.x, boss.y, boss.color, 20 + phase * 4);

            // MinionSurge: faz değişiminde minion dalgası
            if (boss.bossPatterns) {
                const surge = boss.bossPatterns.find(p => p.id === 'minionSurge');
                if (surge) {
                    this._spawnSummons(boss, surge.summonType, surge.count || 6);
                }
            }
        }
    },

    _castBossPattern(boss, pattern, playerX, playerY, distToPlayer) {
        const dmgMult = (boss.bossPhaseDamageMult || 1) * (this.bossDamageMultiplier || 1);

        if (pattern.id === 'dashStrike') {
            const dx = playerX - boss.x;
            const dy = playerY - boss.y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;
            boss.dashVx = dx / len;
            boss.dashVy = dy / len;
            boss.dashTimer = pattern.duration;
            boss.dashSpeedMult = (pattern.speedMult || 3) * (boss.bossPhase >= 3 ? 1.15 : 1);
            Particles.burstAt(boss.x, boss.y, boss.color, 10);
            if (Renderer.notifyBossCast) Renderer.notifyBossCast(boss.color);
            if (typeof Audio !== 'undefined' && Audio.playBossCast) Audio.playBossCast();
            return;
        }

        if (pattern.id === 'summonWave') {
            this._spawnSummons(boss, pattern.summonType, pattern.count || 3);
            if (Renderer.notifyBossCast) Renderer.notifyBossCast(boss.color);
            if (typeof Audio !== 'undefined' && Audio.playBossCast) Audio.playBossCast();
            return;
        }

        if (pattern.id === 'novaPulse' || pattern.id === 'ringBurst') {
            this._spawnTelegraph({
                x: boss.x,
                y: boss.y,
                radius: pattern.radius * (boss.bossPhase >= 3 ? 1.08 : 1),
                damage: Math.ceil((pattern.damage || 12) * dmgMult),
                color: pattern.color || boss.color,
                duration: pattern.id === 'ringBurst' ? 1.15 : 0.85,
                shake: pattern.id === 'ringBurst' ? 12 : 8
            });
            if (Renderer.notifyBossCast) Renderer.notifyBossCast(pattern.color || boss.color);
            return;
        }

        if (pattern.id === 'regenPulse') {
            const heal = Math.floor(boss.maxHp * (pattern.healRatio || 0.03) * (boss.bossPhase >= 3 ? 1.25 : 1));
            boss.hp = Math.min(boss.maxHp, boss.hp + Math.max(1, heal));
            Particles.burstAt(boss.x, boss.y, '#88ffcc', 12);
            return;
        }

        if (pattern.id === 'gravityWell') {
            this._spawnTelegraph({
                x: boss.x,
                y: boss.y,
                radius: pattern.radius,
                damage: Math.ceil((pattern.damage || 8) * dmgMult),
                color: pattern.color || '#88ffdd',
                duration: 0.95,
                shake: 7,
                pull: (pattern.pull || 100) * (boss.bossPhase >= 2 ? 1.15 : 1)
            });
            if (Renderer.notifyBossCast) Renderer.notifyBossCast(pattern.color || '#88ffdd');
            return;
        }

        // ── Yeni Boss Kalıpları (BossSystem) ──

        if (pattern.id === 'shieldPhase') {
            boss._shieldTimer = pattern.duration || 4.0;
            boss._shieldActive = true;
            Particles.burstAt(boss.x, boss.y, '#ffffff', 15);
            if (Renderer.notifyBossCast) Renderer.notifyBossCast('#ffffff');
            if (typeof Audio !== 'undefined' && Audio.playBossCast) Audio.playBossCast();
            return;
        }

        if (pattern.id === 'multiDash') {
            boss._multiDashCount = pattern.dashes || 3;
            boss._multiDashDuration = pattern.dashDuration || 0.35;
            boss._multiDashPause = pattern.dashPause || 0.3;
            boss._multiDashSpeed = (pattern.speedMult || 3.2) * (boss.bossPhase >= 3 ? 1.15 : 1);
            boss._multiDashState = 'dash'; // 'dash' veya 'pause'
            boss._multiDashTimer = boss._multiDashDuration;
            // İlk dash yönü
            const mdx = playerX - boss.x;
            const mdy = playerY - boss.y;
            const mlen = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
            boss.dashVx = mdx / mlen;
            boss.dashVy = mdy / mlen;
            boss.dashTimer = boss._multiDashDuration;
            boss.dashSpeedMult = boss._multiDashSpeed;
            Particles.burstAt(boss.x, boss.y, boss.color, 12);
            if (Renderer.notifyBossCast) Renderer.notifyBossCast(boss.color);
            if (typeof Audio !== 'undefined' && Audio.playBossCast) Audio.playBossCast();
            return;
        }

        if (pattern.id === 'minionSurge') {
            // minionSurge: HP milestone'larında tetiklenen ek minion dalgası
            // interval: 0 olduğu için timer sistemi çağırmaz — _updateBossPhaseState'den çağrılır
            return;
        }
    },

    _spawnTelegraph(data) {
        this.telegraphs.push({
            x: data.x,
            y: data.y,
            radius: data.radius,
            damage: data.damage,
            color: data.color,
            timer: data.duration,
            maxTimer: data.duration,
            shake: data.shake || 8,
            pull: data.pull || 0
        });
    },

    _updateTelegraphs(dt) {
        for (let i = this.telegraphs.length - 1; i >= 0; i--) {
            const t = this.telegraphs[i];
            t.timer -= dt;
            if (t.timer > 0) continue;

            const dx = Player.x - t.x;
            const dy = Player.y - t.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= t.radius) {
                if (t.pull > 0) {
                    const len = dist || 1;
                    Player.x += (-dx / len) * t.pull * 0.09;
                    Player.y += (-dy / len) * t.pull * 0.09;
                }
                Player.takeDamage(t.damage);
                Camera.triggerShake(t.shake, 0.2);
            }

            Particles.burstAt(t.x, t.y, t.color, 22);
            this.telegraphs.splice(i, 1);
        }
    },

    _spawnSummons(boss, summonType, count) {
        if (!this.TYPES[summonType]) return;
        for (let i = 0; i < count; i++) {
            if (this.pool.active.length >= this.maxEnemies) break;
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const dist = boss.radius + 30 + Math.random() * 45;
            const sx = boss.x + Math.cos(angle) * dist;
            const sy = boss.y + Math.sin(angle) * dist;
            this.pool.get(sx, sy, summonType);
        }
    },

    /**
     * Deal damage to an enemy, returns true if killed
     *
     * ---- Enemy Bullet System ----
     */

    _fireEnemyBullet(enemy, playerX, playerY) {
        if (this.bullets.length >= this.maxBullets) return;
        const dx = playerX - enemy.x;
        const dy = playerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const dirX = dx / dist;
        const dirY = dy / dist;
        const parallax = Maps.getParallaxMetrics ? Maps.getParallaxMetrics() : null;
        const tunnelSpeed = parallax && parallax.enabled ? parallax.normalizedSpeed : 0;
        const speed = 180 * (1 + Math.min(0.35, tunnelSpeed * 0.15));
        const palette = Maps.getNeonTunnelPalette ? Maps.getNeonTunnelPalette() : null;
        const bulletColor = palette && palette.accent ? palette.accent : enemy.color;
        const pulseColor = palette && palette.pulse ? palette.pulse : '#ffffff';
        const muzzle = this._getBulletMuzzle(enemy, dirX, dirY);
        const spawnX = muzzle.x;
        const spawnY = muzzle.y;
        const scale = enemy.sides === 3 ? 0.58 : enemy.sides >= 5 ? 0.72 : 0.64;
        const width = 26 * scale;
        const height = 26 * scale;
        const animFps = this._bulletFx.bulletFrameRate * (0.85 + (speed / 220) * 0.55);
        const hitRadius = Math.max(2.4, Math.min(width, height) * 0.22);

        this.bullets.push({
            x: spawnX,
            y: spawnY,
            vx: dirX * speed,
            vy: dirY * speed,
            damage: Math.ceil(enemy.damage * 0.4),
            color: bulletColor,
            pulseColor,
            radius: 4,
            life: 3.0,
            width,
            height,
            scale,
            currentFrameIndex: 0,
            frameTimer: 0,
            frameRate: animFps,
            hitRadius
        });
    },

    _updateBullets(dt, playerX, playerY) {
        this._bulletFx.lastDt = dt;
        if (this._bulletFx.impactPool) {
            this._bulletFx.impactPool.updateAll((imp, delta) => {
                imp.life += delta;
                if (imp.life >= imp.maxLife) {
                    return true;
                }
                imp.scale += delta * 3.5;
                imp.frameTimer += delta;
                const step = 1 / Math.max(1, imp.frameRate || this._bulletFx.impactFrameRate);
                while (imp.frameTimer >= step) {
                    imp.frameTimer -= step;
                    imp.currentFrameIndex++;
                    if (imp.currentFrameIndex >= this._bulletFx.impactFrameCount) {
                        return true;
                    }
                }
                return false;
            }, dt);
        }

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.x += b.vx * dt;
            b.y += b.vy * dt;
            b.life -= dt;

            b.frameTimer += dt;
            const frameStep = 1 / Math.max(1, b.frameRate || 14);
            while (b.frameTimer >= frameStep) {
                b.frameTimer -= frameStep;
                b.currentFrameIndex = (b.currentFrameIndex + 1) % Math.max(1, this._bulletFx.bulletFrameCount);
            }

            if (b.life <= 0) {
                this._destroyBullet(i);
                continue;
            }

            // Collision with player
            const dx = Player.x - b.x;
            const dy = Player.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < Player.radius + (b.hitRadius || b.radius)) {
                this._onBulletCollision(b, i);
                Player.takeDamage(b.damage);
                const lowFps = this._bulletFx.lastDt > this._bulletFx.lowFpsDtThreshold;
                if (!lowFps || Math.random() < 0.45) {
                    Particles.damageFlash(b.x, b.y);
                }
            }
        }
    },

    _onBulletCollision(bullet, index) {
        this.spawnBulletEffect(bullet);
        this._destroyBullet(index);
    },

    _destroyBullet(index) {
        if (index < 0 || index >= this.bullets.length) return;
        this.bullets.splice(index, 1);
    },

    drawBullets(ctx) {
        this._ensureBulletFx();
        for (const b of this.bullets) {
            const drawAngle = Math.atan2(b.vy, b.vx);
            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.rotate(drawAngle);

            if (this._bulletFx.ready && this._bulletFx.bulletSprite) {
                const src = this._bulletFx.bulletSprite.getSourceRect(b.currentFrameIndex);
                ctx.globalCompositeOperation = 'lighter';
                ctx.shadowColor = b.color;
                ctx.shadowBlur = 16;
                ctx.globalAlpha = 0.95;
                ctx.drawImage(
                    this._bulletFx.bulletSprite.image,
                    src.sourceX, src.sourceY, src.sourceWidth, src.sourceHeight,
                    -b.width * 0.5, -b.height * 0.5, b.width, b.height
                );
            }

            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
    },

    drawBulletEffects(ctx) {
        if (!this._bulletFx.ready || !this._bulletFx.impactSprite) return;
        const impacts = this.getBulletEffectsForRender();
        for (const imp of impacts) {
            const src = this._bulletFx.impactSprite.getSourceRect(imp.currentFrameIndex);
            const size = this._bulletFx.frameWidth * imp.scale;
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.globalAlpha = 0.96;
            ctx.shadowColor = '#9ee6ff';
            ctx.shadowBlur = 16;
            ctx.drawImage(
                this._bulletFx.impactSprite.image,
                src.sourceX, src.sourceY, src.sourceWidth, src.sourceHeight,
                imp.x - size * 0.5, imp.y - size * 0.5, size, size
            );
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
    },

    getBulletEffectsForRender() {
        if (!this._bulletFx.impactPool) return this._bulletFx.impacts;
        return this._bulletFx.impactPool.active;
    },

    getBulletImpactImage() {
        return this._bulletFx.impactImage;
    },

    // ---- Boss Robotic Hands ----

    _spawnBossHands(boss) {
        this.bossHands = [
            { offsetAngle: -Math.PI / 2, dist: boss.radius * 2.5, x: 0, y: 0, radius: boss.radius * 0.5, damage: boss.damage * 0.6, phase: 0 },
            { offsetAngle: Math.PI / 2, dist: boss.radius * 2.5, x: 0, y: 0, radius: boss.radius * 0.5, damage: boss.damage * 0.6, phase: Math.PI }
        ];
    },

    _updateBossHands(dt, playerX, playerY) {
        if (!this.activeBoss || this.bossHands.length === 0) return;
        const boss = this.activeBoss;

        for (const hand of this.bossHands) {
            hand.phase += dt * 1.2;
            const baseAngle = boss._faceAngle + hand.offsetAngle + Math.sin(hand.phase) * 0.4;
            const reachDist = hand.dist + Math.sin(hand.phase * 1.7) * 20;

            hand.x = boss.x + Math.cos(baseAngle) * reachDist;
            hand.y = boss.y + Math.sin(baseAngle) * reachDist;

            // Push toward player
            const dx = playerX - hand.x;
            const dy = playerY - hand.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            hand.x += (dx / dist) * 40 * dt;
            hand.y += (dy / dist) * 40 * dt;

            // Hand collision with player
            const pdx = Player.x - hand.x;
            const pdy = Player.y - hand.y;
            const pdist = Math.sqrt(pdx * pdx + pdy * pdy);
            if (pdist < Player.radius + hand.radius) {
                Player.takeDamage(hand.damage);
                if (pdist > 0) {
                    Player.x += (pdx / pdist) * 20;
                    Player.y += (pdy / pdist) * 20;
                }
            }
        }
    },

    drawBossHands(ctx) {
        if (!this.activeBoss || this.bossHands.length === 0) return;
        const boss = this.activeBoss;

        for (const hand of this.bossHands) {
            // Arm connector
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(boss.x, boss.y);
            ctx.lineTo(hand.x, hand.y);
            ctx.strokeStyle = boss.color + '80';
            ctx.lineWidth = 6;
            ctx.shadowColor = boss.color;
            ctx.shadowBlur = 10;
            ctx.stroke();
            ctx.restore();

            // Hand sprite
            const sprite = this._getSpriteForEnemy(boss);
            const handSize = hand.radius * 4;
            if (sprite) {
                ctx.save();
                ctx.translate(hand.x, hand.y);
                const angle = Math.atan2(Player.y - hand.y, Player.x - hand.x);
                ctx.rotate(angle);
                ctx.shadowColor = boss.color;
                ctx.shadowBlur = 15;
                ctx.drawImage(sprite, -handSize / 2, -handSize / 2, handSize, handSize);
                ctx.restore();
            } else {
                ctx.save();
                ctx.beginPath();
                ctx.arc(hand.x, hand.y, hand.radius, 0, Math.PI * 2);
                ctx.fillStyle = boss.color;
                ctx.shadowColor = boss.color;
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.restore();
            }
        }
    },

    /**
     * Deal damage to an enemy, returns true if killed
     */
    damageEnemy(enemy, amount) {
        // Shield Phase: kalkan aktifken hasar %90 azalır
        if (enemy._shieldActive) {
            amount = Math.ceil(amount * 0.1);
            Particles.weaponSpark(enemy.x, enemy.y, '#ffffff');
        }

        if (typeof Characters !== 'undefined' && Characters.getDamageMultiplier) {
            amount *= Characters.getDamageMultiplier(enemy);
        }
        // Critical hit passive
        if (Player.critChance > 0 && Math.random() < Player.critChance) {
            amount *= 2;
            Particles.weaponSpark(enemy.x, enemy.y, '#ffff00');
        }

        enemy.hp -= amount;
        enemy.flashTimer = 0.1;

        const enemyCount = this.pool.active.length;
        const isBoss = enemy.isBoss;

        // Particles on hit
        if (isBoss || enemyCount < 60) {
            Particles.damageFlash(enemy.x, enemy.y);
        }

        // Update boss HP bar
        if (isBoss && this.activeBoss === enemy) {
            UI.updateBossHP(enemy.hp, enemy.maxHp, enemy.bossName || enemy.type);
        }

        if (enemy.hp <= 0) {
            if (Particles.spawnIceEnemyBurst) {
                Particles.spawnIceEnemyBurst(enemy);
            }

            if (isBoss) {
                // Boss death: big explosion + screen shake + guaranteed gold
                Particles.burstAt(enemy.x, enemy.y, enemy.color, 30);
                Particles.burstAt(enemy.x, enemy.y, '#ffaa00', 20);
                Particles.burstAt(enemy.x, enemy.y, '#ffffff', 15);
                // Guaranteed gold drop for bosses (always drops)
                GoldOrbs.pool.get(enemy.x, enemy.y, enemy.gold);
                // Clear boss reference
                if (this.activeBoss === enemy) {
                    this.activeBoss = null;
                    UI.hideBossHP();
                }
            } else {
                const burstCount = enemyCount > 100 ? 4 : enemyCount > 60 ? 6 : 10 + enemy.radius;
                Particles.burstAt(enemy.x, enemy.y, enemy.color, burstCount);
            }
            if (Renderer.notifyKill) {
                Renderer.notifyKill(Game && Game.comboCount ? Game.comboCount : 1);
            }
            return true;
        }
        return false;
    },

    /**
     * Check collision between an enemy and a circle
     */
    checkCircleCollision(enemy, cx, cy, cr) {
        const dx = enemy.x - cx;
        const dy = enemy.y - cy;
        const r = enemy.radius + cr;
        return (dx * dx + dy * dy) < (r * r);
    },

    checkSpriteCenterCollision(enemy, cx, cy, cr) {
        const dx = enemy.x - cx;
        const dy = enemy.y - cy;
        const shrink = enemy.isBoss ? 0.74 : 0.64;
        const r = enemy.radius * shrink + cr;
        return (dx * dx + dy * dy) < (r * r);
    },

    /**
     * Get the closest enemy to a point
     */
    getClosest(x, y, maxDist = Infinity) {
        let closest = null;
        let closestDistSq = maxDist * maxDist;
        const candidates = Number.isFinite(maxDist)
            ? this.getNearby(x, y, maxDist + 80)
            : this.pool.active;

        for (const e of candidates) {
            if (!e || !e._poolActive) continue;
            const dx = e.x - x;
            const dy = e.y - y;
            const distSq = dx * dx + dy * dy;
            if (distSq < closestDistSq) {
                closest = e;
                closestDistSq = distSq;
            }
        }
        return closest;
    },

    /**
     * Get N closest enemies
     */
    getClosestN(x, y, n, maxDist = Infinity) {
        if (n <= 0) return [];

        const maxDistSq = maxDist * maxDist;
        const candidates = Number.isFinite(maxDist)
            ? this.getNearby(x, y, maxDist + 80)
            : this.pool.active;

        const best = [];
        for (let i = 0; i < candidates.length; i++) {
            const e = candidates[i];
            if (!e || !e._poolActive) continue;

            const dx = e.x - x;
            const dy = e.y - y;
            const distSq = dx * dx + dy * dy;
            if (distSq > maxDistSq) continue;

            let insertAt = best.length;
            while (insertAt > 0 && distSq < best[insertAt - 1].distSq) {
                insertAt--;
            }
            if (insertAt >= n) continue;

            best.splice(insertAt, 0, { enemy: e, distSq });
            if (best.length > n) best.pop();
        }

        const result = new Array(best.length);
        for (let i = 0; i < best.length; i++) {
            result[i] = best[i].enemy;
        }
        return result;
    },

    /**
     * Draw all enemies
     */
    draw(ctx) {
        const enemyCount = this.pool.active.length;
        const perfMode = enemyCount > 80;
        this._spriteHoverTime += 0.05;
        this._ensureSprites();

        this.pool.drawAll((ctx, e) => {
            const isBoss = e.isBoss;
            const sprite = this._getSpriteForEnemy(e);

            // --- Hover effect: smooth Y oscillation via Math.sin ---
            const hoverAmp = isBoss ? 6 : 4;
            const hoverSpeed = isBoss ? 2.2 : 3;
            const hoverPhase = e.x * 0.01 + e.y * 0.007;
            const hover = Math.sin(this._spriteHoverTime * hoverSpeed + hoverPhase) * hoverAmp;

            // --- Face-Player rotation (spinner spins instead) ---
            const drawRotation = (e.sides >= 5 && !isBoss) ? e._spinAngle : e._faceAngle;

            if (isBoss) {
                const pulse = 1 + Math.sin(e.rotation * 3) * 0.08;
                const r = e.radius * pulse;
                const drawSize = r * 6.0;

                // Outer danger glow
                ctx.save();
                ctx.globalAlpha = 0.2 + Math.sin(e.rotation * 4) * 0.1;
                ctx.beginPath();
                ctx.arc(e.x, e.y + hover, r * 2, 0, Math.PI * 2);
                const glow = ctx.createRadialGradient(e.x, e.y + hover, r * 0.5, e.x, e.y + hover, r * 2);
                glow.addColorStop(0, e.color + '60');
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.fill();
                ctx.restore();

                // Boss sprite with hover + face-player rotation
                ctx.save();
                ctx.translate(e.x, e.y + hover);
                ctx.rotate(drawRotation);

                if (e.flashTimer > 0) {
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                        ? Renderer.getShadowBlur(30, true)
                        : 30;
                } else {
                    ctx.shadowColor = e.color;
                    ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                        ? Renderer.getShadowBlur(20, true)
                        : 20;
                }

                if (sprite) {
                    ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
                } else {
                    Renderer.drawNeonPoly(ctx, 0, 0, r, Math.max(6, e.sides || 6), 0, e.color, 14);
                }
                ctx.shadowBlur = 0;
                ctx.restore();

                // Boss name tag
                ctx.save();
                ctx.font = 'bold 11px Orbitron, monospace';
                ctx.textAlign = 'center';
                ctx.fillStyle = e.color;
                ctx.shadowColor = e.color;
                ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                    ? Renderer.getShadowBlur(10)
                    : 10;
                ctx.fillText(e.bossName || 'BOSS', e.x, e.y + hover - r - 16);
                ctx.restore();

                // Boss HP bar (always visible, bigger)
                const barW = r * 2.5;
                const barH = 5;
                const barX = e.x - barW / 2;
                const barY = e.y + hover - r - 12;
                const hpRatio = e.hp / e.maxHp;

                ctx.fillStyle = 'rgba(0,0,0,0.6)';
                ctx.fillRect(barX, barY, barW, barH);
                ctx.fillStyle = hpRatio > 0.5 ? '#ff4400' : hpRatio > 0.25 ? '#ff2200' : '#ff0000';
                ctx.fillRect(barX, barY, barW * hpRatio, barH);
                ctx.strokeStyle = '#ff660080';
                ctx.lineWidth = 1;
                ctx.strokeRect(barX, barY, barW, barH);
            } else {
                // Normal enemy — PNG sprite with hover + face-player rotation
                // UFO enemies (sides >= 5) get extra size boost
                const sizeMult = (e.sides >= 5) ? 8.0 : 6.0;
                const drawSize = e.radius * sizeMult;

                ctx.save();
                ctx.translate(e.x, e.y + hover);
                ctx.rotate(drawRotation);

                // Hit flash
                if (e.flashTimer > 0) {
                    ctx.shadowColor = '#ffffff';
                    ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                        ? Renderer.getShadowBlur(25, true)
                        : 25;
                } else {
                    ctx.shadowColor = e.color;
                    ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                        ? Renderer.getShadowBlur(8)
                        : 8;
                }

                if (sprite) {
                    ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
                } else {
                    Renderer.drawNeonPoly(ctx, 0, 0, e.radius, Math.max(3, e.sides || 4), 0, e.color, 10);
                }

                ctx.shadowBlur = 0;
                ctx.restore();

                // HP bar (only if damaged, skip in perf mode for basic enemies)
                if (e.hp < e.maxHp && (!perfMode || e.radius > 14)) {
                    const barW = e.radius * 2;
                    const barH = 3;
                    const barX = e.x - barW / 2;
                    const barY = e.y + hover - e.radius - 10;
                    const hpRatio = e.hp / e.maxHp;

                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(barX, barY, barW, barH);
                    ctx.fillStyle = hpRatio > 0.5 ? '#00ff88' : hpRatio > 0.25 ? '#ffaa00' : '#ff0044';
                    ctx.fillRect(barX, barY, barW * hpRatio, barH);
                }
            }
        }, ctx);
    },

    drawTelegraphs(ctx) {
        if (!this.telegraphs.length) return;

        for (const t of this.telegraphs) {
            const ratio = Math.max(0, t.timer / t.maxTimer);
            const pulse = 1 + Math.sin((1 - ratio) * 24) * 0.04;
            const radius = t.radius * pulse;

            ctx.save();
            ctx.globalAlpha = 0.2 + (1 - ratio) * 0.25;
            ctx.beginPath();
            ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = t.color + '22';
            ctx.fill();

            ctx.globalAlpha = 0.45 + (1 - ratio) * 0.4;
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2.5;
            ctx.setLineDash([8, 6]);
            ctx.beginPath();
            ctx.arc(t.x, t.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    },

    /** Clear all enemies */
    clear() {
        this.pool.releaseAll();
        this.activeBoss = null;
        this.telegraphs = [];
        this.bullets = [];
        if (this._spatialMap) this._spatialMap.clear();
        this._nearbyBuffer.length = 0;
        this._bulletFx.impacts = [];
        this._clearBulletImpactPool();
        this.bossHands = [];
    }
};
