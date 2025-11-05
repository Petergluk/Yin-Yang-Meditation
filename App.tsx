import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Color Utility Functions ---
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
};

const lerp = (a: number, b: number, t: number): number => {
    return a * (1 - t) + b * t;
}

const lerpColor = (colorA: string, colorB: string, amount: number): string => {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  if (!rgbA || !rgbB) return colorA;

  const r = Math.round(lerp(rgbA.r, rgbA.r, amount));
  const g = Math.round(lerp(rgbA.g, rgbB.g, amount));
  const b = Math.round(lerp(rgbA.b, rgbB.b, amount));

  return rgbToHex(r, g, b);
};


/**
 * Props for the YinYang component.
 */
interface YinYangProps {
  size: number;
  rotationSpeed: number;
  pulseSpeed: number;
  minRadius: number;
  maxRadius: number;
  curveRadius: number;
  invertPulsePhase: boolean;
  eyeAngleOffset: number;
  borderWidth: number;
  darkEyeColor: string;
  lightEyeColor: string;
}

const YinYang: React.FC<YinYangProps> = ({
  size,
  rotationSpeed,
  pulseSpeed,
  minRadius,
  maxRadius,
  curveRadius,
  invertPulsePhase,
  eyeAngleOffset,
  borderWidth,
  darkEyeColor,
  lightEyeColor,
}) => {
  const rotationStyle = {
    animationDuration: `${rotationSpeed}s`,
  };

  // SVG calculations for robust border
  const center = 50;
  const mainRadius = 50 - (borderWidth / 2);

  const pathD = `M${center},${center + mainRadius} A${curveRadius} ${curveRadius} 0 0 0 ${center} ${center} A${curveRadius} ${curveRadius} 0 0 1 ${center} ${center - mainRadius} A${mainRadius} ${mainRadius} 0 0 1 ${center} ${center + mainRadius} Z`;
  
  const eyeCenterYTop = -mainRadius / 2;
  const eyeCenterYBottom = mainRadius / 2;
  
  const minScale = minRadius / maxRadius;

  const basePulseStyle = {
    animationDuration: `${pulseSpeed}s`,
    '--min-scale': minScale,
    '--max-scale': 1,
  } as React.CSSProperties;

  const invertedPulseStyle = invertPulsePhase ? {
    ...basePulseStyle,
    animationDelay: `-${pulseSpeed / 2}s`,
  } : basePulseStyle;

  return (
    <div
      className="animate-spin-continuous"
      style={rotationStyle}
    >
      <div 
        className="relative rounded-full overflow-hidden"
        style={{ width: `${size}px`, height: `${size}px` }}
      >
          <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle
                cx={center}
                cy={center}
                r={mainRadius}
                fill="#000000"
                stroke="#000000"
                strokeWidth={borderWidth}
              />
              <path
                  d={pathD}
                  fill="#ffffff"
              />
              <g transform={`translate(${center} ${center}) rotate(${eyeAngleOffset})`}>
                <circle cx={0} cy={eyeCenterYTop} r={maxRadius} className="animate-pulse-scale" style={{...basePulseStyle, fill: darkEyeColor, transformOrigin: `0px ${eyeCenterYTop}px`}} />
                <circle cx={0} cy={eyeCenterYBottom} r={maxRadius} className="animate-pulse-scale" style={{...invertedPulseStyle, fill: lightEyeColor, transformOrigin: `0px ${eyeCenterYBottom}px`}} />
              </g>
          </svg>
      </div>
    </div>
  );
};

// --- Settings and Presets Configuration ---
type AccentType = 'skip' | 'standard' | 'accent1' | 'accent2';

const ACCENT_CONFIG: Record<AccentType, { color: string; ringColor: string; label: string }> = {
  skip: { color: 'bg-slate-500/30', ringColor: 'ring-slate-400', label: 'Skip' },
  standard: { color: 'bg-green-500/80', ringColor: 'ring-green-400', label: 'Standard' },
  accent1: { color: 'bg-red-500/80', ringColor: 'ring-red-400', label: 'Accent 1' },
  accent2: { color: 'bg-yellow-500/80', ringColor: 'ring-yellow-400', label: 'Accent 2' },
};

type MetronomeSoundKit = 'click' | 'beep' | 'drum' | 'jazz' | 'drops' | 'marimba' | 'jazz_ride';


interface Settings {
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
  // Speed Trainer Settings
  speedTrainerEnabled: boolean;
  startBPM: number;
  targetBPM: number;
  increaseBy: number;
  everyNMeasures: number;
}

interface Preset {
  name: string;
  settings: Settings;
}

const PRESETS_STORAGE_KEY = 'yin-yang-custom-presets';

const initialSettings: Settings = {
  rotationSpeed: 30,
  pulseSpeed: 30,
  minRadius: 5.0,
  maxRadius: 9.0,
  breathSpeed: 30,
  minBreathPercent: 60,
  maxBreathPercent: 85,
  maxCurveRadius: 29.0,
  curveSpeed: 15,
  invertPulsePhase: true,
  eyeAngleOffset: 6,
  borderWidth: 2.0,
  eyeColorInversion: 30,
  eyeColorSpeed: 45,
  bgLightness: 85,
  bgWarmth: 85,
  glowSize: 25,
  metronomeEnabled: false,
  metronomeBPM: 60,
  metronomeSoundKit: 'jazz',
  beatsPerMeasure: 4,
  accentPattern: ['accent1', 'standard', 'standard', 'standard'],
  panelOpacity: 40,
  panelBlur: 10,
  syncBreathWithMetronome: false,
  syncMultiplier: 2,
  speedTrainerEnabled: false,
  startBPM: 60,
  targetBPM: 120,
  increaseBy: 5,
  everyNMeasures: 2,
};

const defaultPresets: Preset[] = [
  {
    name: 'Classic Calm',
    settings: { ...initialSettings },
  },
  {
    name: 'Deep Breath',
    settings: {
      ...initialSettings,
      rotationSpeed: 15,
      pulseSpeed: 30,
      minRadius: 5.0,
      maxRadius: 12.0,
      breathSpeed: 20,
      minBreathPercent: 25,
      maxBreathPercent: 99,
      maxCurveRadius: 35.0,
      curveSpeed: 10,
      invertPulsePhase: false,
      eyeAngleOffset: 21,
      borderWidth: 2.0,
      eyeColorInversion: 30,
      eyeColorSpeed: 30,
      bgLightness: 81,
      bgWarmth: 0,
      glowSize: 50,
      metronomeBPM: 50,
      beatsPerMeasure: 4,
      accentPattern: ['accent1', 'skip', 'standard', 'skip'],
      metronomeSoundKit: 'beep',
    },
  },
  {
    name: 'Vibrant Energy',
    settings: {
      ...initialSettings,
      rotationSpeed: 7,
      pulseSpeed: 15,
      minRadius: 5.0,
      maxRadius: 8.0,
      breathSpeed: 10,
      minBreathPercent: 40,
      maxBreathPercent: 60,
      maxCurveRadius: 28.0,
      curveSpeed: 30,
      invertPulsePhase: false,
      eyeAngleOffset: 6,
      borderWidth: 0.0,
      eyeColorInversion: 30,
      eyeColorSpeed: 60,
      bgLightness: 85,
      bgWarmth: 100,
      glowSize: 25,
      metronomeBPM: 120,
      beatsPerMeasure: 4,
      accentPattern: ['accent1', 'standard', 'accent2', 'standard'],
      metronomeSoundKit: 'drum',
    },
  },
  {
    name: 'Cosmic Swirl',
    settings: {
      ...initialSettings,
      rotationSpeed: 60,
      pulseSpeed: 60,
      minRadius: 4.0,
      maxRadius: 8.0,
      breathSpeed: 120,
      minBreathPercent: 30,
      maxBreathPercent: 90,
      maxCurveRadius: 27.0,
      curveSpeed: 60,
      invertPulsePhase: true,
      eyeAngleOffset: 0,
      borderWidth: 0.0,
      eyeColorInversion: 50,
      eyeColorSpeed: 30,
      bgLightness: 7,
      bgWarmth: 0,
      glowSize: 100,
      metronomeBPM: 70,
      beatsPerMeasure: 5,
      accentPattern: ['accent1', 'standard', 'standard', 'accent2', 'standard'],
      metronomeSoundKit: 'click',
    },
  },
];

const NumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
}> = ({ label, value, onChange, min, max, step }) => {
    const [inputValue, setInputValue] = useState(String(value));
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    // Syncs the input field when the prop value changes from the outside (e.g., loading a preset)
    useEffect(() => {
        if (document.activeElement?.id !== `input-${label}`) {
            setInputValue(String(value));
        }
    }, [value, label]);

    const stopCounter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        timeoutRef.current = null;
        intervalRef.current = null;
    };

    // Use a ref for the value in intervals to avoid stale closures
    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const handleChange = (newValue: number) => {
        const clampedValue = Math.max(min, Math.min(max, newValue));
        // Only call onChange if the value is actually different to prevent unnecessary re-renders
        if (clampedValue !== valueRef.current) {
            onChange(clampedValue);
        }
        return clampedValue;
    };
    
    const startCounter = (increment: boolean) => {
        stopCounter();
        // Perform initial change
        const nextValue = valueRef.current + (increment ? step : -step);
        handleChange(nextValue);
        
        // Start rapid change after a delay
        timeoutRef.current = window.setTimeout(() => {
            intervalRef.current = window.setInterval(() => {
                // Read from ref to get the latest value inside interval
                const currentVal = valueRef.current;
                const nextVal = currentVal + (increment ? step : -step);
                const clampedVal = handleChange(nextVal);
                // Stop if we hit the boundary
                if (clampedVal === min || clampedVal === max) {
                    stopCounter();
                }
            }, 50);
        }, 500);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
    };

    const handleInputBlur = () => {
        const parsedValue = parseInt(inputValue, 10);
        if (!isNaN(parsedValue)) {
            const clampedValue = Math.max(min, Math.min(max, parsedValue));
            // Update parent state
            onChange(clampedValue);
            // Sync local input state in case of clamping
            setInputValue(String(clampedValue));
        } else {
            // Revert to last valid value if input is not a number
            setInputValue(String(value));
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleInputBlur();
            (e.target as HTMLInputElement).blur();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const nextValue = (parseInt(inputValue, 10) || value) + step;
            const clampedValue = Math.max(min, Math.min(max, nextValue));
            onChange(clampedValue);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextValue = (parseInt(inputValue, 10) || value) - step;
            const clampedValue = Math.max(min, Math.min(max, nextValue));
            onChange(clampedValue);
        }
    };

    return (
        <div className="space-y-1">
            <label htmlFor={`input-${label}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
            <div className="flex items-center justify-between p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <button 
                    onMouseDown={() => startCounter(false)} 
                    onMouseUp={stopCounter} 
                    onMouseLeave={stopCounter}
                    onTouchStart={(e) => { e.preventDefault(); startCounter(false); }}
                    onTouchEnd={stopCounter}
                    className="px-3 py-1 rounded-md bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors select-none touch-manipulation"
                    aria-label={`Decrease ${label}`}
                >-</button>
                <input
                    id={`input-${label}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    className="w-16 text-center text-lg font-mono font-semibold text-slate-800 dark:text-slate-200 bg-transparent border-none focus:ring-0 p-0"
                />
                <button 
                    onMouseDown={() => startCounter(true)} 
                    onMouseUp={stopCounter} 
                    onMouseLeave={stopCounter}
                    onTouchStart={(e) => { e.preventDefault(); startCounter(true); }}
                    onTouchEnd={stopCounter}
                    className="px-3 py-1 rounded-md bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 transition-colors select-none touch-manipulation"
                    aria-label={`Increase ${label}`}
                >+</button>
            </div>
        </div>
    );
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [animatedCurveRadius, setAnimatedCurveRadius] = useState(25);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [animatedDarkEyeColor, setAnimatedDarkEyeColor] = useState('#000000');
  const [animatedLightEyeColor, setAnimatedLightEyeColor] = useState('#ffffff');
  const [viewportSize, setViewportSize] = useState({width: window.innerWidth, height: window.innerHeight});
  const [animatedScale, setAnimatedScale] = useState(1);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [currentBeat, setCurrentBeat] = useState<number | null>(null);
  const [panelView, setPanelView] = useState<'main' | 'visuals' | 'metronome' | 'interface'>('main');
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [currentDynamicBPM, setCurrentDynamicBPM] = useState(initialSettings.metronomeBPM);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const metronomeTimeoutRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const beatCounterRef = useRef(0);
  const measureCounterRef = useRef(0);
  const currentBPMRef = useRef(initialSettings.startBPM);
  
  // Refs for stateful, resettable animation
  const lastTimestampRef = useRef<number | null>(null);
  const breathPhaseRef = useRef(0);
  const curvePhaseRef = useRef(0);
  const colorPhaseRef = useRef(0);
  const animationKeyRef = useRef(0);


  const {
    rotationSpeed, pulseSpeed, minRadius, maxRadius,
    breathSpeed, minBreathPercent, maxBreathPercent,
    maxCurveRadius, curveSpeed, invertPulsePhase,
    eyeAngleOffset, borderWidth, eyeColorInversion,
    eyeColorSpeed, bgLightness, bgWarmth, glowSize,
    metronomeEnabled, metronomeBPM, metronomeSoundKit,
    beatsPerMeasure, accentPattern, panelOpacity, panelBlur,
    syncBreathWithMetronome, syncMultiplier,
    speedTrainerEnabled, startBPM, targetBPM, increaseBy, everyNMeasures
  } = settings;

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setCustomPresets(JSON.parse(storedPresets));
      }
    } catch (error)
    {
      console.error("Failed to load custom presets:", error);
    }
  }, []);
  
  // Metronome effect using recursive setTimeout for dynamic interval
  const playSound = useCallback((beatIndex: number) => {
    const audioCtx = audioCtxRef.current;
    if (!audioCtx) return;

    const accent = accentPattern[beatIndex];
    if (accent === 'skip') return;
    const time = audioCtx.currentTime;

    switch (metronomeSoundKit) {
        case 'marimba': {
            const baseFreq = 261.63; // C4
            const scale = [0, 4, 7]; // Major triad intervals (in semitones)
            const semitone = Math.pow(2, 1 / 12);
            const noteIndex = beatIndex % 3;
            const freq = baseFreq * Math.pow(semitone, scale[noteIndex]);

            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);

            const osc2 = audioCtx.createOscillator();
            osc2.connect(gainNode);
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(freq * 2.01, time); 

            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.4, time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.8);

            osc.start(time);
            osc2.start(time);
            osc.stop(time + 1);
            osc2.stop(time + 1);
            break;
        }
        case 'jazz_ride': {
             const playRide = () => {
                const bufferSize = audioCtx.sampleRate * 0.5;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = buffer.getChannelData(0);

                const freqs = [220, 550, 880, 1320, 1600, 2400, 3200, 4800, 6000];
                const decays = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45];
                const amps = [0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0.05];

                for (let i = 0; i < bufferSize; i++) {
                    let value = 0;
                    const t = i / audioCtx.sampleRate;
                    for (let j = 0; j < freqs.length; j++) {
                        value += amps[j] * Math.sin(2 * Math.PI * freqs[j] * t) * Math.exp(-t / decays[j]);
                    }
                    output[i] = value * 0.5;
                }
                 for (let i = 0; i < bufferSize; i++) {
                    output[i] += (Math.random() * 2 - 1) * 0.01;
                }

                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const highpass = audioCtx.createBiquadFilter();
                highpass.type = 'highpass';
                highpass.frequency.value = 400;

                const gainNode = audioCtx.createGain();
                source.connect(highpass).connect(gainNode).connect(audioCtx.destination);
                gainNode.gain.setValueAtTime(0.3, time);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
                source.start(time);
            };
            const playBrushSnare = () => {
                 const bufferSize = audioCtx.sampleRate * 0.2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const gainNode = audioCtx.createGain();
                source.connect(gainNode).connect(audioCtx.destination);
                gainNode.gain.setValueAtTime(0.1, time);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
                source.start(time);
            };
            
            if (accent === 'accent2') {
                playBrushSnare();
            } else {
                playRide();
            }
            break;
        }
        case 'beep': {
            const freq = accent === 'accent1' ? 880 : accent === 'accent2' ? 660 : 440;
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, time);
            gainNode.gain.setValueAtTime(0.3, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
            oscillator.start(time);
            oscillator.stop(time + 0.1);
            break;
        }
        case 'drum': {
            if (accent === 'standard') { // Hi-hat
                const bufferSize = audioCtx.sampleRate * 0.1;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
                
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 7000;
                const gainNode = audioCtx.createGain();
                
                source.connect(filter).connect(gainNode).connect(audioCtx.destination);
                gainNode.gain.setValueAtTime(0.2, time);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
                source.start(time);
            } else if (accent === 'accent2') { // Snare
                const bufferSize = audioCtx.sampleRate * 0.2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
                
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const gainNode = audioCtx.createGain();
                source.connect(gainNode).connect(audioCtx.destination);
                gainNode.gain.setValueAtTime(0.3, time);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
                source.start(time);
            } else { // Kick (accent1)
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode).connect(audioCtx.destination);
                oscillator.frequency.setValueAtTime(150, time);
                oscillator.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
                gainNode.gain.setValueAtTime(0.8, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
                oscillator.start(time);
                oscillator.stop(time + 0.15);
            }
            break;
        }
        case 'jazz': {
            const playBrush = () => {
                const bufferSize = audioCtx.sampleRate * 0.3;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = buffer.getChannelData(0);
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    output[i] = (lastOut + (0.02 * white)) / 1.02;
                    lastOut = output[i];
                    output[i] *= 3.5; // boost
                }
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const bandpass = audioCtx.createBiquadFilter();
                bandpass.type = 'bandpass';
                bandpass.frequency.value = 6000;
                bandpass.Q.value = 0.5;
                const highpass = audioCtx.createBiquadFilter();
                highpass.type = 'highpass';
                highpass.frequency.value = 300;
                const gainNode = audioCtx.createGain();
                source.connect(bandpass).connect(highpass).connect(gainNode).connect(audioCtx.destination);
                gainNode.gain.setValueAtTime(0, time);
                gainNode.gain.linearRampToValueAtTime(0.15, time + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
                source.start(time);
            };
        
            const playKick = () => {
                const oscillator = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                oscillator.connect(gainNode).connect(audioCtx.destination);
                oscillator.frequency.setValueAtTime(150, time);
                oscillator.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
                gainNode.gain.setValueAtTime(0.6, time);
                gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
                oscillator.start(time);
                oscillator.stop(time + 0.15);
            };
        
            const playSnare = () => {
                const bufferSize = audioCtx.sampleRate * 0.2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const output = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) { output[i] = Math.random() * 2 - 1; }
                
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const gainNode = audioCtx.createGain();
                source.connect(gainNode).connect(audioCtx.destination);
                gainNode.gain.setValueAtTime(0.08, time);
                gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
                source.start(time);
            };
        
            playBrush();
            if (accent === 'accent1') {
                playKick();
            } else if (accent === 'accent2') {
                playSnare();
            }
            break;
        }
        case 'drops': {
            const freq = accent === 'accent1' ? 600 : accent === 'accent2' ? 700 : 650;
            const gainVal = accent === 'accent1' ? 0.4 : 0.3;
            const decay = accent === 'accent1' ? 0.3 : 0.2;
            
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            
            osc.frequency.setValueAtTime(freq * 2.5, time);
            osc.frequency.exponentialRampToValueAtTime(freq, time + 0.05);

            gainNode.gain.setValueAtTime(gainVal, time);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + decay);
            
            osc.start(time);
            osc.stop(time + decay + 0.1);
            break;
        }
        case 'click':
        default: {
            const freq = accent === 'accent1' ? 1200 : accent === 'accent2' ? 1000 : 800;
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            oscillator.connect(gainNode).connect(audioCtx.destination);
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(freq, time);
            gainNode.gain.setValueAtTime(0.4, time);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
            oscillator.start(time);
            oscillator.stop(time + 0.05);
            break;
        }
    }
  }, [accentPattern, metronomeSoundKit]);


  useEffect(() => {
    const clearMetronome = () => {
      if (metronomeTimeoutRef.current) {
        clearTimeout(metronomeTimeoutRef.current);
        metronomeTimeoutRef.current = null;
      }
      setCurrentBeat(null);
    };

    if (!metronomeEnabled) {
      clearMetronome();
      return;
    }

    // Reset counters and BPM on start
    beatCounterRef.current = -1;
    measureCounterRef.current = 0;
    currentBPMRef.current = speedTrainerEnabled ? startBPM : metronomeBPM;
    setCurrentDynamicBPM(currentBPMRef.current);


    const tick = () => {
      // --- Update Beat and Measure Counters ---
      beatCounterRef.current = (beatCounterRef.current + 1) % beatsPerMeasure;
      if (beatCounterRef.current === 0) {
        measureCounterRef.current++;
      }

      // --- Play Sound ---
      playSound(beatCounterRef.current);
      setCurrentBeat(beatCounterRef.current);

      // --- Speed Trainer Logic ---
      if (speedTrainerEnabled) {
        // Check if a BPM update is due
        if (measureCounterRef.current > 0 && measureCounterRef.current % everyNMeasures === 0 && beatCounterRef.current === 0) {
          const isAccelerating = targetBPM > startBPM;
          let nextBPM = currentBPMRef.current + (isAccelerating ? increaseBy : -increaseBy);

          if (isAccelerating) {
            nextBPM = Math.min(nextBPM, targetBPM);
          } else {
            nextBPM = Math.max(nextBPM, targetBPM);
          }
          
          if(nextBPM !== currentBPMRef.current) {
            currentBPMRef.current = nextBPM;
            setCurrentDynamicBPM(nextBPM);
          }
        }
      } else {
        // Ensure BPM is correct in normal mode
        if (currentBPMRef.current !== metronomeBPM) {
            currentBPMRef.current = metronomeBPM;
            setCurrentDynamicBPM(metronomeBPM);
        }
      }

      // --- Schedule Next Tick ---
      const interval = (60 / currentBPMRef.current) * 1000;
      metronomeTimeoutRef.current = window.setTimeout(tick, interval);
    };

    tick(); // Start the metronome

    return clearMetronome;
  }, [
    metronomeEnabled, metronomeBPM, beatsPerMeasure, playSound,
    speedTrainerEnabled, startBPM, targetBPM, increaseBy, everyNMeasures
  ]);

  // Sync Breath Speed with Metronome
  useEffect(() => {
    if (syncBreathWithMetronome) {
        const bpmForSync = speedTrainerEnabled ? currentDynamicBPM : metronomeBPM;
        const measureDurationSeconds = (60 / bpmForSync) * beatsPerMeasure;
        const newBreathSpeed = measureDurationSeconds * syncMultiplier;
        if (Math.abs(settings.breathSpeed - newBreathSpeed) > 0.01) {
            setSettings(prev => ({ ...prev, breathSpeed: parseFloat(newBreathSpeed.toFixed(2)) }));
        }
    }
  }, [metronomeBPM, currentDynamicBPM, beatsPerMeasure, syncBreathWithMetronome, syncMultiplier, speedTrainerEnabled, settings.breathSpeed]);

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({width: window.innerWidth, height: window.innerHeight});
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleRestart = () => {
    animationKeyRef.current += 1; // Use ref to trigger restart
    lastTimestampRef.current = null;
    breathPhaseRef.current = 0;
    curvePhaseRef.current = 0;
    colorPhaseRef.current = 0;
  };

  useEffect(() => {
    let animationFrameId: number;
    
    const COLORS = {
      dark: '#000000',
      light: '#ffffff',
    };

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      // Update phases based on delta time and current speed settings
      // This allows for smooth speed changes without resetting the animation
      if (breathSpeed > 0) {
        breathPhaseRef.current = (breathPhaseRef.current + deltaTime / (breathSpeed * 1000)) % 1;
      }
      if (curveSpeed > 0) {
        curvePhaseRef.current = (curvePhaseRef.current + deltaTime / (curveSpeed * 1000)) % 1;
      }
      if (eyeColorSpeed > 0) {
        colorPhaseRef.current = (colorPhaseRef.current + deltaTime / (eyeColorSpeed * 1000)) % 1;
      }
      
      const minScale = minBreathPercent / maxBreathPercent;
      const breathEasedValue = (1 - Math.cos(breathPhaseRef.current * 2 * Math.PI)) / 2;
      const currentScale = lerp(minScale, 1.0, breathEasedValue);
      setAnimatedScale(currentScale);

      const curveEasedValue = Math.pow(Math.sin(curvePhaseRef.current * Math.PI), 4);
      const curveRange = maxCurveRadius - 25;
      const currentRadius = 25 + (curveRange * curveEasedValue);
      setAnimatedCurveRadius(currentRadius);

      const easedColorValue = (1 - Math.cos(colorPhaseRef.current * 2 * Math.PI)) / 2;
      const inversionAmount = eyeColorInversion / 100;
      const colorInversionFactor = easedColorValue * inversionAmount;

      const darkEyeColor = lerpColor(COLORS.dark, COLORS.light, colorInversionFactor);
      const lightEyeColor = lerpColor(COLORS.light, COLORS.dark, colorInversionFactor);

      setAnimatedDarkEyeColor(darkEyeColor);
      setAnimatedLightEyeColor(lightEyeColor);

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [
      minBreathPercent, maxBreathPercent, maxCurveRadius, eyeColorInversion, 
      breathSpeed, curveSpeed, eyeColorSpeed // Keep speeds here to update phase calculation
  ]);


  useEffect(() => {
    if (bgLightness < 50) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [bgLightness]);
  
  const handleExportHtml = () => {
    // This function exports a simplified version and does not include the new metronome features.
    // It's kept for basic animation export functionality.
    const generatedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yin-Yang Animation</title>
    <style>
        body { margin: 0; overflow: hidden; transition: background-color 0.5s; }
        main { position: relative; display: flex; align-items: center; justify-content: center; min-height: 100vh; width: 100%; }
        @keyframes spin-continuous { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-continuous { animation: spin-continuous linear infinite; }
    </style>
</head>
<body>
    <div id="start-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); color:white; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:2rem; cursor:pointer; z-index:100; text-align: center;">Click to Begin</div>
    <main id="main-container"></main>
    <script>
        const overlay = document.getElementById('start-overlay');
        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            
            const settings = ${JSON.stringify(settings)};
            
            const hexToRgb = (hex) => {
                const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
                return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
            };
            const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
            const lerp = (a, b, t) => a * (1 - t) + b * t;
            const lerpColor = (colorA, colorB, amount) => {
                const rgbA = hexToRgb(colorA); const rgbB = hexToRgb(colorB);
                if (!rgbA || !rgbB) return colorA;
                const r = Math.round(lerp(rgbA.r, rgbB.r, amount));
                const g = Math.round(lerp(rgbA.g, rgbB.g, amount));
                const b = Math.round(lerp(rgbA.b, rgbB.b, amount));
                return rgbToHex(r, g, b);
            };

            const main = document.getElementById('main-container');
            const glowElement = document.createElement('div');
            const symbolWrapper = document.createElement('div');
            const breathWrapper = document.createElement('div');
            const rotationWrapper = document.createElement('div');
            const svgContainer = document.createElement('div');
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            const bgCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const whitePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            const eyeGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const darkEyeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            const lightEyeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");

            main.append(glowElement, symbolWrapper);
            symbolWrapper.append(breathWrapper);
            breathWrapper.append(rotationWrapper);
            rotationWrapper.append(svgContainer);
            svgContainer.append(svg);
            svg.append(bgCircle, whitePath, eyeGroup);
            eyeGroup.append(darkEyeCircle, lightEyeCircle);

            const center = 50; const mainRadius = 50 - (settings.borderWidth / 2);
            const eyeCenterYTop = -mainRadius / 2; const eyeCenterYBottom = mainRadius / 2;

            symbolWrapper.style.position = 'relative'; symbolWrapper.style.display = 'flex';
            symbolWrapper.style.alignItems = 'center'; symbolWrapper.style.justifyContent = 'center';
            svgContainer.style.position = 'relative'; svgContainer.style.borderRadius = '9999px'; svgContainer.style.overflow = 'hidden';
            rotationWrapper.className = 'animate-spin-continuous'; rotationWrapper.style.animationDuration = settings.rotationSpeed + 's';
            svg.setAttribute('viewBox', '0 0 100 100'); svg.style.width = '100%'; svg.style.height = '100%';
            bgCircle.setAttribute('cx', center); bgCircle.setAttribute('cy', center); bgCircle.setAttribute('r', mainRadius);
            bgCircle.setAttribute('fill', '#000000'); bgCircle.setAttribute('stroke', '#000000'); bgCircle.setAttribute('stroke-width', settings.borderWidth);
            whitePath.setAttribute('fill', '#ffffff');
            eyeGroup.setAttribute('transform', \`translate(\${center} \${center}) rotate(\${settings.eyeAngleOffset})\`);
            darkEyeCircle.setAttribute('cx', 0); darkEyeCircle.setAttribute('cy', eyeCenterYTop);
            darkEyeCircle.setAttribute('r', settings.maxRadius);
            darkEyeCircle.style.transformOrigin = \`0px \${eyeCenterYTop}px\`;
            lightEyeCircle.setAttribute('cx', 0); lightEyeCircle.setAttribute('cy', eyeCenterYBottom);
            lightEyeCircle.setAttribute('r', settings.maxRadius);
            lightEyeCircle.style.transformOrigin = \`0px \${eyeCenterYBottom}px\`;

            let startTime = 0;
            function animate(timestamp) {
                if (!startTime) startTime = timestamp;
                const elapsed = timestamp - startTime;
                const viewportMin = Math.min(window.innerWidth, window.innerHeight);
                const baseSize = (settings.maxBreathPercent / 100) * viewportMin * 0.9;
                const minScale = settings.minBreathPercent / settings.maxBreathPercent;
                const breathPeriod = settings.breathSpeed * 1000;
                const breathPhase = (elapsed % breathPeriod) / breathPeriod;
                const breathEasedValue = (1 - Math.cos(breathPhase * 2 * Math.PI)) / 2;
                const currentScale = lerp(minScale, 1.0, breathEasedValue);
                const curvePeriod = settings.curveSpeed * 1000;
                const curvePhase = (elapsed % curvePeriod) / curvePeriod;
                const curveEasedValue = Math.pow(Math.sin(curvePhase * Math.PI), 4);
                const currentRadius = 25 + ((settings.maxCurveRadius - 25) * curveEasedValue);
                const pathD = \`M\${center},\${center + mainRadius} A\${currentRadius} \${currentRadius} 0 0 0 \${center} \${center} A\${currentRadius} \${currentRadius} 0 0 1 \${center} \${center - mainRadius} A\${mainRadius} \${mainRadius} 0 0 1 \${center} \${center + mainRadius} Z\`;
                const colorPeriod = settings.eyeColorSpeed * 1000;
                const colorPhase = (elapsed % colorPeriod) / colorPeriod;
                const easedColorValue = (1 - Math.cos(colorPhase * 2 * Math.PI)) / 2;
                const colorInversionFactor = easedColorValue * (settings.eyeColorInversion / 100);
                const darkEyeColor = lerpColor('#000000', '#ffffff', colorInversionFactor);
                const lightEyeColor = lerpColor('#ffffff', '#dark', colorInversionFactor);
                const pulsePeriod = settings.pulseSpeed * 1000;
                const minEyeScale = settings.minRadius / settings.maxRadius;
                const darkEyePhase = (elapsed % pulsePeriod) / pulsePeriod;
                const darkEyeEasedValue = (1 - Math.cos(darkEyePhase * 2 * Math.PI)) / 2;
                const darkEyeScale = lerp(minEyeScale, 1, darkEyeEasedValue);
                const lightEyeElapsed = settings.invertPulsePhase ? elapsed + (pulsePeriod / 2) : elapsed;
                const lightEyePhase = (lightEyeElapsed % pulsePeriod) / pulsePeriod;
                const lightEyeEasedValue = (1 - Math.cos(lightEyePhase * 2 * Math.PI)) / 2;
                const lightEyeScale = lerp(minEyeScale, 1, lightEyeEasedValue);
                symbolWrapper.style.width = \`\${baseSize}px\`; symbolWrapper.style.height = \`\${baseSize}px\`;
                svgContainer.style.width = \`\${baseSize}px\`; svgContainer.style.height = \`\${baseSize}px\`;
                breathWrapper.style.transform = \`scale(\${currentScale})\`; whitePath.setAttribute('d', pathD);
                darkEyeCircle.setAttribute('fill', darkEyeColor);
                darkEyeCircle.style.transform = \`scale(\${darkEyeScale})\`;
                lightEyeCircle.setAttribute('fill', lightEyeColor);
                lightEyeCircle.style.transform = \`scale(\${lightEyeScale})\`;
                const warmthFactor = (settings.bgWarmth - 50) / 50; const saturation = Math.abs(warmthFactor) * 40;
                const hue = warmthFactor > 0 ? 40 : 220;
                main.style.backgroundColor = \`hsl(\${hue}, \${saturation}%, \${settings.bgLightness}%)\`;
                const glowColor = settings.bgLightness < 50 ? 'rgba(203, 213, 225, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                const blurRadius = (settings.glowSize / 100) * 150;
                const baseSpread = (settings.glowSize / 100) * 20;
                const spreadRadius = baseSpread;
                glowElement.style.cssText = \`width: \${baseSize}px; height: \${baseSize}px; box-shadow: 0 0 \${blurRadius}px \${spreadRadius}px \${glowColor}; border-radius: 50%; position: absolute; opacity: \${settings.glowSize > 0 ? 1 : 0}; transition: opacity 0.3s, box-shadow 0.1s; transform: scale(\${currentScale});\`;
                requestAnimationFrame(animate);
            }
            requestAnimationFrame(animate);
        }, { once: true });
    <\/script>
</body>
</html>`;
    const blob = new Blob([generatedHtml.trim()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yin-yang-animation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleSettingChange = (key: keyof Settings, value: any) => {
    if (key === 'metronomeEnabled') {
      if (value === true) {
        handleRestart();
        const initializeAndStart = async () => {
          try {
            if (!audioCtxRef.current) {
              audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
              await audioCtxRef.current.resume();
            }
            setSettings(prev => ({ ...prev, metronomeEnabled: true }));
          } catch (error) {
            console.error("Failed to initialize or resume AudioContext:", error);
            alert("Could not start audio. Please interact with the page and try again.");
          }
        };
        initializeAndStart();
      } else {
        setSettings(prev => ({ ...prev, metronomeEnabled: false }));
      }
      setSelectedPreset('');
      return;
    }

    if (key === 'breathSpeed' && settings.syncBreathWithMetronome) {
        setSettings(prev => ({ ...prev, breathSpeed: value, syncBreathWithMetronome: false }));
        setSelectedPreset('');
        return;
    }

    setSettings(prev => ({ ...prev, [key]: value }));
    setSelectedPreset('');
  };

  const handleMinRadiusChange = (value: number) => {
    handleSettingChange('minRadius', Math.min(value, maxRadius));
  };
  
  const handleMaxRadiusChange = (value: number) => {
    handleSettingChange('maxRadius', Math.max(value, minRadius));
  };

  const handleMinBreathPercentChange = (value: number) => {
    handleSettingChange('minBreathPercent', Math.min(value, maxBreathPercent));
  };

  const handleMaxBreathPercentChange = (value: number) => {
    handleSettingChange('maxBreathPercent', Math.max(value, minBreathPercent));
  };

  const applyPreset = (presetSettings: Settings) => {
    setSettings(presetSettings);
    handleRestart();
  };

  const savePreset = () => {
    const trimmedName = newPresetName.trim();
    if (!trimmedName) return;

    const isNameTaken = defaultPresets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase()) ||
                        customPresets.some(p => p.name.toLowerCase() === trimmedName.toLowerCase());
    
    if (isNameTaken) {
      alert('Preset name already exists. Please choose a different name.');
      return;
    }

    const newPreset: Preset = { name: trimmedName, settings };
    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
    setNewPresetName('');
  };

  const deletePreset = (nameToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the "${nameToDelete}" preset?`)) {
      const updatedPresets = customPresets.filter(p => p.name !== nameToDelete);
      setCustomPresets(updatedPresets);
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
      setSelectedPreset('');
    }
  };

  const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedPreset(value);
    
    if (!value) return;

    const [type, name] = value.split(':');
    const presetList = type === 'default' ? defaultPresets : customPresets;
    const preset = presetList.find(p => p.name === name);

    if (preset) {
      applyPreset(preset.settings);
    }
  };

  const handleDeleteSelectedPreset = () => {
    if (!selectedPreset || !selectedPreset.startsWith('custom:')) return;
    const name = selectedPreset.split(':')[1];
    deletePreset(name);
  };
  
  const handleTouchStart = (e: React.TouchEvent) => {
      if (panelRef.current && panelRef.current.contains(e.target as Node)) {
          setTouchStartY(e.targetTouches[0].clientY);
      }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartY === null) return;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = touchEndY - touchStartY;
      if (deltaY > 50) {
          setIsPanelOpen(false);
      }
      setTouchStartY(null);
  };
  
  const cycleAccent = (currentAccent: AccentType): AccentType => {
      const cycle: AccentType[] = ['standard', 'accent1', 'accent2', 'skip'];
      const currentIndex = cycle.indexOf(currentAccent);
      const nextIndex = (currentIndex + 1) % cycle.length;
      return cycle[nextIndex];
  };

  const handleAccentChange = (index: number) => {
    const newPattern = [...settings.accentPattern];
    newPattern[index] = cycleAccent(newPattern[index]);
    handleSettingChange('accentPattern', newPattern);
  };

  const handleBeatsPerMeasureChange = (newBeats: number) => {
    const safeBeats = Math.max(1, Math.min(16, newBeats));
    const oldPattern = settings.accentPattern;
    const newPattern: AccentType[] = [];
    for (let i = 0; i < safeBeats; i++) {
        newPattern.push(oldPattern[i] || (i === 0 ? 'accent1' : 'standard'));
    }
    if (newPattern.length > 0 && !newPattern.includes('accent1')) {
        newPattern[0] = 'accent1';
    }
    setSettings(prev => ({ ...prev, beatsPerMeasure: safeBeats, accentPattern: newPattern }));
    setSelectedPreset('');
  };
  
  const calculateTimeToTarget = () => {
    if (!speedTrainerEnabled || increaseBy <= 0 || (startBPM >= targetBPM && increaseBy > 0) || (startBPM <= targetBPM && increaseBy < 0)) {
        return null;
    }
    let totalSeconds = 0;
    let currentBpm = startBPM;
    const isAccelerating = targetBPM > startBPM;

    while (isAccelerating ? currentBpm < targetBPM : currentBpm > targetBPM) {
        const secondsPerMeasure = (60 / currentBpm) * beatsPerMeasure;
        totalSeconds += secondsPerMeasure * everyNMeasures;
        currentBpm += isAccelerating ? increaseBy : -increaseBy;
    }

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.round(totalSeconds % 60);
    return `Approx. ${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''} taken to reach ${targetBPM} BPM`;
  };

  const baseSize = (maxBreathPercent / 100) * Math.min(viewportSize.width, viewportSize.height) * 0.9;

  const warmthFactor = (bgWarmth - 50) / 50;
  const saturation = Math.abs(warmthFactor) * 40;
  const hue = warmthFactor > 0 ? 40 : 220;
  const bgColor = `hsl(${hue}, ${saturation}%, ${bgLightness}%)`;

  const glowColor = bgLightness < 50 ? 'rgba(203, 213, 225, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  const blurRadius = (glowSize / 100) * 150;
  
  const baseSpreadRadius = (glowSize / 100) * 20;
  const spreadRadius = baseSpreadRadius;

  const glowStyle = {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    boxShadow: `0 0 ${blurRadius}px ${spreadRadius}px ${glowColor}`,
    borderRadius: '50%',
    position: 'absolute' as 'absolute',
    opacity: glowSize > 0 ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out, box-shadow 0.1s ease-in-out',
  };

  const panelStyle = {
    backgroundColor: bgLightness >= 50 
      ? `rgba(255, 255, 255, ${panelOpacity / 100})` 
      : `rgba(30, 41, 59, ${panelOpacity / 100})`,
    backdropFilter: `blur(${panelBlur}px)`,
    WebkitBackdropFilter: `blur(${panelBlur}px)`,
  };
  
  const renderPanelContent = () => {
    switch(panelView) {
      case 'interface':
        return (
          <>
            <div className="pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <button onClick={() => setPanelView('main')} className="flex items-center gap-2 w-full text-left text-xl font-bold text-slate-800 dark:text-slate-200 p-2 -ml-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Back to main menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Interface Settings</span>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6 pt-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Panel Opacity ({panelOpacity}%)
                </label>
                <input
                  type="range" min="20" max="100" value={panelOpacity}
                  onChange={(e) => handleSettingChange('panelOpacity', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Panel Blur ({panelBlur}px)
                </label>
                <input
                  type="range" min="0" max="40" value={panelBlur}
                  onChange={(e) => handleSettingChange('panelBlur', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </>
        );
      case 'visuals':
        return (
          <>
            <div className="pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <button onClick={() => setPanelView('main')} className="flex items-center gap-2 w-full text-left text-xl font-bold text-slate-800 dark:text-slate-200 p-2 -ml-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Back to main menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Visual Settings</span>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Rotation Speed ({rotationSpeed}s)
                </label>
                <input
                  type="range" min="2" max="180" value={rotationSpeed}
                  onChange={(e) => handleSettingChange('rotationSpeed', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <hr className="border-slate-200/50 dark:border-slate-700/50 my-6" />
                <p className="text-center font-semibold text-slate-700 dark:text-slate-300 mb-4">Main Symbol</p>
                <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Border Width ({borderWidth.toFixed(1)})
                </label>
                <input
                  type="range" min="0" max="5" step="0.1" value={borderWidth}
                  onChange={(e) => handleSettingChange('borderWidth', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Glow Spread ({glowSize}%)
                </label>
                <input
                  type="range" min="0" max="100" value={glowSize}
                  onChange={(e) => handleSettingChange('glowSize', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Breath Speed ({breathSpeed}s)
                    {syncBreathWithMetronome && <span className="text-xs text-blue-500 dark:text-blue-400 ml-2">(Synced)</span>}
                </label>
                <input
                  type="range" min="1" max="180" value={breathSpeed}
                  onChange={(e) => handleSettingChange('breathSpeed', Number(e.target.value))}
                  disabled={syncBreathWithMetronome}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Min Breath Size ({minBreathPercent}%)
                </label>
                <input
                  type="range" min="10" max="99" step="1" value={minBreathPercent}
                  onChange={(e) => handleMinBreathPercentChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Max Breath Size ({maxBreathPercent}%)
                </label>
                <input
                  type="range" min="10" max="99" step="1" value={maxBreathPercent}
                  onChange={(e) => handleMaxBreathPercentChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Curve Speed ({curveSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={curveSpeed}
                  onChange={(e) => handleSettingChange('curveSpeed', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Max Curve Radius ({maxCurveRadius.toFixed(1)})
                </label>
                <input
                  type="range" min="25" max="35" step="0.1" value={maxCurveRadius}
                  onChange={(e) => handleSettingChange('maxCurveRadius', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
                <hr className="border-slate-200/50 dark:border-slate-700/50 my-6" />
                <p className="text-center font-semibold text-slate-700 dark:text-slate-300 mb-4">Eyes Pulse</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Pulse Speed ({pulseSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={pulseSpeed}
                  onChange={(e) => handleSettingChange('pulseSpeed', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Min Radius ({minRadius.toFixed(1)})
                </label>
                <input
                  type="range" min="1" max="15" step="0.5" value={minRadius}
                  onChange={(e) => handleMinRadiusChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Max Radius ({maxRadius.toFixed(1)})
                </label>
                <input
                  type="range" min="1" max="15" step="0.5" value={maxRadius}
                  onChange={(e) => handleMaxRadiusChange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Angle Offset ({eyeAngleOffset.toFixed(0)}°)
                </label>
                <input
                  type="range" min="-45" max="45" value={eyeAngleOffset}
                  onChange={(e) => handleSettingChange('eyeAngleOffset', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Eye Color Inversion ({eyeColorInversion}%)
                </label>
                <input
                  type="range" min="0" max="100" value={eyeColorInversion}
                  onChange={(e) => handleSettingChange('eyeColorInversion', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Inversion Speed ({eyeColorSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={eyeColorSpeed}
                  onChange={(e) => handleSettingChange('eyeColorSpeed', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
                <div className="pt-2 mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={invertPulsePhase}
                    onChange={(e) => handleSettingChange('invertPulsePhase', e.target.checked)}
                    className="h-4 w-4 text-slate-600 bg-slate-100 border-slate-300 rounded focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-slate-600"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invert Pulse Phase
                  </span>
                </label>
              </div>
              <hr className="border-slate-200/50 dark:border-slate-700/50 my-6" />
                <p className="text-center font-semibold text-slate-700 dark:text-slate-300 mb-4">Background</p>
                <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Lightness ({bgLightness}%)
                </label>
                <input
                  type="range" min="0" max="100" value={bgLightness}
                  onChange={(e) => handleSettingChange('bgLightness', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
                <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Warmth ({bgWarmth}%)
                </label>
                <input
                  type="range" min="0" max="100" value={bgWarmth}
                  onChange={(e) => handleSettingChange('bgWarmth', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            <div className="pt-4 mt-auto">
              <button
                onClick={handleRestart}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors"
              >
                Restart Animation
              </button>
            </div>
          </>
        );
      case 'metronome':
        const timeToTargetStr = calculateTimeToTarget();
        return (
          <>
            <div className="pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <button onClick={() => setPanelView('main')} className="flex items-center gap-2 w-full text-left text-xl font-bold text-slate-800 dark:text-slate-200 p-2 -ml-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Back to main menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Metronome</span>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6 flex flex-col">
              <button
                onClick={() => handleSettingChange('metronomeEnabled', !metronomeEnabled)}
                className={`w-full py-3 rounded-xl text-white text-xl font-bold transition-all duration-150 flex items-center justify-center shadow-lg
                            ${metronomeEnabled 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'}`}
                aria-label={metronomeEnabled ? 'Stop Metronome' : 'Start Metronome'}
              >
                {metronomeEnabled ? 'Stop' : 'Start'}
              </button>
              
              <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Accent Pattern</label>
                    <div className="grid grid-cols-4 gap-3">
                      {accentPattern.map((accent, index) => (
                        <button
                          key={index}
                          onClick={() => handleAccentChange(index)}
                          className={`relative w-full aspect-square rounded-xl text-white text-xl font-bold transition-all duration-150 flex items-center justify-center
                                      ${ACCENT_CONFIG[accent].color} 
                                      ${currentBeat === index ? `ring-4 ${ACCENT_CONFIG[accent].ringColor}` : 'ring-0'}`}
                          title={ACCENT_CONFIG[accent].label}
                          aria-label={`Beat ${index + 1}: ${ACCENT_CONFIG[accent].label}. Click to change.`}
                        >
                        <span className="drop-shadow-sm">{index + 1}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label htmlFor="beats-per-measure" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Beats
                          </label>
                          <select
                              id="beats-per-measure"
                              value={beatsPerMeasure}
                              onChange={(e) => handleBeatsPerMeasureChange(Number(e.target.value))}
                              className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                          >
                              {[...Array(15)].map((_, i) => <option key={i+2} value={i+2}>{i+2}</option>)}
                          </select>
                      </div>
                      <div>
                          <label htmlFor="metronome-sound" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Sound Kit
                          </label>
                          <select
                              id="metronome-sound"
                              value={metronomeSoundKit}
                              onChange={(e) => handleSettingChange('metronomeSoundKit', e.target.value as MetronomeSoundKit)}
                              className="w-full px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                          >
                              <option value="click">Click</option>
                              <option value="beep">Beep</option>
                              <option value="drum">Drum Kit</option>
                              <option value="jazz">Jazz Drums</option>
                              <option value="jazz_ride">Jazz Ride</option>
                              <option value="drops">Water Drops</option>
                              <option value="marimba">Marimba</option>
                          </select>
                      </div>
                  </div>
                
                <hr className="border-slate-200/50 dark:border-slate-700/50" />
                
                <div className="flex items-center justify-between">
                    <label className="font-medium text-slate-800 dark:text-slate-200">Speed Trainer</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={speedTrainerEnabled} onChange={(e) => handleSettingChange('speedTrainerEnabled', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {speedTrainerEnabled ? (
                    <div className="space-y-4 p-4 bg-slate-500/10 rounded-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <NumberInput label="Start BPM" value={startBPM} onChange={v => handleSettingChange('startBPM', v)} min={20} max={400} step={1} />
                        <NumberInput label="Target BPM" value={targetBPM} onChange={v => handleSettingChange('targetBPM', v)} min={20} max={400} step={1} />
                        <NumberInput label="Increase By" value={increaseBy} onChange={v => handleSettingChange('increaseBy', v)} min={1} max={50} step={1} />
                        <NumberInput label="Every Bar" value={everyNMeasures} onChange={v => handleSettingChange('everyNMeasures', v)} min={1} max={32} step={1} />
                      </div>
                      {timeToTargetStr && <p className="text-xs text-center text-slate-600 dark:text-slate-400 pt-2">{timeToTargetStr}</p>}
                    </div>
                ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                          BPM
                        </label>
                        <span className="text-lg font-mono font-semibold text-slate-800 dark:text-slate-200">{metronomeBPM}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <button onClick={() => handleSettingChange('metronomeBPM', Math.max(20, metronomeBPM - 1))} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">-</button>
                         <input
                          type="range" min="20" max="400" value={metronomeBPM}
                          onChange={(e) => handleSettingChange('metronomeBPM', Number(e.target.value))}
                          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                         <button onClick={() => handleSettingChange('metronomeBPM', Math.min(400, metronomeBPM + 1))} className="p-2 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">+</button>
                      </div>
                    </div>
                )}


                <hr className="border-slate-200/50 dark:border-slate-700/50" />
                
                <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={syncBreathWithMetronome}
                            onChange={(e) => handleSettingChange('syncBreathWithMetronome', e.target.checked)}
                            className="h-5 w-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-blue-600"
                        />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                            Sync with Breath Speed
                        </span>
                    </label>

                    {syncBreathWithMetronome && (
                    <div className="flex items-center gap-2">
                        <label htmlFor="sync-multiplier" className="font-medium text-slate-800 dark:text-slate-200">
                            X
                        </label>
                        <select
                            id="sync-multiplier"
                            value={syncMultiplier}
                            onChange={(e) => handleSettingChange('syncMultiplier', Number(e.target.value))}
                            className="w-20 px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        >
                            {[...Array(8)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </select>
                    </div>
                    )}
                </div>
              </div>
            </div>
          </>
        )
      default: // 'main'
        return (
          <>
            <div className="flex items-center pb-4 mb-4 border-b border-slate-200/50 dark:border-slate-700/50">
                <div className="w-8"> {/* Spacer to align title */}</div>
                <h2 className="text-xl font-bold text-center flex-grow text-slate-800 dark:text-slate-200">Settings</h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-slate-500/10 transition-colors" aria-label="Close settings panel">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pt-4 pr-2 -mr-4 space-y-4">
                <div>
                  <ul className="space-y-2">
                    <li>
                      <button onClick={() => setPanelView('visuals')} className="w-full flex justify-between items-center text-left p-4 rounded-xl hover:bg-slate-500/10 transition-colors bg-slate-500/5">
                          <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">Visual Effects</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                     <li>
                      <button onClick={() => setPanelView('metronome')} className="w-full flex justify-between items-center text-left p-4 rounded-xl hover:bg-slate-500/10 transition-colors bg-slate-500/5">
                          <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">Metronome</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setPanelView('interface')} className="w-full flex justify-between items-center text-left p-4 rounded-xl hover:bg-slate-500/10 transition-colors bg-slate-500/5">
                          <span className="font-semibold text-lg text-slate-800 dark:text-slate-200">Interface</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                  </ul>
                </div>
                <hr className="border-slate-200/50 dark:border-slate-700/50"/>
               <div>
                  <div className="space-y-2 mb-4">
                    <label htmlFor="preset-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Load Preset
                    </label>
                    <div className="flex gap-2 items-center">
                      <select
                        id="preset-select"
                        value={selectedPreset}
                        onChange={handlePresetSelect}
                        className="flex-grow min-w-0 px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        aria-label="Load a preset"
                      >
                        <option value="">Select a preset...</option>
                        {defaultPresets.map(p => <option key={p.name} value={`default:${p.name}`}>{p.name}</option>)}
                        {customPresets.length > 0 && (
                          <optgroup label="My Presets">
                            {customPresets.map(p => <option key={p.name} value={`custom:${p.name}`}>{p.name}</option>)}
                          </optgroup>
                        )}
                      </select>
                      <button 
                        onClick={handleDeleteSelectedPreset} 
                        disabled={!selectedPreset.startsWith('custom:')}
                        title="Delete selected custom preset"
                        aria-label="Delete selected custom preset"
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                           <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.347-9zm5.48.058a.75.75 0 10-1.499-.058l-.347 9a.75.75 0 001.5.058l.347-9z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2 pt-2">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Save Current Settings</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newPresetName} 
                        onChange={e => setNewPresetName(e.target.value)} 
                        placeholder="Preset name..." 
                        className="flex-grow min-w-0 px-3 py-2 bg-slate-200 dark:bg-slate-700 border border-slate-300/50 dark:border-slate-600/50 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none"
                        aria-label="New preset name"
                      />
                      <button 
                        onClick={savePreset} 
                        disabled={!newPresetName.trim()} 
                        title="Save current settings as a preset"
                        aria-label="Save current settings as a preset"
                        className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                      >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                          </svg>
                      </button>
                    </div>
                  </div>
                </div>
            </div>
            <div className="pt-4 mt-auto">
               <button
                onClick={handleExportHtml}
                className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors text-lg"
              >
                Export as HTML
              </button>
            </div>
          </>
        )
    }
  }


  return (
    <main 
      className={`relative flex items-center justify-center min-h-screen transition-colors duration-500 overflow-hidden`}
      style={{ backgroundColor: bgColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isPanelOpen && (
        <button
          onClick={() => {
            setIsPanelOpen(true);
            setPanelView('main'); // Reset to main view when opening
          }}
          className="fixed top-4 left-4 z-30 p-2 space-y-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-md border border-slate-200/50 dark:border-slate-700/50 transition-opacity hover:opacity-80"
          aria-label="Toggle settings panel"
        >
          <span className="block w-6 h-0.5 bg-slate-700 dark:bg-slate-300"></span>
          <span className="block w-6 h-0.5 bg-slate-700 dark:bg-slate-300"></span>
          <span className="block w-6 h-0.5 bg-slate-700 dark:bg-slate-300"></span>
        </button>
      )}
        
      {isPanelOpen && (
          <div 
              className="fixed inset-0 bg-black/30 z-10 transition-opacity duration-500" 
              onClick={() => setIsPanelOpen(false)}
              aria-hidden="true"
          ></div>
      )}

      {/* Settings Panel */}
      <div 
        ref={panelRef}
        className={`fixed z-20 transition-transform duration-500 ease-in-out 
                   sm:top-0 sm:left-0 sm:h-full sm:translate-y-0 ${isPanelOpen ? 'sm:translate-x-0' : 'sm:-translate-x-full'}
                   bottom-0 left-0 w-full h-[90vh] sm:h-full sm:w-80 md:w-96 rounded-t-3xl sm:rounded-none
                   ${isPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        <div 
            className="w-full h-full p-4 sm:p-6 border-t sm:border-t-0 sm:border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col"
            style={panelStyle}
        >
          <div className="w-12 h-1.5 bg-slate-400 rounded-full mx-auto mb-3 sm:hidden"></div>
          {renderPanelContent()}
        </div>
      </div>
        
      <div className={`transition-transform duration-500 ease-in-out flex items-center justify-center w-full h-full`}>
            <div 
              className="relative flex items-center justify-center"
              style={{ width: `${baseSize}px`, height: `${baseSize}px`}}
            >
              <div style={{ ...glowStyle, transform: `scale(${animatedScale})`}} />
              <div style={{ transform: `scale(${animatedScale})`}}>
                <YinYang 
                    key={animationKeyRef.current}
                    size={baseSize}
                    rotationSpeed={rotationSpeed} 
                    pulseSpeed={pulseSpeed} 
                    minRadius={minRadius} 
                    maxRadius={maxRadius}
                    curveRadius={animatedCurveRadius}
                    invertPulsePhase={invertPulsePhase}
                    eyeAngleOffset={eyeAngleOffset}
                    borderWidth={borderWidth}
                    darkEyeColor={animatedDarkEyeColor}
                    lightEyeColor={animatedLightEyeColor}
                />
              </div>
            </div>
        </div>
    </main>
  );
}

export default App;