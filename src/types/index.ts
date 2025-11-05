export type AccentType = 'skip' | 'standard' | 'accent1' | 'accent2';

export type MetronomeSoundKit = 'click' | 'beep' | 'drum' | 'jazz' | 'percussion' | 'marimba' | 'rock_drums';

export interface Settings {
  rotationSpeed: number;
  pulseSpeed: number;
  minRadius: number;
  maxRadius: number;
  breathSpeed: number;
  minBreathPercent: number;
  maxBreathPercent: number;
  curveSpeed: number;
  maxCurveRadius: number;
  invertPulsePhase: boolean;
  eyeAngleOffset: number;
  borderWidth: number;
  eyeColorInversion: number;
  eyeColorSpeed: number;
  bgLightness: number;
  bgWarmth: number;
  glowSize: number;
  metronomeEnabled: boolean;
  metronomeBPM: number;
  metronomeSoundKit: MetronomeSoundKit;
  beatsPerMeasure: number;
  accentPattern: AccentType[];
  panelOpacity: number;
  panelBlur: number;
  syncBreathWithMetronome: boolean;
  syncMultiplier: number;
  asymmetricBreathing: boolean;
  speedTrainerEnabled: boolean;
  startBPM: number;
  targetBPM: number;
  increaseBy: number;
  everyNMeasures: number;
  showMetronomeControl: boolean;
}

export interface Preset {
  name: string;
  settings: Settings;
}
