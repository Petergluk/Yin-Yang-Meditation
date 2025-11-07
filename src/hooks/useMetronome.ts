import { useState, useRef, useCallback, useEffect } from 'react';
import type { Settings, MetronomeSoundKit, AccentType } from '../types';

export const useMetronome = (settings: Settings) => {
    const {
        metronomeEnabled, metronomeBPM, metronomeSoundKit,
        beatsPerMeasure, accentPattern, speedTrainerEnabled,
        startBPM, targetBPM, increaseBy, everyNMeasures
    } = settings;

    const audioCtxRef = useRef<AudioContext | null>(null);
    const soundCacheRef = useRef<Partial<Record<MetronomeSoundKit, Partial<Record<AccentType, AudioBuffer>>>>>(
        {}
    );
    const metronomeTimeoutRef = useRef<number | null>(null);
    const beatCounterRef = useRef(0);
    const measureCounterRef = useRef(0);
    const currentBPMRef = useRef(startBPM);

    const [currentBeat, setCurrentBeat] = useState<number | null>(null);
    const [currentDynamicBPM, setCurrentDynamicBPM] = useState(metronomeBPM);
    const [isCaching, setIsCaching] = useState(false);

    const initAudio = useCallback(async () => {
        if (!audioCtxRef.current) {
            try {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (error) {
                console.error("Failed to create AudioContext:", error);
                alert("Audio is not supported on this browser.");
            }
        }
        if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
            try {
                await audioCtxRef.current.resume();
            } catch (error) {
                console.error("Failed to resume AudioContext:", error);
            }
        }
    }, []);

    const generateAndCacheSounds = useCallback(async (kit: MetronomeSoundKit) => {
        const audioCtx = audioCtxRef.current;
        if (!audioCtx || soundCacheRef.current[kit] || isCaching) return;

        setIsCaching(true);
        soundCacheRef.current[kit] = {};
        const accentsToCache: AccentType[] = ['standard', 'accent1', 'accent2'];

        for (const accent of accentsToCache) {
             try {
                let buffer: AudioBuffer | null = null;
                switch (kit) {
                    case 'marimba': {
                        const DURATION = 0.2;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        const baseFreq = 261.63; // C4
                        const fifths: Record<AccentType, number> = { accent1: 0, accent2: 7, standard: 2, skip: 0 };
                        const semitone = Math.pow(2, 1 / 12);
                        const freq = baseFreq * Math.pow(semitone, fifths[accent]);
                        const osc = offlineCtx.createOscillator(); const gainNode = offlineCtx.createGain();
                        osc.connect(gainNode).connect(offlineCtx.destination);
                        osc.type = 'sine'; osc.frequency.value = freq;
                        gainNode.gain.setValueAtTime(0, 0);
                        gainNode.gain.linearRampToValueAtTime(0.5, 0.01);
                        gainNode.gain.exponentialRampToValueAtTime(0.001, DURATION - 0.05);
                        osc.start(0); osc.stop(DURATION);
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                     case 'rock_drums': {
                        const DURATION = 0.2;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        if (accent === 'accent1') { // Kick
                            const osc = offlineCtx.createOscillator(); const gain = offlineCtx.createGain();
                            osc.connect(gain).connect(offlineCtx.destination);
                            osc.frequency.setValueAtTime(120, 0); osc.frequency.exponentialRampToValueAtTime(40, DURATION);
                            gain.gain.setValueAtTime(1, 0); gain.gain.exponentialRampToValueAtTime(0.001, DURATION);
                            osc.start(0); osc.stop(DURATION);
                        } else if (accent === 'accent2') { // Snare
                            const noiseSource = offlineCtx.createBufferSource();
                            const noiseBuffer = offlineCtx.createBuffer(1, offlineCtx.sampleRate * DURATION, offlineCtx.sampleRate);
                            const data = noiseBuffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                            noiseSource.buffer = noiseBuffer;
                            const noiseGain = offlineCtx.createGain(); noiseGain.gain.setValueAtTime(0.4, 0); noiseGain.gain.exponentialRampToValueAtTime(0.001, 0.1);
                            noiseSource.connect(noiseGain).connect(offlineCtx.destination);
                            noiseSource.start(0); noiseSource.stop(DURATION);
                        } else { // Hi-hat
                            const noiseSource = offlineCtx.createBufferSource();
                            const noiseBuffer = offlineCtx.createBuffer(1, offlineCtx.sampleRate * 0.1, offlineCtx.sampleRate);
                            const data = noiseBuffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                            noiseSource.buffer = noiseBuffer;
                            const filter = offlineCtx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 8000;
                            const gain = offlineCtx.createGain(); gain.gain.setValueAtTime(0.15, 0); gain.gain.exponentialRampToValueAtTime(0.0001, 0.05);
                            noiseSource.connect(filter).connect(gain).connect(offlineCtx.destination);
                            noiseSource.start(0);
                        }
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                    case 'beep': {
                        const DURATION = 0.1;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        const freq = accent === 'accent1' ? 880 : accent === 'accent2' ? 660 : 440;
                        const osc = offlineCtx.createOscillator(); const gain = offlineCtx.createGain();
                        osc.connect(gain).connect(offlineCtx.destination);
                        osc.type = 'sine'; osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.3, 0); gain.gain.exponentialRampToValueAtTime(0.0001, DURATION);
                        osc.start(0); osc.stop(DURATION);
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                    case 'drum': {
                        const DURATION = 0.15;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        if (accent === 'accent1') { // Kick
                            const osc = offlineCtx.createOscillator(); const gain = offlineCtx.createGain();
                            osc.connect(gain).connect(offlineCtx.destination);
                            osc.frequency.setValueAtTime(150, 0); osc.frequency.exponentialRampToValueAtTime(0.01, 0.1);
                            gain.gain.setValueAtTime(0.8, 0); gain.gain.exponentialRampToValueAtTime(0.01, 0.1);
                            osc.start(0); osc.stop(DURATION);
                        } else { // Hi-hat or Snare
                            const noiseSource = offlineCtx.createBufferSource();
                            const noiseBuffer = offlineCtx.createBuffer(1, offlineCtx.sampleRate * DURATION, offlineCtx.sampleRate);
                            const data = noiseBuffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                            noiseSource.buffer = noiseBuffer;
                            const gain = offlineCtx.createGain();
                            noiseSource.connect(gain).connect(offlineCtx.destination);
                            if (accent === 'accent2') { // Snare
                                gain.gain.setValueAtTime(0.3, 0); gain.gain.exponentialRampToValueAtTime(0.0001, DURATION);
                            } else { // Hi-hat
                                const filter = offlineCtx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 7000;
                                noiseSource.connect(filter).connect(gain);
                                gain.gain.setValueAtTime(0.2, 0); gain.gain.exponentialRampToValueAtTime(0.0001, 0.05);
                            }
                            noiseSource.start(0);
                        }
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                    case 'jazz': {
                        const DURATION = 0.25;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        // Base brush sound for all
                        const noiseSource = offlineCtx.createBufferSource();
                        const noiseBuffer = offlineCtx.createBuffer(1, offlineCtx.sampleRate * DURATION, offlineCtx.sampleRate);
                        const data = noiseBuffer.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
                        noiseSource.buffer = noiseBuffer;
                        const bandpass = offlineCtx.createBiquadFilter(); bandpass.type = 'bandpass'; bandpass.frequency.value = 6000; bandpass.Q.value = 0.5;
                        const gain = offlineCtx.createGain();
                        gain.gain.setValueAtTime(0, 0); gain.gain.linearRampToValueAtTime(0.15, 0.02); gain.gain.exponentialRampToValueAtTime(0.001, DURATION);
                        noiseSource.connect(bandpass).connect(gain).connect(offlineCtx.destination);
                        noiseSource.start(0);
                        if (accent === 'accent1') { // Kick
                            const osc = offlineCtx.createOscillator(); const kickGain = offlineCtx.createGain();
                            osc.connect(kickGain).connect(offlineCtx.destination);
                            osc.frequency.setValueAtTime(150, 0); osc.frequency.exponentialRampToValueAtTime(0.01, 0.1);
                            kickGain.gain.setValueAtTime(0.6, 0); kickGain.gain.exponentialRampToValueAtTime(0.01, 0.1);
                            osc.start(0); osc.stop(0.15);
                        } else if (accent === 'accent2') { // Snare
                            const snareNoise = offlineCtx.createBufferSource(); snareNoise.buffer = noiseBuffer;
                            const snareGain = offlineCtx.createGain(); snareGain.gain.setValueAtTime(0.12, 0); snareGain.gain.exponentialRampToValueAtTime(0.0001, 0.1);
                            snareNoise.connect(snareGain).connect(offlineCtx.destination);
                            snareNoise.start(0);
                        }
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                    case 'percussion': {
                        const DURATION = 0.15;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        const osc = offlineCtx.createOscillator(); const gain = offlineCtx.createGain();
                        osc.connect(gain).connect(offlineCtx.destination);
                        osc.type = 'sine';
                        const freqs: Record<AccentType, number> = { accent1: 100, accent2: 300, standard: 440, skip: 0};
                        const gains: Record<AccentType, number> = { accent1: 0.8, accent2: 0.6, standard: 0.5, skip: 0};
                        osc.frequency.value = freqs[accent]; gain.gain.setValueAtTime(gains[accent], 0); gain.gain.exponentialRampToValueAtTime(0.01, DURATION - 0.05);
                        osc.start(0); osc.stop(DURATION);
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                    case 'click':
                    default: {
                        const DURATION = 0.05;
                        const offlineCtx = new OfflineAudioContext(1, Math.ceil(audioCtx.sampleRate * DURATION), audioCtx.sampleRate);
                        const freq = accent === 'accent1' ? 1200 : accent === 'accent2' ? 1000 : 800;
                        const osc = offlineCtx.createOscillator(); const gain = offlineCtx.createGain();
                        osc.connect(gain).connect(offlineCtx.destination);
                        osc.type = 'triangle'; osc.frequency.value = freq;
                        gain.gain.setValueAtTime(0.4, 0); gain.gain.exponentialRampToValueAtTime(0.0001, DURATION);
                        osc.start(0); osc.stop(DURATION);
                        buffer = await offlineCtx.startRendering();
                        break;
                    }
                }
                if (buffer && soundCacheRef.current[kit]) {
                    soundCacheRef.current[kit]![accent] = buffer;
                }
            } catch (error) {
                 console.error(`Failed to cache sound for ${kit} - ${accent}:`, error);
            }
        }
        setIsCaching(false);
    }, [isCaching]);

     useEffect(() => {
        if (audioCtxRef.current && metronomeEnabled) {
            generateAndCacheSounds(metronomeSoundKit);
        }
    }, [metronomeSoundKit, metronomeEnabled, generateAndCacheSounds]);

    const playSound = useCallback((beatIndex: number) => {
        const audioCtx = audioCtxRef.current;
        const accent = accentPattern[beatIndex];
        if (!audioCtx || accent === 'skip') return;

        const buffer = soundCacheRef.current[metronomeSoundKit]?.[accent];

        if (buffer) {
            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(audioCtx.destination);
            source.start(audioCtx.currentTime);
        } else {
            console.warn(`Sound not cached for ${metronomeSoundKit} - ${accent}, attempting to cache now.`);
            generateAndCacheSounds(metronomeSoundKit);
        }
    }, [accentPattern, metronomeSoundKit, generateAndCacheSounds]);


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

    const calculateTimeToTarget = useCallback(() => {
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
      return { minutes, seconds, target: targetBPM };
    }, [speedTrainerEnabled, increaseBy, startBPM, targetBPM, beatsPerMeasure, everyNMeasures]);

    return {
        currentBeat,
        currentDynamicBPM,
        initAudio,
        calculateTimeToTarget,
    };
};
