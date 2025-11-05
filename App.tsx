import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- SVG Icon Components ---
const FullscreenEnterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="24px" height="24px" viewBox="0 0 16 16" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path fillRule="evenodd" d="M5.828 10.172a.5.5 0 0 0-.707 0l-4.096 4.096V11.5a.5.5 0 0 0-1 0v3.975a.5.5 0 0 0 .5.5H4.5a.5.5 0 0 0 0-1H1.732l4.096-4.096a.5.5 0 0 0 0-.707zm4.344 0a.5.5 0 0 1 .707 0l4.096 4.096V11.5a.5.5 0 1 1 1 0v3.975a.5.5 0 0 1-.5.5H11.5a.5.5 0 0 1 0-1h2.768l-4.096-4.096a.5.5 0 0 1 0-.707zm0-4.344a.5.5 0 0 0 .707 0l4.096-4.096V4.5a.5.5 0 1 0 1 0V.525a.5.5 0 0 0-.5-.5H11.5a.5.5 0 0 0 0 1h2.768l-4.096 4.096a.5.5 0 0 0 0 .707zm-4.344 0a.5.5 0 0 1-.707 0L1.025 1.732V4.5a.5.5 0 0 1-1 0V.525a.5.5 0 0 1 .5-.5H4.5a.5.5 0 0 1 0 1H1.732l4.096 4.096a.5.5 0 0 1 0 .707z"/>
    </svg>
);

const FullscreenExitIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg width="24px" height="24px" viewBox="0 0 1024 1024" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M391 240.9c-.8-6.6-8.9-9.4-13.6-4.7l-43.7 43.7L200 146.3a8.03 8.03 0 0 0-11.3 0l-42.4 42.3a8.03 8.03 0 0 0 0 11.3L280 333.6l-43.9 43.9a8.01 8.01 0 0 0 4.7 13.6L401 410c5.1.6 9.5-3.7 8.9-8.9L391 240.9zm10.1 373.2L240.8 633c-6.6.8-9.4 8.9-4.7 13.6l43.9 43.9L146.3 824a8.03 8.03 0 0 0 0 11.3l42.4 42.3c3.1 3.1 8.2 3.1 11.3 0L333.7 744l43.7 43.7A8.01 8.01 0 0 0 391 783l18.9-160.1c.6-5.1-3.7-9.4-8.8-8.8zm221.8-204.2L783.2 391c6.6-.8 9.4-8.9 4.7-13.6L744 333.6 877.7 200c3.1-3.1 3.1-8.2 0-11.3l-42.4-42.3a8.03 8.03 0 0 0-11.3 0L690.3 279.9l-43.7-43.7a8.01 8.01 0 0 0-13.6 4.7L614.1 401c-.6 5.2 3.7 9.5 8.8 8.9zM744 690.4l43.9-43.9a8.01 8.01 0 0 0-4.7-13.6L623 614c-5.1-.6-9.5 3.7-8.9 8.9L633 783.1c.8 6.6 8.9 9.4 13.6 4.7l43.7-43.7L824 877.7c3.1 3.1 8.2 3.1 11.3 0l42.4-42.3c3.1-3.1 3.1-8.2 0-11.3L744 690.4z"/>
    </svg>
);


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

  // Corrected color interpolation
  const r = Math.round(lerp(rgbA.r, rgbB.r, amount));
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

