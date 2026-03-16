// ============================================================
// audio.js — Procedural Audio (Web Audio API)
// ============================================================

const Audio = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    musicPlaying: false,
    muted: false,
    initialized: false,
    activeTrack: null,
    mapTracks: {
        neonCity: 'assets/music/neon-city.mp3',
        iceCave: 'assets/music/ice-cave.mp3',
        lavaFactory: 'assets/music/lava-factory.mp3',
        darkForest: 'assets/music/dark-forest.mp3',
        spaceStation: 'assets/music/space-station.mp3'
    },

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.5;
            this.masterGain.connect(this.ctx.destination);

            this.musicGain = this.ctx.createGain();
            this.musicGain.gain.value = 0.15;
            this.musicGain.connect(this.masterGain);

            this.sfxGain = this.ctx.createGain();
            this.sfxGain.gain.value = 0.4;
            this.sfxGain.connect(this.masterGain);

            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio not supported:', e);
        }
    },

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : 0.5;
        }
    },

    // ---- Sound Effects ----

    playLaser() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },

    playLightning() {
        if (!this.initialized) return;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        filter.Q.value = 1;
        source.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        source.start();
    },

    playXPPickup() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },

    playLevelUp() {
        if (!this.initialized) return;
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const startTime = this.ctx.currentTime + i * 0.1;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(startTime);
            osc.stop(startTime + 0.35);
        });
    },

    playHit() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGain);

        const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.08, this.ctx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) noiseData[i] = (Math.random() * 2 - 1) * 0.35;
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
        noise.connect(noiseGain);
        noiseGain.connect(this.sfxGain);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
        noise.start();
        noise.stop(this.ctx.currentTime + 0.09);
    },

    playDeath() {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.85);
    },

    /** Boss warning siren — dramatic rising tone */
    playBossWarning() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        for (let i = 0; i < 3; i++) {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            const start = t + i * 0.35;
            osc.frequency.setValueAtTime(200 + i * 100, start);
            osc.frequency.linearRampToValueAtTime(400 + i * 150, start + 0.25);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.18, start + 0.05);
            gain.gain.setValueAtTime(0.18, start + 0.2);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.32);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.34);
        }
    },

    /** Boss nova/cast sound — low rumble + high ping */
    playBossCast() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        // Low rumble
        const rumble = this.ctx.createOscillator();
        const rGain = this.ctx.createGain();
        rumble.type = 'sawtooth';
        rumble.frequency.setValueAtTime(60, t);
        rumble.frequency.exponentialRampToValueAtTime(30, t + 0.4);
        rGain.gain.setValueAtTime(0.2, t);
        rGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        const rFilter = this.ctx.createBiquadFilter();
        rFilter.type = 'lowpass';
        rFilter.frequency.value = 200;
        rumble.connect(rFilter);
        rFilter.connect(rGain);
        rGain.connect(this.sfxGain);
        rumble.start(t);
        rumble.stop(t + 0.45);
        // High ping
        const ping = this.ctx.createOscillator();
        const pGain = this.ctx.createGain();
        ping.type = 'sine';
        ping.frequency.setValueAtTime(880, t);
        ping.frequency.exponentialRampToValueAtTime(440, t + 0.15);
        pGain.gain.setValueAtTime(0.12, t);
        pGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        ping.connect(pGain);
        pGain.connect(this.sfxGain);
        ping.start(t);
        ping.stop(t + 0.22);
    },

    /** Weapon evolution fanfare — ascending chord */
    playEvolution() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4-E4-G4-C5
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const start = t + i * 0.12;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.15, start + 0.04);
            gain.gain.setValueAtTime(0.15, start + 0.3);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.65);
        });
    },

    /** Explosion sound for rockets/bosses */
    playExplosion() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        // Noise burst
        const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.25, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.6;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.25, t);
        nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        const nFilter = this.ctx.createBiquadFilter();
        nFilter.type = 'lowpass';
        nFilter.frequency.setValueAtTime(1000, t);
        nFilter.frequency.exponentialRampToValueAtTime(100, t + 0.2);
        noise.connect(nFilter);
        nFilter.connect(nGain);
        nGain.connect(this.sfxGain);
        noise.start(t);
        noise.stop(t + 0.26);
        // Sub boom
        const boom = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        boom.type = 'sine';
        boom.frequency.setValueAtTime(80, t);
        boom.frequency.exponentialRampToValueAtTime(20, t + 0.3);
        bGain.gain.setValueAtTime(0.3, t);
        bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        boom.connect(bGain);
        bGain.connect(this.sfxGain);
        boom.start(t);
        boom.stop(t + 0.32);
    },

    /** Combo escalation chime */
    playComboChime(comboLevel) {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;
        const baseFreq = 440 + Math.min(comboLevel, 10) * 40;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = baseFreq;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(t);
        osc.stop(t + 0.14);
    },

    /** Boss death stinger */
    playBossDeath() {
        if (!this.initialized) return;
        const t = this.ctx.currentTime;

        this.playExplosion();

        const notes = [196, 246.94, 329.63, 392];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            const start = t + i * 0.09;
            osc.frequency.setValueAtTime(freq, start);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.8, start + 0.16);
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.12, start + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);
            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(start);
            osc.stop(start + 0.24);
        });
    },


    // ---- Background Music (Simple Synth Loop) ----

    startMusic(mapId = 'neonCity') {
        if (!this.initialized || this.musicPlaying) return;
        this.musicPlaying = true;

        // Try real music file first
        const trackUrl = this.mapTracks[mapId] || this.mapTracks.neonCity;
        if (trackUrl) {
            try {
                this.activeTrack = new window.Audio(trackUrl);
                this.activeTrack.loop = true;
                this.activeTrack.volume = 0.25;

                // Fallback to procedural music if file fails to load (404, etc.)
                this.activeTrack.addEventListener('error', () => {
                    console.warn(`[Audio] Music file not found: ${trackUrl}, using procedural fallback.`);
                    this.activeTrack = null;
                    this._playMusicLoop(mapId);
                }, { once: true });

                const p = this.activeTrack.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(() => {
                        this.activeTrack = null;
                        this._playMusicLoop(mapId);
                    });
                }
                return;
            } catch (e) {
                this.activeTrack = null;
            }
        }

        this._playMusicLoop(mapId);
    },

    stopMusic() {
        this.musicPlaying = false;
        if (this.activeTrack) {
            this.activeTrack.pause();
            this.activeTrack.currentTime = 0;
            this.activeTrack = null;
        }
    },

    _playMusicLoop(mapId = 'neonCity') {
        if (!this.musicPlaying) return;

        // Simple arpeggio pattern
        const bpmMap = {
            neonCity: 120,
            iceCave: 102,
            lavaFactory: 128,
            darkForest: 108,
            spaceStation: 132
        };
        const bpm = bpmMap[mapId] || 120;
        const beatDuration = 60 / bpm;
        // Cm - Ab - Eb - Bb  (dark synthwave progression)
        const patternMap = {
            neonCity: [[130.81, 155.56, 196.00], [207.65, 261.63, 311.13], [155.56, 196.00, 233.08], [116.54, 146.83, 174.61]],
            iceCave: [[146.83, 174.61, 220.00], [196.00, 246.94, 293.66], [164.81, 207.65, 246.94], [130.81, 164.81, 196.00]],
            lavaFactory: [[138.59, 174.61, 207.65], [155.56, 196.00, 233.08], [174.61, 220.00, 261.63], [130.81, 174.61, 220.00]],
            darkForest: [[123.47, 146.83, 174.61], [164.81, 196.00, 233.08], [110.00, 146.83, 185.00], [130.81, 155.56, 196.00]],
            spaceStation: [[155.56, 196.00, 246.94], [185.00, 233.08, 293.66], [174.61, 220.00, 277.18], [146.83, 185.00, 233.08]]
        };
        const pattern = patternMap[mapId] || patternMap.neonCity;

        const now = this.ctx.currentTime;
        const barLength = beatDuration * 4;

        pattern.forEach((chord, chordIdx) => {
            chord.forEach((freq, noteIdx) => {
                const startTime = now + chordIdx * barLength + noteIdx * beatDuration;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0, startTime);
                gain.gain.linearRampToValueAtTime(0.08, startTime + 0.05);
                gain.gain.setValueAtTime(0.08, startTime + beatDuration * 0.7);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + beatDuration * 0.95);
                osc.connect(gain);
                gain.connect(this.musicGain);
                osc.start(startTime);
                osc.stop(startTime + beatDuration);
            });
        });

        // Bass
        const bassMap = {
            neonCity: [65.41, 103.83, 77.78, 58.27],
            iceCave: [73.42, 92.50, 69.30, 55.00],
            lavaFactory: [69.30, 77.78, 87.31, 65.41],
            darkForest: [61.74, 82.41, 55.00, 65.41],
            spaceStation: [77.78, 92.50, 87.31, 73.42]
        };
        const bassNotes = bassMap[mapId] || bassMap.neonCity;
        bassNotes.forEach((freq, i) => {
            const startTime = now + i * barLength;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
            gain.gain.setValueAtTime(0.12, startTime + barLength * 0.8);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + barLength * 0.95);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 300;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.musicGain);
            osc.start(startTime);
            osc.stop(startTime + barLength);
        });

        // Schedule next loop
        const totalDuration = pattern.length * barLength;
        setTimeout(() => this._playMusicLoop(mapId), totalDuration * 1000 - 50);
    }
};
