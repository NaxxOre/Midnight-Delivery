            // ============================================================================
    // 1. BACKGROUND MUSIC ("Passing Streetlights") & CUSTOMIZABLE SFX SYSTEM
    // ============================================================================
    class SoundSystem {
      constructor() {
        this.ctx = null;
        this._enabled = true;
        this.isPlayingMusic = false;
        this.bgm = null;
        this.bgmDrive = null;
        this.bgmGarage = null;
        this.currentTrack = 'garage';
        this.sfxGainNode = null;

        // Load saved volume preferences or default to comfortable levels
        const savedMusicVol = typeof localStorage !== 'undefined' ? localStorage.getItem('md_volume_music') : null;
        const savedSfxVol = typeof localStorage !== 'undefined' ? localStorage.getItem('md_volume_sfx') : null;

        this.bgmVolume = savedMusicVol !== null ? parseFloat(savedMusicVol) : 0.25; // 25% default cozy level
        this.sfxVolume = savedSfxVol !== null ? parseFloat(savedSfxVol) : 0.75; // 75% default SFX level
        this._wasPlayingBeforeHide = false;

        this.step = 0;
        this.activeVoices = new Set();
        this.maxVoices = 32;
        this.availableGains = [];
        this.gainsCreated = 0;
      }

      get enabled() {
        return this._enabled;
      }

      set enabled(val) {
        this._enabled = !!val;
        this.syncMuteState();
      }

      syncMuteState() {
        const active = this.currentTrack === 'garage' ? this.bgmGarage : this.bgmDrive;
        const other = this.currentTrack === 'garage' ? this.bgmDrive : this.bgmGarage;

        if (other && !other.paused) {
          other.pause();
        }

        if (active) {
          if (!this._enabled) {
            active.pause();
          } else if (this.isPlayingMusic) {
            active.volume = this.bgmVolume;
            active.play().catch(() => {});
          }
        }
        if (this.sfxGainNode && this.ctx) {
          this.sfxGainNode.gain.setValueAtTime(this._enabled ? this.sfxVolume : 0, this.ctx.currentTime);
        }
      }

      createVoice() {
        if (!this.ctx || this.ctx.state !== 'running' || this.activeVoices.size >= this.maxVoices) return null;
        const oscillator = this.ctx.createOscillator();
        const gain = this.availableGains.pop() || this.createPooledGain();
        gain.gain.cancelScheduledValues(this.ctx.currentTime);
        gain.gain.setValueAtTime(0, this.ctx.currentTime);
        const voice = { oscillator, gain };
        this.activeVoices.add(voice);
        oscillator.onended = () => {
          try { oscillator.disconnect(); } catch (e) {}
          try { gain.disconnect(); } catch (e) {}
          this.activeVoices.delete(voice);
          if (this.availableGains.length < this.maxVoices) this.availableGains.push(gain);
          oscillator.onended = null;
        };
        return voice;
      }

      createPooledGain() {
        this.gainsCreated++;
        return this.ctx.createGain();
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
          if (this.ctx && !this.sfxGainNode) {
            this.sfxGainNode = this.ctx.createGain();
            this.sfxGainNode.gain.setValueAtTime(this._enabled ? this.sfxVolume : 0, this.ctx.currentTime);
            this.sfxGainNode.connect(this.ctx.destination);
          }
          if (!this.bgmDrive || !this.bgmGarage) {
            this.initBGM();
          }
        } catch (e) {
          console.warn('AudioContext initialization deferred:', e);
        }
      }

      getSFXDestination() {
        if (!this.ctx) return null;
        if (!this.sfxGainNode) {
          this.sfxGainNode = this.ctx.createGain();
          this.sfxGainNode.gain.setValueAtTime(this._enabled ? this.sfxVolume : 0, this.ctx.currentTime);
          this.sfxGainNode.connect(this.ctx.destination);
        }
        return this.sfxGainNode;
      }

      initBGM() {
        try {
          if (!this.bgmDrive) {
            const driveEl = typeof document !== 'undefined' ? (document.getElementById('bgm-drive') || document.getElementById('bgm-audio')) : null;
            if (driveEl) {
              this.bgmDrive = driveEl;
            } else if (typeof Audio !== 'undefined') {
              this.bgmDrive = new Audio('resources/Passing_Streetlights.mp3');
              this.bgmDrive.id = 'bgm-drive';
            }
            if (this.bgmDrive) {
              this.bgmDrive.loop = true;
              this.bgmDrive.volume = this._enabled ? this.bgmVolume : 0;
              this.bgmDrive.preload = 'auto';
            }
          }

          if (!this.bgmGarage) {
            const garageEl = typeof document !== 'undefined' ? document.getElementById('bgm-garage') : null;
            if (garageEl) {
              this.bgmGarage = garageEl;
            } else if (typeof Audio !== 'undefined') {
              this.bgmGarage = new Audio('resources/Asphalt_Reflections.mp3');
              this.bgmGarage.id = 'bgm-garage';
            }
            if (this.bgmGarage) {
              this.bgmGarage.loop = true;
              this.bgmGarage.volume = this._enabled ? this.bgmVolume : 0;
              this.bgmGarage.preload = 'auto';
            }
          }

          if (!this.currentTrack) {
            this.currentTrack = (typeof gameState !== 'undefined' && gameState && gameState.mode === 'playing') ? 'drive' : 'garage';
          }
          this.bgm = this.currentTrack === 'garage' ? this.bgmGarage : this.bgmDrive;
        } catch (e) {
          console.warn('BGM initialization deferred:', e);
        }
      }

      playTrack(trackName = 'garage') {
        this.init();
        if (!this.bgmDrive || !this.bgmGarage) {
          this.initBGM();
        }

        const prevTrack = this.currentTrack;
        this.currentTrack = trackName;
        const targetBgm = trackName === 'garage' ? this.bgmGarage : this.bgmDrive;
        const otherBgm = trackName === 'garage' ? this.bgmDrive : this.bgmGarage;
        this.bgm = targetBgm;

        // Smoothly fade out previous track if playing
        if (otherBgm && !otherBgm.paused) {
          try {
            let fadeVol = otherBgm.volume;
            const step = Math.max(0.03, fadeVol / 8);
            const fadeTimer = setInterval(() => {
              fadeVol = Math.max(0, fadeVol - step);
              try { otherBgm.volume = fadeVol; } catch (e) {}
              if (fadeVol <= 0) {
                clearInterval(fadeTimer);
                try {
                  otherBgm.pause();
                  otherBgm.currentTime = 0;
                } catch (e) {}
              }
            }, 25);
          } catch (e) {
            otherBgm.pause();
          }
        }

        if (this._enabled && this.isPlayingMusic && targetBgm) {
          targetBgm.volume = this.bgmVolume;
          if (targetBgm.paused || prevTrack !== trackName) {
            const playPromise = targetBgm.play();
            if (playPromise !== undefined) {
              playPromise.catch(err => {
                console.log('BGM playback waiting for user interaction:', err);
              });
            }
          }
        }
      }

      startCozyMusic(trackName) {
        this.init();
        this.isPlayingMusic = true;
        const target = trackName || this.currentTrack || ((typeof gameState !== 'undefined' && gameState && gameState.mode === 'playing') ? 'drive' : 'garage');
        this.playTrack(target);
      }

      stopMusic() {
        this.isPlayingMusic = false;
        if (this.bgmDrive) {
          this.bgmDrive.pause();
          this.bgmDrive.currentTime = 0;
        }
        if (this.bgmGarage) {
          this.bgmGarage.pause();
          this.bgmGarage.currentTime = 0;
        }
      }

      pauseMusic() {
        const active = this.currentTrack === 'garage' ? this.bgmGarage : this.bgmDrive;
        if (active && !active.paused) {
          active.pause();
          this._wasPlayingBeforeHide = true;
        }
      }

      resumeMusic() {
        if (!this._enabled || !this.isPlayingMusic) return;
        const active = this.currentTrack === 'garage' ? this.bgmGarage : this.bgmDrive;
        if (active) {
          active.volume = this.bgmVolume;
          active.play().catch(() => {});
          this._wasPlayingBeforeHide = false;
        }
      }

      setMusicVolume(vol) {
        this.bgmVolume = Math.max(0, Math.min(1, vol));
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('md_volume_music', this.bgmVolume.toString());
        }
        if (this.bgmDrive && this._enabled) {
          this.bgmDrive.volume = this.bgmVolume;
        }
        if (this.bgmGarage && this._enabled) {
          this.bgmGarage.volume = this.bgmVolume;
        }
      }

      setSFXVolume(vol) {
        this.sfxVolume = Math.max(0, Math.min(1, vol));
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('md_volume_sfx', this.sfxVolume.toString());
        }
        if (this.sfxGainNode && this.ctx) {
          this.sfxGainNode.gain.setValueAtTime(this._enabled ? this.sfxVolume : 0, this.ctx.currentTime);
        }
      }


      playCapsuleFanfare(rarity = 'COMMON') {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const dest = this.getSFXDestination();
        if (!dest) return;

        const t = this.ctx.currentTime;
        if (rarity === 'LEGENDARY') {
          // Epic 5-note fanfare with shimmering vibrato: C5, E5, G5, B5, C6
          const notes = [523.25, 659.25, 783.99, 987.77, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t + idx * 0.08);

            gain.gain.setValueAtTime(0, t + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.32, t + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.65);

            osc.connect(gain);
            gain.connect(dest);
            osc.start(t + idx * 0.08);
            osc.stop(t + idx * 0.08 + 0.70);
          });
        } else if (rarity === 'EPIC') {
          // Rich 4-note chime: E5, G#5, B5, E6
          const notes = [659.25, 830.61, 987.77, 1318.51];
          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.09);

            gain.gain.setValueAtTime(0, t + idx * 0.09);
            gain.gain.linearRampToValueAtTime(0.26, t + idx * 0.09 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.09 + 0.55);

            osc.connect(gain);
            gain.connect(dest);
            osc.start(t + idx * 0.09);
            osc.stop(t + idx * 0.09 + 0.60);
          });
        } else if (rarity === 'RARE') {
          this.playCityGateChime();
        } else {
          this.playDeliverSuccess();
        }
      }

      playBoost() {
        if (!this.enabled) return;
        this.init();
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator, gain } = voice;
        const now = this.ctx.currentTime;
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(120, now);
        oscillator.frequency.exponentialRampToValueAtTime(720, now + 0.3);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
        oscillator.connect(gain);
        gain.connect(this.getSFXDestination() || this.ctx.destination);
        oscillator.start(now);
        oscillator.stop(now + 0.33);
      }

      playThrow() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain: gain } = voice;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(740, now + 0.16);
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
        osc.connect(gain);
        gain.connect(this.getSFXDestination() || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }

      playDeliverSuccess() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.05);
          gain.gain.setValueAtTime(0.085, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.24);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(430, now + offset);
          osc.frequency.exponentialRampToValueAtTime(260, now + offset + 0.09);
          gain.gain.setValueAtTime(0.04, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.1);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.07);
          gain.gain.setValueAtTime(0.07, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.0008, now + idx * 0.07 + 0.65);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.68);
        });
      }

      playCrash() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain: gain } = voice;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(115, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.32);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
        osc.connect(gain);
        gain.connect(this.getSFXDestination() || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      }

      playReelTick(pitch = 420) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain: gain } = voice;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(pitch, now);
        osc.frequency.exponentialRampToValueAtTime(pitch * 1.35, now + 0.045);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(this.getSFXDestination() || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      }

      playVehiclePassBy(type) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        if (type === 'cattruck') {
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.linearRampToValueAtTime(880, now + 0.11);
          osc.frequency.exponentialRampToValueAtTime(480, now + 0.28);
          gain.gain.setValueAtTime(0.055, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.30);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.31);
        } else if (type === 'tuktuk') {
          [480, 540].forEach((f, i) => {
            const voice = this.createVoice();
            if (!voice) return;
            const { oscillator: osc, gain: gain } = voice;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(f, now + i * 0.09);
            gain.gain.setValueAtTime(0.035, now + i * 0.09);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.07);
            osc.connect(gain);
            gain.connect(this.getSFXDestination() || this.ctx.destination);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.08);
          });
        } else if (type === 'ambulance' || type === 'police' || type === 'firetruck') {
          [740, 590].forEach((f, i) => {
            const voice = this.createVoice();
            if (!voice) return;
            const { oscillator: osc, gain: gain } = voice;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(f, now + i * 0.14);
            gain.gain.setValueAtTime(0.032, now + i * 0.14);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.14 + 0.13);
            osc.connect(gain);
            gain.connect(this.getSFXDestination() || this.ctx.destination);
            osc.start(now + i * 0.14);
            osc.stop(now + i * 0.14 + 0.14);
          });
        } else if (type === 'ufo') {
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.exponentialRampToValueAtTime(860, now + 0.28);
          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.055);
          gain.gain.setValueAtTime(0.08, now + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.28);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
          osc.start(now + idx * 0.055);
          osc.stop(now + idx * 0.055 + 0.30);
        });
      }

      playNearMissWhoosh() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain: gain } = voice;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.26);
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
        osc.connect(gain);
        gain.connect(this.getSFXDestination() || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }

      playRivalSnipe() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;
        const notes = [587.33, 880.00, 1174.66, 1760.00];
        notes.forEach((freq, idx) => {
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain } = voice;
          const noteTime = now + idx * 0.045;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, noteTime);
          gain.gain.setValueAtTime(0.08, noteTime);
          gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.12);
          osc.connect(gain);
          gain.connect(this.getSFXDestination() || this.ctx.destination);
          osc.start(noteTime);
          osc.stop(noteTime + 0.14);
        });
      }

      playOverdriveBurst() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx || this.ctx.state !== 'running') return;
        const now = this.ctx.currentTime;
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain } = voice;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.getSFXDestination() || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    }

    const soundFX = new SoundSystem();

