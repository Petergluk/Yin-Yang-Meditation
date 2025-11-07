import React, { createContext, useContext, useReducer, ReactNode, Dispatch } from 'react';
import type { Settings } from '../types';

// --- Action Type ---
type SettingsAction =
  | { type: 'UPDATE_SETTING'; payload: { key: keyof Settings; value: any } }
  | { type: 'APPLY_PRESET'; payload: Settings };

// --- Initial State ---
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
  breathSyncMultiplier: 2,
  asymmetricBreathing: false,
  asymmetricBreathingInvert: false,
  speedTrainerEnabled: false,
  startBPM: 60,
  targetBPM: 120,
  increaseBy: 5,
  everyNMeasures: 2,
  showMetronomeControl: true,

  // New sync settings defaults
  syncRotationWithMetronome: false,
  rotationSyncMultiplier: 2,
  syncPulseWithMetronome: false,
  pulseSyncMultiplier: 2,
  syncCurveWithMetronome: false,
  curveSyncMultiplier: 4,
  syncEyeColorWithMetronome: false,
  eyeColorSyncMultiplier: 8,

  // Glow Flash defaults
  glowFlashTrigger: 'none',
  glowFlashSize: 50,
  glowFlashDuration: 0.5,
};

// --- Reducer ---
const settingsReducer = (state: Settings, action: SettingsAction): Settings => {
    switch (action.type) {
        case 'UPDATE_SETTING': {
            const { key, value } = action.payload;
            const newState = { ...state, [key]: value };

            // Logic to handle dependent settings
            if (key === 'syncBreathWithMetronome' && value === false) {
                newState.asymmetricBreathing = false;
                newState.asymmetricBreathingInvert = false;
            }
            if (key === 'asymmetricBreathing' && value === false) {
                newState.asymmetricBreathingInvert = false;
            }
            return newState;
        }
        case 'APPLY_PRESET':
            return action.payload;
        default:
            return state;
    }
};

// --- Context Definition ---
interface SettingsContextType {
    settings: Settings;
    dispatch: Dispatch<SettingsAction>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// --- Provider Component ---
interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
    const [settings, dispatch] = useReducer(settingsReducer, initialSettings);

    return (
        <SettingsContext.Provider value={{ settings, dispatch }}>
            {children}
        </SettingsContext.Provider>
    );
};

// --- Custom Hook ---
export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