type MetronomeSoundKit = 'click' | 'beep' | 'drum' | 'jazz' | 'percussion' | 'marimba' | 'rock_drums';


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
  asymmetricBreathing: boolean;
  // Speed Trainer Settings
  speedTrainerEnabled: boolean;
  startBPM: number;
  targetBPM: number;
  increaseBy: number;
  everyNMeasures: number;
  // Interface Settings
  showMetronomeControl: boolean;
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
  asymmetricBreathing: false,
  speedTrainerEnabled: false,
  startBPM: 60,
  targetBPM: 120,
  increaseBy: 5,
  everyNMeasures: 2,
  showMetronomeControl: true,
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
    isDark: boolean;
}> = ({ label, value, onChange, min, max, step, isDark }) => {
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
    
    const textColor = isDark ? 'text-slate-200' : 'text-slate-700';
    const bgColor = isDark ? 'bg-slate-700' : 'bg-slate-200';
    const buttonBgColor = isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-300 hover:bg-slate-400';
    const inputTextColor = isDark ? 'text-slate-100' : 'text-slate-800';


    return (
        <div className="space-y-1">
            <label htmlFor={`input-${label}`} className={`block text-sm font-medium ${textColor}`}>{label}</label>
            <div className={`flex items-center justify-between p-1 ${bgColor} rounded-lg`}>
                <button 
                    onMouseDown={() => startCounter(false)} 
                    onMouseUp={stopCounter} 
                    onMouseLeave={stopCounter}
                    onTouchStart={(e) => { e.preventDefault(); startCounter(false); }}
                    onTouchEnd={stopCounter}
                    className={`px-3 py-1 rounded-md ${buttonBgColor} transition-colors select-none touch-manipulation`}
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
                    className={`w-16 text-center text-lg font-mono font-semibold ${inputTextColor} bg-transparent border-none focus:ring-0 p-0`}
                />
                <button 
                    onMouseDown={() => startCounter(true)} 
                    onMouseUp={stopCounter} 
                    onMouseLeave={stopCounter}
                    onTouchStart={(e) => { e.preventDefault(); startCounter(true); }}
                    onTouchEnd={stopCounter}
                    className={`px-3 py-1 rounded-md ${buttonBgColor} transition-colors select-none touch-manipulation`}
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  
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
    syncBreathWithMetronome, syncMultiplier, asymmetricBreathing,
    speedTrainerEnabled, startBPM, targetBPM, increaseBy, everyNMeasures,
    showMetronomeControl
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
            const fifths = [0, 7, 2, 9]; // C, G, D, A (in semitones, wrapped)
            const semitone = Math.pow(2, 1 / 12);
            const noteIndex = beatIndex % 4;
            const freq = baseFreq * Math.pow(semitone, fifths[noteIndex]);

            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, time);
            
            gainNode.gain.setValueAtTime(0, time);
            gainNode.gain.linearRampToValueAtTime(0.5, time + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.15); // Shorter, duller decay

            osc.start(time);
            osc.stop(time + 0.2);
            break;
        }
        case 'rock_drums': {
            if (accent === 'accent1') { // Kick
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(120, time);
                osc.frequency.exponentialRampToValueAtTime(40, time + 0.15);
                gain.gain.setValueAtTime(1, time);
                gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
                osc.start(time);
                osc.stop(time + 0.2);
            } else if (accent === 'accent2') { // Snare
                const bufferSize = audioCtx.sampleRate * 0.2;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = audioCtx.createGain();
                noiseGain.gain.setValueAtTime(0.4, time);
                noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

                const osc = audioCtx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(200, time);
                const oscGain = audioCtx.createGain();
                oscGain.gain.setValueAtTime(0.3, time);
                oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

                noise.connect(noiseGain).connect(audioCtx.destination);
                osc.connect(oscGain).connect(audioCtx.destination);
                noise.start(time);
                osc.start(time);
                noise.stop(time + 0.2);
                osc.stop(time + 0.2);
            } else { // Hi-hat
                const bufferSize = audioCtx.sampleRate * 0.1;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                
                const source = audioCtx.createBufferSource();
                source.buffer = buffer;
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'highpass';
                filter.frequency.value = 8000;
                const gain = audioCtx.createGain();
                
                source.connect(filter).connect(gain).connect(audioCtx.destination);
                gain.gain.setValueAtTime(0.15, time);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
                source.start(time);
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
        case 'percussion': {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain).connect(audioCtx.destination);
            osc.type = 'sine';

            if (accent === 'accent1') { // Cajon Bass
                osc.frequency.setValueAtTime(100, time);
                gain.gain.setValueAtTime(0.8, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            } else if (accent === 'accent2') { // Cajon Slap
                osc.frequency.setValueAtTime(300, time);
                gain.gain.setValueAtTime(0.6, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.08);
            } else { // Bongo
                osc.frequency.setValueAtTime(440, time);
                gain.gain.setValueAtTime(0.5, time);
                gain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
            }
            
            osc.start(time);
            osc.stop(time + 0.15);
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

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({width: window.innerWidth, height: window.innerHeight});
    };
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    window.addEventListener('resize', handleResize);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
  }, []);

  const handleRestart = useCallback(() => {
    animationKeyRef.current += 1; // Use ref to trigger restart
    lastTimestampRef.current = null;
    breathPhaseRef.current = 0;
    curvePhaseRef.current = 0;
    colorPhaseRef.current = 0;
  }, []);

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

      // --- Breath Animation ---
      const bpmForSync = speedTrainerEnabled ? currentDynamicBPM : metronomeBPM;
      const measureDurationMs = (60 / bpmForSync) * beatsPerMeasure * 1000;
      
      const breathCycleDurationMs = syncBreathWithMetronome
        ? measureDurationMs * syncMultiplier
        : breathSpeed * 1000;

      if (breathCycleDurationMs > 0) {
          breathPhaseRef.current = (breathPhaseRef.current + deltaTime / breathCycleDurationMs) % 1;
      }
      
      let breathEasedValue;
      if (syncBreathWithMetronome && asymmetricBreathing) {
        // 2:1 ratio: 2/3 for inhale, 1/3 for exhale
        const phase = breathPhaseRef.current;
        const inhaleDuration = 2 / 3;
        
        if (phase < inhaleDuration) {
          // Inhale part
          const inhaleProgress = phase / inhaleDuration;
          breathEasedValue = (1 - Math.cos(inhaleProgress * Math.PI)) / 2; // Goes from 0 to 1
        } else {
          // Exhale part
          const exhaleProgress = (phase - inhaleDuration) / (1 - inhaleDuration);
          breathEasedValue = (1 + Math.cos(exhaleProgress * Math.PI)) / 2; // Goes from 1 to 0
        }
      } else {
        // Standard symmetric breathing
        breathEasedValue = (1 - Math.cos(breathPhaseRef.current * 2 * Math.PI)) / 2;
      }

      const minScale = minBreathPercent / maxBreathPercent;
      const currentScale = lerp(minScale, 1.0, breathEasedValue);
      setAnimatedScale(currentScale);

      // --- Other independent animations ---
      if (curveSpeed > 0) {
        curvePhaseRef.current = (curvePhaseRef.current + deltaTime / (curveSpeed * 1000)) % 1;
      }
      if (eyeColorSpeed > 0) {
        colorPhaseRef.current = (colorPhaseRef.current + deltaTime / (eyeColorSpeed * 1000)) % 1;
      }

      const curveEasedValue = Math.pow(Math.sin(curvePhaseRef.current * Math.PI), 4);
      const curveRange = maxCurveRadius - 25;
      const currentRadius = 25 + (curveRange * curveEasedValue);
      setAnimatedCurveRadius(currentRadius);

      const easedColorValue = (1 - Math.cos(colorPhaseRef.current * 2 * Math.PI)) / 2;
      const inversionAmount = eyeColorInversion / 100;
      const colorInversionFactor = easedColorValue * inversionAmount;
      
      // Corrected color inversion logic for both eyes
      const darkEyeColor = lerpColor(COLORS.dark, COLORS.light, colorInversionFactor);
      const lightEyeColor = lerpColor(COLORS.light, COLORS.dark, colorInversionFactor);

      setAnimatedDarkEyeColor(darkEyeColor);
      setAnimatedLightEyeColor(lightEyeColor);

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [settings, currentDynamicBPM]);


  useEffect(() => {
    const isDark = bgLightness < 50;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Force text color update for panel
    const panel = panelRef.current;
    if (panel) {
        const textColor = isDark ? '#e2e8f0' : '#334155'; // slate-200 or slate-700
        panel.style.color = textColor;
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
                const lightEyeColor = lerpColor('#ffffff', '#000000', colorInversionFactor);
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
    // When changing a setting that affects breath speed, disable asymmetric breathing
    // unless the change is to asymmetricBreathing itself.
    if (key !== 'asymmetricBreathing' && (key === 'syncBreathWithMetronome' && value === false)) {
        setSettings(prev => ({ ...prev, [key]: value, asymmetricBreathing: false }));
    } else {
        setSettings(prev => ({ ...prev, [key]: value }));
    }
    setSelectedPreset('');
  };
  
  const handleMetronomeToggle = async () => {
    if (!audioCtxRef.current) {
        try {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (error) {
            console.error("Failed to create AudioContext:", error);
            alert("Audio is not supported on this browser.");
            return;
        }
    }
    if (audioCtxRef.current.state === 'suspended') {
        try {
            await audioCtxRef.current.resume();
        } catch (error) {
            console.error("Failed to resume AudioContext:", error);
        }
    }

    if (!metronomeEnabled) {
      handleRestart();
    }
    
    handleSettingChange('metronomeEnabled', !metronomeEnabled);
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
      if (panelRef.current && e.target === panelRef.current) {
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
    return `Approx. ${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''} to reach ${targetBPM} BPM`;
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
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
    const isDark = bgLightness < 50;
    const textColor = isDark ? 'text-slate-100' : 'text-slate-800';
    const secondaryTextColor = isDark ? 'text-slate-200' : 'text-slate-700';
    const mutedTextColor = isDark ? 'text-slate-400' : 'text-slate-600';
    const closeIconColor = isDark ? 'text-slate-200' : 'text-slate-800';
    const borderColor = isDark ? 'border-slate-700/50' : 'border-slate-200/50';
    const buttonBg = isDark ? 'bg-slate-700' : 'bg-slate-200';
    const selectBg = isDark ? 'bg-slate-700' : 'bg-slate-200';
    const selectBorder = isDark ? 'border-slate-600/50' : 'border-slate-300/50';
    const hoverBg = isDark ? 'hover:bg-slate-500/10' : 'hover:bg-slate-500/10';
    const subMenuBg = isDark ? 'bg-slate-500/5' : 'bg-slate-500/5';
    const actionButtonBg = isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300';
    const finalButtonBg = isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-600 text-white hover:bg-slate-700';


    const SubMenuHeader: React.FC<{ title: string }> = ({ title }) => (
      <div className={`pb-4 mb-4 border-b ${borderColor} flex items-center justify-between`}>
          <button onMouseDown={() => setPanelView('main')} className={`flex items-center gap-2 w-full text-left text-xl font-bold ${textColor} p-2 -ml-2 rounded-lg ${hoverBg} transition-colors`} aria-label="Back to main menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{title}</span>
          </button>
          <button onMouseDown={() => setIsPanelOpen(false)} className={`p-2 -mr-2 rounded-full ${hoverBg} transition-colors`} aria-label="Close settings panel">
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${closeIconColor}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
          </button>
      </div>
    );
    
    switch(panelView) {
      case 'interface':
        return (
          <>
            <SubMenuHeader title="Interface Settings" />
            <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6 pt-4 custom-scrollbar">
              <div>
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Panel Opacity ({panelOpacity}%)
                </label>
                <input
                  type="range" min="20" max="100" value={panelOpacity}
                  onChange={(e) => handleSettingChange('panelOpacity', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Panel Blur ({panelBlur}px)
                </label>
                <input
                  type="range" min="0" max="40" value={panelBlur}
                  onChange={(e) => handleSettingChange('panelBlur', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <hr className={borderColor} />
              <div>
                <h3 className={`text-md font-semibold ${textColor} mb-3`}>Main Screen Elements</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded-md">
                    <span className={`text-sm font-medium ${secondaryTextColor}`}>Show Metronome Control</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={showMetronomeControl} onChange={(e) => handleSettingChange('showMetronomeControl', e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'visuals':
        return (
          <>
            <SubMenuHeader title="Visual Settings" />
            <div className="flex-grow overflow-y-auto pr-2 -mr-4 custom-scrollbar">
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Rotation Speed ({rotationSpeed}s)
                </label>
                <input
                  type="range" min="2" max="180" value={rotationSpeed}
                  onChange={(e) => handleSettingChange('rotationSpeed', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <hr className={`${borderColor} my-6`} />
                <p className={`text-center font-semibold ${secondaryTextColor} mb-4`}>Main Symbol</p>
                <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Border Width ({borderWidth.toFixed(1)})
                </label>
                <input
                  type="range" min="0" max="5" step="0.1" value={borderWidth}
                  onChange={(e) => handleSettingChange('borderWidth', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Glow Spread ({glowSize}%)
                </label>
                <input
                  type="range" min="0" max="100" value={glowSize}
                  onChange={(e) => handleSettingChange('glowSize', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                    Breath Speed ({breathSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={breathSpeed}
                  onChange={(e) => handleSettingChange('breathSpeed', Number(e.target.value))}
                  disabled={syncBreathWithMetronome}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Min Breath Size ({minBreathPercent}%)
                </label>
                <input
                  type="range" min="10" max="99" step="1" value={minBreathPercent}
                  onChange={(e) => handleMinBreathPercentChange(Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Max Breath Size ({maxBreathPercent}%)
                </label>
                <input
                  type="range" min="10" max="99" step="1" value={maxBreathPercent}
                  onChange={(e) => handleMaxBreathPercentChange(Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Curve Speed ({curveSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={curveSpeed}
                  onChange={(e) => handleSettingChange('curveSpeed', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Max Curve Radius ({maxCurveRadius.toFixed(1)})
                </label>
                <input
                  type="range" min="25" max="35" step="0.1" value={maxCurveRadius}
                  onChange={(e) => handleSettingChange('maxCurveRadius', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
                <hr className={`${borderColor} my-6`} />
                <p className={`text-center font-semibold ${secondaryTextColor} mb-4`}>Eyes Pulse</p>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Pulse Speed ({pulseSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={pulseSpeed}
                  onChange={(e) => handleSettingChange('pulseSpeed', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Min Radius ({minRadius.toFixed(1)})
                </label>
                <input
                  type="range" min="1" max="15" step="0.5" value={minRadius}
                  onChange={(e) => handleMinRadiusChange(Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Max Radius ({maxRadius.toFixed(1)})
                </label>
                <input
                  type="range" min="1" max="15" step="0.5" value={maxRadius}
                  onChange={(e) => handleMaxRadiusChange(Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Angle Offset ({eyeAngleOffset.toFixed(0)}°)
                </label>
                <input
                  type="range" min="-45" max="45" value={eyeAngleOffset}
                  onChange={(e) => handleSettingChange('eyeAngleOffset', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Eye Color Inversion ({eyeColorInversion}%)
                </label>
                <input
                  type="range" min="0" max="100" value={eyeColorInversion}
                  onChange={(e) => handleSettingChange('eyeColorInversion', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
              <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Inversion Speed ({eyeColorSpeed}s)
                </label>
                <input
                  type="range" min="1" max="180" value={eyeColorSpeed}
                  onChange={(e) => handleSettingChange('eyeColorSpeed', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
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
                  <span className={`text-sm font-medium ${secondaryTextColor}`}>
                    Invert Pulse Phase
                  </span>
                </label>
              </div>
              <hr className={`${borderColor} my-6`} />
                <p className={`text-center font-semibold ${secondaryTextColor} mb-4`}>Background</p>
                <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Lightness ({bgLightness}%)
                </label>
                <input
                  type="range" min="0" max="100" value={bgLightness}
                  onChange={(e) => handleSettingChange('bgLightness', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
                <div className="mb-4">
                <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                  Warmth ({bgWarmth}%)
                </label>
                <input
                  type="range" min="0" max="100" value={bgWarmth}
                  onChange={(e) => handleSettingChange('bgWarmth', Number(e.target.value))}
                  className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                />
              </div>
            </div>
            <div className="pt-4 mt-auto">
              <button
                onClick={handleRestart}
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors ${finalButtonBg}`}
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
            <SubMenuHeader title="Metronome" />
            <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-6 flex flex-col custom-scrollbar">
              <button
                onClick={handleMetronomeToggle}
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
                    <label className={`block text-sm font-medium ${secondaryTextColor} mb-3`}>Accent Pattern</label>
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
                          <label htmlFor="beats-per-measure" className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                              Beats
                          </label>
                          <select
                              id="beats-per-measure"
                              value={beatsPerMeasure}
                              onChange={(e) => handleBeatsPerMeasureChange(Number(e.target.value))}
                              className={`w-full px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                          >
                              {[...Array(15)].map((_, i) => <option key={i+2} value={i+2}>{i+2}</option>)}
                          </select>
                      </div>
                      <div>
                          <label htmlFor="metronome-sound" className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                              Sound Kit
                          </label>
                          <select
                              id="metronome-sound"
                              value={metronomeSoundKit}
                              onChange={(e) => handleSettingChange('metronomeSoundKit', e.target.value as MetronomeSoundKit)}
                              className={`w-full px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                          >
                              <option value="click">Click</option>
                              <option value="beep">Beep</option>
                              <option value="drum">Drum Kit</option>
                              <option value="jazz">Jazz Drums</option>
                              <option value="rock_drums">Rock Drums</option>
                              <option value="percussion">Percussion</option>
                              <option value="marimba">Marimba</option>
                          </select>
                      </div>
                  </div>
                
                <hr className={borderColor} />
                
                <div className="flex items-center justify-between">
                    <label className={`font-medium ${textColor}`}>Speed Trainer</label>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={speedTrainerEnabled} onChange={(e) => handleSettingChange('speedTrainerEnabled', e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {speedTrainerEnabled ? (
                    <div className="space-y-4 p-4 bg-slate-500/10 rounded-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <NumberInput label="Start BPM" value={startBPM} onChange={v => handleSettingChange('startBPM', v)} min={20} max={400} step={1} isDark={isDark} />
                        <NumberInput label="Target BPM" value={targetBPM} onChange={v => handleSettingChange('targetBPM', v)} min={20} max={400} step={1} isDark={isDark} />
                        <NumberInput label="Increase By" value={increaseBy} onChange={v => handleSettingChange('increaseBy', v)} min={1} max={50} step={1} isDark={isDark} />
                        <NumberInput label="Every Bar" value={everyNMeasures} onChange={v => handleSettingChange('everyNMeasures', v)} min={1} max={32} step={1} isDark={isDark} />
                      </div>
                      {timeToTargetStr && <p className={`text-xs text-center ${mutedTextColor} pt-2`}>{timeToTargetStr}</p>}
                    </div>
                ) : (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className={`block text-sm font-medium ${secondaryTextColor}`}>
                          BPM
                        </label>
                        <span className={`text-lg font-mono font-semibold ${textColor}`}>{metronomeBPM}</span>
                      </div>
                      <div className="flex items-center gap-3">
                         <button onClick={() => handleSettingChange('metronomeBPM', Math.max(20, metronomeBPM - 1))} className={`p-2 rounded-full ${actionButtonBg} transition-colors`}>-</button>
                         <input
                          type="range" min="20" max="400" value={metronomeBPM}
                          onChange={(e) => handleSettingChange('metronomeBPM', Number(e.target.value))}
                          className={`w-full h-2 ${buttonBg} rounded-lg appearance-none cursor-pointer`}
                        />
                         <button onClick={() => handleSettingChange('metronomeBPM', Math.min(400, metronomeBPM + 1))} className={`p-2 rounded-full ${actionButtonBg} transition-colors`}>+</button>
                      </div>
                    </div>
                )}


                <hr className={borderColor} />
                
                <div className={`p-4 rounded-xl space-y-3 ${syncBreathWithMetronome ? 'bg-slate-500/10' : ''} transition-colors`}>
                    {/* Main Sync Row */}
                    <div className="flex items-center justify-between">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={syncBreathWithMetronome}
                                onChange={(e) => handleSettingChange('syncBreathWithMetronome', e.target.checked)}
                                className="h-5 w-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-blue-600"
                            />
                            <span className={`font-medium ${textColor}`}>
                                Breath Sync
                            </span>
                        </label>

                        <div className={`flex items-center gap-2 transition-opacity duration-300 ${syncBreathWithMetronome ? 'opacity-100' : 'opacity-0'}`}>
                            <label htmlFor="sync-multiplier" className={`font-medium ${textColor}`}>
                                X
                            </label>
                            <select
                                id="sync-multiplier"
                                value={syncMultiplier}
                                onChange={(e) => handleSettingChange('syncMultiplier', Number(e.target.value))}
                                className={`w-20 px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                            >
                                {[...Array(8)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {/* Asymmetric Row - with slide-down animation */}
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${syncBreathWithMetronome ? 'max-h-12 pt-3' : 'max-h-0 pt-0'}`}>
                        <div className="flex items-center justify-between">
                            <label className={`font-medium ${textColor}`}>Asymmetric Rhythm (2:1)</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={asymmetricBreathing} onChange={(e) => handleSettingChange('asymmetricBreathing', e.target.checked)} className="sr-only peer" disabled={!syncBreathWithMetronome} />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                            </label>
                        </div>
                    </div>
                </div>
              </div>
            </div>
          </>
        )
      default: // 'main'
        return (
          <>
            <div className={`flex items-center pb-4 mb-4 border-b ${borderColor}`}>
                <div className="w-8"> {/* Spacer to align title */}</div>
                <h2 className={`text-xl font-bold text-center flex-grow ${textColor}`}>Settings</h2>
                <button onMouseDown={() => setIsPanelOpen(false)} className={`p-2 -mr-2 rounded-full ${hoverBg} transition-colors`} aria-label="Close settings panel">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${closeIconColor}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pt-4 pr-2 -mr-4 space-y-4 custom-scrollbar">
                <div>
                  <ul className="space-y-2">
                    <li>
                      <button onClick={() => setPanelView('visuals')} className={`w-full flex justify-between items-center text-left p-4 rounded-xl ${hoverBg} ${subMenuBg} transition-colors`}>
                          <span className={`font-semibold text-lg ${secondaryTextColor}`}>Visual Effects</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${mutedTextColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                     <li>
                      <button onClick={() => setPanelView('metronome')} className={`w-full flex justify-between items-center text-left p-4 rounded-xl ${hoverBg} ${subMenuBg} transition-colors`}>
                          <span className={`font-semibold text-lg ${secondaryTextColor}`}>Metronome</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${mutedTextColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setPanelView('interface')} className={`w-full flex justify-between items-center text-left p-4 rounded-xl ${hoverBg} ${subMenuBg} transition-colors`}>
                          <span className={`font-semibold text-lg ${secondaryTextColor}`}>Interface</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${mutedTextColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                  </ul>
                </div>
                <hr className={borderColor}/>
               <div>
                  <div className="space-y-2 mb-4">
                    <label htmlFor="preset-select" className={`block text-sm font-medium ${secondaryTextColor}`}>
                      Load Preset
                    </label>
                    <div className="flex gap-2 items-center">
                      <select
                        id="preset-select"
                        value={selectedPreset}
                        onChange={handlePresetSelect}
                        className={`flex-grow min-w-0 px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
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
                    <p className={`text-sm font-medium ${secondaryTextColor}`}>Save Current Settings</p>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newPresetName} 
                        onChange={e => setNewPresetName(e.target.value)} 
                        placeholder="Preset name..." 
                        className={`flex-grow min-w-0 px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
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
                className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors ${finalButtonBg}`}
              >
                Export as HTML
              </button>
            </div>
          </>
        )
    }
  }

  const progressPercent = targetBPM === startBPM ? 0 : Math.min(100,
    (Math.abs(currentDynamicBPM - startBPM) / Math.abs(targetBPM - startBPM)) * 100
  );

  return (
    <main 
      className={`relative flex items-center justify-center min-h-screen transition-colors duration-500 overflow-hidden`}
      style={{ backgroundColor: bgColor }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {!isPanelOpen && (
        <div className="fixed top-4 left-4 right-4 z-30 flex justify-between items-center">
            <button
              onClick={() => {
                setIsPanelOpen(true);
                setPanelView('main'); // Reset to main view when opening
              }}
              className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-colors hover:bg-white/70 dark:hover:bg-slate-800/70"
              aria-label="Open settings panel"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-800 dark:text-slate-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.532 1.532 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.532 1.532 0 01.947-2.287c1.561-.379-1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <button
                onClick={toggleFullscreen}
                className="p-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-colors hover:bg-white/70 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen 
                ? <FullscreenExitIcon className="w-6 h-6" />
                : <FullscreenEnterIcon className="w-6 h-6" />
              }
            </button>
        </div>
      )}

      {/* Main Screen Metronome UI */}
       {showMetronomeControl && (
        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-center sm:justify-start z-10">
          <button
            onClick={handleMetronomeToggle}
            className={`relative w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg text-slate-800 dark:text-slate-200
                        bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-sm border border-white/20 dark:border-black/20`}
            aria-label={metronomeEnabled ? 'Stop Metronome' : 'Start Metronome'}
          >
            {metronomeEnabled ? (
              <span className="font-mono text-2xl font-semibold animate-[fadeIn_0.3s_ease-in-out]">{currentDynamicBPM}</span>
            ) : (
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden="true">
                 <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          
          {/* Speed Trainer Progress Bar */}
          <div className={`fixed bottom-0 left-0 right-0 h-1 transition-opacity duration-300 ${metronomeEnabled && speedTrainerEnabled ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-slate-300/50 dark:bg-slate-600/50 h-full">
                <div className="bg-blue-600 h-full transition-all duration-500 ease-linear" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        </div>
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