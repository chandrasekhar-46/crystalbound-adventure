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
  private masterVolume = 0.75;
  private activeMusicOscillators: OscillatorNode[] = [];

  constructor() {
    // AudioContext will be initialized on first user gesture or ensureUnlocked
  }

  public ensureUnlocked(): boolean {
    return this.initContext();
  }

  private initContext(): boolean {
    if (!this.ctx && typeof window !== 'undefined') {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicEnabled ? 0.32 : 0, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? 0.65 : 0, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      } catch {
        return false;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return !!this.ctx;
  }

  public updateSettings(settings: { music: boolean; sfx: boolean; masterVolume: number }) {
    this.musicEnabled = settings.music;
    this.sfxEnabled = settings.sfx;
    this.masterVolume = Math.max(0, Math.min(1, settings.masterVolume));

    if (this.ctx && this.masterGain && this.musicGain && this.sfxGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setTargetAtTime(this.masterVolume, now, 0.05);
      this.musicGain.gain.setTargetAtTime(this.musicEnabled ? 0.32 : 0, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(this.sfxEnabled ? 0.65 : 0, now, 0.05);
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

    // Atmospheric fantasy chord progression (Am9 - Fmaj7 - Cmaj9 - Em7/G)
    const chords = [
      [220.0, 261.63, 329.63, 493.88], // Am9 (A3, C4, E4, B4)
      [174.61, 220.0, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
      [130.81, 196.0, 246.94, 293.66], // Cmaj9 (C3, G3, B3, D4)
      [164.81, 196.0, 246.94, 392.0],  // Em7/G (E3, G3, B3, G4)
    ];

    let chordIndex = 0;

    const playChordCycle = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      const now = this.ctx.currentTime;
      const chordDuration = 5.6;

      // 1. Lush multi-layer warm ambient pad with gentle lowpass filter
      currentChord.forEach((freq, idx) => {
        try {
          const osc1 = this.ctx!.createOscillator();
          const osc2 = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const filter = this.ctx!.createBiquadFilter();

          // Detuned dual oscillators for rich stereo warmth
          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(freq, now);
          osc1.detune.setValueAtTime(-5, now);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(freq, now);
          osc2.detune.setValueAtTime(5, now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(550 + (idx * 110), now);
          filter.frequency.exponentialRampToValueAtTime(800 + (idx * 80), now + chordDuration * 0.5);
          filter.frequency.exponentialRampToValueAtTime(500, now + chordDuration);

          const peakGain = 0.045 / currentChord.length;
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.exponentialRampToValueAtTime(peakGain, now + 1.4);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + chordDuration);

          osc1.connect(filter);
          osc2.connect(filter);
          filter.connect(gain);
          gain.connect(this.musicGain!);

          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + chordDuration);
          osc2.stop(now + chordDuration);

          this.activeMusicOscillators.push(osc1, osc2);
        } catch {}
      });

      // 2. Delicate celestial crystal harp arpeggios dancing across the chord
      const arpeggioNotes = [
        currentChord[1] * 2,
        currentChord[2] * 2,
        currentChord[3] * 2,
        currentChord[0] * 4,
        currentChord[2] * 3,
      ];

      arpeggioNotes.forEach((f, cIdx) => {
        const chimeDelay = 0.8 + cIdx * 0.85 + (Math.random() * 0.2);
        try {
          const osc = this.ctx!.createOscillator();
          const overtone = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + chimeDelay);

          overtone.type = 'triangle';
          overtone.frequency.setValueAtTime(f * 2, now + chimeDelay);

          gain.gain.setValueAtTime(0.0001, now + chimeDelay);
          gain.gain.exponentialRampToValueAtTime(0.028, now + chimeDelay + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.00001, now + chimeDelay + 1.4);

          osc.connect(gain);
          overtone.connect(gain);
          gain.connect(this.musicGain!);

          osc.start(now + chimeDelay);
          overtone.start(now + chimeDelay);
          osc.stop(now + chimeDelay + 1.5);
          overtone.stop(now + chimeDelay + 1.5);

          this.activeMusicOscillators.push(osc, overtone);
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
    // Stop lingering active oscillators
    for (const osc of this.activeMusicOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    }
    this.activeMusicOscillators = [];
  }

  // Enchanting, sparkling crystal pickup chime with pleasant pitch ascension
  public playCrystalCollect(collectedCount: number = 0) {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Base scales transposed up slightly as more crystals are recovered
      const pitchScale = 1.0 + Math.min(0.5, (collectedCount % 8) * 0.06);

      // Pentatonic crystal harmonics
      const baseFreqs = [587.33, 739.99, 880.0, 1174.66, 1479.98];
      const freqs = baseFreqs.map(f => f * pitchScale);

      freqs.forEach((f, i) => {
        const osc = this.ctx!.createOscillator();
        const shimmer = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + i * 0.035);

        shimmer.type = 'triangle';
        shimmer.frequency.setValueAtTime(f * 2.01, now + i * 0.035);

        const startTime = now + i * 0.035;
        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.09, startTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.38);

        osc.connect(gain);
        shimmer.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(startTime);
        shimmer.start(startTime);
        osc.stop(startTime + 0.42);
        shimmer.stop(startTime + 0.42);
      });
    } catch {}
  }

  // Arcane Portal Unlock Fanfare
  public playPortalUnlock() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      // Resonant mystical ascending chord
      const chords = [
        { f: 392.0, t: 0.0 },   // G4
        { f: 493.88, t: 0.08 }, // B4
        { f: 587.33, t: 0.16 }, // D5
        { f: 783.99, t: 0.24 }, // G5
        { f: 987.77, t: 0.34 }, // B5
        { f: 1174.66, t: 0.46 },// D6
        { f: 1567.98, t: 0.58 },// G6
      ];

      chords.forEach(c => {
        const osc = this.ctx!.createOscillator();
        const sub = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c.f, now + c.t);

        sub.type = 'sine';
        sub.frequency.setValueAtTime(c.f * 0.5, now + c.t);

        gain.gain.setValueAtTime(0.0001, now + c.t);
        gain.gain.exponentialRampToValueAtTime(0.12, now + c.t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + c.t + 1.2);

        osc.connect(gain);
        sub.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + c.t);
        sub.start(now + c.t);
        osc.stop(now + c.t + 1.3);
        sub.stop(now + c.t + 1.3);
      });
    } catch {}
  }

  // Obstacle or Hazard collision: Tactile, crisp fantasy impact thud
  public playHazardHit() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      
      // Low impact body thud
      const bodyOsc = this.ctx.createOscillator();
      const bodyGain = this.ctx.createGain();

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(140, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(38, now + 0.22);

      bodyGain.gain.setValueAtTime(0.25, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

      bodyOsc.connect(bodyGain);
      bodyGain.connect(this.sfxGain);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.25);

      // Mystical glass crack / warning ring
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();

      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(420, now);
      ringOsc.frequency.exponentialRampToValueAtTime(180, now + 0.15);

      ringGain.gain.setValueAtTime(0.12, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      ringOsc.connect(ringGain);
      ringGain.connect(this.sfxGain);

      ringOsc.start(now);
      ringOsc.stop(now + 0.17);
    } catch {}
  }

  // Triumphant Level Completion Fanfare
  public playLevelComplete() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { f: 523.25, t: 0.0 },   // C5
        { f: 659.25, t: 0.12 },  // E5
        { f: 783.99, t: 0.24 },  // G5
        { f: 1046.50, t: 0.38 }, // C6
        { f: 1318.51, t: 0.52 }, // E6
      ];

      notes.forEach(note => {
        const osc = this.ctx!.createOscillator();
        const overtone = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        overtone.type = 'sine';
        overtone.frequency.setValueAtTime(note.f * 2, now + note.t);

        gain.gain.setValueAtTime(0.0001, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.14, now + note.t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.t + 0.95);

        osc.connect(gain);
        overtone.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + note.t);
        overtone.start(now + note.t);
        osc.stop(now + note.t + 1.0);
        overtone.stop(now + note.t + 1.0);
      });
    } catch {}
  }

  // Epic Grand Game Victory (Final 100 Realms Victory)
  public playGameVictory() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const melody = [
        { f: 523.25, t: 0.0 },
        { f: 659.25, t: 0.18 },
        { f: 783.99, t: 0.36 },
        { f: 1046.5, t: 0.54 },
        { f: 1318.5, t: 0.76 },
        { f: 1567.9, t: 1.02 },
        { f: 2093.0, t: 1.34 },
      ];

      melody.forEach(item => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, now + item.t);

        gain.gain.setValueAtTime(0.0001, now + item.t);
        gain.gain.exponentialRampToValueAtTime(0.18, now + item.t + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + item.t + 1.4);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now + item.t);
        osc.stop(now + item.t + 1.5);
      });
    } catch {}
  }

  // Soft, satisfying UI click (stone/crystal tap)
  public playUiClick() {
    if (!this.sfxEnabled) return;
    if (!this.initContext() || !this.ctx || !this.sfxGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.045);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }
}

export const soundManager = new SoundManager();

// Automatically unlock AudioContext on first mobile or desktop user interaction
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    soundManager.ensureUnlocked();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('touchstart', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { passive: true });
  window.addEventListener('touchstart', unlockAudio, { passive: true });
  window.addEventListener('keydown', unlockAudio, { passive: true });
}
