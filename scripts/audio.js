        // ============================================================================
    // 1. BACKGROUND MUSIC ("Passing Streetlights") & SFX SYSTEM
    // ============================================================================
    class SoundSystem {
      constructor() {
        this.ctx = null;
        this._enabled = true;
        this.isPlayingMusic = false;
        this.bgm = null;
        this.bgmVolume = 0.22; // "not too loud" - gentle, cozy background level
        this._wasPlayingBeforeHide = false;
      }

      get enabled() {
        return this._enabled;
      }

      set enabled(val) {
        this._enabled = !!val;
        if (this.bgm) {
          if (!this._enabled) {
            this.bgm.pause();
          } else if (this.isPlayingMusic) {
            this.bgm.volume = this.bgmVolume;
            this.bgm.play().catch(() => {});
          }
        }
      }

      init() {
        try {
          if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
          }
          if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }
          if (!this.bgm) {
            this.initBGM();
          }
        } catch (e) {
          console.warn('AudioContext initialization deferred:', e);
        }
      }

      initBGM() {
        try {
          const existingEl = typeof document !== 'undefined' ? document.getElementById('bgm-audio') : null;
          if (existingEl) {
            this.bgm = existingEl;
          } else if (typeof Audio !== 'undefined') {
            this.bgm = new Audio('resources/Passing_Streetlights.mp3');
            this.bgm.id = 'bgm-audio';
          }
          if (this.bgm) {
            this.bgm.loop = true;
            this.bgm.volume = this._enabled ? this.bgmVolume : 0;
            this.bgm.preload = 'auto';
          }
        } catch (e) {
          console.warn('BGM initialization deferred:', e);
        }
      }

      startCozyMusic() {
        this.init();
        this.isPlayingMusic = true;
        if (!this._enabled) return;

        if (!this.bgm) {
          this.initBGM();
        }
        if (this.bgm) {
          this.bgm.volume = this.bgmVolume;
          const playPromise = this.bgm.play();
          if (playPromise !== undefined) {
            playPromise.catch(err => {
              // Browser autoplay policy waiting for user interaction
              console.log('BGM playback waiting for user interaction:', err);
            });
          }
        }
      }

      stopMusic() {
        this.isPlayingMusic = false;
        if (this.bgm) {
          this.bgm.pause();
        }
      }

      pauseMusic() {
        if (this.bgm && !this.bgm.paused) {
          this.bgm.pause();
          this._wasPlayingBeforeHide = true;
        }
      }

      resumeMusic() {
        if (this.bgm && this._enabled && this.isPlayingMusic) {
          this.bgm.volume = this.bgmVolume;
          this.bgm.play().catch(() => {});
          this._wasPlayingBeforeHide = false;
        }
      }

      setVolume(vol) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        if (this.bgm && this._enabled) {
          this.bgm.volume = this.bgmVolume;
        }
      }

      playThrow() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.16);
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      playDeliverSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.085, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.24);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.25);
        });
      }

      playDuckQuack() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [0, 0.13].forEach((offset) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(430, now + offset);
          osc.frequency.exponentialRampToValueAtTime(260, now + offset + 0.09);
          gain.gain.setValueAtTime(0.04, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + offset);
          osc.stop(now + offset + 0.11);
        });
      }

      playCityGateChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [392.00, 493.88, 587.33, 783.99].forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.07);
          gain.gain.setValueAtTime(0.07, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.07 + 0.65);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.68);
        });
      }

      playCrash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.32);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }

      playReelTick(pitch = 420) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, now + 0.045);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      }

      playVehiclePassBy(type) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (type === 'cattruck') {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.11);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.28);
          gain.gain.setValueAtTime(0.055, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.31);
        } else if (type === 'tuktuk') {
          [480, 540].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + i * 0.09);
            gain.gain.setValueAtTime(0.035, now + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.07);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.08);
          });
        } else if (type === 'ambulance' || type === 'police' || type === 'firetruck') {
          [740, 590].forEach((f, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.14);
            gain.gain.setValueAtTime(0.032, now + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.13);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now + i * 0.14);
            osc.stop(now + i * 0.14 + 0.14);
          });
        } else if (type === 'ufo') {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(860, now + 0.28);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.32);
        }
      }

      playPerfectChime() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        // Sparkling high-pitched arcade synth arpeggio (C6, E6, G6, C7)
        [1046.5, 1318.5, 1567.98, 2093.0].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.055);
          gain.gain.setValueAtTime(0.08, now + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now + idx * 0.055);
          osc.stop(now + idx * 0.055 + 0.30);
        });
      }

      playNearMissWhoosh() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.26);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    }

    const soundFX = new SoundSystem();

