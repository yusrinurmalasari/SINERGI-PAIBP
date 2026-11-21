// Instrumen Semangat — Web Audio API Sequencer Energik & Optimis (+ Dukungan File Audio Lokal)

export type AmbientPreset = 'semangat_pagi' | 'semangat_berkarya';

interface MelodyNote {
  freq: number;
  startBeat: number;
  durationBeats: number;
  velocity?: number;
}

interface ChordEvent {
  freqs: number[];
  bassFreq: number;
  startBeat: number;
  durationBeats: number;
}

interface PresetConfig {
  label: string;
  subtitle: string;
  leadWave: OscillatorType;
  padWave: OscillatorType;
  filterCutoff: number;
  beatSec: number;
  chords: ChordEvent[];
  melody: MelodyNote[];
}

const NOTE = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  F3: 174.61,
  G3: 196.0,
  A3: 220.0,
  B3: 246.94,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  Fs4: 369.99,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
  D5: 587.33,
  E5: 659.25,
  F5: 698.46,
  G5: 783.99,
};

const TOTAL_BEATS = 16;

// Progresi Mayor Ceria & Penuh Energi: C - G - Am - F (120 BPM)
const CHORDS_PAGI: ChordEvent[] = [
  { freqs: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5], bassFreq: NOTE.C3, startBeat: 0, durationBeats: 4 },
  { freqs: [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4], bassFreq: NOTE.G3, startBeat: 4, durationBeats: 4 },
  { freqs: [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.A4], bassFreq: NOTE.A3, startBeat: 8, durationBeats: 4 },
  { freqs: [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.F4], bassFreq: NOTE.F3, startBeat: 12, durationBeats: 4 },
];

const MELODY_PAGI: MelodyNote[] = [
  // Birama 1 (C): Motiv naik penuh semangat
  { freq: NOTE.E4, startBeat: 0, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.G4, startBeat: 0.5, durationBeats: 0.45, velocity: 0.95 },
  { freq: NOTE.C5, startBeat: 1, durationBeats: 0.9, velocity: 1.0 },
  { freq: NOTE.E5, startBeat: 2, durationBeats: 0.45, velocity: 1.0 },
  { freq: NOTE.D5, startBeat: 2.5, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.C5, startBeat: 3, durationBeats: 0.8, velocity: 0.95 },

  // Birama 2 (G): Sinkopasi energik
  { freq: NOTE.B4, startBeat: 4, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.D5, startBeat: 4.5, durationBeats: 0.45, velocity: 0.95 },
  { freq: NOTE.G5, startBeat: 5, durationBeats: 0.9, velocity: 1.0 },
  { freq: NOTE.D5, startBeat: 6, durationBeats: 0.5, velocity: 0.9 },
  { freq: NOTE.B4, startBeat: 6.5, durationBeats: 0.5, velocity: 0.85 },
  { freq: NOTE.G4, startBeat: 7, durationBeats: 0.8, velocity: 0.9 },

  // Birama 3 (Am): Melodi optimis
  { freq: NOTE.A4, startBeat: 8, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.C5, startBeat: 8.5, durationBeats: 0.45, velocity: 0.95 },
  { freq: NOTE.E5, startBeat: 9, durationBeats: 0.9, velocity: 1.0 },
  { freq: NOTE.C5, startBeat: 10, durationBeats: 0.5, velocity: 0.9 },
  { freq: NOTE.A4, startBeat: 10.5, durationBeats: 0.5, velocity: 0.85 },
  { freq: NOTE.E5, startBeat: 11, durationBeats: 0.8, velocity: 0.95 },

  // Birama 4 (F -> G feel): Kadens dorongan semangat
  { freq: NOTE.F5, startBeat: 12, durationBeats: 0.65, velocity: 1.0 },
  { freq: NOTE.E5, startBeat: 12.75, durationBeats: 0.65, velocity: 0.95 },
  { freq: NOTE.D5, startBeat: 13.5, durationBeats: 0.5, velocity: 0.9 },
  { freq: NOTE.C5, startBeat: 14, durationBeats: 0.9, velocity: 0.95 },
  { freq: NOTE.G4, startBeat: 15, durationBeats: 0.8, velocity: 0.9 },
];

