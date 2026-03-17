// ============================================================
// enemy_sprites.js — Enemy Sprite & Asset Loading System
// ============================================================
// This file is loaded AFTER enemy.js and extends the Enemies
// object with sprite/asset methods using Object.assign.
// SpriteSheet class is already defined in enemy.js — do not redeclare!
// ============================================================

Object.assign(Enemies, {
    // Sprite state properties
    _sprites: {},
    _spritesReady: false,
    _spriteHoverTime: 0,

    // Enemy bullet sprite animation config
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
        const total = 20; // 4 defaults + 16 map specifics
        const markDone = () => { loaded++; if (loaded >= total) this._spritesReady = true; };

        // Defaults (Neon City)
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
        
        // --- Map Specific Entities ---
        const mapKeys = ['ice', 'lava', 'forest', 'space'];
        const types = ['drone', 'fighter', 'tank', 'boss'];
        
        mapKeys.forEach(mk => {
            this._sprites[mk] = {};
            types.forEach(t => {
                const img = new Image();
                img.onload = markDone;
                img.onerror = markDone;
                // Get the latest file matching the pattern
                img.src = `assets/sprites/${mk}_${t}.png`; // Warning: Needs exact filenames if timestamped, will handle fallback
                this._sprites[mk][t] = img;
            });
        });
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

        // ---- AUTO-DOWNSCALE oversized sprites for performance ----
        const MAX_DIM = 512;
        let srcImg = img;
        if (img.width > MAX_DIM || img.height > MAX_DIM) {
            const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height);
            const sw = Math.round(img.width * scale);
            const sh = Math.round(img.height * scale);
            console.log(`[EnemyBullets] Auto-downscaling ${img.width}x${img.height} → ${sw}x${sh}`);
            const tmpC = document.createElement('canvas');
            tmpC.width = sw;
            tmpC.height = sh;
            const tmpCtx = tmpC.getContext('2d');
            tmpCtx.drawImage(img, 0, 0, sw, sh);
            srcImg = tmpC;
        }

        const cleanCanvas = document.createElement('canvas');
        cleanCanvas.width = srcImg.width;
        cleanCanvas.height = srcImg.height;
        const ctx = cleanCanvas.getContext('2d', { willReadFrequently: true });
        ctx.clearRect(0, 0, cleanCanvas.width, cleanCanvas.height);
        ctx.drawImage(srcImg, 0, 0);

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

        // Recalculate frame dimensions based on actual (possibly downscaled) canvas
        const actualFw = Math.min(fw, cleanCanvas.width);
        const actualFh = Math.min(fh, cleanCanvas.height);
        return new SpriteSheet(cleanCanvas, actualFw, actualFh, frameCount);
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

    // Get the correct sprite image for an enemy based on the current map
    _getSpriteForEnemy(e) {
        if (!this._spritesReady) return null;
        
        const mapId = Maps.selected || 'neonCity';
        
        // Map specific sprite logic
        if (mapId === 'iceCave' && this._sprites.ice) {
            if (e.isBoss) return this._sprites.ice.boss;
            if (e.sides === 3) return this._sprites.ice.fighter;
            if (e.sides === 4) return this._sprites.ice.drone;
            return this._sprites.ice.tank;
        }
        else if (mapId === 'lavaFactory' && this._sprites.lava) {
            if (e.isBoss) return this._sprites.lava.boss;
            if (e.sides === 3) return this._sprites.lava.fighter;
            if (e.sides === 4) return this._sprites.lava.drone;
            return this._sprites.lava.tank;
        }
        else if (mapId === 'darkForest' && this._sprites.forest) {
            if (e.isBoss) return this._sprites.forest.boss;
            if (e.sides === 3) return this._sprites.forest.fighter;
            if (e.sides === 4) return this._sprites.forest.drone;
            return this._sprites.forest.tank;
        }
        else if (mapId === 'spaceStation' && this._sprites.space) {
            if (e.isBoss) return this._sprites.space.boss;
            if (e.sides === 3) return this._sprites.space.fighter;
            if (e.sides === 4) return this._sprites.space.drone;
            return this._sprites.space.tank;
        }
        
        // Fallback to defaults (Neon City and others)
        if (e.isBoss) return this._sprites.boss;
        if (e.sides === 3) return this._sprites.ucak;   // Rusher/Fighter → uçak
        if (e.sides === 4) return this._sprites.kare;   // Drone → kare
        return this._sprites.ufo;                        // Brute/Spinner (5+) → ufo
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
    }
});
