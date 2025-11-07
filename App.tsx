import React, { useState, useEffect, useRef, useCallback } from 'react';
// Restore point.
import { YinYang, YinYangHandle } from './src/components/YinYang';
import { FullscreenEnterIcon, FullscreenExitIcon } from './src/components/FullscreenIcons';
import { SettingsIcon } from './src/components/SettingsIcon';
import type { Settings, Preset } from './src/types';
import { useMetronome } from './src/hooks/useMetronome';
import { SettingsPanel } from './src/components/SettingsPanel';
import { useSettings } from './src/contexts/SettingsContext';
import { useLocalization } from './src/contexts/LocalizationContext';

// --- Preset Configuration ---
const PRESETS_STORAGE_KEY = 'yin-yang-custom-presets';

const defaultPresets: Preset[] = [
  {
    name: 'Classic Calm',
    settings: {
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
      metronomeSoundKit: 'marimba',
      beatsPerMeasure: 4,
      accentPattern: ['accent1', 'standard', 'standard', 'standard'],
      panelOpacity: 40,
      panelBlur: 10,
      asymmetricBreathing: false,
      asymmetricBreathingInvert: false,
      speedTrainerEnabled: false,
      startBPM: 60,
      targetBPM: 120,
      increaseBy: 5,
      everyNMeasures: 2,
      showMetronomeControl: true,
      syncBreathWithMetronome: true,
      breathSyncMultiplier: 8,
      syncRotationWithMetronome: true,
      rotationSyncMultiplier: 8,
      syncPulseWithMetronome: true,
      pulseSyncMultiplier: 30,
      syncCurveWithMetronome: true,
      curveSyncMultiplier: 4,
      syncEyeColorWithMetronome: true,
      eyeColorSyncMultiplier: 45,
      glowFlashTrigger: 'measure',
      glowFlashSize: 40,
      glowFlashDuration: 0.7,
    },
  },
  {
    name: 'Deep Breath',
    settings: {
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
      metronomeEnabled: false,
      metronomeBPM: 50,
      metronomeSoundKit: 'beep',
      beatsPerMeasure: 4,
      accentPattern: ['accent1', 'skip', 'standard', 'skip'],
      panelOpacity: 40,
      panelBlur: 10,
      asymmetricBreathing: false,
      asymmetricBreathingInvert: false,
      speedTrainerEnabled: false,
      startBPM: 60,
      targetBPM: 120,
      increaseBy: 5,
      everyNMeasures: 2,
      showMetronomeControl: true,
      syncBreathWithMetronome: true,
      breathSyncMultiplier: 4,
      syncRotationWithMetronome: true,
      rotationSyncMultiplier: 3,
      syncPulseWithMetronome: true,
      pulseSyncMultiplier: 25,
      syncCurveWithMetronome: true,
      curveSyncMultiplier: 2,
      syncEyeColorWithMetronome: true,
      eyeColorSyncMultiplier: 25,
      glowFlashTrigger: 'none',
      glowFlashSize: 50,
      glowFlashDuration: 0.5,
    },
  },
  {
    name: 'Vibrant Energy',
    settings: {
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
      metronomeEnabled: false,
      metronomeBPM: 120,
      metronomeSoundKit: 'rock_drums',
      beatsPerMeasure: 4,
      accentPattern: ['accent1', 'standard', 'accent2', 'standard'],
      panelOpacity: 40,
      panelBlur: 10,
      asymmetricBreathing: false,
      asymmetricBreathingInvert: false,
      speedTrainerEnabled: false,
      startBPM: 60,
      targetBPM: 120,
      increaseBy: 5,
      everyNMeasures: 2,
      showMetronomeControl: true,
      syncBreathWithMetronome: true,
      breathSyncMultiplier: 5,
      syncRotationWithMetronome: true,
      rotationSyncMultiplier: 4,
      syncPulseWithMetronome: true,
      pulseSyncMultiplier: 30,
      syncCurveWithMetronome: true,
      curveSyncMultiplier: 15,
      syncEyeColorWithMetronome: true,
      eyeColorSyncMultiplier: 64,
      glowFlashTrigger: 'accent2',
      glowFlashSize: 60,
      glowFlashDuration: 0.3,
    },
  },
  {
    name: 'Cosmic Swirl',
    settings: {
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
      metronomeEnabled: false,
      metronomeBPM: 70,
      metronomeSoundKit: 'jazz',
      beatsPerMeasure: 5,
      accentPattern: ['accent1', 'standard', 'standard', 'accent2', 'standard'],
      panelOpacity: 40,
      panelBlur: 10,
      asymmetricBreathing: false,
      asymmetricBreathingInvert: false,
      speedTrainerEnabled: false,
      startBPM: 60,
      targetBPM: 120,
      increaseBy: 5,
      everyNMeasures: 2,
      showMetronomeControl: true,
      syncBreathWithMetronome: true,
      breathSyncMultiplier: 28,
      syncRotationWithMetronome: true,
      rotationSyncMultiplier: 14,
      syncPulseWithMetronome: true,
      pulseSyncMultiplier: 64,
      syncCurveWithMetronome: true,
      curveSyncMultiplier: 14,
      syncEyeColorWithMetronome: true,
      eyeColorSyncMultiplier: 35,
      glowFlashTrigger: 'none',
      glowFlashSize: 50,
      glowFlashDuration: 0.5,
    },
  },
];


