    // ============================================================================
    // 1. UPBEAT 118 BPM CITY-POP / ARCADE DRIVING GROOVE + PRIZE REEL SFX
    // ============================================================================
    class SoundSystem {
      constructor() {
        this.ctx = null;
        this.enabled = true;
        this.isPlayingMusic = false;
        this.step = 0;
        this.activeVoices = new Set();
        this.maxVoices = 32;
      }

      createVoice() {
        if (!this.ctx || this.ctx.state !== 'running' || this.activeVoices.size >= this.maxVoices) return null;
        const oscillator = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const voice = { oscillator, gain };
        this.activeVoices.add(voice);
        oscillator.onended = () => {
          oscillator.disconnect();
          gain.disconnect();
          this.activeVoices.delete(voice);
          oscillator.onended = null;
        };
        return voice;
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
        } catch (e) {
          console.warn('AudioContext initialization deferred:', e);
        }
      }

      startCozyMusic() {
        this.init();
        if (!this.ctx || this.isPlayingMusic) return;
        this.isPlayingMusic = true;

        const chords = [
          [261.63, 329.63, 392.00, 493.88],
          [220.00, 261.63, 329.63, 392.00],
          [174.61, 220.00, 261.63, 349.23],
          [196.00, 246.94, 293.66, 392.00]
        ];
        const bassRoot = [65.41, 55.00, 43.65, 49.00];
        const leadNotes = [
          523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25,
          659.25, 783.99, 1046.50, 880.00, 783.99, 659.25, 587.33, 659.25
        ];

        const tick = () => {
          if (!this.isPlayingMusic) return;
          setTimeout(tick, 127);
          if (this.enabled && this.ctx && this.ctx.state === 'running') {
            const now = this.ctx.currentTime;
            const bar = Math.floor(this.step / 16) % 4;
            const s16 = this.step % 16;

            if (s16 % 4 === 0) {
              const voice = this.createVoice();
              if (!voice) return;
              const { oscillator: kOsc, gain: kGain } = voice;
              kOsc.type = 'sine';
              kOsc.frequency.setValueAtTime(135, now);
              kOsc.frequency.exponentialRampToValueAtTime(38, now + 0.09);
              kGain.gain.setValueAtTime(0.075, now);
              kGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
              kOsc.connect(kGain);
              kGain.connect(this.ctx.destination);
              kOsc.start(now);
              kOsc.stop(now + 0.12);
            }

            if (s16 === 4 || s16 === 12) {
              const voice = this.createVoice();
              if (!voice) return;
              const { oscillator: sOsc, gain: sGain } = voice;
              sOsc.type = 'triangle';
              sOsc.frequency.setValueAtTime(290, now);
              sOsc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
              sGain.gain.setValueAtTime(0.045, now);
              sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
              sOsc.connect(sGain);
              sGain.connect(this.ctx.destination);
              sOsc.start(now);
              sOsc.stop(now + 0.09);
            }

            if (s16 % 2 === 0) {
              const voice = this.createVoice();
              if (!voice) return;
              const { oscillator: bOsc, gain: bGain } = voice;
              bOsc.type = 'sawtooth';
              const isOctave = (s16 % 4 === 2);
              const freq = bassRoot[bar] * (isOctave ? 2.0 : 1.0);
              bOsc.frequency.setValueAtTime(freq, now);
              bGain.gain.setValueAtTime(0.032, now);
              bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
              bOsc.connect(bGain);
              bGain.connect(this.ctx.destination);
              bOsc.start(now);
              bOsc.stop(now + 0.12);
            }

            if (s16 === 0 || s16 === 3 || s16 === 6 || s16 === 10 || s16 === 12) {
              chords[bar].forEach((freq, idx) => {
                const voice = this.createVoice();
                if (!voice) return;
                const { oscillator: cOsc, gain: cGain } = voice;
                cOsc.type = 'triangle';
                cOsc.frequency.setValueAtTime(freq, now);
                cGain.gain.setValueAtTime(0.016 - idx * 0.002, now);
                cGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.18);
                cOsc.connect(cGain);
                cGain.connect(this.ctx.destination);
                cOsc.start(now);
                cOsc.stop(now + 0.19);
              });
            }

            if (s16 === 0 || s16 === 2 || s16 === 5 || s16 === 8 || s16 === 11 || s16 === 14) {
              const voice = this.createVoice();
              if (!voice) return;
              const { oscillator: lOsc, gain: lGain } = voice;
              lOsc.type = 'square';
              const note = leadNotes[(s16 + bar * 3) % leadNotes.length];
              lOsc.frequency.setValueAtTime(note, now);
              lGain.gain.setValueAtTime(0.014, now);
              lGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.15);
              lOsc.connect(lGain);
              lGain.connect(this.ctx.destination);
              lOsc.start(now);
              lOsc.stop(now + 0.16);
            }

            this.step++;
          }
        };
        tick();
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
        gain.connect(this.ctx.destination);
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
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
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain: gain } = voice;
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
        const voice = this.createVoice();
        if (!voice) return;
        const { oscillator: osc, gain: gain } = voice;
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
          gain.connect(this.ctx.destination);
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
            gain.connect(this.ctx.destination);
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
            gain.connect(this.ctx.destination);
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
          const voice = this.createVoice();
          if (!voice) return;
          const { oscillator: osc, gain: gain } = voice;
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
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      }
    }

    const soundFX = new SoundSystem();

