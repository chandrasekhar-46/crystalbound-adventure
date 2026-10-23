/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private musicEnabled = true;
  private sfxEnabled = true;
  private masterVolume = 0.7;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext(): boolean {
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.35 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.6 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      } catch {
        return false;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return true;
  }

  public updateSettings(settings: { music: boolean; sfx: boolean; masterVolume: number }) {
    this.musicEnabled = settings.music;
    this.sfxEnabled = settings.sfx;
    this.masterVolume = Math.max(0, Math.min(1, settings.masterVolume));

    if (this.ctx && this.masterGain && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.masterVolume, now, 0.05);
      this.musicGain.gain.setTargetAtTime(this.musicEnabled ? 0.35 : 0, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(this.sfxEnabled ? 0.6 : 0, now, 0.05);
    }

    if (!this.musicEnabled && this.isMusicPlaying) {
      this.stopMusic();
    } else if (this.musicEnabled && !this.isMusicPlaying) {
      this.startMusic();
    }
  }

  public startMusic() {
    if (!this.musicEnabled || this.isMusicPlaying) return;
    if (!this.initContext() || !this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    
    // Ambient fantasy chord progression & crystal arpeggiator
    const chords = [
      [220.0, 261.63, 329.63, 440.0], // Am (A3, C4, E4, A4)
      [174.61, 220.0, 261.63, 349.23], // F (F3, A3, C4, F4)
      [196.0, 246.94, 293.66, 392.0], // G (G3, B3, D4, G4)
      [164.81, 207.65, 246.94, 329.63], // Em (E3, G#3/G3, B3, E4)
    ];

    let chordIndex = 0;
    const playChordCycle = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const chordDuration = 5.5;

      // Play warm pad
      currentChord.forEach((freq, idx) => {
        try {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const filter = this.ctx!.createBiquadFilter();

          osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800 + Math.random() * 400, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.exponentialRampToValueAtTime(0.08 / currentChord.length, now + 1.2);
          gain.gain.exponentialRampToValueAtTime(0.001, now + chordDuration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);

          osc.start(now);
          osc.stop(now + chordDuration);
        } catch {}
      });

      // Play soft celestial chimes over the chord
      const chimeNotes = [currentChord[1] * 2, currentChord[2] * 2, currentChord[3] * 2, currentChord[0] * 4];
      chimeNotes.forEach((f, cIdx) => {
        const chimeDelay = 1.0 + cIdx * 1.0 + Math.random() * 0.4;
        try {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + chimeDelay);

          gain.gain.setValueAtTime(0.001, now + chimeDelay);
          gain.gain.exponentialRampToValueAtTime(0.035, now + chimeDelay + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + chimeDelay + 1.2);

          osc.connect(gain);
          gain.connect(this.musicGain!);

          osc.start(now + chimeDelay);
          osc.stop(now + chimeDelay + 1.3);
        } catch {}
      });
    };

    playChordCycle();
    this.musicInterval = window.setInterval(playChordCycle, 5200);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public playCrystalCollect() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Bright sparkling crystal chime (pentatonic cascade)
      const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22];
      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.045);

        gain.gain.setValueAtTime(0.001, now + i * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.12, now + i * 0.045 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.045 + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + i * 0.045);
        osc.stop(now + i * 0.045 + 0.45);
      });
    } catch {}
  }

  public playPortalUnlock() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.15, now + idx * 0.1 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.3);
      });
    } catch {}
  }

  public playHazardHit() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {}
  }

  public playLevelComplete() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + i * 0.12);

        gain.gain.setValueAtTime(0.001, now + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.85);
      });
    } catch {}
  }

  public playGameVictory() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Majestic triumphant fanfare
      const melody = [
        { f: 523.25, t: 0.0 }, // C5
        { f: 659.25, t: 0.2 }, // E5
        { f: 783.99, t: 0.4 }, // G5
        { f: 1046.5, t: 0.6 }, // C6
        { f: 1318.5, t: 0.9 }, // E6
        { f: 1567.9, t: 1.2 }, // G6
      ];

      melody.forEach(item => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + item.t);

        gain.gain.setValueAtTime(0.001, now + item.t);
        gain.gain.exponentialRampToValueAtTime(0.2, now + item.t + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + item.t + 1.2);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + item.t);
        osc.stop(now + item.t + 1.3);
      });
    } catch {}
  }

  public playUiClick() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.05);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }
}

export const soundManager = new SoundManager();