const App: React.FC = () => {
  const { settings, dispatch } = useSettings();
  const { t } = useLocalization();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [viewportSize, setViewportSize] = useState({width: window.innerWidth, height: window.innerHeight});
  const [customPresets, setCustomPresets] = useState<Preset[]>([]);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [animationKey, setAnimationKey] = useState(0);
  const [flashClassName, setFlashClassName] = useState('');
  
  const panelRef = useRef<HTMLDivElement>(null);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const activityTimeoutRef = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const yinYangRef = useRef<YinYangHandle>(null);
  
  // Refs for stateful, resettable animation
  const lastTimestampRef = useRef<number | null>(null);
  const curvePhaseRef = useRef(0);
  const curveDurationRef = useRef(settings.curveSpeed * 1000);
  
  // Destructure for direct use in component and effects
  const {
    bgLightness, bgWarmth, glowSize,
    metronomeEnabled, beatsPerMeasure,
    syncBreathWithMetronome,
    speedTrainerEnabled, startBPM, targetBPM, showMetronomeControl
  } = settings;

  const metronome = useMetronome(settings);

  // --- UI Interactivity Effects ---
  useEffect(() => {
    const handleActivity = () => {
      setIsUiVisible(true);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
      activityTimeoutRef.current = window.setTimeout(() => {
        setIsUiVisible(false);
      }, 5000);
    };

    handleActivity(); // Initial call

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isPanelOpen) return;
      const target = event.target as Node;

      const isClickInsidePanel = panelRef.current && panelRef.current.contains(target);
      const isClickOnOpenButton = settingsButtonRef.current && settingsButtonRef.current.contains(target);

      if (!isClickInsidePanel && !isClickOnOpenButton) {
        setIsPanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPanelOpen]);

  const handleRestartAnimation = useCallback(() => {
    lastTimestampRef.current = null;
    curvePhaseRef.current = 0;
    setAnimationKey(prevKey => prevKey + 1);
  }, []);
  
  // --- Animation Settings to CSS Variables ---
  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const {
      rotationSpeed, pulseSpeed, minRadius, maxRadius,
      breathSpeed, minBreathPercent, maxBreathPercent,
      syncBreathWithMetronome, metronomeBPM, beatsPerMeasure,
      breathSyncMultiplier, asymmetricBreathing, asymmetricBreathingInvert,
      eyeColorSpeed, eyeColorInversion, curveSpeed,
      syncRotationWithMetronome, rotationSyncMultiplier,
      syncPulseWithMetronome, pulseSyncMultiplier,
      syncCurveWithMetronome, curveSyncMultiplier,
      syncEyeColorWithMetronome, eyeColorSyncMultiplier,
    } = settings;

    const bpmForSync = speedTrainerEnabled ? metronome.currentDynamicBPM : metronomeBPM;
    const measureDurationMs = (60 / bpmForSync) * beatsPerMeasure * 1000;
    const beatDurationMs = (60 / bpmForSync) * 1000;
      
    const breathCycleDuration = syncBreathWithMetronome ? (measureDurationMs * breathSyncMultiplier) / 1000 : breathSpeed;
    const rotationCycleDuration = syncRotationWithMetronome ? (measureDurationMs * rotationSyncMultiplier) / 1000 : rotationSpeed;
    const pulseCycleDuration = syncPulseWithMetronome ? (beatDurationMs * pulseSyncMultiplier) / 1000 : pulseSpeed;
    const eyeColorCycleDuration = syncEyeColorWithMetronome ? (beatDurationMs * eyeColorSyncMultiplier) / 1000 : eyeColorSpeed;
    const curveCycleDurationMs = syncCurveWithMetronome ? (measureDurationMs * curveSyncMultiplier) : curveSpeed * 1000;

    curveDurationRef.current = curveCycleDurationMs;

    root.style.setProperty('--rotation-duration', `${rotationCycleDuration}s`);
    root.style.setProperty('--pulse-duration', `${pulseCycleDuration}s`);
    root.style.setProperty('--breath-duration', `${breathCycleDuration}s`);
    root.style.setProperty('--min-breath-scale', String(minBreathPercent / maxBreathPercent));
    root.style.setProperty('--min-eye-scale', String(minRadius / maxRadius));
    root.style.setProperty('--pulse-delay', settings.invertPulsePhase ? `-${pulseCycleDuration / 2}s` : '0s');

    // Color Inversion CSS variables
    root.style.setProperty('--eye-color-duration', `${eyeColorCycleDuration}s`);
    const inversionAmount = eyeColorInversion / 100;
    const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
    };
    const rgbToHex = (r: number, g: number, b: number): string => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
    const lerp = (a: number, b: number, t: number): number => a * (1 - t) + b * t;
    const lerpColor = (colorA: string, colorB: string, amount: number): string => {
        const rgbA = hexToRgb(colorA); const rgbB = hexToRgb(colorB);
        if (!rgbA || !rgbB) return colorA;
        const r = Math.round(lerp(rgbA.r, rgbB.r, amount));
        const g = Math.round(lerp(rgbA.g, rgbB.g, amount));
        const b = Math.round(lerp(rgbA.b, rgbB.b, amount));
        return rgbToHex(r, g, b);
    };
    const darkInverted = lerpColor('#000000', '#ffffff', inversionAmount);
    const lightInverted = lerpColor('#ffffff', '#000000', inversionAmount);
    root.style.setProperty('--dark-eye-inverted-color', darkInverted);
    root.style.setProperty('--light-eye-inverted-color', lightInverted);

    if (syncBreathWithMetronome && asymmetricBreathing) {
      if (asymmetricBreathingInvert) {
        root.style.setProperty('--breath-animation-name', 'breath-asymmetric-inverted');
      } else {
        root.style.setProperty('--breath-animation-name', 'breath-asymmetric');
      }
    } else {
      root.style.setProperty('--breath-animation-name', 'breath');
    }

  }, [settings, metronome.currentDynamicBPM]);


  // --- JS-driven animation for properties not easily handled by CSS (SVG path) ---
  useEffect(() => {
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaTime = timestamp - lastTimestampRef.current;
      lastTimestampRef.current = timestamp;

      const { maxCurveRadius } = settings;

      if (curveDurationRef.current > 0) {
        curvePhaseRef.current = (curvePhaseRef.current + deltaTime / curveDurationRef.current) % 1;
      }

      const curveEasedValue = Math.pow(Math.sin(curvePhaseRef.current * Math.PI), 4);
      const curveRange = maxCurveRadius - 25;
      const currentRadius = 25 + (curveRange * curveEasedValue);
      yinYangRef.current?.updateCurve(currentRadius);

      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [settings.maxCurveRadius]);


  useEffect(() => {
    const isDark = bgLightness < 50;
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    const panel = panelRef.current;
    if (panel) {
        const textColor = isDark ? '#e2e8f0' : '#334155';
        panel.style.color = textColor;
    }
  }, [bgLightness]);

  const { currentBeat } = metronome;
  const lastProcessedBeatRef = useRef<number | null>(null);

  useEffect(() => {
    // This effect triggers the glow flash based on metronome beats.
    if (currentBeat === null) {
      lastProcessedBeatRef.current = null;
      return;
    }
    if (currentBeat === lastProcessedBeatRef.current) {
        return;
    }

    lastProcessedBeatRef.current = currentBeat;

    const { glowFlashTrigger, accentPattern, metronomeEnabled, glowFlashSize } = settings;
    if (glowFlashTrigger === 'none' || !metronomeEnabled || glowFlashSize === 0) return;

    const isFirstBeat = currentBeat === 0;
    const currentAccent = accentPattern[currentBeat];

    let shouldFlash = false;
    if (glowFlashTrigger === 'measure' && isFirstBeat) {
      shouldFlash = true;
    } else if (glowFlashTrigger === 'accent1' && currentAccent === 'accent1') {
      shouldFlash = true;
    } else if (glowFlashTrigger === 'accent2' && currentAccent === 'accent2') {
      shouldFlash = true;
    }

    if (shouldFlash) {
      setFlashClassName('glow-flash-active');
    }
  }, [currentBeat, settings.glowFlashTrigger, settings.accentPattern, settings.metronomeEnabled, settings.glowFlashSize]);
  
  const handleExportHtml = () => {
    const clickToBeginText = t('exportOverlayText');
    const generatedHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Yin-Yang Animation</title>
    <style>
        body { margin: 0; overflow: hidden; }
        main { position: relative; display: flex; align-items: center; justify-content: center; min-height: 100vh; width: 100%; }
        @keyframes spin-continuous { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        .animate-spin-continuous { animation: spin-continuous linear infinite; }
    </style>
</head>
<body>
    <div id="start-overlay" style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); color:white; display:flex; align-items:center; justify-content:center; font-family:sans-serif; font-size:2rem; cursor:pointer; z-index:100; text-align: center;">${clickToBeginText}</div>
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
                const warmthFactor = (settings.bgWarmth - 50) / 50;
                const saturation = Math.abs(warmthFactor) * 50;
                const hue = warmthFactor > 0 ? 40 : 220;
                const centerLightness = settings.bgLightness;
                const edgeLightness = settings.bgLightness - 20;
                const colorCenter = \`hsl(\${hue}, \${saturation}%, \${Math.max(0, centerLightness)}%)\`;
                const colorEdge = \`hsl(\${hue}, \${saturation}%, \${Math.max(0, edgeLightness)}%)\`;
                main.style.background = \`radial-gradient(circle, \${colorCenter} 0%, \${colorEdge} 100%)\`;
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
  
  const handleMetronomeToggle = async () => {
    await metronome.initAudio();
    if (!metronomeEnabled && syncBreathWithMetronome) {
      handleRestartAnimation();
    }
    dispatch({ type: 'UPDATE_SETTING', payload: { key: 'metronomeEnabled', value: !metronomeEnabled } });
  };

  const handleApplyPreset = (presetSettings: Settings) => {
    dispatch({ type: 'APPLY_PRESET', payload: presetSettings });
    handleRestartAnimation();
  };

  const handleSavePreset = (name: string) => {
    const isNameTaken = defaultPresets.some(p => p.name.toLowerCase() === name.toLowerCase()) ||
                        customPresets.some(p => p.name.toLowerCase() === name.toLowerCase());
    
    if (isNameTaken) {
      alert('Preset name already exists. Please choose a different name.');
      return false;
    }

    const newPreset: Preset = { name, settings };
    const updatedPresets = [...customPresets, newPreset];
    setCustomPresets(updatedPresets);
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
    return true;
  };

  const handleDeletePreset = (nameToDelete: string) => {
    if (window.confirm(`Are you sure you want to delete the "${nameToDelete}" preset?`)) {
      const updatedPresets = customPresets.filter(p => p.name !== nameToDelete);
      setCustomPresets(updatedPresets);
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
      return true;
    }
    return false;
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


  const baseSize = (settings.maxBreathPercent / 100) * Math.min(viewportSize.width, viewportSize.height) * 0.9;

  const warmthFactor = (bgWarmth - 50) / 50;
  const saturation = Math.abs(warmthFactor) * 50;
  const hue = warmthFactor > 0 ? 40 : 220;
  
  const centerLightness = bgLightness;
  const edgeLightness = bgLightness - 20;

  const colorCenter = `hsl(${hue}, ${saturation}%, ${Math.max(0, centerLightness)}%)`;
  const colorEdge = `hsl(${hue}, ${saturation}%, ${Math.max(0, edgeLightness)}%)`;

  const bgGradient = `radial-gradient(circle, ${colorCenter} 0%, ${colorEdge} 100%)`;

  const glowColor = bgLightness < 50 ? 'rgba(203, 213, 225, 0.2)' : 'rgba(0, 0, 0, 0.2)';
  
  // Base Glow
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

  // Glow Flash
  const flashBlurRadius = (settings.glowFlashSize / 100) * 150;
  const flashSpreadRadius = (settings.glowFlashSize / 100) * 20;
  const glowFlashStyle = {
    width: `${baseSize}px`,
    height: `${baseSize}px`,
    boxShadow: `0 0 ${flashBlurRadius}px ${flashSpreadRadius}px ${glowColor}`,
    borderRadius: '50%',
    position: 'absolute' as 'absolute',
    pointerEvents: 'none' as 'none',
  };


  const progressPercent = targetBPM === startBPM ? 0 : Math.min(100,
    (Math.abs(metronome.currentDynamicBPM - startBPM) / Math.abs(targetBPM - startBPM)) * 100
  );

  return (
    <main 
      ref={mainRef}
      className={`relative flex items-center justify-center min-h-screen overflow-hidden`}
      style={{ background: bgGradient, transition: 'background 0.5s ease-in-out' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`fixed top-4 left-4 right-4 z-30 justify-between items-center transition-opacity duration-700 ${isPanelOpen ? 'hidden' : 'flex'} ${isUiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            ref={settingsButtonRef}
            onClick={() => setIsPanelOpen(true)}
            className="p-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-colors hover:bg-white/60 dark:hover:bg-slate-800/60"
            aria-label={t('openSettings')}
          >
            <SettingsIcon className="h-6 w-6 text-slate-800/80 dark:text-slate-200/80" />
          </button>
          <button
              onClick={toggleFullscreen}
              className="p-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-full border border-slate-200/50 dark:border-slate-700/50 transition-colors hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-800/80 dark:text-slate-200/80"
              aria-label={isFullscreen ? t('exitFullscreen') : t('enterFullscreen')}
          >
            {isFullscreen 
              ? <FullscreenExitIcon className="w-6 h-6" />
              : <FullscreenEnterIcon className="w-6 h-6" />
            }
          </button>
      </div>


      {/* Main Screen Metronome UI */}
       {showMetronomeControl && (
        <div className={`fixed bottom-0 left-0 right-0 p-4 flex justify-center sm:justify-start z-10 transition-opacity duration-700 ${isUiVisible || (metronomeEnabled && speedTrainerEnabled) ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button
            onClick={handleMetronomeToggle}
            className={`relative w-16 h-16 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg text-slate-800 dark:text-slate-200
                        bg-white/40 dark:bg-black/40 hover:bg-white/60 dark:hover:bg-black/60 backdrop-blur-sm border border-white/20 dark:border-black/20`}
            aria-label={metronomeEnabled ? t('stopMetronome') : t('startMetronome')}
          >
            {metronomeEnabled ? (
              <span className="font-mono text-2xl font-semibold animate-[fadeIn_0.3s_ease-in-out]">{metronome.currentDynamicBPM}</span>
            ) : (
              <svg viewBox="0 0 24 24" className="w-8 h-8 fill-current" aria-hidden="true">
                 <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
        </div>
      )}
      <div className={`fixed bottom-0 left-0 right-0 h-1 transition-opacity duration-300 ${metronomeEnabled && speedTrainerEnabled ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-slate-300/50 dark:bg-slate-600/50 h-full">
            <div className="bg-blue-600 h-full transition-all duration-500 ease-linear" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
        
      <SettingsPanel
        ref={panelRef}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onRestartAnimation={handleRestartAnimation}
        onExportHtml={handleExportHtml}
        customPresets={customPresets}
        defaultPresets={defaultPresets}
        onApplyPreset={handleApplyPreset}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
        metronomeState={metronome}
        onToggleMetronome={handleMetronomeToggle}
      />
        
      <div className={`transition-transform duration-500 ease-in-out flex items-center justify-center w-full h-full`}>
            <div
              key={animationKey}
              className="relative flex items-center justify-center"
              style={{ width: `${baseSize}px`, height: `${baseSize}px`}}
            >
              <div className="animate-breath" style={glowStyle} />
              {settings.glowFlashTrigger !== 'none' && settings.glowFlashSize > 0 && (
                <div
                  className={flashClassName || 'opacity-0'}
                  onAnimationEnd={() => setFlashClassName('')}
                  style={{
                    ...glowFlashStyle,
                    '--glow-flash-duration': `${settings.glowFlashDuration}s`,
                  } as React.CSSProperties}
                />
              )}
              <div className="animate-breath">
                <YinYang 
                    ref={yinYangRef}
                    size={baseSize}
                    curveRadius={settings.maxCurveRadius}
                    eyeAngleOffset={settings.eyeAngleOffset}
                    borderWidth={settings.borderWidth}
                    maxRadius={settings.maxRadius}
                />
              </div>
            </div>
        </div>
    </main>
  );
}

export default App;