// Progresi G - D - Em - C (114 BPM, Ritmis & Produktif)
const CHORDS_BERKARYA: ChordEvent[] = [
  { freqs: [NOTE.G3, NOTE.B3, NOTE.D4, NOTE.G4], bassFreq: NOTE.G3 * 0.5, startBeat: 0, durationBeats: 4 },
  { freqs: [NOTE.D4, NOTE.Fs4, NOTE.A4, NOTE.D5], bassFreq: NOTE.D3, startBeat: 4, durationBeats: 4 },
  { freqs: [NOTE.E3, NOTE.G3, NOTE.B3, NOTE.E4], bassFreq: NOTE.E3, startBeat: 8, durationBeats: 4 },
  { freqs: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.C5], bassFreq: NOTE.C3, startBeat: 12, durationBeats: 4 },
];

const MELODY_BERKARYA: MelodyNote[] = [
  { freq: NOTE.G4, startBeat: 0, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.B4, startBeat: 0.5, durationBeats: 0.45, velocity: 0.95 },
  { freq: NOTE.D5, startBeat: 1, durationBeats: 0.7, velocity: 1.0 },
  { freq: NOTE.G5, startBeat: 2, durationBeats: 0.9, velocity: 1.0 },
  { freq: NOTE.D5, startBeat: 3, durationBeats: 0.8, velocity: 0.9 },

  { freq: NOTE.Fs4 * 2, startBeat: 4, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.D5, startBeat: 4.5, durationBeats: 0.45, velocity: 0.9 },
  { freq: NOTE.A4, startBeat: 5, durationBeats: 0.9, velocity: 0.95 },
  { freq: NOTE.D5, startBeat: 6, durationBeats: 0.9, velocity: 0.95 },
  { freq: NOTE.E5, startBeat: 7, durationBeats: 0.8, velocity: 0.95 },

  { freq: NOTE.E5, startBeat: 8, durationBeats: 0.65, velocity: 1.0 },
  { freq: NOTE.D5, startBeat: 8.75, durationBeats: 0.65, velocity: 0.95 },
  { freq: NOTE.B4, startBeat: 9.5, durationBeats: 0.5, velocity: 0.9 },
  { freq: NOTE.G4, startBeat: 10, durationBeats: 0.9, velocity: 0.9 },
  { freq: NOTE.B4, startBeat: 11, durationBeats: 0.8, velocity: 0.9 },

  { freq: NOTE.C5, startBeat: 12, durationBeats: 0.45, velocity: 0.95 },
  { freq: NOTE.E5, startBeat: 12.5, durationBeats: 0.45, velocity: 1.0 },
  { freq: NOTE.G5, startBeat: 13, durationBeats: 0.9, velocity: 1.0 },
  { freq: NOTE.E5, startBeat: 14, durationBeats: 0.9, velocity: 0.95 },
  { freq: NOTE.D5, startBeat: 15, durationBeats: 0.8, velocity: 0.9 },
];

const PRESET_CONFIGS: Record<AmbientPreset, PresetConfig> = {
  semangat_pagi: {
    label: 'Semangat Pagi — Ceria & Optimis',
    subtitle: 'Ritme Ceria 120 BPM · Progresi C Mayor',
    leadWave: 'triangle',
    padWave: 'sine',
    filterCutoff: 2400,
    beatSec: 0.5,
    chords: CHORDS_PAGI,
    melody: MELODY_PAGI,
  },
  semangat_berkarya: {
    label: 'Semangat Berkarya — Fokus Produktif',
    subtitle: 'Ritme Mantap 114 BPM · Progresi G Mayor',
    leadWave: 'triangle',
    padWave: 'triangle',
    filterCutoff: 2100,
    beatSec: 0.526,
    chords: CHORDS_BERKARYA,
    melody: MELODY_BERKARYA,
  },
};

class EnergeticInstrumentalEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private loopTimerId: number | null = null;
  private activeOscillators: Set<OscillatorNode> = new Set();
  private preset: AmbientPreset = 'semangat_pagi';
  private volume = 0.28;
  private playing = false;

  // Opsional file audio lokal (.mp3/.wav)
  private customAudioEl: HTMLAudioElement | null = null;
  private customAudioUrl: string | null = null;
  private customAudioName: string | null = null;

  public getPresets() {
    return Object.entries(PRESET_CONFIGS).map(([key, val]) => ({
      id: key as AmbientPreset,
      label: val.label,
      subtitle: val.subtitle,
    }));
  }

  public isPlaying() {
    return this.playing;
  }

  public getPreset() {
    return this.preset;
  }

  public getCustomAudioName() {
    return this.customAudioName;
  }

  public setPreset(preset: AmbientPreset) {
    this.preset = preset;
    this.clearCustomAudio(false);
    if (this.playing) {
      this.stop();
      this.start();
    }
  }

  public playCustomAudioFile(file: File) {
    this.stop();
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
    }
    this.customAudioUrl = URL.createObjectURL(file);
    this.customAudioName = file.name;
    this.customAudioEl = new Audio(this.customAudioUrl);
    this.customAudioEl.loop = true;
    this.customAudioEl.volume = this.volume;
    void this.customAudioEl.play();
    this.playing = true;
  }

  public clearCustomAudio(stopPlayback = true) {
    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.src = '';
      this.customAudioEl = null;
    }
    if (this.customAudioUrl) {
      URL.revokeObjectURL(this.customAudioUrl);
      this.customAudioUrl = null;
    }
    this.customAudioName = null;
    if (stopPlayback && this.playing) {
      this.stop();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.customAudioEl) {
      this.customAudioEl.volume = this.volume;
    }
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0.0001, this.volume * 0.42), this.ctx.currentTime, 0.1);
    }
  }

  public start() {
    if (this.playing) return;

    if (this.customAudioEl) {
      this.customAudioEl.volume = this.volume;
      void this.customAudioEl.play();
      this.playing = true;
      return;
    }

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    if (!this.ctx) {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    const cfg = PRESET_CONFIGS[this.preset];

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = cfg.filterCutoff;
    this.filterNode.Q.value = 0.7;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.volume * 0.42),
      this.ctx.currentTime + 0.35
    );

    this.filterNode.connect(this.masterGain);
    this.masterGain.connect(this.ctx.destination);

    this.playing = true;

    const scheduleLoop = () => {
      if (!this.playing || !this.ctx || !this.filterNode) return;
      const activeCfg = PRESET_CONFIGS[this.preset];
      const baseTime = this.ctx.currentTime + 0.04;
      const beatSec = activeCfg.beatSec;

      // 1. Akor ritmis + Bass pulse setiap ketukan
      activeCfg.chords.forEach((chord) => {
        this.scheduleChordStabAndArp(
          chord,
          baseTime + chord.startBeat * beatSec,
          beatSec
        );
      });

      // 2. Ketukan Kick lembut pada ketukan 0, 2, 4, 6... agar terasa bersemangat
      for (let b = 0; b < TOTAL_BEATS; b += 1) {
        if (b % 2 === 0) {
          this.scheduleSoftKick(baseTime + b * beatSec);
        }
      }

      // 3. Melodi utama cerah
      activeCfg.melody.forEach((note) => {
        this.scheduleLeadNote(
          note.freq,
          baseTime + note.startBeat * beatSec,
          note.durationBeats * beatSec,
          note.velocity ?? 0.9
        );
      });
    };

    scheduleLoop();
    const cycleMs = Math.round(TOTAL_BEATS * cfg.beatSec * 1000);
    this.loopTimerId = window.setInterval(scheduleLoop, cycleMs);
  }

  public stop() {
    this.playing = false;

    if (this.customAudioEl) {
      this.customAudioEl.pause();
      this.customAudioEl.currentTime = 0;
    }

    if (this.loopTimerId !== null) {
      window.clearInterval(this.loopTimerId);
      this.loopTimerId = null;
    }

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.0001, now, 0.12);
    }

    const stopAt = this.ctx ? this.ctx.currentTime + 0.2 : 0;
    this.activeOscillators.forEach((osc) => {
      try {
        osc.stop(stopAt);
      } catch {
        // Ignore already stopped oscillators
      }
    });
    this.activeOscillators.clear();
  }

  private scheduleSoftKick(startTime: number) {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, startTime);
    osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.11);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.16, startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);

    this.activeOscillators.add(osc);
    osc.onended = () => this.activeOscillators.delete(osc);

    osc.start(startTime);
    osc.stop(startTime + 0.18);
  }

  private scheduleChordStabAndArp(chord: ChordEvent, startTime: number, beatSec: number) {
    if (!this.ctx || !this.filterNode) return;
    const cfg = PRESET_CONFIGS[this.preset];

    // Driving bass pulse (per ketukan)
    for (let i = 0; i < chord.durationBeats; i += 1) {
      const t = startTime + i * beatSec;
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(chord.bassFreq, t);

      bassGain.gain.setValueAtTime(0.0001, t);
      bassGain.gain.linearRampToValueAtTime(0.075, t + 0.02);
      bassGain.gain.exponentialRampToValueAtTime(0.0001, t + beatSec * 0.85);

      bassOsc.connect(bassGain);
      bassGain.connect(this.filterNode);

      this.activeOscillators.add(bassOsc);
      bassOsc.onended = () => this.activeOscillators.delete(bassOsc);
      bassOsc.start(t);
      bassOsc.stop(t + beatSec * 0.9);
    }

    // Energetic upward arpeggio eighth-notes
    const eighthSec = beatSec * 0.5;
    for (let step = 0; step < chord.durationBeats * 2; step += 1) {
      const t = startTime + step * eighthSec;
      const freq = chord.freqs[step % chord.freqs.length];
      const arpOsc = this.ctx.createOscillator();
      const arpGain = this.ctx.createGain();

      arpOsc.type = cfg.padWave;
      arpOsc.frequency.setValueAtTime(freq, t);

      arpGain.gain.setValueAtTime(0.0001, t);
      arpGain.gain.linearRampToValueAtTime(0.032, t + 0.015);
      arpGain.gain.exponentialRampToValueAtTime(0.0001, t + eighthSec * 0.9);

      arpOsc.connect(arpGain);
      arpGain.connect(this.filterNode);

      this.activeOscillators.add(arpOsc);
      arpOsc.onended = () => this.activeOscillators.delete(arpOsc);
      arpOsc.start(t);
      arpOsc.stop(t + eighthSec * 0.95);
    }
  }

  private scheduleLeadNote(freq: number, startTime: number, durationSec: number, velocity: number) {
    if (!this.ctx || !this.filterNode) return;
    const cfg = PRESET_CONFIGS[this.preset];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = cfg.leadWave;
    osc.frequency.setValueAtTime(freq, startTime);

    const peak = 0.085 * velocity;
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peak, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(peak * 0.45, startTime + durationSec * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSec + 0.12);

    osc.connect(gain);
    gain.connect(this.filterNode);

    this.activeOscillators.add(osc);
    osc.onended = () => this.activeOscillators.delete(osc);

    osc.start(startTime);
    osc.stop(startTime + durationSec + 0.15);
  }
}

export const ambientAudio = new EnergeticInstrumentalEngine();
