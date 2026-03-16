// ============================================================
// weapons.js — Weapon System (Auto-Attack)
// ============================================================

const PLASMA_ORBIT_VISUALS = {
    coolBlue: {
        core: '#46e5ff',
        trailTail: 'rgba(70, 229, 255, 0.02)',
        trailMid: 'rgba(80, 190, 255, 0.24)',
        trailHead: 'rgba(225, 248, 255, 0.58)',
        inner: 'rgba(238, 250, 255, 0.44)'
    },
    electricViolet: {
        core: '#7b5cff',
        trailTail: 'rgba(123, 92, 255, 0.02)',
        trailMid: 'rgba(166, 100, 255, 0.24)',
        trailHead: 'rgba(240, 225, 255, 0.58)',
        inner: 'rgba(247, 238, 255, 0.44)'
    }
};

const Weapons = {
    /** All weapon definitions */
    definitions: {},
    /** Active weapon instances on the player */
    activeWeapons: [],

    /** Projectile pool */
    projectilePool: null,
    napalmZones: [],
    plasmaOrbitVisualMode: 'coolBlue',
    evolutionCheckTimer: 0,
    _iceShotToggle: false,
    _nearbyCandidates: [],
    _nearbyBlastCandidates: [],
    _nearbyOrbitCandidates: [],
    _nearbyChainCandidates: [],
    _nearbyVortexCandidates: [],

    rarityConfig: {
        common: { label: 'COMMON', color: '#9aa0aa', mult: 1.0, weight: 62 },
        rare: { label: 'RARE', color: '#4ea2ff', mult: 1.18, weight: 28 },
        legendary: { label: 'LEGENDARY', color: '#ff9d3f', mult: 1.42, weight: 10 }
    },

    evolutionRecipes: {
        neonLaser: { passive: 'criticalHit', to: 'quantumLance' },
        iceBall: { passive: 'xpMagnet', to: 'absoluteZero' },
        rocketBarrage: { passive: 'speedBoost', to: 'apocalypseBarrage' },
        chainLightning: { passive: 'criticalHit', to: 'tempestRelic' },
        vortexBlade: { passive: 'vampirism', to: 'voidSaw' },
        plasmaOrbit: { passive: 'lastBreath', to: 'astralHalo' }
    },

    init() {
        this.activeWeapons = [];
        this.napalmZones = [];
        this.evolutionCheckTimer = 0;
        this._iceShotToggle = false;
        this._nearbyCandidates = [];
        this._nearbyBlastCandidates = [];
        this._nearbyOrbitCandidates = [];
        this._nearbyChainCandidates = [];
        this._nearbyVortexCandidates = [];
        this.projectilePool = new ObjectPool(
            () => ({
                x: 0, y: 0, vx: 0, vy: 0,
                damage: 10, speed: 300, radius: 4,
                life: 2, color: '#00ffff',
                pierce: 1, hitEnemies: [],
                type: 'laser',
                maxLife: 2,
                _iceAnim: 0,
                _iceVariant: 'small'
            }),
            (p, x, y, vx, vy, damage, speed, radius, life, color, pierce, type) => {
                p.x = x; p.y = y; p.vx = vx; p.vy = vy;
                p.damage = damage || 10;
                p.speed = speed || 300;
                p.radius = radius || 4;
                p.life = life || 2;
                p.maxLife = p.life;
                p.color = color || '#00ffff';
                p.pierce = pierce || 1;
                p.hitEnemies = [];
                p.type = type || 'laser';
                p._iceAnim = 0;
                p._iceVariant = 'small';
            },
            50
        );

        // Define weapons
        this.definitions = {
            neonLaser: {
                name: 'Neon Lazer',
                description: 'En yakın düşmana otomatik ateş eden delici lazer.',
                icon: '⚡',
                color: '#00ffff',
                baseDamage: 15,
                baseCooldown: 1.0,
                baseRange: 350,
                basePierce: 1,
                maxLevel: 8,
                upgrades: [
                    'Hasar +5',
                    'Hız +20%',
                    'Delme +1',
                    'Hasar +10',
                    'Menzil +50',
                    'Hız +20%',
                    'Delme +1',
                    'Hasar +15'
                ]
            },
            plasmaOrbit: {
                name: 'Plazma Yörüngesi',
                description: 'Karakterin etrafında dönen enerji topları.',
                icon: '🔮',
                color: PLASMA_ORBIT_VISUALS[this.plasmaOrbitVisualMode].core,
                baseCount: 2,
                baseOrbitRadius: 70,
                baseDamage: 12,
                baseSpeed: 2.0,     // radians per second
                baseHitCooldown: 0.5,
                maxLevel: 8,
                upgrades: [
                    'Top +1',
                    'Hasar +5',
                    'Yarıçap +15',
                    'Top +1',
                    'Hasar +8',
                    'Hız +30%',
                    'Top +1',
                    'Hasar +12'
                ]
            },
            chainLightning: {
                name: 'Zincirleme Yıldırım',
                description: 'Düşmanlara seken elektrik saldırısı.',
                icon: '⚡',
                color: '#ffff00',
                baseDamage: 20,
                baseCooldown: 2.0,
                baseChains: 3,
                baseRange: 300,
                baseChainRange: 150,
                maxLevel: 8,
                upgrades: [
                    'Zincir +1', 'Hasar +8', 'Cooldown -15%', 'Zincir +1',
                    'Hasar +12', 'Menzil +50', 'Zincir +2', 'Hasar +20'
                ]
            },
            vortexBlade: {
                name: 'Girdap Bıçağı',
                description: 'Etrafında dönen keskin bıçaklar.',
                icon: '🗡️',
                color: '#ff4444',
                baseCount: 2,
                baseOrbitRadius: 55,
                baseDamage: 18,
                baseSpeed: 3.5,
                baseHitCooldown: 0.3,
                maxLevel: 8,
                upgrades: [
                    'Bıçak +1', 'Hasar +6', 'Yarıçap +10', 'Bıçak +1',
                    'Hasar +10', 'Hız +30%', 'Bıçak +1', 'Hasar +15'
                ]
            },
            rocketBarrage: {
                name: 'Roket Barajı',
                description: 'Rastgele düşmanlara patlayıcı roketler.',
                icon: '🚀',
                color: '#ff8800',
                baseDamage: 30,
                baseCooldown: 2.5,
                baseRange: 400,
                baseCount: 1,
                baseExplosionRadius: 60,
                maxLevel: 8,
                upgrades: [
                    'Hasar +10', 'Roket +1', 'Cooldown -15%', 'Patlama +20',
                    'Hasar +15', 'Roket +1', 'Cooldown -15%', 'Hasar +25'
                ]
            },
            iceBall: {
                name: 'Buz Topu',
                description: 'Düşmanları yavaşlatan buz mermisi.',
                icon: '❄️',
                color: '#88ddff',
                baseDamage: 12,
                baseCooldown: 1.5,
                baseRange: 350,
                basePierce: 2,
                baseSlowDuration: 2.0,
                baseSlowAmount: 0.5,
                maxLevel: 8,
                upgrades: [
                    'Hasar +5', 'Delme +1', 'Yavaşlatma +20%', 'Hasar +8',
                    'Cooldown -15%', 'Delme +1', 'Yavaşlatma süresi +1s', 'Hasar +15'
                ]
            }
        };

        this._registerExtendedWeapons();
    },

    /**
     * Add a weapon to the player
     */
    addWeapon(weaponId, options = {}) {
        if (typeof Economy !== 'undefined' && Economy.isWeaponUnlocked && !Economy.isWeaponUnlocked(weaponId)) {
            return false;
        }
        if (this.activeWeapons.find(w => w.id === weaponId)) return false;

        const def = this.definitions[weaponId];
        if (!def) return false;
        const rarityKey = this._normalizeRarityKey(options.rarity || this._rollRarity());
        const rarity = this.rarityConfig[rarityKey] || this.rarityConfig.common;
        const weapon = {
            id: weaponId,
            level: 1,
            cooldownTimer: 0,
            rarity: rarityKey,
            rarityLabel: rarity.label,
            rarityColor: rarity.color,
            rarityMultiplier: rarity.mult,
            isEvolved: !!options.isEvolved,
            // Computed stats
            damage: Math.floor((def.baseDamage || 0) * rarity.mult),
            cooldown: def.baseCooldown || 1,
            range: def.baseRange || 300,
            pierce: def.basePierce || 1,
            count: def.baseCount || 1,
            orbitRadius: def.baseOrbitRadius || 70,
            orbitSpeed: def.baseSpeed || 2.0,
            hitCooldown: def.baseHitCooldown || 0.5,
            chains: def.baseChains || 3,
            chainRange: def.baseChainRange || 150,
            color: def.color || '#ffffff',
            // Orbit state
            orbitAngle: 0,
            orbitHitTimers: [],
            // Lightning visual
            lightningChains: [],
            // Vortex blade state
            bladeAngle: 0,
            bladeHitTimers: [],
            // Rocket state
            explosionRadius: def.baseExplosionRadius || 60,
            // Ice ball state
            slowDuration: def.baseSlowDuration || 2.0,
            slowAmount: def.baseSlowAmount || 0.5,
        };

        // Init orbit/blade hit timers
        for (let i = 0; i < weapon.count; i++) {
            weapon.orbitHitTimers.push(0);
            weapon.bladeHitTimers.push(0);
        }

        this.activeWeapons.push(weapon);
        Player.weapons.push(weaponId);
        return true;
    },

    _normalizeRarityKey(key) {
        if (key === 'epic') return 'rare';
        if (key === 'mythic') return 'legendary';
        if (!this.rarityConfig[key]) return 'common';
        return key;
    },

    /**
     * Plasma orbit visual preset selector
     * Available: 'coolBlue' | 'electricViolet'
     */
    setPlasmaOrbitVisual(mode) {
        if (!PLASMA_ORBIT_VISUALS[mode]) return false;
        this.plasmaOrbitVisualMode = mode;

        const def = this.definitions.plasmaOrbit;
        if (def) {
            def.color = PLASMA_ORBIT_VISUALS[mode].core;
        }

        for (const weapon of this.activeWeapons) {
            if (weapon.id === 'plasmaOrbit') {
                weapon.color = PLASMA_ORBIT_VISUALS[mode].core;
            }
        }

        return true;
    },

    /**
     * Upgrade a weapon
     */
    upgradeWeapon(weaponId) {
        const weapon = this.activeWeapons.find(w => w.id === weaponId);
        if (!weapon) return false;

        const def = this.definitions[weaponId];
        if (weapon.level >= def.maxLevel) return false;

        weapon.level++;
        const upgradeText = def.upgrades[weapon.level - 2]; // level 2 = index 0

        // Apply upgrade based on weapon type
        if (weaponId === 'neonLaser') {
            switch (weapon.level) {
                case 2: weapon.damage += 5; break;
                case 3: weapon.cooldown *= 0.8; break;
                case 4: weapon.pierce += 1; break;
                case 5: weapon.damage += 10; break;
                case 6: weapon.range += 50; break;
                case 7: weapon.cooldown *= 0.8; break;
                case 8: weapon.pierce += 1; break;
                case 9: weapon.damage += 15; break;
            }
        } else if (weaponId === 'plasmaOrbit') {
            switch (weapon.level) {
                case 2: weapon.count += 1; weapon.orbitHitTimers.push(0); break;
                case 3: weapon.damage += 5; break;
                case 4: weapon.orbitRadius += 15; break;
                case 5: weapon.count += 1; weapon.orbitHitTimers.push(0); break;
                case 6: weapon.damage += 8; break;
                case 7: weapon.orbitSpeed *= 1.3; break;
                case 8: weapon.count += 1; weapon.orbitHitTimers.push(0); break;
                case 9: weapon.damage += 12; break;
            }
        } else if (weaponId === 'chainLightning') {
            switch (weapon.level) {
                case 2: weapon.chains += 1; break;
                case 3: weapon.damage += 8; break;
                case 4: weapon.cooldown *= 0.85; break;
                case 5: weapon.chains += 1; break;
                case 6: weapon.damage += 12; break;
                case 7: weapon.range += 50; break;
                case 8: weapon.chains += 2; break;
                case 9: weapon.damage += 20; break;
            }
        } else if (weaponId === 'vortexBlade') {
            switch (weapon.level) {
                case 2: weapon.count += 1; weapon.bladeHitTimers.push(0); break;
                case 3: weapon.damage += 6; break;
                case 4: weapon.orbitRadius += 10; break;
                case 5: weapon.count += 1; weapon.bladeHitTimers.push(0); break;
                case 6: weapon.damage += 10; break;
                case 7: weapon.orbitSpeed *= 1.3; break;
                case 8: weapon.count += 1; weapon.bladeHitTimers.push(0); break;
                case 9: weapon.damage += 15; break;
            }
        } else if (weaponId === 'rocketBarrage') {
            switch (weapon.level) {
                case 2: weapon.damage += 10; break;
                case 3: weapon.count += 1; break;
                case 4: weapon.cooldown *= 0.85; break;
                case 5: weapon.explosionRadius += 20; break;
                case 6: weapon.damage += 15; break;
                case 7: weapon.count += 1; break;
                case 8: weapon.cooldown *= 0.85; break;
                case 9: weapon.damage += 25; break;
            }
        } else if (weaponId === 'iceBall') {
            switch (weapon.level) {
                case 2: weapon.damage += 5; break;
                case 3: weapon.pierce += 1; break;
                case 4: weapon.slowAmount = Math.max(0.3, weapon.slowAmount - 0.1); break;
                case 5: weapon.damage += 8; break;
                case 6: weapon.cooldown *= 0.85; break;
                case 7: weapon.pierce += 1; break;
                case 8: weapon.slowDuration += 1.0; break;
                case 9: weapon.damage += 15; break;
            }
        }

        if (!['neonLaser', 'plasmaOrbit', 'chainLightning', 'vortexBlade', 'rocketBarrage', 'iceBall'].includes(weaponId)) {
            this._applyArchetypeUpgrade(weapon, def);
        }

        return true;
    },

    /**
     * Update all active weapons
     */
    update(dt) {
        this._updateNapalmZones(dt);

        for (const weapon of this.activeWeapons) {
            const def = this.definitions[weapon.id] || {};
            const archetype = def.archetype || weapon.id;

            if (archetype === 'neonLaser') {
                this._updateLaser(weapon, dt);
            } else if (archetype === 'plasmaOrbit') {
                this._updateOrbit(weapon, dt);
            } else if (archetype === 'chainLightning') {
                this._updateLightning(weapon, dt);
            } else if (archetype === 'vortexBlade') {
                this._updateVortex(weapon, dt);
            } else if (archetype === 'rocketBarrage') {
                this._updateRocket(weapon, dt);
            } else if (archetype === 'iceBall') {
                this._updateIceBall(weapon, dt);
            }
        }

        this.evolutionCheckTimer -= dt;
        if (this.evolutionCheckTimer <= 0) {
            this.evolutionCheckTimer = 0.5;
            this._tryEvolveWeapons();
        }

        // Update projectiles
        this.projectilePool.updateAll((p, dt) => {
            p.life -= dt;
            if (p.life <= 0) return true;

            if (p.type === 'ice') {
                p._iceAnim += dt;
            }

            p.x += p.vx * dt;
            p.y += p.vy * dt;

            const localCandidates = (typeof Enemies.getNearby === 'function')
                ? Enemies.getNearby(p.x, p.y, (p.explosionRadius || 0) + 120, this._nearbyCandidates)
                : Enemies.pool.active;

            // Check collision with enemies
            for (let i = localCandidates.length - 1; i >= 0; i--) {
                const e = localCandidates[i];
                if (!e || !e._poolActive) continue;
                if (p.hitEnemies.includes(e)) continue;

                if (Enemies.checkSpriteCenterCollision(e, p.x, p.y, p.radius)) {
                    if (p.type === 'rocket') {
                        // AoE explosion
                        const explosionR = p.explosionRadius || 60;
                        Particles.burstAt(p.x, p.y, '#ff8800', 15);
                        Particles.burstAt(p.x, p.y, '#ffcc00', 8);
                        let napalmCreated = false;
                        const blastCandidates = (typeof Enemies.getNearby === 'function')
                            ? Enemies.getNearby(p.x, p.y, explosionR + 80, this._nearbyBlastCandidates)
                            : Enemies.pool.active;

                        // Damage all enemies in explosion radius
                        for (let k = blastCandidates.length - 1; k >= 0; k--) {
                            const ae = blastCandidates[k];
                            if (!ae || !ae._poolActive) continue;
                            const adx = ae.x - p.x;
                            const ady = ae.y - p.y;
                            if (adx * adx + ady * ady < explosionR * explosionR) {
                                if (!napalmCreated && ae._heatedTimer && ae._heatedTimer > 0) {
                                    this._spawnNapalmZone(p.x, p.y, Math.max(48, explosionR * 0.65));
                                    ae._heatedTimer = 0;
                                    napalmCreated = true;
                                }

                                const killed = Enemies.damageEnemy(ae, p.damage);
                                if (killed) {
                                    XPOrbs.spawnAt(ae.x, ae.y, ae.xp);
                                    GoldOrbs.trySpawn(ae.x, ae.y, ae.gold);
                                    Game.addKill(ae);
                                    Enemies.pool.releaseActive(ae);
                                }
                            }
                        }
                        return true; // Destroy rocket
                    }

                    let hitDamage = p.damage;
                    if (p.type === 'ice') {
                        hitDamage = this._applySynergyDamage(e, hitDamage, 'iceBall');
                    }

                    const killed = Enemies.damageEnemy(e, hitDamage);
                    const inIceCave = (typeof Maps !== 'undefined' && Maps.getSelected && Maps.getSelected() && Maps.getSelected().id === 'iceCave');
                    if (!(p.type === 'ice' && inIceCave)) {
                        Particles.weaponSpark(p.x, p.y, p.color);
                    }

                    if (p.type === 'laser' && !killed) {
                        e._heatedTimer = 2.2;
                    }

                    if (p.type === 'ice' && Particles.spawnIceSlowImpact) {
                        Particles.spawnIceSlowImpact(p.x, p.y);
                        if (!killed && e.hp <= e.maxHp * 0.35) {
                            Particles.spawnIceSlowImpact(e.x, e.y);
                        }
                    }

                    // Ice slow effect
                    if (p.type === 'ice' && !killed) {
                        e.slowTimer = p.slowDuration || 2.0;
                        e.slowFactor = p.slowAmount || 0.5;
                    }

                    if (killed) {
                        XPOrbs.spawnAt(e.x, e.y, e.xp);
                        GoldOrbs.trySpawn(e.x, e.y, e.gold);
                        Game.addKill(e);
                        Enemies.pool.releaseActive(e);
                    }

                    p.hitEnemies.push(e);
                    p.pierce--;
                    if (p.pierce <= 0) return true;
                }
            }

            return false;
        }, dt);
    },

    // ---- Neon Laser ----
    _updateLaser(weapon, dt) {
        weapon.cooldownTimer -= dt;
        if (weapon.cooldownTimer > 0) return;

        const target = Enemies.getClosest(Player.x, Player.y, weapon.range);
        if (!target) return;

        weapon.cooldownTimer = weapon.cooldown;

        // Fire laser projectile
        const dx = target.x - Player.x;
        const dy = target.y - Player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 500;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        this.projectilePool.get(
            Player.x, Player.y, vx, vy,
            weapon.damage, speed, 5, 1.5,
            '#00ffff', weapon.pierce, 'laser'
        );

        Audio.playLaser();
        if (Particles.muzzleFlash) Particles.muzzleFlash(Player.x, Player.y, Math.atan2(vy, vx), '#00ffff');
    },

    // ---- Plasma Orbit ----
    _updateOrbit(weapon, dt) {
        weapon.orbitAngle += weapon.orbitSpeed * dt;

        // Update hit cooldown timers
        for (let i = 0; i < weapon.orbitHitTimers.length; i++) {
            if (weapon.orbitHitTimers[i] > 0) {
                weapon.orbitHitTimers[i] -= dt;
            }
        }

        // Check collision for each orbit ball
        for (let i = 0; i < weapon.count; i++) {
            const angle = weapon.orbitAngle + (Math.PI * 2 / weapon.count) * i;
            const bx = Player.x + Math.cos(angle) * weapon.orbitRadius;
            const by = Player.y + Math.sin(angle) * weapon.orbitRadius;
            const ballRadius = 10;

            if (weapon.orbitHitTimers[i] > 0) continue;

            const candidates = (typeof Enemies.getNearby === 'function')
                ? Enemies.getNearby(bx, by, 80, this._nearbyOrbitCandidates)
                : Enemies.pool.active;

            for (let j = candidates.length - 1; j >= 0; j--) {
                const e = candidates[j];
                if (!e || !e._poolActive) continue;
                if (Enemies.checkSpriteCenterCollision(e, bx, by, ballRadius)) {
                    const killed = Enemies.damageEnemy(e, weapon.damage);
                    Particles.weaponSpark(bx, by, weapon.color);
                    weapon.orbitHitTimers[i] = weapon.hitCooldown;

                    if (killed) {
                        XPOrbs.spawnAt(e.x, e.y, e.xp);
                        GoldOrbs.trySpawn(e.x, e.y, e.gold);
                        Game.addKill(e);
                        Enemies.pool.releaseActive(e);
                    }
                    break;
                }
            }
        }
    },

    // ---- Chain Lightning ----
    _updateLightning(weapon, dt) {
        weapon.cooldownTimer -= dt;

        // Update existing chains (visual)
        for (let i = weapon.lightningChains.length - 1; i >= 0; i--) {
            weapon.lightningChains[i].timer -= dt;
            if (weapon.lightningChains[i].timer <= 0) {
                weapon.lightningChains.splice(i, 1);
            }
        }

        if (weapon.cooldownTimer > 0) return;
        if (Enemies.pool.active.length === 0) return;

        weapon.cooldownTimer = weapon.cooldown;

        // Find first target
        const firstTarget = Enemies.getClosest(Player.x, Player.y, weapon.range);
        if (!firstTarget) return;

        Audio.playLightning();

        // Chain through enemies
        const hitTargets = [firstTarget];
        let current = firstTarget;
        let prevX = Player.x;
        let prevY = Player.y;

        // Add visual chain from player to first target
        weapon.lightningChains.push({
            x1: prevX, y1: prevY,
            x2: current.x, y2: current.y,
            timer: 0.25
        });

        // Damage first target
        const firstDamage = this._applySynergyDamage(current, weapon.damage, 'chainLightning');
        const killed = Enemies.damageEnemy(current, firstDamage);
        if (killed) {
            XPOrbs.spawnAt(current.x, current.y, current.xp);
            GoldOrbs.trySpawn(current.x, current.y, current.gold);
            Game.addKill(current);
            Enemies.pool.releaseActive(current);
        }

        // Chain to more enemies
        for (let c = 0; c < weapon.chains; c++) {
            let closestDist = weapon.chainRange;
            let nextTarget = null;

            const candidates = (typeof Enemies.getNearby === 'function')
                ? Enemies.getNearby(current.x, current.y, weapon.chainRange + 80, this._nearbyChainCandidates)
                : Enemies.pool.active;

            for (const e of candidates) {
                if (!e || !e._poolActive) continue;
                if (hitTargets.includes(e)) continue;
                const dx = e.x - current.x;
                const dy = e.y - current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < closestDist) {
                    closestDist = dist;
                    nextTarget = e;
                }
            }

            if (!nextTarget) break;

            // Visual chain
            weapon.lightningChains.push({
                x1: current.x, y1: current.y,
                x2: nextTarget.x, y2: nextTarget.y,
                timer: 0.25
            });

            // Damage (reduced per chain)
            const chainDamage = Math.max(1, Math.floor(weapon.damage * (0.8 - c * 0.1)));
            const finalChainDamage = this._applySynergyDamage(nextTarget, chainDamage, 'chainLightning');
            const chainKilled = Enemies.damageEnemy(nextTarget, finalChainDamage);
            Particles.weaponSpark(nextTarget.x, nextTarget.y, '#ffff00');

            if (chainKilled) {
                XPOrbs.spawnAt(nextTarget.x, nextTarget.y, nextTarget.xp);
                GoldOrbs.trySpawn(nextTarget.x, nextTarget.y, nextTarget.gold);
                Game.addKill(nextTarget);
                Enemies.pool.releaseActive(nextTarget);
            }

            hitTargets.push(nextTarget);
            current = nextTarget;
        }
    },

    /**
     * Draw all weapons
     */
    draw(ctx) {
        const tunnelPalette = (typeof Maps !== 'undefined' && Maps.getNeonTunnelPalette)
            ? Maps.getNeonTunnelPalette()
            : null;

        this._drawNapalmZones(ctx);

        // Draw projectiles
        this.projectilePool.drawAll((ctx, p) => {
            ctx.save();
            const projColor = tunnelPalette && p.type === 'laser' ? tunnelPalette.accent : p.color;
            const projPulse = tunnelPalette && p.type === 'laser' ? tunnelPalette.pulse : '#ffffff';
            ctx.shadowColor = projColor;
            ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                ? Renderer.getShadowBlur(12)
                : 12;

            if (p.type === 'laser') {
                const angle = Math.atan2(p.vy, p.vx);
                const tailLen = 20;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(
                    p.x - Math.cos(angle) * tailLen,
                    p.y - Math.sin(angle) * tailLen
                );
                ctx.strokeStyle = projColor;
                ctx.lineWidth = 3;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = projPulse;
                ctx.fill();
            } else if (p.type === 'rocket') {
                // Rocket: triangle with fire trail
                const angle = Math.atan2(p.vy, p.vx);
                ctx.translate(p.x, p.y);
                ctx.rotate(angle);

                // Fire trail
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(-20, -4);
                ctx.lineTo(-20, 4);
                ctx.closePath();
                ctx.fillStyle = '#ffcc00';
                ctx.fill();

                // Rocket body
                ctx.globalAlpha = 1;
                ctx.beginPath();
                ctx.moveTo(8, 0);
                ctx.lineTo(-6, -4);
                ctx.lineTo(-6, 4);
                ctx.closePath();
                ctx.fillStyle = '#ff8800';
                ctx.fill();
                ctx.strokeStyle = '#ffaa44';
                ctx.lineWidth = 1;
                ctx.stroke();
            } else if (p.type === 'ice') {
                const drewSprite = Particles.drawIceProjectile && Particles.drawIceProjectile(ctx, p);
                const inIceCave = (typeof Maps !== 'undefined' && Maps.getSelected && Maps.getSelected() && Maps.getSelected().id === 'iceCave');
                if (!drewSprite && !inIceCave) {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius + 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(136, 221, 255, 0.3)';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = '#88ddff';
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = '#ffffff';
                    ctx.fill();
                }
            }

            ctx.shadowBlur = 0;
            ctx.restore();
        }, ctx);

        // Draw special weapons
        for (const weapon of this.activeWeapons) {
            const def = this.definitions[weapon.id] || {};
            const archetype = def.archetype || weapon.id;
            if (archetype === 'plasmaOrbit') {
                this._drawOrbit(ctx, weapon);
            } else if (archetype === 'chainLightning') {
                this._drawLightning(ctx, weapon);
            } else if (archetype === 'vortexBlade') {
                this._drawVortex(ctx, weapon);
            }
        }
    },

    _rollRarity() {
        const total = Object.values(this.rarityConfig).reduce((s, v) => s + v.weight, 0);
        let roll = Math.random() * total;
        for (const [key, cfg] of Object.entries(this.rarityConfig)) {
            roll -= cfg.weight;
            if (roll <= 0) return key;
        }
        return 'common';
    },

    _applySynergyDamage(enemy, baseDamage, sourceArchetype) {
        if (!enemy) return baseDamage;

        let finalDamage = baseDamage;

        // Lightning vs frozen/slowed: bonus hit + mark target as electrified
        if (sourceArchetype === 'chainLightning') {
            const frozen = (enemy.slowTimer && enemy.slowTimer > 0) || enemy._frostSlow;
            if (frozen) {
                finalDamage = Math.floor(finalDamage * 1.35);
                Particles.weaponSpark(enemy.x, enemy.y, '#9df6ff');
            }
            enemy._electroChargedTimer = 2.0;
            return finalDamage;
        }

        // Ice vs electrified: consume charge for shatter bonus
        if (sourceArchetype === 'iceBall') {
            if (enemy._electroChargedTimer && enemy._electroChargedTimer > 0) {
                enemy._electroChargedTimer = 0;
                finalDamage = Math.floor(finalDamage * 1.3);
                Particles.weaponSpark(enemy.x, enemy.y, '#b8ecff');
            }
            return finalDamage;
        }

        return finalDamage;
    },

    _applyArchetypeUpgrade(weapon, def) {
        const archetype = def.archetype || 'neonLaser';
        if (archetype === 'neonLaser') {
            weapon.damage += Math.max(2, Math.floor(4 * weapon.rarityMultiplier));
            weapon.cooldown *= 0.95;
            if (weapon.level % 3 === 0) weapon.pierce += 1;
        } else if (archetype === 'plasmaOrbit') {
            weapon.damage += Math.max(2, Math.floor(3 * weapon.rarityMultiplier));
            if (weapon.level % 2 === 0) {
                weapon.count += 1;
                weapon.orbitHitTimers.push(0);
            }
            weapon.orbitSpeed *= 1.04;
        } else if (archetype === 'chainLightning') {
            weapon.damage += Math.max(3, Math.floor(5 * weapon.rarityMultiplier));
            if (weapon.level % 2 === 0) weapon.chains += 1;
            weapon.cooldown *= 0.95;
        } else if (archetype === 'vortexBlade') {
            weapon.damage += Math.max(3, Math.floor(4 * weapon.rarityMultiplier));
            if (weapon.level % 2 === 1) {
                weapon.count += 1;
                weapon.bladeHitTimers.push(0);
            }
            weapon.orbitSpeed *= 1.05;
        } else if (archetype === 'rocketBarrage') {
            weapon.damage += Math.max(4, Math.floor(6 * weapon.rarityMultiplier));
            if (weapon.level % 3 === 0) weapon.count += 1;
            weapon.cooldown *= 0.94;
            weapon.explosionRadius += 6;
        } else if (archetype === 'iceBall') {
            weapon.damage += Math.max(3, Math.floor(4 * weapon.rarityMultiplier));
            weapon.cooldown *= 0.95;
            if (weapon.level % 3 === 0) weapon.pierce += 1;
            weapon.slowDuration += 0.1;
        }
    },

    _spawnNapalmZone(x, y, radius) {
        this.napalmZones.push({
            x,
            y,
            radius,
            timer: 3.2,
            maxTimer: 3.2,
            dps: 20,
            tickTimer: 0.2
        });
        Particles.burstAt(x, y, '#ff7744', 12);
    },

    _updateNapalmZones(dt) {
        for (let i = this.napalmZones.length - 1; i >= 0; i--) {
            const zone = this.napalmZones[i];
            zone.timer -= dt;
            zone.tickTimer -= dt;

            if (zone.tickTimer <= 0) {
                zone.tickTimer = 0.2;
                for (let k = Enemies.pool.active.length - 1; k >= 0; k--) {
                    const e = Enemies.pool.active[k];
                    const dx = e.x - zone.x;
                    const dy = e.y - zone.y;
                    if (dx * dx + dy * dy > zone.radius * zone.radius) continue;

                    const killed = Enemies.damageEnemy(e, zone.dps * 0.2);
                    if (killed) {
                        XPOrbs.spawnAt(e.x, e.y, e.xp);
                        GoldOrbs.trySpawn(e.x, e.y, e.gold);
                        Game.addKill(e);
                        Enemies.pool.releaseActiveAt(k);
                    }
                }
                Particles.weaponSpark(zone.x, zone.y, '#ff9955');
            }

            if (zone.timer <= 0) {
                this.napalmZones.splice(i, 1);
            }
        }
    },

    _drawNapalmZones(ctx) {
        if (!this.napalmZones || this.napalmZones.length === 0) return;

        for (const zone of this.napalmZones) {
            const alpha = Math.max(0, zone.timer / zone.maxTimer);
            ctx.save();
            ctx.globalAlpha = 0.22 * alpha;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#ff6b2e';
            ctx.fill();

            ctx.globalAlpha = 0.55 * alpha;
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ffbf66';
            ctx.stroke();
            ctx.restore();
        }
    },

    _tryEvolveWeapons() {
        if (!Player || !Player.getPassiveLevel) return;

        for (let i = 0; i < this.activeWeapons.length; i++) {
            const weapon = this.activeWeapons[i];
            if (weapon.isEvolved) continue;

            const recipe = this.evolutionRecipes[weapon.id];
            if (!recipe) continue;
            if (weapon.level < 8) continue;
            if (Player.getPassiveLevel(recipe.passive) <= 0) continue;

            this.removeWeapon(weapon.id);
            const evolvedRarity = 'legendary';
            const added = this.addWeapon(recipe.to, { rarity: evolvedRarity, isEvolved: true });
            if (added) {
                const evolved = this.activeWeapons.find(w => w.id === recipe.to);
                if (evolved) evolved.level = Math.max(evolved.level, 3);
                Camera.triggerShake(12, 0.2);
                Particles.burstAt(Player.x, Player.y, '#ffd166', 24);
                if (typeof Audio !== 'undefined' && Audio.playEvolution) Audio.playEvolution();
            }
            break;
        }
    },

    _registerExtendedWeapons() {
        Object.assign(this.definitions, {
            pulseCarbine: { name: 'Pulse Carbine', description: 'Hızlı darbe atışları.', icon: '🔫', color: '#44d6ff', baseDamage: 13, baseCooldown: 0.72, baseRange: 360, basePierce: 1, maxLevel: 8, archetype: 'neonLaser', upgrades: ['DMG +', 'Rate +', 'Pierce +', 'DMG +', 'Range +', 'Rate +', 'Pierce +', 'DMG +'] },
            toxicBeam: { name: 'Toxic Beam', description: 'Asidik uzun menzil ışın.', icon: '☣️', color: '#8cff5b', baseDamage: 17, baseCooldown: 1.15, baseRange: 420, basePierce: 2, maxLevel: 8, archetype: 'neonLaser', upgrades: ['DMG +', 'Range +', 'Pierce +', 'Rate +', 'DMG +', 'Pierce +', 'Rate +', 'DMG +'] },
            quasarNeedle: { name: 'Quasar Needle', description: 'Keskin yüksek hız iğne atışı.', icon: '🪡', color: '#ff7be9', baseDamage: 20, baseCooldown: 1.28, baseRange: 390, basePierce: 2, maxLevel: 8, archetype: 'neonLaser', upgrades: ['DMG +', 'Rate +', 'Pierce +', 'DMG +', 'Range +', 'Rate +', 'Pierce +', 'DMG +'] },

            droneHalo: { name: 'Drone Halo', description: 'Yakın dönen drone halkası.', icon: '🛰️', color: '#7fffd4', baseCount: 2, baseOrbitRadius: 80, baseDamage: 11, baseSpeed: 2.6, baseHitCooldown: 0.45, maxLevel: 8, archetype: 'plasmaOrbit', upgrades: ['Drone +1', 'DMG +', 'Radius +', 'Drone +1', 'DMG +', 'Speed +', 'Drone +1', 'DMG +'] },
            astralHalo: { name: 'Astral Halo', description: 'Evrilmiş yıldız yörüngesi.', icon: '🪐', color: '#ffe87c', baseCount: 4, baseOrbitRadius: 92, baseDamage: 26, baseSpeed: 3.1, baseHitCooldown: 0.26, maxLevel: 8, archetype: 'plasmaOrbit', evolvedOnly: true, upgrades: ['Astral +', 'DMG +', 'Radius +', 'Astral +', 'DMG +', 'Speed +', 'Astral +', 'DMG +'] },

            thunderTotem: { name: 'Thunder Totem', description: 'Kısa cooldown zincir yıldırım.', icon: '🌩️', color: '#f0f46a', baseDamage: 16, baseCooldown: 1.35, baseChains: 4, baseRange: 320, baseChainRange: 140, maxLevel: 8, archetype: 'chainLightning', upgrades: ['Chain +', 'DMG +', 'CDR +', 'Chain +', 'DMG +', 'Range +', 'Chain +', 'DMG +'] },
            tempestRelic: { name: 'Tempest Relic', description: 'Evrilmiş fırtına zinciri.', icon: '⛈️', color: '#ffe17a', baseDamage: 32, baseCooldown: 1.0, baseChains: 6, baseRange: 360, baseChainRange: 190, maxLevel: 8, archetype: 'chainLightning', evolvedOnly: true, upgrades: ['Chain +', 'DMG +', 'CDR +', 'Chain +', 'DMG +', 'Range +', 'Chain +', 'DMG +'] },

            sawRing: { name: 'Saw Ring', description: 'Dönen testere halkası.', icon: '🪚', color: '#ff6688', baseCount: 2, baseOrbitRadius: 60, baseDamage: 16, baseSpeed: 3.8, baseHitCooldown: 0.28, maxLevel: 8, archetype: 'vortexBlade', upgrades: ['Saw +1', 'DMG +', 'Radius +', 'Saw +1', 'DMG +', 'Speed +', 'Saw +1', 'DMG +'] },
            voidSaw: { name: 'Void Saw', description: 'Evrilmiş boşluk bıçak çemberi.', icon: '🌀', color: '#ff9db3', baseCount: 4, baseOrbitRadius: 72, baseDamage: 30, baseSpeed: 4.6, baseHitCooldown: 0.2, maxLevel: 8, archetype: 'vortexBlade', evolvedOnly: true, upgrades: ['Saw +', 'DMG +', 'Radius +', 'Saw +', 'DMG +', 'Speed +', 'Saw +', 'DMG +'] },

            meteorCore: { name: 'Meteor Core', description: 'Yıkıcı meteor roketleri.', icon: '☄️', color: '#ff9a3b', baseDamage: 36, baseCooldown: 2.2, baseRange: 430, baseCount: 1, baseExplosionRadius: 72, maxLevel: 8, archetype: 'rocketBarrage', upgrades: ['DMG +', 'Rocket +', 'CDR +', 'Blast +', 'DMG +', 'Rocket +', 'CDR +', 'DMG +'] },
            apocalypseBarrage: { name: 'Apocalypse Barrage', description: 'Evrilmiş kıyamet roket yağmuru.', icon: '💥', color: '#ffd166', baseDamage: 62, baseCooldown: 1.75, baseRange: 460, baseCount: 2, baseExplosionRadius: 95, maxLevel: 8, archetype: 'rocketBarrage', evolvedOnly: true, upgrades: ['DMG +', 'Rocket +', 'CDR +', 'Blast +', 'DMG +', 'Rocket +', 'CDR +', 'DMG +'] },

            shardLauncher: { name: 'Shard Launcher', description: 'Çoklu donma şarapneli.', icon: '🧊', color: '#8ed6ff', baseDamage: 14, baseCooldown: 1.25, baseRange: 360, basePierce: 3, baseSlowDuration: 2.2, baseSlowAmount: 0.52, maxLevel: 8, archetype: 'iceBall', upgrades: ['DMG +', 'Pierce +', 'Slow +', 'DMG +', 'CDR +', 'Pierce +', 'Duration +', 'DMG +'] },
            cryoNova: { name: 'Cryo Nova', description: 'Alan dondurucu buz mermisi.', icon: '🥶', color: '#a8ecff', baseDamage: 18, baseCooldown: 1.5, baseRange: 340, basePierce: 2, baseSlowDuration: 2.8, baseSlowAmount: 0.45, maxLevel: 8, archetype: 'iceBall', upgrades: ['DMG +', 'Pierce +', 'Slow +', 'DMG +', 'CDR +', 'Pierce +', 'Duration +', 'DMG +'] },
            absoluteZero: { name: 'Absolute Zero', description: 'Evrilmiş mutlak sıfır fırtınası.', icon: '❄️', color: '#e7fbff', baseDamage: 34, baseCooldown: 1.0, baseRange: 380, basePierce: 5, baseSlowDuration: 3.2, baseSlowAmount: 0.3, maxLevel: 8, archetype: 'iceBall', evolvedOnly: true, upgrades: ['DMG +', 'Pierce +', 'Slow +', 'DMG +', 'CDR +', 'Pierce +', 'Duration +', 'DMG +'] },

            quantumLance: { name: 'Quantum Lance', description: 'Evrilmiş kuantum lazer.', icon: '🧬', color: '#ffdf6e', baseDamage: 42, baseCooldown: 0.8, baseRange: 450, basePierce: 4, maxLevel: 8, archetype: 'neonLaser', evolvedOnly: true, upgrades: ['DMG +', 'Rate +', 'Pierce +', 'DMG +', 'Range +', 'Rate +', 'Pierce +', 'DMG +'] }
        });
    },

    _drawOrbit(ctx, weapon) {
        const palette = PLASMA_ORBIT_VISUALS[this.plasmaOrbitVisualMode] || PLASMA_ORBIT_VISUALS.coolBlue;

        for (let i = 0; i < weapon.count; i++) {
            const angle = weapon.orbitAngle + (Math.PI * 2 / weapon.count) * i;
            const bx = Player.x + Math.cos(angle) * weapon.orbitRadius;
            const by = Player.y + Math.sin(angle) * weapon.orbitRadius;
            const trailStart = angle - 1.05;
            const trailMid = angle - 0.42;

            // Orbit trail
            ctx.save();
            ctx.globalAlpha = 1;
            const trailGrad = ctx.createLinearGradient(
                Player.x + Math.cos(trailStart) * weapon.orbitRadius,
                Player.y + Math.sin(trailStart) * weapon.orbitRadius,
                Player.x + Math.cos(angle) * weapon.orbitRadius,
                Player.y + Math.sin(angle) * weapon.orbitRadius
            );
            trailGrad.addColorStop(0, palette.trailTail);
            trailGrad.addColorStop(0.45, palette.trailMid);
            trailGrad.addColorStop(1, palette.trailHead);

            ctx.beginPath();
            ctx.arc(Player.x, Player.y, weapon.orbitRadius, trailStart, angle);
            ctx.strokeStyle = trailGrad;
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Inner focused streak for modern plasma feel
            ctx.beginPath();
            ctx.arc(Player.x, Player.y, weapon.orbitRadius, trailMid, angle);
            ctx.strokeStyle = palette.inner;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Ball
            Renderer.drawNeonCircle(ctx, bx, by, 10, weapon.color, 18);
            ctx.restore();
        }
    },

    _drawLightning(ctx, weapon) {
        for (const chain of weapon.lightningChains) {
            const alpha = chain.timer / 0.25;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.shadowColor = '#ffff00';
            ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                ? Renderer.getShadowBlur(15, true)
                : 15;
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            const dx = chain.x2 - chain.x1;
            const dy = chain.y2 - chain.y1;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const segments = Math.max(4, Math.floor(dist / 20));
            const perpX = -dy / dist;
            const perpY = dx / dist;

            ctx.moveTo(chain.x1, chain.y1);
            for (let s = 1; s < segments; s++) {
                const t = s / segments;
                const jitter = (Math.random() - 0.5) * 20;
                const px = chain.x1 + dx * t + perpX * jitter;
                const py = chain.y1 + dy * t + perpY * jitter;
                ctx.lineTo(px, py);
            }
            ctx.lineTo(chain.x2, chain.y2);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(chain.x1, chain.y1);
            ctx.lineTo(chain.x2, chain.y2);
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },

    // ---- VORTEX BLADE ----

    _updateVortex(weapon, dt) {
        weapon.bladeAngle += weapon.orbitSpeed * dt;

        // Update hit cooldowns
        for (let i = 0; i < weapon.bladeHitTimers.length; i++) {
            if (weapon.bladeHitTimers[i] > 0) weapon.bladeHitTimers[i] -= dt;
        }

        // Check blade collisions
        for (let i = 0; i < weapon.count; i++) {
            if (weapon.bladeHitTimers[i] > 0) continue;

            const angle = weapon.bladeAngle + (Math.PI * 2 / weapon.count) * i;
            const bx = Player.x + Math.cos(angle) * weapon.orbitRadius;
            const by = Player.y + Math.sin(angle) * weapon.orbitRadius;

            const candidates = (typeof Enemies.getNearby === 'function')
                ? Enemies.getNearby(bx, by, 85, this._nearbyVortexCandidates)
                : Enemies.pool.active;

            for (let j = candidates.length - 1; j >= 0; j--) {
                const e = candidates[j];
                if (!e || !e._poolActive) continue;
                if (Enemies.checkSpriteCenterCollision(e, bx, by, 15)) {
                    const killed = Enemies.damageEnemy(e, weapon.damage);
                    Particles.weaponSpark(bx, by, '#ff4444');
                    weapon.bladeHitTimers[i] = weapon.hitCooldown;

                    if (killed) {
                        XPOrbs.spawnAt(e.x, e.y, e.xp);
                        GoldOrbs.trySpawn(e.x, e.y, e.gold);
                        Game.addKill(e);
                        Enemies.pool.releaseActive(e);
                    }
                    break;
                }
            }
        }
    },

    _drawVortex(ctx, weapon) {
        for (let i = 0; i < weapon.count; i++) {
            const angle = weapon.bladeAngle + (Math.PI * 2 / weapon.count) * i;
            const bx = Player.x + Math.cos(angle) * weapon.orbitRadius;
            const by = Player.y + Math.sin(angle) * weapon.orbitRadius;

            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(angle + Math.PI / 2);

            // Blade trail
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.arc(0, 0, 14, -Math.PI, 0);
            ctx.fillStyle = '#ff4444';
            ctx.fill();

            // Blade shape (elongated diamond)
            ctx.globalAlpha = 0.9;
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = (typeof Renderer !== 'undefined' && Renderer.getShadowBlur)
                ? Renderer.getShadowBlur(12)
                : 12;
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(5, 0);
            ctx.lineTo(0, 16);
            ctx.lineTo(-5, 0);
            ctx.closePath();
            ctx.fillStyle = '#ff4444';
            ctx.fill();
            ctx.strokeStyle = '#ff8888';
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.shadowBlur = 0;
            ctx.restore();
        }
    },

    // ---- ROCKET BARRAGE ----

    _updateRocket(weapon, dt) {
        weapon.cooldownTimer -= dt;
        if (weapon.cooldownTimer > 0) return;

        const targets = Enemies.getClosestN(Player.x, Player.y, weapon.count, weapon.range);
        if (targets.length === 0) return;

        weapon.cooldownTimer = weapon.cooldown;

        for (const target of targets) {
            const dx = target.x - Player.x;
            const dy = target.y - Player.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const speed = 250;
            const vx = (dx / dist) * speed;
            const vy = (dy / dist) * speed;

            const rocket = this.projectilePool.get(
                Player.x, Player.y, vx, vy,
                weapon.damage, speed, 6, 3.0, '#ff8800', 1, 'rocket'
            );
            if (rocket) {
                rocket.explosionRadius = weapon.explosionRadius;
            }
        }
        if (targets.length > 0 && Particles.muzzleFlash) {
            const t = targets[0];
            Particles.muzzleFlash(Player.x, Player.y, Math.atan2(t.y - Player.y, t.x - Player.x), '#ff8800');
        }
    },

    _drawRocket(ctx, weapon) {
        // Rockets are drawn by projectile pool — we add explosion drawing
    },

    // ---- ICE BALL ----

    _updateIceBall(weapon, dt) {
        weapon.cooldownTimer -= dt;
        if (weapon.cooldownTimer > 0) return;

        const target = Enemies.getClosest(Player.x, Player.y, weapon.range);
        if (!target) return;

        weapon.cooldownTimer = weapon.cooldown;

        const dx = target.x - Player.x;
        const dy = target.y - Player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 280;
        const vx = (dx / dist) * speed;
        const vy = (dy / dist) * speed;

        const p = this.projectilePool.get(
            Player.x, Player.y, vx, vy,
            weapon.damage, speed, 5, 2.5, '#88ddff', weapon.pierce, 'ice'
        );
        if (p) {
            p.slowDuration = weapon.slowDuration;
            p.slowAmount = weapon.slowAmount;
            if (typeof Player !== 'undefined' && Player.level >= 5) {
                this._iceShotToggle = !this._iceShotToggle;
                p._iceVariant = this._iceShotToggle ? 'small' : 'big';
                if (Particles.spawnIceShotMuzzle) {
                    Particles.spawnIceShotMuzzle(Player.x, Player.y, vx, vy, p._iceVariant);
                }
            } else {
                if (Particles.muzzleFlash) Particles.muzzleFlash(Player.x, Player.y, Math.atan2(vy, vx), '#88ddff');
            }
        }
    },

    /**
     * Remove a weapon (used when temporary powerup expires)
     */
    removeWeapon(weaponId) {
        const idx = this.activeWeapons.findIndex(w => w.id === weaponId);
        if (idx !== -1) {
            this.activeWeapons.splice(idx, 1);
        }
        const pidx = Player.weapons.indexOf(weaponId);
        if (pidx !== -1) {
            Player.weapons.splice(pidx, 1);
        }
    },

    /** Clear */
    clear() {
        this.activeWeapons = [];
        this.napalmZones = [];
        this.projectilePool.releaseAll();
    }
};
