// ============================================================
// maps.js — Map Biome Definitions & Selection System
// ============================================================

const Maps = {
    /** Currently selected map id */
    selected: 'neonCity',

    /** Test helper: unlock all maps */
    debugUnlockAll: false,

    /** All map definitions */
    biomes: {
        neonCity: {
            id: 'neonCity',
            name: 'NEON ŞEHİR',
            icon: '🏙️',
            description: 'Varsayılan arena. Klasik neon grid.',
            difficulty: 1,
            cost: 0,
            unlocked: true,
            unlockCondition: null,
            // Colors
            bgColor: '#0a0a14',
            gridColor: 'rgba(0, 255, 255, 0.12)',
            gridGlowColor: 'rgba(0, 255, 255, 0.06)',
            gridShadowColor: '#00ffff',
            dotColor: 'rgba(0, 255, 255, 0.25)',
            ambientColor: 'rgba(0, 255, 255, 0.04)',
            // Grid style
            gridStyle: 'square',
            gridSize: 80,
            // Hazards
            hazards: [
                { type: 'electricFence', radius: 55, damage: 8, tickRate: 1.2, spawnInterval: 12, maxCount: 3 }
            ],
            // Parallax background particles
            bgParticles: { color: '#00ffff', count: 15, speed: 0.3 },
            // Enemy pool weights
            enemyWeights: { BASIC: 50, FAST: 25, TANK: 15, ELITE: 10 },
            spawnPressure: 1,
            enemySpeedMultiplier: 1,
            previewGradient: 'linear-gradient(160deg, #0b0f2a 0%, #09132a 50%, #120a26 100%)'
        },

        iceCave: {
            id: 'iceCave',
            name: 'BUZ MAĞARASI',
            icon: '🧊',
            description: 'Kaygan zemin. Her yer buz gibi soğuk.',
            difficulty: 2,
            cost: 800,
            unlocked: false,
            unlockCondition: '3 dakika hayatta kal',
            bgColor: '#06101e',
            gridColor: 'rgba(100, 200, 255, 0.1)',
            gridGlowColor: 'rgba(100, 200, 255, 0.05)',
            gridShadowColor: '#66ccff',
            dotColor: 'rgba(150, 220, 255, 0.3)',
            ambientColor: 'rgba(100, 200, 255, 0.03)',
            gridStyle: 'diamond',
            gridSize: 70,
            hazards: [
                { type: 'iceZone', radius: 100, speedPenalty: 0.85, spawnInterval: 8, maxCount: 4 }
            ],
            bgParticles: { color: '#aaddff', count: 25, speed: 0.15, type: 'snow' },
            enemyWeights: { BASIC: 30, FAST: 35, TANK: 20, ELITE: 15 },
            spawnPressure: 1.05,
            enemySpeedMultiplier: 1.03,
            previewGradient: 'linear-gradient(160deg, #071326 0%, #0c2748 60%, #113a55 100%)'
        },

        lavaFactory: {
            id: 'lavaFactory',
            name: 'LAV FABRİKA',
            icon: '🌋',
            description: 'Lav havuzları ve sıcak zemin. Dikkatli ol!',
            difficulty: 3,
            cost: 2000,
            unlocked: false,
            unlockCondition: '1 Boss yen',
            bgColor: '#140808',
            gridColor: 'rgba(255, 100, 30, 0.12)',
            gridGlowColor: 'rgba(255, 80, 20, 0.06)',
            gridShadowColor: '#ff4400',
            dotColor: 'rgba(255, 140, 50, 0.3)',
            ambientColor: 'rgba(255, 68, 0, 0.04)',
            gridStyle: 'square',
            gridSize: 85,
            hazards: [
                { type: 'lavaPool', radius: 70, damage: 5, tickRate: 0.5, spawnInterval: 10, maxCount: 5 }
            ],
            bgParticles: { color: '#ff6600', count: 20, speed: 0.5, type: 'ember' },
            enemyWeights: { BASIC: 25, FAST: 20, TANK: 35, ELITE: 20 },
            spawnPressure: 1.12,
            enemySpeedMultiplier: 1.06,
            previewGradient: 'linear-gradient(160deg, #210c07 0%, #3a0f05 55%, #5a1b08 100%)'
        },

        darkForest: {
            id: 'darkForest',
            name: 'KARANLIK ORMAN',
            icon: '🌲',
            description: 'Görüş alanı kısıtlı. Karanlıktan kork.',
            difficulty: 4,
            cost: 4000,
            unlocked: false,
            unlockCondition: '500 düşman öldür',
            bgColor: '#0d160f',
            gridColor: 'rgba(60, 215, 95, 0.12)',
            gridGlowColor: 'rgba(50, 200, 80, 0.04)',
            gridShadowColor: '#33cc55',
            dotColor: 'rgba(80, 220, 100, 0.2)',
            ambientColor: 'rgba(50, 200, 80, 0.03)',
            gridStyle: 'organic',
            gridSize: 90,
            hazards: [
                { type: 'fogOfWar', visionRadius: 430, overlayAlpha: 0.62 },
                { type: 'thornBush', radius: 45, damage: 3, speedPenalty: 0.6, tickRate: 0.8, spawnInterval: 7, maxCount: 6 }
            ],
            bgParticles: { color: '#44ff66', count: 10, speed: 0.1, type: 'firefly' },
            enemyWeights: { BASIC: 20, FAST: 40, TANK: 15, ELITE: 25 },
            spawnPressure: 1.08,
            enemySpeedMultiplier: 1.1,
            previewGradient: 'linear-gradient(160deg, #071108 0%, #112417 50%, #1a3320 100%)'
        },

        spaceStation: {
            id: 'spaceStation',
            name: 'UZAY İSTASYONU',
            icon: '🚀',
            description: 'Düşük yerçekimi. Yüksek hız kaosuna hazır ol.',
            difficulty: 5,
            cost: 7000,
            unlocked: false,
            unlockCondition: 'Tüm haritaları aç',
            bgColor: '#04040e',
            gridColor: 'rgba(160, 100, 255, 0.1)',
            gridGlowColor: 'rgba(160, 100, 255, 0.05)',
            gridShadowColor: '#9966ff',
            dotColor: 'rgba(180, 130, 255, 0.25)',
            ambientColor: 'rgba(160, 100, 255, 0.03)',
            gridStyle: 'hex',
            gridSize: 75,
            hazards: [
                { type: 'voidZone', radius: 80, damage: 4, pullForce: 120, tickRate: 0.6, spawnInterval: 15, maxCount: 2 }
            ],
            speedMultiplier: 1.2,
            bgParticles: { color: '#bb88ff', count: 30, speed: 0.08, type: 'star' },
            enemyWeights: { BASIC: 15, FAST: 35, TANK: 10, ELITE: 40 },
            spawnPressure: 1.18,
            enemySpeedMultiplier: 1.15,
            previewGradient: 'linear-gradient(160deg, #09071f 0%, #1b103c 55%, #29195b 100%)'
        }
    },

    /** Active hazard instances in the world */
    activeHazards: [],
    _hazardTimers: {},
    _wasInIceZone: false,

    /** Parallax background particles */
    bgParticlePool: [],

    /** Ice cave static background image */
    iceBackdrop: {
        imagePath: 'Buz_magarası/harita.png',
        image: null,
        ready: false,
        failed: false
    },

    /** Layered PNG backdrops (option 2: asset-driven integration) */
    mapBackdrops: {
        lavaFactory: {
            enabled: true,
            layers: [
                { key: 'far', path: 'assets/maps/lava_factory/bg_far.png', parallax: 0.06, alpha: 0.9 },
                { key: 'mid', path: 'assets/maps/lava_factory/bg_mid.png', parallax: 0.14, alpha: 0.92 },
                { key: 'fx', path: 'assets/maps/lava_factory/bg_fx.png', parallax: 0.22, alpha: 0.55 }
            ],
            _initialized: false,
            _readyCount: 0
        },
        darkForest: {
            enabled: true,
            layers: [
                { key: 'far', path: 'assets/maps/dark_forest/bg_far.png', parallax: 0.05, alpha: 0.95 },
                { key: 'mid', path: 'assets/maps/dark_forest/bg_mid.png', parallax: 0.12, alpha: 0.92 },
                { key: 'fx', path: 'assets/maps/dark_forest/bg_fx.png', parallax: 0.2, alpha: 0.45 }
            ],
            _initialized: false,
            _readyCount: 0
        },
        spaceStation: {
            enabled: true,
            layers: [
                { key: 'far', path: 'assets/maps/space_station/bg_far.png', parallax: 0.07, alpha: 0.92 },
                { key: 'mid', path: 'assets/maps/space_station/bg_mid.png', parallax: 0.16, alpha: 0.9 },
                { key: 'fx', path: 'assets/maps/space_station/bg_fx.png', parallax: 0.24, alpha: 0.5 }
            ],
            _initialized: false,
            _readyCount: 0
        }
    },

    /** Neon city layered tunnel parallax state */
    neonTunnel: {
        imagePath: 'neonsehir_harita.png',
        image: null,
        ready: false,
        failed: false,
        layer1: null,
        layer2: null,
        layer3: null,
        offsets: { layer1: 0, layer2: 0, layer3: 0 },
        speeds: { layer1: 1, layer2: 3, layer3: 10 },
        scrollFactor: 1,
        normalizedSpeed: 0,
        introTimer: 0,
        introHold: 2.0,
        introRamp: 2.0,
        introProgress: 0,
        lastPlayerX: 0,
        lastPlayerY: 0,
        hasLastPlayer: false,
        palette: {
            base: '#7a3cff',
            accent: '#25e6ff',
            pulse: '#ff4fca'
        }
    },

    /** Permanent progression for map unlocks */
    progress: {
        totalSurvival: 0,
        totalKills: 0,
        totalBossKills: 0
    },

    /**
     * Get the currently selected map
     */
    getSelected() {
        return this.biomes[this.selected];
    },

    /**
     * Initialize map system for a new game
     */
    init() {
        this.activeHazards = [];
        this._hazardTimers = {};
        this._wasInIceZone = false;
        this._ensureIceBackdrop();
        this._ensureMapBackdrop(this.selected);
        this._resetNeonTunnelState();
        this._ensureNeonCityLayers();
        this._initBgParticles();
        this._applyMapToRenderer();
    },

    _ensureMapBackdrop(mapId) {
        const cfg = this.mapBackdrops[mapId];
        if (!cfg || !cfg.enabled || cfg._initialized) return;

        cfg._initialized = true;
        cfg._readyCount = 0;

        for (const layer of cfg.layers) {
            layer.image = null;
            layer.ready = false;
            layer.failed = false;
            const img = new Image();
            img.onload = () => {
                layer.image = img;
                layer.ready = true;
                cfg._readyCount++;
            };
            img.onerror = () => {
                layer.failed = true;
            };
            img.src = layer.path;
        }
    },

    _drawMapBackdropLayers(ctx, mapId, camX, camY) {
        const cfg = this.mapBackdrops[mapId];
        if (!cfg || !cfg.enabled || !cfg.layers || cfg.layers.length === 0) return false;

        let drewAny = false;
        const sw = Renderer.width;
        const sh = Renderer.height;

        for (const layer of cfg.layers) {
            if (!layer.ready || !layer.image) continue;

            const img = layer.image;
            const scale = Math.max(sw / img.width, sh / img.height) * 1.08;
            const dw = img.width * scale;
            const dh = img.height * scale;
            const baseX = (sw - dw) * 0.5;
            const baseY = (sh - dh) * 0.5;
            const offsetX = Math.max(-80, Math.min(80, -camX * (layer.parallax || 0)));
            const offsetY = Math.max(-60, Math.min(60, -camY * (layer.parallax || 0)));

            ctx.globalAlpha = layer.alpha == null ? 1 : layer.alpha;
            ctx.drawImage(img, baseX + offsetX, baseY + offsetY, dw, dh);
            drewAny = true;
        }

        ctx.globalAlpha = 1;
        return drewAny;
    },

    _ensureIceBackdrop() {
        if (this.iceBackdrop.ready || this.iceBackdrop.failed) return;
        if (this.iceBackdrop.image) return;

        const img = new Image();
        img.onload = () => {
            this.iceBackdrop.image = img;
            this.iceBackdrop.ready = true;
        };
        img.onerror = () => {
            this.iceBackdrop.failed = true;
        };
        img.src = this.iceBackdrop.imagePath;
        this.iceBackdrop.image = img;
    },

    _drawIceBackdrop(ctx) {
        this._ensureIceBackdrop();
        if (!this.iceBackdrop.ready || !this.iceBackdrop.image) return false;

        const img = this.iceBackdrop.image;
        const sw = Renderer.width;
        const sh = Renderer.height;
        const scale = Math.max(sw / img.width, sh / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (sw - dw) * 0.5;
        const dy = (sh - dh) * 0.5;

        ctx.drawImage(img, dx, dy, dw, dh);
        return true;
    },

    _resetNeonTunnelState() {
        this.neonTunnel.offsets.layer1 = 0;
        this.neonTunnel.offsets.layer2 = 0;
        this.neonTunnel.offsets.layer3 = 0;
        this.neonTunnel.scrollFactor = 0;
        this.neonTunnel.normalizedSpeed = 0;
        this.neonTunnel.introTimer = 0;
        this.neonTunnel.introProgress = 0;
        this.neonTunnel.hasLastPlayer = false;
    },

    _ensureNeonCityLayers() {
        if (this.neonTunnel.ready || this.neonTunnel.failed) return;
        if (this.neonTunnel.image) return;

        const img = new Image();
        img.onload = () => {
            this.neonTunnel.image = img;
            this._buildNeonCityLayersFromImage(img);
        };
        img.onerror = () => {
            this.neonTunnel.failed = true;
        };
        img.src = this.neonTunnel.imagePath;
        this.neonTunnel.image = img;
    },

    _buildNeonCityLayersFromImage(img) {
        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = img.width;
        baseCanvas.height = img.height;
        const baseCtx = baseCanvas.getContext('2d');
        baseCtx.drawImage(img, 0, 0);

        const imageData = baseCtx.getImageData(0, 0, baseCanvas.width, baseCanvas.height);
        const src = imageData.data;
        const layer1 = new Uint8ClampedArray(src.length);
        const layer2 = new Uint8ClampedArray(src.length);
        const layer3 = new Uint8ClampedArray(src.length);

        const width = baseCanvas.width;
        const height = baseCanvas.height;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const i = (y * width + x) * 4;
                const r = src[i];
                const g = src[i + 1];
                const b = src[i + 2];
                const a = src[i + 3];
                if (a < 8) continue;

                const maxC = Math.max(r, g, b);
                const minC = Math.min(r, g, b);
                const luma = (r * 0.299) + (g * 0.587) + (b * 0.114);
                const sat = maxC === 0 ? 0 : (maxC - minC) / maxC;
                const edgeBand = (x < width * 0.23) || (x > width * 0.77);
                const nebulaTone = (r > 110 && b > 120) || (b > 140 && g > 85) || (r > 135 && b > 95);
                const tinyStar = luma > 212 && sat < 0.24;

                let target = 2;
                if (edgeBand && luma > 34) {
                    target = 3;
                } else if (tinyStar || (luma < 74 && sat < 0.44)) {
                    target = 1;
                } else if (nebulaTone || (sat > 0.34 && luma > 45)) {
                    target = 2;
                }

                const dst = target === 1 ? layer1 : target === 3 ? layer3 : layer2;
                dst[i] = r;
                dst[i + 1] = g;
                dst[i + 2] = b;
                dst[i + 3] = a;
            }
        }

        this.neonTunnel.layer1 = this._toCanvasFromPixels(layer1, width, height);
        this.neonTunnel.layer2 = this._toCanvasFromPixels(layer2, width, height);
        this.neonTunnel.layer3 = this._toCanvasFromPixels(layer3, width, height);

        this._makeVerticalTileable(this.neonTunnel.layer3, 72);
        this._extractNeonPalette(this.neonTunnel.layer2 || baseCanvas);

        this.neonTunnel.ready = true;
    },

    _toCanvasFromPixels(pixelData, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        const data = ctx.createImageData(width, height);
        data.data.set(pixelData);
        ctx.putImageData(data, 0, 0);
        return canvas;
    },

    _makeVerticalTileable(canvas, feather = 64) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;
        const f = Math.min(feather, Math.floor(h * 0.2));
        if (f < 2) return;

        const img = ctx.getImageData(0, 0, w, h);
        const px = img.data;

        for (let y = 0; y < f; y++) {
            const blend = y / (f - 1);
            const topY = y;
            const bottomY = h - f + y;

            for (let x = 0; x < w; x++) {
                const ti = (topY * w + x) * 4;
                const bi = (bottomY * w + x) * 4;

                for (let c = 0; c < 4; c++) {
                    const topVal = px[ti + c];
                    const bottomVal = px[bi + c];
                    const mix = Math.round(topVal * (1 - blend) + bottomVal * blend);
                    px[ti + c] = mix;
                    px[bi + c] = mix;
                }
            }
        }

        ctx.putImageData(img, 0, 0);
    },

    _extractNeonPalette(sourceCanvas) {
        const ctx = sourceCanvas.getContext('2d');
        const { width, height } = sourceCanvas;
        const sampleData = ctx.getImageData(0, 0, width, height).data;
        const bins = [];

        for (let i = 0; i < sampleData.length; i += 28) {
            const r = sampleData[i];
            const g = sampleData[i + 1];
            const b = sampleData[i + 2];
            const a = sampleData[i + 3];
            if (a < 20) continue;

            const luma = r * 0.299 + g * 0.587 + b * 0.114;
            if (luma < 35) continue;

            const key = `${Math.round(r / 24)}_${Math.round(g / 24)}_${Math.round(b / 24)}`;
            let bin = bins.find(item => item.key === key);
            if (!bin) {
                bin = { key, count: 0, r: 0, g: 0, b: 0 };
                bins.push(bin);
            }
            bin.count++;
            bin.r += r;
            bin.g += g;
            bin.b += b;
        }

        bins.sort((a, b) => b.count - a.count);
        const primary = bins[0];
        const secondary = bins[1] || bins[0];

        if (primary) {
            const r = Math.round(primary.r / primary.count);
            const g = Math.round(primary.g / primary.count);
            const b = Math.round(primary.b / primary.count);
            this.neonTunnel.palette.base = `rgb(${r}, ${g}, ${b})`;
        }
        if (secondary) {
            const r = Math.round(secondary.r / secondary.count);
            const g = Math.round(secondary.g / secondary.count);
            const b = Math.round(secondary.b / secondary.count);
            this.neonTunnel.palette.accent = `rgb(${r}, ${g}, ${b})`;
        }
    },

    _updateNeonTunnelMotion(dt, playerX, playerY) {
        const tunnel = this.neonTunnel;
        tunnel.lastPlayerX = playerX;
        tunnel.lastPlayerY = playerY;
        tunnel.hasLastPlayer = true;
        tunnel.introProgress = 0;
        tunnel.normalizedSpeed = 0;
        tunnel.scrollFactor = 0;
    },

    _advanceLayerOffset(offset, baseSpeed, scrollFactor, dt, canvas) {
        const h = canvas ? canvas.height : Math.max(Renderer.height || 800, 800);
        let next = offset + baseSpeed * scrollFactor * dt * 60;
        while (next >= h) next -= h;
        while (next < 0) next += h;
        return next;
    },

    _drawLayerInfiniteVertical(ctx, layerCanvas, offset, alpha = 1, xParallax = 0) {
        if (!layerCanvas) return;
        const screenW = Renderer.width;
        const screenH = Renderer.height;
        const layerW = layerCanvas.width;
        const layerH = layerCanvas.height;
        if (layerW <= 0 || layerH <= 0) return;

        const scale = Math.max(screenW / layerW, screenH / layerH);
        const drawW = layerW * scale;
        const drawH = layerH * scale;
        const drawX = (screenW - drawW) * 0.5 + xParallax;

        let y = -offset;
        while (y < screenH) {
            ctx.globalAlpha = alpha;
            ctx.drawImage(layerCanvas, drawX, y, drawW, drawH);
            y += drawH;
        }
    },

    _drawNeonCityTunnel(ctx, camX, camY) {
        if (!this.neonTunnel.ready) return false;
        const tunnel = this.neonTunnel;
        const driftXFar = 0;
        const driftXMid = 0;
        const driftXNear = 0;

        this._drawLayerInfiniteVertical(ctx, tunnel.layer1, tunnel.offsets.layer1, 0.55, driftXFar);
        this._drawLayerInfiniteVertical(ctx, tunnel.layer2, tunnel.offsets.layer2, 0.82, driftXMid);
        this._drawLayerInfiniteVertical(ctx, tunnel.layer3, tunnel.offsets.layer3, 0.96, driftXNear);

        const glow = ctx.createLinearGradient(0, Renderer.height * 0.1, 0, Renderer.height);
        glow.addColorStop(0, 'rgba(20, 5, 40, 0.05)');
        glow.addColorStop(0.55, 'rgba(155, 40, 255, 0.07)');
        glow.addColorStop(1, 'rgba(0, 240, 255, 0.06)');
        ctx.globalAlpha = 1;
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, Renderer.width, Renderer.height);
        return true;
    },

    getParallaxMetrics() {
        return {
            enabled: this.selected === 'neonCity',
            scrollFactor: this.neonTunnel.scrollFactor,
            normalizedSpeed: this.neonTunnel.normalizedSpeed
        };
    },

    getNeonTunnelPalette() {
        if (this.selected !== 'neonCity') return null;
        return this.neonTunnel.palette;
    },

    /**
     * Apply map colors to renderer
     */
    _applyMapToRenderer() {
        const map = this.getSelected();
        if (!map) return;
        Renderer.gridColor = map.gridColor;
        Renderer.gridGlowColor = map.gridGlowColor;
        Renderer.gridSize = map.gridSize;
    },

    /**
     * Initialize parallax background particles
     */
    _initBgParticles() {
        this.bgParticlePool = [];
        const map = this.getSelected();
        if (!map || !map.bgParticles) return;

        const count = map.bgParticles.count;
        for (let i = 0; i < count; i++) {
            this.bgParticlePool.push({
                x: Math.random() * 2000 - 1000,
                y: Math.random() * 2000 - 1000,
                size: 1 + Math.random() * 2,
                alpha: 0.1 + Math.random() * 0.4,
                speed: map.bgParticles.speed * (0.5 + Math.random()),
                phase: Math.random() * Math.PI * 2
            });
        }
    },

    /**
     * Update map hazards and bg particles
     */
    update(dt, playerX, playerY) {
        const map = this.getSelected();
        if (!map) return;

        if (map.id === 'neonCity') {
            this._ensureNeonCityLayers();
            this._updateNeonTunnelMotion(dt, playerX, playerY);
        }

        // Update background particles (parallax drift)
        for (const p of this.bgParticlePool) {
            p.phase += dt * 0.5;
            p.y += p.speed * dt * 30;
            // Wrap around player
            if (p.y > playerY + 600) p.y = playerY - 600;
            if (p.y < playerY - 600) p.y = playerY + 600;
            if (p.x > playerX + 800) p.x = playerX - 800;
            if (p.x < playerX - 800) p.x = playerX + 800;
        }

        // Spawn hazards over time
        for (const hazardDef of map.hazards) {
            if (hazardDef.type === 'fogOfWar') continue; // Static effect, not spawned

            const key = hazardDef.type;
            if (!this._hazardTimers[key]) this._hazardTimers[key] = 0;
            this._hazardTimers[key] += dt;

            if (this._hazardTimers[key] >= hazardDef.spawnInterval) {
                this._hazardTimers[key] = 0;
                // Only spawn if under max count
                const count = this.activeHazards.filter(h => h.type === key).length;
                if (count < hazardDef.maxCount) {
                    // Spawn near player but not on top
                    const angle = Math.random() * Math.PI * 2;
                    const dist = 150 + Math.random() * 300;
                    this.activeHazards.push({
                        type: key,
                        x: playerX + Math.cos(angle) * dist,
                        y: playerY + Math.sin(angle) * dist,
                        radius: hazardDef.radius,
                        damage: hazardDef.damage || 0,
                        speedPenalty: hazardDef.speedPenalty || 1,
                        tickRate: hazardDef.tickRate || 1,
                        _tickTimer: 0,
                        life: 15 + Math.random() * 10 // Despawn after 15-25s
                    });
                }
            }
        }

        // Update active hazards
        let inSlowZone = false;
        for (let i = this.activeHazards.length - 1; i >= 0; i--) {
            const h = this.activeHazards[i];
            h.life -= dt;
            if (h.life <= 0) {
                this.activeHazards.splice(i, 1);
                continue;
            }

            // Animate phase for visual effects
            if (h._phase === undefined) h._phase = Math.random() * Math.PI * 2;
            h._phase += dt * 2.5;

            // Check player collision
            const dx = playerX - h.x;
            const dy = playerY - h.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < h.radius + Player.radius) {
                if (h.type === 'iceZone' || h.type === 'thornBush') {
                    inSlowZone = true;
                }
                // Lava pool: periodic damage
                if (h.type === 'lavaPool' && h.damage > 0) {
                    h._tickTimer += dt;
                    if (h._tickTimer >= h.tickRate) {
                        h._tickTimer = 0;
                        Player.takeDamage(h.damage);
                        Particles.burstAt(playerX, playerY, '#ff4400', 4);
                    }
                }
                // Ice zone: speed penalty
                if (h.type === 'iceZone') {
                    Player._mapSpeedMult = h.speedPenalty;
                }
                // Electric fence: periodic shock damage + cyan sparks
                if (h.type === 'electricFence' && h.damage > 0) {
                    h._tickTimer += dt;
                    if (h._tickTimer >= h.tickRate) {
                        h._tickTimer = 0;
                        Player.takeDamage(h.damage);
                        Particles.burstAt(playerX, playerY, '#00ffff', 6);
                    }
                }
                // Thorn bush: tick damage + speed penalty
                if (h.type === 'thornBush') {
                    Player._mapSpeedMult = Math.min(Player._mapSpeedMult || 1, h.speedPenalty);
                    if (h.damage > 0) {
                        h._tickTimer += dt;
                        if (h._tickTimer >= h.tickRate) {
                            h._tickTimer = 0;
                            Player.takeDamage(h.damage);
                            Particles.burstAt(playerX, playerY, '#44ff66', 3);
                        }
                    }
                }
                // Void zone: pull force + periodic damage
                if (h.type === 'voidZone') {
                    // Pull player towards center
                    if (dist > 5) {
                        const pullStrength = (h.pullForce || 120) * dt;
                        const nx = -dx / dist;
                        const ny = -dy / dist;
                        Player.x += nx * pullStrength;
                        Player.y += ny * pullStrength;
                    }
                    if (h.damage > 0) {
                        h._tickTimer += dt;
                        if (h._tickTimer >= h.tickRate) {
                            h._tickTimer = 0;
                            Player.takeDamage(h.damage);
                            Particles.burstAt(playerX, playerY, '#aa66ff', 5);
                        }
                    }
                }
            }
        }

        // Reset map speed mult each frame (will be set again if in zone)
        if (!inSlowZone) {
            Player._mapSpeedMult = 1;
        }

        if (map.id === 'iceCave' && inSlowZone && !this._wasInIceZone && Particles.spawnIceSlowImpact) {
            Particles.spawnIceSlowImpact(playerX, playerY);
        }
        this._wasInIceZone = inSlowZone;

        // Space station speed multiplier
        if (map.speedMultiplier) {
            Player._mapSpeedMult = (Player._mapSpeedMult || 1) * map.speedMultiplier;
        }
    },

    /**
     * Draw map-specific effects (background particles, hazards, fog)
     */
    drawBackground(ctx, camX, camY) {
        const map = this.getSelected();
        if (!map) return;

        this._ensureMapBackdrop(map.id);

        // Background color
        ctx.save();
        if (map.id === 'iceCave') {
            const drewIce = this._drawIceBackdrop(ctx);
            if (!drewIce) {
                ctx.fillStyle = map.bgColor;
                ctx.fillRect(0, 0, Renderer.width, Renderer.height);
            }
        } else {
            ctx.fillStyle = map.bgColor;
            ctx.fillRect(0, 0, Renderer.width, Renderer.height);
        }

        if (map.id === 'neonCity') {
            this._drawNeonCityTunnel(ctx, camX, camY);
        }

        // Layered PNG backdrop for maps without dedicated static art code
        this._drawMapBackdropLayers(ctx, map.id, camX, camY);

        this._drawThemeOverlay(ctx, map, camX, camY);
        ctx.restore();
    },

    _drawThemeOverlay(ctx, map, camX, camY) {
        const t = performance.now() * 0.001;
        const w = Renderer.width;
        const h = Renderer.height;

        if (map.id === 'neonCity') {
            ctx.globalAlpha = 0.2;
            for (let i = -2; i < 12; i++) {
                const y = (i * 80 + (camY * 0.15) + t * 35) % (h + 120) - 60;
                ctx.strokeStyle = 'rgba(0,255,255,0.14)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(w, y);
                ctx.stroke();
            }
            const grad = ctx.createLinearGradient(0, h * 0.55, 0, h);
            grad.addColorStop(0, 'rgba(255,0,255,0)');
            grad.addColorStop(1, 'rgba(255,0,255,0.12)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, h * 0.55, w, h * 0.45);
            return;
        }

        if (map.id === 'iceCave') {
            const frost = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.15, w * 0.5, h * 0.5, h * 0.8);
            frost.addColorStop(0, 'rgba(170,230,255,0.01)');
            frost.addColorStop(1, 'rgba(170,230,255,0.09)');
            ctx.fillStyle = frost;
            ctx.fillRect(0, 0, w, h);

            const edgeShade = ctx.createLinearGradient(0, 0, 0, h);
            edgeShade.addColorStop(0, 'rgba(6,16,30,0.16)');
            edgeShade.addColorStop(0.45, 'rgba(6,16,30,0.03)');
            edgeShade.addColorStop(1, 'rgba(6,16,30,0.18)');
            ctx.fillStyle = edgeShade;
            ctx.fillRect(0, 0, w, h);
            return;
        }

        if (map.id === 'lavaFactory') {
            for (let i = 0; i < 7; i++) {
                const y = h * 0.15 + i * 90 + Math.sin(t * 0.9 + i) * 10;
                ctx.strokeStyle = 'rgba(255,90,30,0.16)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x <= w; x += 80) {
                    const wave = Math.sin((x * 0.02) + t * 1.2 + i) * 8;
                    if (x === 0) ctx.moveTo(x, y + wave);
                    else ctx.lineTo(x, y + wave);
                }
                ctx.stroke();
            }
            const heat = ctx.createLinearGradient(0, 0, 0, h);
            heat.addColorStop(0, 'rgba(255,80,20,0.03)');
            heat.addColorStop(1, 'rgba(255,30,0,0.14)');
            ctx.fillStyle = heat;
            ctx.fillRect(0, 0, w, h);
            return;
        }

        if (map.id === 'darkForest') {
            ctx.fillStyle = 'rgba(20,40,20,0.22)';
            for (let i = 0; i < 10; i++) {
                const x = ((i * 190) - camX * 0.12) % (w + 180) - 90;
                const sway = Math.sin(t + i * 1.3) * 10;
                ctx.beginPath();
                ctx.moveTo(x + sway, h);
                ctx.lineTo(x + 40 + sway, h * 0.5);
                ctx.lineTo(x + 80 + sway, h);
                ctx.closePath();
                ctx.fill();
            }
            const shade = ctx.createRadialGradient(w * 0.5, h * 0.5, h * 0.2, w * 0.5, h * 0.5, h * 0.7);
            shade.addColorStop(0, 'rgba(0,0,0,0)');
            shade.addColorStop(1, 'rgba(0,0,0,0.25)');
            ctx.fillStyle = shade;
            ctx.fillRect(0, 0, w, h);
            return;
        }

        if (map.id === 'spaceStation') {
            ctx.strokeStyle = 'rgba(170,120,255,0.18)';
            ctx.lineWidth = 1;
            for (let i = 0; i < 4; i++) {
                const r = 140 + i * 90 + Math.sin(t + i) * 8;
                ctx.beginPath();
                ctx.arc(w * 0.5, h * 0.5, r, 0, Math.PI * 2);
                ctx.stroke();
            }
            for (let i = 0; i < 18; i++) {
                const sx = (i * 97 + camX * 0.05) % w;
                const sy = (i * 63 + camY * 0.05) % h;
                ctx.fillStyle = 'rgba(200,170,255,0.18)';
                ctx.fillRect(sx, sy, 2, 2);
            }
        }
    },

    /**
     * Draw parallax particles (screen-space, before grid)
     */
    drawBgParticles(ctx, camX, camY) {
        const map = this.getSelected();
        if (!map || !map.bgParticles) return;

        ctx.save();
        const color = map.bgParticles.color;

        for (const p of this.bgParticlePool) {
            // Parallax: particles move slower than camera
            const sx = (p.x - camX * 0.3) % Renderer.width;
            const sy = (p.y - camY * 0.3) % Renderer.height;
            const flicker = map.bgParticles.type === 'firefly'
                ? 0.3 + Math.sin(p.phase * 3) * 0.7
                : 1;

            ctx.globalAlpha = p.alpha * flicker;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = p.size * 3;

            if (map.bgParticles.type === 'snow') {
                // Snowflake: small circle with drift
                ctx.beginPath();
                ctx.arc(sx + Math.sin(p.phase) * 5, sy, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (map.bgParticles.type === 'ember') {
                // Ember: upward floating small rectangles
                ctx.fillRect(sx, sy, p.size * 0.8, p.size * 1.5);
            } else if (map.bgParticles.type === 'star') {
                // Star: twinkling dots
                const tw = 0.5 + Math.sin(p.phase * 2) * 0.5;
                ctx.globalAlpha = p.alpha * tw;
                ctx.beginPath();
                ctx.arc(sx, sy, p.size * 0.7, 0, Math.PI * 2);
                ctx.fill();
            } else if (map.bgParticles.type === 'firefly') {
                // Firefly: glowing dot
                ctx.beginPath();
                ctx.arc(sx + Math.sin(p.phase * 2) * 8, sy + Math.cos(p.phase) * 5, p.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Default: simple dot
                ctx.beginPath();
                ctx.arc(sx, sy, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.restore();
    },

    /**
     * Draw world-space hazards (after camera transform)
     */
    drawHazards(ctx) {
        for (const h of this.activeHazards) {
            ctx.save();
            if (h.type === 'lavaPool') {
                // Lava: orange-red pulsing circle
                const pulse = 1 + Math.sin(h.life * 3) * 0.05;
                const r = h.radius * pulse;
                const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
                grad.addColorStop(0, 'rgba(255, 100, 0, 0.35)');
                grad.addColorStop(0.6, 'rgba(255, 50, 0, 0.2)');
                grad.addColorStop(1, 'rgba(255, 30, 0, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(255, 80, 0, 0.4)';
                ctx.lineWidth = 2;
                ctx.stroke();

            } else if (h.type === 'iceZone') {
                // Ice: blue translucent circle
                const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.radius);
                grad.addColorStop(0, 'rgba(100, 200, 255, 0.15)');
                grad.addColorStop(0.7, 'rgba(100, 200, 255, 0.08)');
                grad.addColorStop(1, 'rgba(100, 200, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(h.x, h.y, h.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = 'rgba(150, 220, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 8]);
                ctx.stroke();
                ctx.setLineDash([]);

            } else if (h.type === 'electricFence') {
                // Electric fence: pulsing cyan ring with lightning arcs
                const phase = h._phase || 0;
                const pulse = 0.9 + Math.sin(phase * 3) * 0.1;
                const r = h.radius * pulse;

                // Outer glow
                const grad = ctx.createRadialGradient(h.x, h.y, r * 0.6, h.x, h.y, r);
                grad.addColorStop(0, 'rgba(0, 255, 255, 0.05)');
                grad.addColorStop(0.7, 'rgba(0, 200, 255, 0.12)');
                grad.addColorStop(1, 'rgba(0, 255, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
                ctx.fill();

                // Electric ring
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 8 + Math.sin(phase * 5) * 4;
                ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 + Math.sin(phase * 4) * 0.2})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
                ctx.stroke();

                // Lightning arcs (3 small zaps around the ring)
                ctx.strokeStyle = 'rgba(150, 255, 255, 0.6)';
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 3; i++) {
                    const angle = phase * 2 + (Math.PI * 2 / 3) * i;
                    const sx = h.x + Math.cos(angle) * r * 0.7;
                    const sy = h.y + Math.sin(angle) * r * 0.7;
                    const ex = h.x + Math.cos(angle) * r;
                    const ey = h.y + Math.sin(angle) * r;
                    const mx = (sx + ex) / 2 + (Math.random() - 0.5) * 10;
                    const my = (sy + ey) / 2 + (Math.random() - 0.5) * 10;
                    ctx.beginPath();
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(mx, my);
                    ctx.lineTo(ex, ey);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;

            } else if (h.type === 'thornBush') {
                // Thorn bush: organic green spiky circle
                const phase = h._phase || 0;
                const r = h.radius;

                // Green glow fill
                const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
                grad.addColorStop(0, 'rgba(30, 120, 50, 0.2)');
                grad.addColorStop(0.6, 'rgba(40, 160, 60, 0.12)');
                grad.addColorStop(1, 'rgba(60, 200, 80, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
                ctx.fill();

                // Spiky border (irregular polygon)
                ctx.strokeStyle = 'rgba(80, 220, 100, 0.5)';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                const spikes = 10;
                for (let i = 0; i <= spikes; i++) {
                    const angle = (Math.PI * 2 / spikes) * i + phase * 0.2;
                    const spikeR = (i % 2 === 0) ? r : r * 0.7;
                    const px = h.x + Math.cos(angle) * spikeR;
                    const py = h.y + Math.sin(angle) * spikeR;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();

                // Inner thorn dots
                ctx.fillStyle = 'rgba(100, 255, 120, 0.3)';
                for (let i = 0; i < 5; i++) {
                    const a = (Math.PI * 2 / 5) * i + phase * 0.3;
                    const d = r * 0.4;
                    ctx.beginPath();
                    ctx.arc(h.x + Math.cos(a) * d, h.y + Math.sin(a) * d, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

            } else if (h.type === 'voidZone') {
                // Void zone: purple swirling vortex
                const phase = h._phase || 0;
                const r = h.radius;

                // Dark center
                const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, r);
                grad.addColorStop(0, 'rgba(60, 0, 120, 0.35)');
                grad.addColorStop(0.4, 'rgba(100, 40, 180, 0.18)');
                grad.addColorStop(0.8, 'rgba(140, 80, 220, 0.08)');
                grad.addColorStop(1, 'rgba(160, 100, 255, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
                ctx.fill();

                // Rotating spiral arms
                ctx.strokeStyle = 'rgba(170, 100, 255, 0.35)';
                ctx.lineWidth = 1.5;
                for (let arm = 0; arm < 3; arm++) {
                    ctx.beginPath();
                    const startAngle = phase + (Math.PI * 2 / 3) * arm;
                    for (let t = 0; t < 1; t += 0.05) {
                        const angle = startAngle + t * Math.PI * 1.5;
                        const dist = r * 0.15 + t * r * 0.8;
                        const px = h.x + Math.cos(angle) * dist;
                        const py = h.y + Math.sin(angle) * dist;
                        if (t === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.stroke();
                }

                // Pulsing outer ring
                ctx.strokeStyle = `rgba(160, 100, 255, ${0.2 + Math.sin(phase * 3) * 0.1})`;
                ctx.lineWidth = 1;
                ctx.setLineDash([3, 6]);
                ctx.beginPath();
                ctx.arc(h.x, h.y, r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
            }
            ctx.restore();
        }
    },

    /**
     * Draw fog of war overlay (screen-space, after everything)
     */
    drawFogOfWar(ctx) {
        const map = this.getSelected();
        if (!map) return;

        const fogDef = map.hazards.find(h => h.type === 'fogOfWar');
        if (!fogDef) return;

        const w = Renderer.width;
        const h = Renderer.height;
        const cx = w / 2;
        const cy = h / 2;
        const minR = Math.min(w, h) * 0.32;
        const r = Math.max(fogDef.visionRadius || 280, minR);
        const overlayAlpha = fogDef.overlayAlpha == null ? 0.85 : fogDef.overlayAlpha;

        ctx.save();
        // Draw a radial gradient vignette: transparent center, dark edges
        const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
        grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        grad.addColorStop(0.6, `rgba(0, 0, 0, ${overlayAlpha * 0.4})`);
        grad.addColorStop(1, `rgba(0, 0, 0, ${overlayAlpha})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    },

    /**
     * Unlock map based on achievement
     */
    unlockMap(mapId) {
        const map = this.biomes[mapId];
        if (map) {
            map.unlocked = true;
        }
    },

    /**
     * Load unlock state from localStorage
     */
    loadUnlocks() {
        for (const map of Object.values(this.biomes)) {
            map.unlocked = true;
        }
        return;

        for (const [id, map] of Object.entries(this.biomes)) {
            if (id === 'neonCity') {
                map.unlocked = true;
                continue;
            }
            map.unlocked = false;
            try {
                if (localStorage.getItem('unlockedMaps_' + id) === '1') {
                    map.unlocked = true;
                }
            } catch (e) { }
        }

        try {
            const raw = localStorage.getItem('mapProgressTotals');
            if (raw) {
                const parsed = JSON.parse(raw);
                this.progress.totalSurvival = Number(parsed.totalSurvival) || 0;
                this.progress.totalKills = Number(parsed.totalKills) || 0;
                this.progress.totalBossKills = Number(parsed.totalBossKills) || 0;
            }
        } catch (e) { }

        if (!this.biomes[this.selected] || !this.biomes[this.selected].unlocked) {
            this.selected = 'neonCity';
        }
    },

    recordRunProgress(gameTime, kills, bossKills) {
        this.progress.totalSurvival += Math.max(0, gameTime || 0);
        this.progress.totalKills += Math.max(0, kills || 0);
        this.progress.totalBossKills += Math.max(0, bossKills || 0);

        try {
            localStorage.setItem('mapProgressTotals', JSON.stringify(this.progress));
        } catch (e) { }
    },

    getUnlockProgress(mapId) {
        const map = this.biomes[mapId];
        if (!map) return { ratio: 1, done: true, label: 'AÇIK' };
        if (map.unlocked) return { ratio: 1, done: true, label: 'AÇIK' };

        if (mapId === 'iceCave') {
            const current = Math.floor(this.progress.totalSurvival);
            const target = 180;
            return {
                ratio: Math.min(1, current / target),
                done: current >= target,
                label: `${Math.min(current, target)} / ${target} sn hayatta kal`
            };
        }

        if (mapId === 'lavaFactory') {
            const current = this.progress.totalBossKills;
            const target = 1;
            return {
                ratio: Math.min(1, current / target),
                done: current >= target,
                label: `${Math.min(current, target)} / ${target} boss kes`
            };
        }

        if (mapId === 'darkForest') {
            const current = this.progress.totalKills;
            const target = 500;
            return {
                ratio: Math.min(1, current / target),
                done: current >= target,
                label: `${Math.min(current, target)} / ${target} düşman`
            };
        }

        if (mapId === 'spaceStation') {
            const required = ['iceCave', 'lavaFactory', 'darkForest'];
            const unlockedCount = required.filter(id => this.biomes[id].unlocked).length;
            const target = required.length;
            return {
                ratio: unlockedCount / target,
                done: unlockedCount === target,
                label: `${unlockedCount} / ${target} harita açık`
            };
        }

        return { ratio: 0, done: false, label: map.unlockCondition || 'Kilidi açılmadı' };
    },

    /**
     * Check unlock conditions after game ends
     */
    checkUnlocks() {
        const unlockedNow = [];
        // Ice Cave: survive 3 minutes
        if (this.progress.totalSurvival >= 180 && !this.biomes.iceCave.unlocked) {
            this.unlockMap('iceCave');
            unlockedNow.push('iceCave');
        }
        // Lava Factory: kill 1 boss
        if (this.progress.totalBossKills >= 1 && !this.biomes.lavaFactory.unlocked) {
            this.unlockMap('lavaFactory');
            unlockedNow.push('lavaFactory');
        }
        // Dark Forest: 500 total kills
        if (this.progress.totalKills >= 500 && !this.biomes.darkForest.unlocked) {
            this.unlockMap('darkForest');
            unlockedNow.push('darkForest');
        }
        // Space Station: all other maps unlocked
        if (this.biomes.iceCave.unlocked && this.biomes.lavaFactory.unlocked &&
            this.biomes.darkForest.unlocked && !this.biomes.spaceStation.unlocked) {
            this.unlockMap('spaceStation');
            unlockedNow.push('spaceStation');
        }

        return unlockedNow;
    }
};

// Load unlock state on script load
Maps.loadUnlocks();
