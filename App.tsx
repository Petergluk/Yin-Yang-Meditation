import React, { useState, useEffect, useRef } from 'react';

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
  
  const eyeCenterYTop = center - mainRadius / 2;
  const eyeCenterYBottom = center + mainRadius / 2;

  const basePulseStyle = {
    animationDuration: `${pulseSpeed}s`,
    '--min-radius': minRadius,
    '--max-radius': maxRadius,
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
              <g transform={`rotate(${eyeAngleOffset} ${center} ${center})`}>
                <circle cx={center} cy={eyeCenterYTop} className="animate-pulse-size" style={{...basePulseStyle, fill: darkEyeColor}} />
                <circle cx={center} cy={eyeCenterYBottom} className="animate-pulse-size" style={{...invertedPulseStyle, fill: lightEyeColor}} />
              </g>
          </svg>
      </div>
    </div>
  );
};

// --- Settings and Presets Configuration ---
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
  metronomeSound: 'click' | 'beep';
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
  metronomeSound: 'click',
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
    },
  },
];


const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [animatedCurveRadius, setAnimatedCurveRadius] = useState(25);
  const [animationKey, setAnimationKey] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [animatedDarkEyeColor, setAnimatedDarkEyeColor] = useState('#000000');
  const [animatedLightEyeColor, setAnimatedLightEyeColor] = useState('#ffffff');
  const [viewportSize, setViewportSize] = useState({width: window.innerWidth, height: window.innerHeight});
  const [animatedScale, setAnimatedScale] = useState(1);
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [newPresetName, setNewPresetName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [metronomeVisualPulse, setMetronomeVisualPulse] = useState(false);
  const [panelView, setPanelView] = useState<'main' | 'visuals' | 'metronome'>('main');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const metronomeIntervalRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    rotationSpeed, pulseSpeed, minRadius, maxRadius,
    breathSpeed, minBreathPercent, maxBreathPercent,
    maxCurveRadius, curveSpeed, invertPulsePhase,
    eyeAngleOffset, borderWidth, eyeColorInversion,
    eyeColorSpeed, bgLightness, bgWarmth, glowSize,
    metronomeEnabled, metronomeBPM, metronomeSound,
  } = settings;

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (storedPresets) {
        setCustomPresets(JSON.parse(storedPresets));
      }
    } catch (error) {
      console.error("Failed to load custom presets:", error);
    }
  }, []);
  
  // Metronome effect
  useEffect(() => {
    if (metronomeIntervalRef.current) {
      clearInterval(metronomeIntervalRef.current);
    }
  
    if (metronomeEnabled) {
      const audioCtx = audioCtxRef.current;
      if (!audioCtx) return;
  
      const playSound = () => {
        const time = audioCtx.currentTime;
        if (metronomeSound === 'beep') {
          const oscillator = audioCtx.createOscillator();
          const gainNode = audioCtx.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioCtx.destination);
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(880, time);
          gainNode.gain.setValueAtTime(0.5, time);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
          oscillator.start(time);
          oscillator.stop(time + 0.1);
        } else { // 'click'
          const bufferSize = audioCtx.sampleRate * 0.05; // 50ms
          const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const output = buffer.getChannelData(0);
          for (let i = 0; i < 100; i++) {
            output[i] = Math.random() * 2 - 1;
          }
          const source = audioCtx.createBufferSource();
          source.buffer = buffer;
          source.connect(audioCtx.destination);
          source.start(time);
        }
      };
  
      const interval = (60 / metronomeBPM) * 1000;
      metronomeIntervalRef.current = window.setInterval(() => {
        playSound();
        setMetronomeVisualPulse(true);
        setTimeout(() => setMetronomeVisualPulse(false), 100);
      }, interval);
    }
  
    return () => {
      if (metronomeIntervalRef.current) {
        clearInterval(metronomeIntervalRef.current);
      }
    };
  }, [metronomeEnabled, metronomeBPM, metronomeSound]);


  useEffect(() => {
    const handleResize = () => {
      setViewportSize({width: window.innerWidth, height: window.innerHeight});
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    let startTime = 0;
    
    const COLORS = {
      dark: '#000000', // Pure Black
      light: '#ffffff', // Pure White
    };

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      // --- Main Symbol Breath Animation ---
      const minScale = minBreathPercent / maxBreathPercent;
      const breathPeriod = breathSpeed * 1000;
      const breathPhase = (elapsed % breathPeriod) / breathPeriod;
      const breathEasedValue = (1 - Math.cos(breathPhase * 2 * Math.PI)) / 2;
      const currentScale = lerp(minScale, 1.0, breathEasedValue);
      setAnimatedScale(currentScale);

      // --- Curve Radius Animation ---
      const curvePeriod = curveSpeed * 1000;
      const curvePhase = (elapsed % curvePeriod) / curvePeriod;
      const curveEasedValue = Math.pow(Math.sin(curvePhase * Math.PI), 4);
      const curveRange = maxCurveRadius - 25;
      const currentRadius = 25 + (curveRange * curveEasedValue);
      setAnimatedCurveRadius(currentRadius);

      // --- Eyes Color Animation ---
      const colorPeriod = eyeColorSpeed * 1000;
      const colorPhase = (elapsed % colorPeriod) / colorPeriod;
      const easedColorValue = (1 - Math.cos(colorPhase * 2 * Math.PI)) / 2;
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
      viewportSize, minBreathPercent, maxBreathPercent, breathSpeed, 
      maxCurveRadius, curveSpeed, eyeColorSpeed, eyeColorInversion, 
      animationKey
  ]);


  useEffect(() => {
    if (bgLightness < 50) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [bgLightness]);

  const handleRestart = () => {
    setAnimationKey(prevKey => prevKey + 1);
  };
  
  const handleExportHtml = () => {
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
            let audioCtx = null;
            if (settings.metronomeEnabled) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

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
            const eyeCenterYTop = center - mainRadius / 2; const eyeCenterYBottom = center + mainRadius / 2;

            symbolWrapper.style.position = 'relative'; symbolWrapper.style.display = 'flex';
            symbolWrapper.style.alignItems = 'center'; symbolWrapper.style.justifyContent = 'center';
            svgContainer.style.position = 'relative'; svgContainer.style.borderRadius = '9999px'; svgContainer.style.overflow = 'hidden';
            rotationWrapper.className = 'animate-spin-continuous'; rotationWrapper.style.animationDuration = settings.rotationSpeed + 's';
            svg.setAttribute('viewBox', '0 0 100 100'); svg.style.width = '100%'; svg.style.height = '100%';
            bgCircle.setAttribute('cx', center); bgCircle.setAttribute('cy', center); bgCircle.setAttribute('r', mainRadius);
            bgCircle.setAttribute('fill', '#000000'); bgCircle.setAttribute('stroke', '#000000'); bgCircle.setAttribute('stroke-width', settings.borderWidth);
            whitePath.setAttribute('fill', '#ffffff');
            eyeGroup.setAttribute('transform', \`rotate(\${settings.eyeAngleOffset} \${center} \${center})\`);
            darkEyeCircle.setAttribute('cx', center); darkEyeCircle.setAttribute('cy', eyeCenterYTop);
            lightEyeCircle.setAttribute('cx', center); lightEyeCircle.setAttribute('cy', eyeCenterYBottom);
            
            let metronomePulse = false;
            if (settings.metronomeEnabled && audioCtx) {
                const playSound = () => {
                    const time = audioCtx.currentTime;
                    if (settings.metronomeSound === 'beep') {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(880, time);
                        gain.gain.setValueAtTime(0.5, time);
                        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
                        osc.start(time);
                        osc.stop(time + 0.1);
                    } else {
                        const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.05, audioCtx.sampleRate);
                        const output = buffer.getChannelData(0);
                        for (let i = 0; i < 100; i++) { output[i] = Math.random() * 2 - 1; }
                        const source = audioCtx.createBufferSource();
                        source.buffer = buffer;
                        source.connect(audioCtx.destination);
                        source.start(time);
                    }
                };
                const interval = (60 / settings.metronomeBPM) * 1000;
                setInterval(() => {
                    playSound();
                    metronomePulse = true;
                    setTimeout(() => { metronomePulse = false; }, 100);
                }, interval);
            }

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
                const darkEyePhase = (elapsed % pulsePeriod) / pulsePeriod;
                const darkEyeEasedValue = (1 - Math.cos(darkEyePhase * 2 * Math.PI)) / 2;
                const darkEyeRadius = lerp(settings.minRadius, settings.maxRadius, darkEyeEasedValue);
                const lightEyeElapsed = settings.invertPulsePhase ? elapsed + (pulsePeriod / 2) : elapsed;
                const lightEyePhase = (lightEyeElapsed % pulsePeriod) / pulsePeriod;
                const lightEyeEasedValue = (1 - Math.cos(lightEyePhase * 2 * Math.PI)) / 2;
                const lightEyeRadius = lerp(settings.minRadius, settings.maxRadius, lightEyeEasedValue);
                symbolWrapper.style.width = \`\${baseSize}px\`; symbolWrapper.style.height = \`\${baseSize}px\`;
                svgContainer.style.width = \`\${baseSize}px\`; svgContainer.style.height = \`\${baseSize}px\`;
                breathWrapper.style.transform = \`scale(\${currentScale})\`; whitePath.setAttribute('d', pathD);
                darkEyeCircle.setAttribute('fill', darkEyeColor); darkEyeCircle.setAttribute('r', darkEyeRadius);
                lightEyeCircle.setAttribute('fill', lightEyeColor); lightEyeCircle.setAttribute('r', lightEyeRadius);
                const warmthFactor = (settings.bgWarmth - 50) / 50; const saturation = Math.abs(warmthFactor) * 40;
                const hue = warmthFactor > 0 ? 40 : 220;
                main.style.backgroundColor = \`hsl(\${hue}, \${saturation}%, \${settings.bgLightness}%)\`;
                const glowColor = settings.bgLightness < 50 ? 'rgba(203, 213, 225, 0.2)' : 'rgba(0, 0, 0, 0.2)';
                const blurRadius = (settings.glowSize / 100) * 150;
                const baseSpread = (settings.glowSize / 100) * 20;
                const pulseSpread = (settings.glowSize / 100) * 40;
                const spreadRadius = metronomePulse ? pulseSpread : baseSpread;
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
  
  const handleSettingChange = (key: keyof Settings, value: string | number | boolean) => {
    if (key === 'metronomeEnabled' && value === true) {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    }
    setSettings(prev => ({ ...prev, [key]: value as any }));
    setSelectedPreset(''); // Deselect preset when a manual change is made
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
      setSelectedPreset(''); // Reset dropdown after deletion
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
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
      if (touchStartX === null) return;
      const touchEndX = e.changedTouches[0].clientX;
      const deltaX = touchEndX - touchStartX;
      if (deltaX < -50) { // Swiped left
          setIsPanelOpen(false);
      }
      setTouchStartX(null);
  };


  const baseSize = (maxBreathPercent / 100) * Math.min(viewportSize.width, viewportSize.height) * 0.9;

  const warmthFactor = (bgWarmth - 50) / 50; // -1 to 1
  const saturation = Math.abs(warmthFactor) * 40;
  const hue = warmthFactor > 0 ? 40 : 220;
  const bgColor = `hsl(${hue}, ${saturation}%, ${bgLightness}%)`;

  const glowColor = bgLightness < 50 ? 'rgba(203, 213, 225, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  const blurRadius = (glowSize / 100) * 150;
  
  const baseSpreadRadius = (glowSize / 100) * 20;
  const pulseSpreadRadius = (glowSize / 100) * 40;
  const spreadRadius = metronomeVisualPulse ? pulseSpreadRadius : baseSpreadRadius;

  const glowStyle = {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    boxShadow: `0 0 ${blurRadius}px ${spreadRadius}px ${glowColor}`,
    borderRadius: '50%',
    position: 'absolute' as 'absolute',
    opacity: glowSize > 0 ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out, box-shadow 0.1s ease-in-out',
  };

  const renderPanelContent = () => {
    switch(panelView) {
      case 'visuals':
        return (
          <>
            <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setPanelView('main')} className="flex items-center gap-2 w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-200 p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Back to main menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Visual Settings</span>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-1 -mr-2">
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
              <hr className="border-slate-200 dark:border-slate-700 mb-4" />
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
                </label>
                <input
                  type="range" min="1" max="180" value={breathSpeed}
                  onChange={(e) => handleSettingChange('breathSpeed', Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
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
                <hr className="border-slate-200 dark:border-slate-700 mb-4" />
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
              <hr className="border-slate-200 dark:border-slate-700 mb-4" />
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
        return (
          <>
            <div className="pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => setPanelView('main')} className="flex items-center gap-2 w-full text-left text-lg font-semibold text-slate-800 dark:text-slate-200 p-2 -ml-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Back to main menu">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Metronome</span>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pr-1 -mr-2 space-y-6">
                <label htmlFor="metronome-toggle" className="flex items-center justify-between cursor-pointer">
                  <span className="text-md font-medium text-slate-800 dark:text-slate-200">
                    Enable Metronome
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="metronome-toggle"
                      className="sr-only"
                      checked={metronomeEnabled}
                      onChange={(e) => handleSettingChange('metronomeEnabled', e.target.checked)}
                    />
                    <div className="block bg-slate-300 dark:bg-slate-600 w-12 h-7 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${metronomeEnabled ? 'translate-x-5 bg-blue-500' : ''}`}></div>
                  </div>
                </label>
              
              <div className={`p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 transition-opacity ${metronomeEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <div className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-center text-slate-700 dark:text-slate-300 mb-2">
                        Beats Per Minute
                      </label>
                      <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSettingChange('metronomeBPM', Math.max(40, metronomeBPM - 1))}
                            disabled={!metronomeEnabled}
                            className="px-2 py-1 rounded-md bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                          >
                            -
                          </button>
                          <div className="flex-grow text-center text-lg font-mono px-2 py-1 bg-slate-200 dark:bg-slate-800 rounded-md">
                            {metronomeBPM}
                          </div>
                          <button
                             onClick={() => handleSettingChange('metronomeBPM', Math.min(200, metronomeBPM + 1))}
                            disabled={!metronomeEnabled}
                            className="px-2 py-1 rounded-md bg-slate-300 dark:bg-slate-700 hover:bg-slate-400 dark:hover:bg-slate-600 transition-colors"
                          >
                            +
                          </button>
                      </div>
                      <input
                        type="range" min="40" max="200" value={metronomeBPM}
                        onChange={(e) => handleSettingChange('metronomeBPM', Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer mt-3"
                        disabled={!metronomeEnabled}
                      />
                  </div>
                  <div>
                    <label htmlFor="metronome-sound" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Sound
                    </label>
                    <select
                        id="metronome-sound"
                        value={metronomeSound}
                        onChange={(e) => handleSettingChange('metronomeSound', e.target.value as 'click' | 'beep')}
                        className="w-full px-3 py-1.5 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
                        disabled={!metronomeEnabled}
                    >
                        <option value="click">Click</option>
                        <option value="beep">Beep</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      default: // 'main'
        return (
          <>
            <div className="flex items-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-700">
                <div className="w-8"> {/* Spacer to align title */}</div>
                <h2 className="text-lg font-semibold text-center flex-grow text-slate-800 dark:text-slate-200">Settings</h2>
                <button onClick={() => setIsPanelOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" aria-label="Close settings panel">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="flex-grow overflow-y-auto pt-4 pr-1 -mr-2 space-y-4">
               <div>
                  <h3 className="mb-2 text-md font-semibold text-slate-800 dark:text-slate-200">Presets</h3>
                  <div className="space-y-2 mb-4">
                    <label htmlFor="preset-select" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Load Preset
                    </label>
                    <div className="flex gap-2 items-center">
                      <select
                        id="preset-select"
                        value={selectedPreset}
                        onChange={handlePresetSelect}
                        className="flex-grow min-w-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
                        aria-label="Load a preset"
                      >
                        <option value="">Select a preset...</option>
                        <optgroup label="Defaults">
                          {defaultPresets.map(p => <option key={p.name} value={`default:${p.name}`}>{p.name}</option>)}
                        </optgroup>
                        {customPresets.length > 0 && (
                          <optgroup label="Custom">
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
                        className="flex-grow min-w-0 px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-md text-sm focus:ring-2 focus:ring-slate-500 focus:outline-none"
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
                <hr className="border-slate-200 dark:border-slate-700"/>
                <div>
                  <ul className="space-y-2">
                    <li>
                      <button onClick={() => setPanelView('visuals')} className="w-full flex justify-between items-center text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Visual Settings</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                     <li>
                      <button onClick={() => setPanelView('metronome')} className="w-full flex justify-between items-center text-left p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                          <span className="font-medium text-slate-800 dark:text-slate-200">Metronome</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                      </button>
                    </li>
                  </ul>
                </div>
            </div>
            <div className="pt-4 mt-auto">
               <button
                onClick={handleExportHtml}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
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
    >
      {!isPanelOpen && (
        <button
          onClick={() => {
            setIsPanelOpen(true);
            setPanelView('main'); // Reset to main view when opening
          }}
          className="absolute top-4 left-4 z-30 p-2 space-y-1.5 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-md border border-slate-200 dark:border-slate-700 transition-opacity hover:opacity-80"
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

        <div 
          ref={panelRef}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`fixed top-0 left-0 h-full z-20 transition-transform duration-500 ease-in-out ${isPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="w-64 sm:w-80 overflow-y-auto p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-r border-slate-200 dark:border-slate-700 h-full flex flex-col">
            {renderPanelContent()}
          </div>
        </div>
        
        <div className={`transition-transform duration-500 ease-in-out flex items-center justify-center w-full ${isPanelOpen ? 'lg:translate-x-32' : 'translate-x-0'}`}>
            <div 
              className="relative flex items-center justify-center"
              style={{ width: `${baseSize}px`, height: `${baseSize}px`}}
            >
              <div style={{ ...glowStyle, transform: `scale(${animatedScale})`}} />
              <div style={{ transform: `scale(${animatedScale})`}}>
                <YinYang 
                    key={animationKey}
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