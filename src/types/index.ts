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
  breathSyncMultiplier: number;
  asymmetricBreathing: boolean;
  asymmetricBreathingInvert: boolean;
  speedTrainerEnabled: boolean;
  startBPM: number;
  targetBPM: number;
  increaseBy: number;
  everyNMeasures: number;
  showMetronomeControl: boolean;
  
  // New sync settings
  syncRotationWithMetronome: boolean;
  rotationSyncMultiplier: number;
  syncPulseWithMetronome: boolean;
  pulseSyncMultiplier: number;
  syncCurveWithMetronome: boolean;
  curveSyncMultiplier: number;
  syncEyeColorWithMetronome: boolean;
  eyeColorSyncMultiplier: number;

  // Glow Flash Settings
  glowFlashTrigger: 'none' | 'measure' | 'accent1' | 'accent2';
  glowFlashSize: number;
  glowFlashDuration: number;
}

export interface Preset {
  name: string;
  settings: Settings;
}
