// ============================================================
// characters.js — Character Definitions & Selection
// ============================================================

const Characters = {
    /** Currently selected character id */
    selected: 'cipher',

    /** All character definitions */
    roster: {
        cipher: {
            id: 'cipher',
            name: 'CIPHER',
            title: 'Acemi Savaşçı',
            cost: 0,
            icon: '⚡',
            description: 'Başlangıç karakteri. Hareket ettikçe hasar bonusu kazanır.',
            color: '#00ffff',
            accentColor: '#00ccff',
            spriteFile: 'assets/sprites/ufo.png',
            // Base stats (multipliers applied to Player defaults)
            stats: {
                hp: 0.8,        // -20% (en düşük)
                speed: 0.85,    // -15% (en düşük)
                damage: 0.85,   // -15% (en düşük)
                magnetRadius: 1.0
            },
            startWeapon: 'neonLaser',
            sides: 6,       // Hexagon
            // Passive ability hook
            passive: {
                name: 'Hız Avcısı',
                description: 'Hareket ederken hasar +%15',
                onUpdate(player, dt) {
                    // Moving damage boost is handled in weapons via player.isMoving
                },
                damageMultiplier(player) {
                    return player._isMoving ? 1.15 : 1.0;
                }
            },
            // Drawing: fast sleek hexagon with speed lines
            drawBody(ctx, x, y, r, rotation, pulse) {
                // Outer hexagon
                Renderer.drawNeonPoly(ctx, x, y, r, 6, rotation, '#00ffff', 18);
                // Speed arrow inner
                ctx.save();
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 5;
                ctx.beginPath();
                const tipX = x + Math.cos(rotation) * r * 0.6;
                const tipY = y + Math.sin(rotation) * r * 0.6;
                const leftX = x + Math.cos(rotation + 2.5) * r * 0.35;
                const leftY = y + Math.sin(rotation + 2.5) * r * 0.35;
                const rightX = x + Math.cos(rotation - 2.5) * r * 0.35;
                const rightY = y + Math.sin(rotation - 2.5) * r * 0.35;
                ctx.moveTo(tipX, tipY);
                ctx.lineTo(leftX, leftY);
                ctx.lineTo(rightX, rightY);
                ctx.closePath();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        volt: {
            id: 'volt',
            name: 'VOLT',
            title: 'Yıldırım Ustası',
            cost: 500,
            icon: '🔵',
            description: 'Yıldırım hasarı +%30. Düşmanları çarparak yavaşlatır.',
            color: '#4488ff',
            accentColor: '#2266dd',
            spriteFile: 'assets/sprites/volt.png',
            stats: {
                hp: 0.9,
                speed: 1.0,
                damage: 1.3,    // +30% damage
                magnetRadius: 1.0
            },
            startWeapon: 'chainLightning',
            sides: 5,       // Pentagon
            passive: {
                name: 'Statik Şok',
                description: 'Her 5. vuruş düşmanları 1s yavaşlatır',
                hitCounter: 0,
                onHit(enemy) {
                    this.hitCounter++;
                    if (this.hitCounter >= 5) {
                        this.hitCounter = 0;
                        enemy._slowTimer = 1.0;
                        return true; // Slow applied
                    }
                    return false;
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 5, rotation, '#4488ff', 18);
                // Lightning bolt inner symbol
                ctx.save();
                ctx.shadowColor = '#88ccff';
                ctx.shadowBlur = 8;
                ctx.strokeStyle = '#88ccff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x - r * 0.15, y - r * 0.35);
                ctx.lineTo(x + r * 0.05, y - r * 0.05);
                ctx.lineTo(x - r * 0.1, y + r * 0.05);
                ctx.lineTo(x + r * 0.15, y + r * 0.35);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        phantom: {
            id: 'phantom',
            name: 'PHANTOM',
            title: 'Gölge Avcı',
            cost: 1200,
            icon: '👻',
            description: 'Her 10 saniyede 1.5s görünmezlik. Düşmanlar hedef alamaz.',
            color: '#aa44ff',
            accentColor: '#8822dd',
            spriteFile: 'assets/sprites/phantom.png',
            spriteRotationOffset: -Math.PI / 2,  // Sprite'ı 90° sola döndür
            stats: {
                hp: 0.85,
                speed: 1.1,
                damage: 1.0,
                magnetRadius: 1.15
            },
            startWeapon: 'plasmaOrbit',
            sides: 8,       // Octagon (ghostly)
            passive: {
                name: 'Gölge Adım',
                description: 'Her 10s görünmezlik (1.5s)',
                _timer: 0,
                _invisTimer: 0,
                _interval: 10,
                _duration: 1.5,
                onUpdate(player, dt) {
                    if (this._invisTimer > 0) {
                        this._invisTimer -= dt;
                        player._phantomInvis = true;
                        player.invincible = true;
                        if (this._invisTimer <= 0) {
                            player._phantomInvis = false;
                        }
                        return;
                    }
                    this._timer += dt;
                    if (this._timer >= this._interval) {
                        this._timer = 0;
                        this._invisTimer = this._duration;
                    }
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                const alpha = Player._phantomInvis ? 0.3 : 1.0;
                ctx.save();
                ctx.globalAlpha *= alpha;
                Renderer.drawNeonPoly(ctx, x, y, r, 8, rotation, '#aa44ff', 18);
                // Ghost eye inner
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 6;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x - r * 0.15, y - r * 0.1, r * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + r * 0.15, y - r * 0.1, r * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        blaze: {
            id: 'blaze',
            name: 'BLAZE',
            title: 'Ateş Lordu',
            cost: 2000,
            icon: '🔥',
            description: 'Öldürdüğü düşmanlar patlayarak yakınlara hasar verir.',
            color: '#ff6600',
            accentColor: '#ff4400',
            spriteFile: 'assets/sprites/blaze.png',
            stats: {
                hp: 1.15,
                speed: 0.9,
                damage: 1.0,
                magnetRadius: 0.9
            },
            startWeapon: 'rocketBarrage',
            sides: 4,       // Diamond
            passive: {
                name: 'Ateş Patlaması',
                description: 'Öldürülen düşmanlar patlar (40 hasar, 60px)',
                onKill(enemy) {
                    // Spawn explosion particles
                    Particles.burstAt(enemy.x, enemy.y, '#ff6600', 8);
                    // Damage nearby enemies
                    const explosionRadius = 60;
                    const explosionDamage = 40;
                    for (let i = Enemies.pool.active.length - 1; i >= 0; i--) {
                        const e = Enemies.pool.active[i];
                        if (e === enemy) continue;
                        const dx = e.x - enemy.x;
                        const dy = e.y - enemy.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < explosionRadius) {
                            Enemies.damageEnemy(e, explosionDamage);
                        }
                    }
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 4, rotation + Math.PI / 4, '#ff6600', 18);
                // Flame inner symbol
                ctx.save();
                ctx.shadowColor = '#ffaa00';
                ctx.shadowBlur = 10;
                ctx.fillStyle = '#ffaa00';
                ctx.beginPath();
                ctx.arc(x, y - r * 0.1, r * 0.2, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(x, y - r * 0.1, r * 0.08, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        frost: {
            id: 'frost',
            name: 'FROST',
            title: 'Buz Kraliçesi',
            cost: 3500,
            icon: '❄️',
            description: 'Yakın düşmanları yavaşlatır. Yavaşlayan düşmanlara +%20 hasar.',
            color: '#00ccff',
            accentColor: '#0099dd',
            spriteFile: 'assets/sprites/frost.png',
            stats: {
                hp: 1.1,
                speed: 0.95,
                damage: 1.0,
                magnetRadius: 1.1
            },
            startWeapon: 'iceBall',
            sides: 6,       // Hexagon (snowflake-like)
            passive: {
                name: 'Dondurucu Aura',
                description: '120px içindeki düşmanları %40 yavaşlatır',
                auraRadius: 120,
                slowFactor: 0.6,
                onUpdate(player, dt) {
                    // Slow nearby enemies
                    for (const e of Enemies.pool.active) {
                        const dx = e.x - player.x;
                        const dy = e.y - player.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < this.auraRadius) {
                            e._frostSlow = true;
                            e._frostSlowFactor = this.slowFactor;
                        } else {
                            e._frostSlow = false;
                        }
                    }
                },
                damageMultiplier(player, enemy) {
                    return enemy && enemy._frostSlow ? 1.2 : 1.0;
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 6, rotation, '#00ccff', 18);
                // Snowflake inner — 3 crossing lines
                ctx.save();
                ctx.shadowColor = '#88eeff';
                ctx.shadowBlur = 6;
                ctx.strokeStyle = '#88eeff';
                ctx.lineWidth = 1.5;
                for (let i = 0; i < 3; i++) {
                    const angle = rotation + (Math.PI / 3) * i;
                    ctx.beginPath();
                    ctx.moveTo(x + Math.cos(angle) * r * 0.35, y + Math.sin(angle) * r * 0.35);
                    ctx.lineTo(x - Math.cos(angle) * r * 0.35, y - Math.sin(angle) * r * 0.35);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
                // Frost aura circle
                ctx.save();
                ctx.beginPath();
                ctx.arc(x, y, 120, 0, Math.PI * 2);
                ctx.strokeStyle = 'rgba(0, 204, 255, 0.08)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        },

        nexus: {
            id: 'nexus',
            name: 'NEXUS',
            title: 'Enerji Kolektörü',
            cost: 5000,
            icon: '💎',
            description: 'XP +%25, Mıknatıs alanı +%40. Daha hızlı seviye atlar.',
            color: '#00ffcc',
            accentColor: '#00dd99',
            spriteFile: 'assets/sprites/nexus.png',
            stats: {
                hp: 0.9,
                speed: 1.0,
                damage: 0.9,
                magnetRadius: 1.4     // +40%
            },
            startWeapon: 'vortexBlade',
            sides: 7,       // Heptagon (unique)
            passive: {
                name: 'Enerji Sifonu',
                description: 'XP +%25. Her 20 XP toplamada küçük HP iyileştir.',
                _xpCollected: 0,
                _xpThreshold: 20,
                onXPCollect(player, amount) {
                    this._xpCollected += amount;
                    if (this._xpCollected >= this._xpThreshold) {
                        this._xpCollected -= this._xpThreshold;
                        player.hp = Math.min(player.maxHp, player.hp + 2);
                    }
                },
                xpMultiplier: 1.25
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 7, rotation, '#00ffcc', 18);
                // Diamond inner symbol
                ctx.save();
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 8;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(x, y - r * 0.3);
                ctx.lineTo(x + r * 0.2, y);
                ctx.lineTo(x, y + r * 0.3);
                ctx.lineTo(x - r * 0.2, y);
                ctx.closePath();
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        // ── NEW CHARACTERS ──────────────────────────────────

        venom: {
            id: 'venom',
            name: 'VENOM',
            title: 'Zehir Ustası',
            cost: 6500,
            icon: '☣️',
            description: 'Öldürdüğü düşmanlar zehir bulutu bırakır. Bulut 3s boyunca çevresine hasar verir.',
            color: '#8cff5b',
            accentColor: '#66dd33',
            spriteFile: 'assets/sprites/venom.png',
            stats: {
                hp: 1.0,
                speed: 1.0,
                damage: 1.1,     // +10% damage
                magnetRadius: 1.0
            },
            startWeapon: 'neonLaser',
            sides: 5,
            passive: {
                name: 'Zehir Bulutu',
                description: 'Öldürülen düşmanlar 3s zehir bulutu bırakır (15 hasar/sn, 80px)',
                _clouds: [],
                onKill(enemy) {
                    // Green burst particles
                    Particles.burstAt(enemy.x, enemy.y, '#8cff5b', 6);
                    // Register a poison cloud tracked via _clouds
                    this._clouds.push({ x: enemy.x, y: enemy.y, timer: 3.0, radius: 80, dps: 15, _tick: 0 });
                },
                onUpdate(player, dt) {
                    // Tick poison clouds
                    for (let i = this._clouds.length - 1; i >= 0; i--) {
                        const c = this._clouds[i];
                        c.timer -= dt;
                        c._tick -= dt;
                        if (c.timer <= 0) { this._clouds.splice(i, 1); continue; }
                        if (c._tick <= 0) {
                            c._tick = 0.5;
                            for (let j = Enemies.pool.active.length - 1; j >= 0; j--) {
                                const e = Enemies.pool.active[j];
                                const dx = e.x - c.x, dy = e.y - c.y;
                                if (Math.sqrt(dx * dx + dy * dy) < c.radius) {
                                    Enemies.damageEnemy(e, Math.round(c.dps * 0.5));
                                }
                            }
                        }
                    }
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 5, rotation, '#8cff5b', 18);
                // Biohazard inner ring
                ctx.save();
                ctx.shadowColor = '#bbff88';
                ctx.shadowBlur = 8;
                ctx.strokeStyle = '#bbff88';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(x, y, r * 0.22, 0, Math.PI * 2);
                ctx.stroke();
                for (let i = 0; i < 3; i++) {
                    const a = rotation + (Math.PI * 2 / 3) * i;
                    ctx.beginPath();
                    ctx.moveTo(x + Math.cos(a) * r * 0.22, y + Math.sin(a) * r * 0.22);
                    ctx.lineTo(x + Math.cos(a) * r * 0.42, y + Math.sin(a) * r * 0.42);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        titan: {
            id: 'titan',
            name: 'TITAN',
            title: 'Zırhlı Dev',
            cost: 8000,
            icon: '🛡️',
            description: 'HP +%40, Zırh: gelen hasar -%25. Ama hız -%15.',
            color: '#9999cc',
            accentColor: '#7777aa',
            spriteFile: 'assets/sprites/titan.png',
            stats: {
                hp: 1.4,        // +40%
                speed: 0.85,    // -15%
                damage: 1.0,
                magnetRadius: 0.95
            },
            startWeapon: 'rocketBarrage',
            sides: 4,       // Square — tanky
            passive: {
                name: 'Nano Zırh',
                description: 'Gelen hasar -%25. 30 HP altında +%10 hasar.',
                armorReduction: 0.75,
                onUpdate(player, dt) {
                    // Armor is applied via takeDamage hook; low-HP rage is via damageMultiplier
                },
                damageMultiplier(player) {
                    return player.hp < 30 ? 1.10 : 1.0;
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 4, rotation, '#9999cc', 18);
                // Shield cross inner
                ctx.save();
                ctx.shadowColor = '#ccccff';
                ctx.shadowBlur = 6;
                ctx.strokeStyle = '#ccccff';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(x, y - r * 0.3);
                ctx.lineTo(x, y + r * 0.3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - r * 0.3, y);
                ctx.lineTo(x + r * 0.3, y);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        spectra: {
            id: 'spectra',
            name: 'SPECTRA',
            title: 'Işık Dansçısı',
            cost: 10000,
            icon: '🌈',
            description: 'Hız +%10. Her 8 saniyede rastgele bir buff alır (hasar/hız/can).',
            color: '#ff66cc',
            accentColor: '#dd44aa',
            spriteFile: 'assets/sprites/spectra.png',
            stats: {
                hp: 0.95,
                speed: 1.1,
                damage: 1.05,
                magnetRadius: 1.05
            },
            startWeapon: 'plasmaOrbit',
            sides: 6,
            passive: {
                name: 'Prizmatik Değişim',
                description: 'Her 8s rastgele buff: hasar +%20 / hız +%15 / can +10',
                _timer: 0,
                _interval: 8,
                _buffTimer: 0,
                _buffType: null,
                onUpdate(player, dt) {
                    // Decay active buff
                    if (this._buffTimer > 0) {
                        this._buffTimer -= dt;
                        if (this._buffTimer <= 0) {
                            this._buffType = null;
                        }
                    }
                    this._timer += dt;
                    if (this._timer >= this._interval) {
                        this._timer = 0;
                        const roll = Math.random();
                        if (roll < 0.33) {
                            this._buffType = 'damage';
                            this._buffTimer = 4;
                        } else if (roll < 0.66) {
                            this._buffType = 'speed';
                            this._buffTimer = 4;
                            player.speed = Math.floor(player.speed * 1.15);
                        } else {
                            this._buffType = 'heal';
                            player.hp = Math.min(player.maxHp, player.hp + 10);
                        }
                        Particles.burstAt(player.x, player.y, '#ff66cc', 5);
                    }
                },
                damageMultiplier(player) {
                    return this._buffType === 'damage' ? 1.20 : 1.0;
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 6, rotation, '#ff66cc', 18);
                // Rainbow ring inner
                ctx.save();
                ctx.shadowColor = '#ff88dd';
                ctx.shadowBlur = 10;
                ctx.strokeStyle = '#ff88dd';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
                ctx.stroke();
                // Sparkle dot
                const sx = x + Math.cos(rotation * 3) * r * 0.28;
                const sy = y + Math.sin(rotation * 3) * r * 0.28;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(sx, sy, r * 0.06, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        echo: {
            id: 'echo',
            name: 'ECHO',
            title: 'Yankı Savaşçısı',
            cost: 12000,
            icon: '🔊',
            description: 'Her 12 saniyede sonic dalga: 150px içindeki tüm düşmanlara hasar + itme.',
            color: '#ffaa00',
            accentColor: '#dd8800',
            spriteFile: 'assets/sprites/echo.png',
            stats: {
                hp: 1.05,
                speed: 1.0,
                damage: 1.0,
                magnetRadius: 1.1
            },
            startWeapon: 'chainLightning',
            sides: 8,
            passive: {
                name: 'Sonic Dalga',
                description: 'Her 12s 150px AoE patlama: 30 hasar + itme',
                _timer: 0,
                _interval: 12,
                onUpdate(player, dt) {
                    this._timer += dt;
                    if (this._timer >= this._interval) {
                        this._timer = 0;
                        const blastRadius = 150;
                        const blastDamage = 30;
                        const pushForce = 120;
                        Particles.burstAt(player.x, player.y, '#ffaa00', 12);
                        for (let i = Enemies.pool.active.length - 1; i >= 0; i--) {
                            const e = Enemies.pool.active[i];
                            const dx = e.x - player.x;
                            const dy = e.y - player.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist < blastRadius && dist > 0) {
                                Enemies.damageEnemy(e, blastDamage);
                                e.x += (dx / dist) * pushForce;
                                e.y += (dy / dist) * pushForce;
                            }
                        }
                    }
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 8, rotation, '#ffaa00', 18);
                // Sound wave arcs
                ctx.save();
                ctx.shadowColor = '#ffcc44';
                ctx.shadowBlur = 6;
                ctx.strokeStyle = '#ffcc44';
                ctx.lineWidth = 1.5;
                for (let i = 1; i <= 2; i++) {
                    ctx.beginPath();
                    ctx.arc(x + Math.cos(rotation) * r * 0.1, y + Math.sin(rotation) * r * 0.1, r * 0.18 * i, rotation - 0.5, rotation + 0.5);
                    ctx.stroke();
                }
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        },

        glitch: {
            id: 'glitch',
            name: 'GLITCH',
            title: 'Kaos Mühendisi',
            cost: 15000,
            icon: '💀',
            description: 'Kritik vuruş şansı +%20. Her 15 saniyede rastgele düşmanlara şimşek yağdırır.',
            color: '#ff3366',
            accentColor: '#dd1144',
            spriteFile: 'assets/sprites/glitch.png',
            stats: {
                hp: 0.85,
                speed: 1.05,
                damage: 1.15,    // +15% base damage
                magnetRadius: 1.0
            },
            startWeapon: 'iceBall',
            sides: 3,       // Triangle — chaotic
            passive: {
                name: 'Kaotik Darbe',
                description: 'Kritik +%20. Her 15s 5 rastgele düşmana 50 hasar',
                _timer: 0,
                _interval: 15,
                onUpdate(player, dt) {
                    this._timer += dt;
                    if (this._timer >= this._interval) {
                        this._timer = 0;
                        const targets = Enemies.pool.active.slice();
                        // Shuffle & pick up to 5
                        for (let i = targets.length - 1; i > 0; i--) {
                            const j = Math.floor(Math.random() * (i + 1));
                            [targets[i], targets[j]] = [targets[j], targets[i]];
                        }
                        const count = Math.min(5, targets.length);
                        for (let i = 0; i < count; i++) {
                            Enemies.damageEnemy(targets[i], 50);
                            Particles.burstAt(targets[i].x, targets[i].y, '#ff3366', 6);
                        }
                    }
                },
                damageMultiplier(player) {
                    // 20% crit chance → average +20% via random
                    return Math.random() < 0.20 ? 1.5 : 1.0;
                }
            },
            drawBody(ctx, x, y, r, rotation, pulse) {
                Renderer.drawNeonPoly(ctx, x, y, r, 3, rotation, '#ff3366', 18);
                // Glitch lines
                ctx.save();
                ctx.shadowColor = '#ff6699';
                ctx.shadowBlur = 8;
                ctx.strokeStyle = '#ff6699';
                ctx.lineWidth = 1.5;
                const offset = Math.sin(rotation * 8) * r * 0.08;
                ctx.beginPath();
                ctx.moveTo(x - r * 0.25 + offset, y - r * 0.1);
                ctx.lineTo(x + r * 0.25 + offset, y - r * 0.1);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(x - r * 0.2 - offset, y + r * 0.1);
                ctx.lineTo(x + r * 0.2 - offset, y + r * 0.1);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.restore();
            }
        }
    },

    /**
     * Get the currently selected character definition
     */
    getSelected() {
        return this.roster[this.selected];
    },

    /**
     * Apply character stats to player at game start
     */
    applyToPlayer() {
        const char = this.getSelected();
        if (!char) return;
        const masteryBonus = (typeof Economy !== 'undefined' && Economy.getMasteryBonus)
            ? Economy.getMasteryBonus(char.id)
            : { damageMultiplier: 1, speedMultiplier: 1, magnetMultiplier: 1 };

        // Get character upgrade bonuses
        const upgradeHp = (typeof Economy !== 'undefined' && Economy.getCharStatWithUpgrade)
            ? Economy.getCharStatWithUpgrade(char.id, 'hp') : char.stats.hp;
        const upgradeSpeed = (typeof Economy !== 'undefined' && Economy.getCharStatWithUpgrade)
            ? Economy.getCharStatWithUpgrade(char.id, 'speed') : char.stats.speed;
        const upgradeDamage = (typeof Economy !== 'undefined' && Economy.getCharStatWithUpgrade)
            ? Economy.getCharStatWithUpgrade(char.id, 'damage') : char.stats.damage;

        // Apply stat multipliers (with upgrade bonuses)
        Player.maxHp = Math.floor(Player.maxHp * upgradeHp);
        Player.hp = Player.maxHp;
        Player.speed = Math.floor(Player.speed * upgradeSpeed * masteryBonus.speedMultiplier);
        Player.magnetRadius = Math.floor(Player.magnetRadius * char.stats.magnetRadius * masteryBonus.magnetMultiplier);
        Player.color = char.color;
        Player.glowColor = char.color;
        Player._characterId = char.id;
        Player._isMoving = false;
        Player._phantomInvis = false;
        Player._damageMultiplier = upgradeDamage;
        Player._masteryDamageMultiplier = masteryBonus.damageMultiplier;

        // Apply XP multiplier from passive (Nexus)
        if (char.passive.xpMultiplier) {
            Player.xpMultiplier *= char.passive.xpMultiplier;
        }

        // Reset passive state
        if (char.passive._timer !== undefined) char.passive._timer = 0;
        if (char.passive._invisTimer !== undefined) char.passive._invisTimer = 0;
        if (char.passive.hitCounter !== undefined) char.passive.hitCounter = 0;
        if (char.passive._xpCollected !== undefined) char.passive._xpCollected = 0;
        if (char.passive._clouds !== undefined) char.passive._clouds = [];
        if (char.passive._buffTimer !== undefined) char.passive._buffTimer = 0;
        if (char.passive._buffType !== undefined) char.passive._buffType = null;
    },

    /**
     * Update character passive (called every frame)
     */
    updatePassive(player, dt) {
        const char = this.getSelected();
        if (!char) return;

        // Track if moving (for Cipher)
        const dir = Input.getDirection();
        player._isMoving = dir.magnitude > 0.1;

        // Call passive onUpdate if exists
        if (char.passive.onUpdate) {
            char.passive.onUpdate(player, dt);
        }
    },

    /**
     * Called when an enemy is killed
     */
    onEnemyKill(enemy) {
        const char = this.getSelected();
        if (char && char.passive.onKill) {
            char.passive.onKill(enemy);
        }
    },

    /**
     * Called when XP is collected
     */
    onXPCollect(amount) {
        const char = this.getSelected();
        if (char && char.passive.onXPCollect) {
            char.passive.onXPCollect(Player, amount);
        }
    },

    /**
     * Get damage multiplier from character passive
     */
    getDamageMultiplier(enemy) {
        const char = this.getSelected();
        if (!char) return 1.0;
        let mult = char.stats.damage * (Player._masteryDamageMultiplier || 1);
        if (char.passive.damageMultiplier) {
            mult *= char.passive.damageMultiplier(Player, enemy);
        }
        return mult;
    },

    /**
     * Draw the player using the character's sprite with hover & tilt effects
     */
    _spriteCache: {},    // { filename: { img, loaded } }
    _hoverTime: 0,
    _currentTilt: 0,

    _ensureSpriteLoaded(filename) {
        if (!this._spriteCache[filename]) {
            const img = new Image();
            const entry = { img, loaded: false, failed: false };
            img.onload = () => { entry.loaded = true; };
            img.onerror = () => {
                console.warn('[Characters] Sprite yüklenemedi:', filename);
                entry.failed = true;
            };
            img.src = filename;
            this._spriteCache[filename] = entry;
        }
        return this._spriteCache[filename];
    },

    drawPlayer(ctx) {
        const char = this.getSelected();
        const spriteFile = (char && char.spriteFile) ? char.spriteFile : 'assets/sprites/ufo.png';
        const sprite = this._ensureSpriteLoaded(spriteFile);

        // If sprite failed to load, use drawBody fallback
        if (sprite.failed) {
            if (char && char.drawBody) {
                const pulse = 1 + Math.sin(Player.pulseTimer || 0) * 0.05;
                char.drawBody(ctx, Player.x, Player.y, Player.radius * pulse, Player.rotation || 0, pulse);
                return true;
            }
            return false;
        }
        if (!sprite.loaded) return false;

        // Update hover timer
        this._hoverTime += 0.05;

        // Hover offset: gentle up-down float using sin wave (±4px)
        const hoverOffset = Math.sin(this._hoverTime * 3) * 4;

        // Full directional rotation from Player.rotation
        // Sprite's natural "up" is -π/2, so offset by +π/2
        // Per-character offset (e.g., Phantom needs extra -90°)
        const charRotOffset = (char && char.spriteRotationOffset) ? char.spriteRotationOffset : 0;
        const spriteRotation = (Player.rotation || 0) + Math.PI / 2 + charRotOffset;

        // Invincibility blink
        if (Player.invincible && !Player._phantomInvis && Math.sin(Player.invincibleTimer * 20) > 0) {
            ctx.globalAlpha = 0.4;
        }

        // Hit flash — white glow behind sprite
        if (Player.flashTimer > 0) {
            ctx.save();
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 30;
            ctx.beginPath();
            ctx.arc(Player.x, Player.y + hoverOffset, Player.radius + 5, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Draw sprite with hover + tilt
        const drawSize = Player.radius * 2.6;
        ctx.save();
        ctx.translate(Player.x, Player.y + hoverOffset);
        ctx.rotate(spriteRotation);

        // Subtle neon glow (Drawn separately to fix iOS Canvas drawImage + shadowBlur bug)
        const glowColor = char ? char.color : '#00ffff';
        ctx.save();
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 15 + Math.sin(this._hoverTime * 5) * 5;
        ctx.beginPath();
        ctx.arc(0, 0, Player.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = glowColor;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.restore();

        // Draw actual sprite without shadow
        ctx.drawImage(
            sprite.img,
            -drawSize / 2,
            -drawSize / 2,
            drawSize,
            drawSize
        );

        ctx.restore();

        ctx.globalAlpha = 1;
        return true; // Signal that we drew the player
    }
};
