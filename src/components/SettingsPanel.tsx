import React, { useState, forwardRef } from 'react';
import type { Settings, Preset, AccentType, MetronomeSoundKit } from '../types';
import { ACCENT_CONFIG } from '../config';
import { NumberInput } from './NumberInput';
import { useSettings } from '../contexts/SettingsContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { ValueSlider } from './ValueSlider';
import { RangeSlider } from './RangeSlider';
import { GradientSlider } from './GradientSlider';
import { BpmSlider } from './BpmSlider';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onRestartAnimation: () => void;
    onExportHtml: () => void;
    customPresets: Preset[];
    defaultPresets: Preset[];
    onApplyPreset: (settings: Settings) => void;
    onSavePreset: (name: string) => boolean; // Returns success
    onDeletePreset: (name: string) => boolean; // Returns success
    metronomeState: {
        currentBeat: number | null;
        currentDynamicBPM: number;
        calculateTimeToTarget: () => { minutes: number; seconds: number; target: number } | null;
    };
    onToggleMetronome: () => Promise<void>;
}

const SyncControl: React.FC<{
    label: string;
    isSynced: boolean;
    onSyncChange: (value: boolean) => void;
    multiplier: number;
    onMultiplierChange: (value: number) => void;
    isDark: boolean;
    maxMultiplier?: number;
}> = ({ label, isSynced, onSyncChange, multiplier, onMultiplierChange, isDark, maxMultiplier = 64 }) => {
    const textColor = isDark ? 'text-slate-100' : 'text-slate-800';
    const selectBg = isDark ? 'bg-slate-700' : 'bg-slate-100';
    const selectBorder = isDark ? 'border-slate-600/50' : 'border-slate-300';

    return (
        <div className="flex items-center justify-between pl-2">
            <label className="flex items-center space-x-3 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isSynced}
                    onChange={(e) => onSyncChange(e.target.checked)}
                    className="h-5 w-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-blue-600"
                />
                <span className={`font-medium ${textColor}`}>
                    {label}
                </span>
            </label>

            <div className={`flex items-center gap-2 transition-opacity duration-300 ${isSynced ? 'opacity-100' : 'opacity-0'}`}>
                <label htmlFor={`sync-multiplier-${label}`} className={`font-medium ${textColor}`}>
                    X
                </label>
                <select
                    id={`sync-multiplier-${label}`}
                    value={multiplier}
                    onChange={(e) => onMultiplierChange(Number(e.target.value))}
                    disabled={!isSynced}
                    className={`w-20 px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                >
                    {[...Array(maxMultiplier)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                </select>
            </div>
        </div>
    );
};


export const SettingsPanel = forwardRef<HTMLDivElement, SettingsPanelProps>((props, ref) => {
    const {
        isOpen, onClose, onRestartAnimation, onExportHtml,
        customPresets, defaultPresets, onApplyPreset, onSavePreset, onDeletePreset,
        metronomeState, onToggleMetronome
    } = props;

    const { settings, dispatch } = useSettings();
    const { t, language, setLanguage } = useLocalization();

    const onSettingChange = (key: keyof Settings, value: any) => {
        dispatch({ type: 'UPDATE_SETTING', payload: { key, value } });
    };

    const [panelView, setPanelView] = useState<'main' | 'visuals' | 'metronome' | 'interface'>('main');
    const [newPresetName, setNewPresetName] = useState('');
    const [selectedPreset, setSelectedPreset] = useState('');
    
    // Destructure for easier access
    const {
        bgLightness, panelOpacity, panelBlur, showMetronomeControl,
        rotationSpeed, borderWidth, glowSize, breathSpeed, syncBreathWithMetronome,
        minBreathPercent, maxBreathPercent, curveSpeed, maxCurveRadius,
        pulseSpeed, minRadius, maxRadius, eyeAngleOffset, eyeColorInversion,
        eyeColorSpeed, invertPulsePhase, metronomeEnabled, beatsPerMeasure,
        speedTrainerEnabled, metronomeBPM, asymmetricBreathing
    } = settings;

    const handleMinRadiusChange = (value: number) => {
        onSettingChange('minRadius', Math.min(value, maxRadius));
    };

    const handleMaxRadiusChange = (value: number) => {
        onSettingChange('maxRadius', Math.max(value, minRadius));
    };

    const handleMinBreathPercentChange = (value: number) => {
        onSettingChange('minBreathPercent', Math.min(value, maxBreathPercent));
    };

    const handleMaxBreathPercentChange = (value: number) => {
        onSettingChange('maxBreathPercent', Math.max(value, minBreathPercent));
    };

    const handlePresetSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedPreset(value);
        if (!value) return;

        const [type, name] = value.split(':');
        const presetList = type === 'default' ? defaultPresets : customPresets;
        const preset = presetList.find(p => p.name === name);
        if (preset) {
            onApplyPreset(preset.settings);
        }
    };
    
    const handleSavePreset = () => {
        const trimmedName = newPresetName.trim();
        if (!trimmedName) return;
        
        const success = onSavePreset(trimmedName);
        if (success) {
            setNewPresetName('');
        }
    };

    const handleDeleteSelectedPreset = () => {
        if (!selectedPreset || !selectedPreset.startsWith('custom:')) return;
        const name = selectedPreset.split(':')[1];
        const success = onDeletePreset(name);
        if (success) {
            setSelectedPreset('');
        }
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
        onSettingChange('accentPattern', newPattern);
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
        onSettingChange('beatsPerMeasure', safeBeats);
        onSettingChange('accentPattern', newPattern);
    };
    
    const getGridColsClass = (beats: number) => {
        if (beats <= 7) {
            return `grid-cols-${beats}`;
        }
        const cols = Math.min(8, Math.ceil(beats / 2));
        return `grid-cols-${cols}`;
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
        const borderColor = isDark ? 'border-slate-700/50' : 'border-slate-300';
        const selectBg = isDark ? 'bg-slate-700' : 'bg-slate-100';
        const selectBorder = isDark ? 'border-slate-600/50' : 'border-slate-300';
        const hoverBg = isDark ? 'hover:bg-slate-500/10' : 'hover:bg-slate-500/10';
        const subMenuBg = isDark ? 'bg-slate-500/5' : 'bg-slate-200/50';
        const finalButtonBg = isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-600 text-white hover:bg-slate-700';

        const SubMenuHeader: React.FC<{ title: string }> = ({ title }) => (
            <div className={`pb-3 mb-3 border-b ${borderColor} flex items-center justify-between`}>
                <button onClick={() => setPanelView('main')} className={`p-2 -ml-2 rounded-lg ${hoverBg} transition-colors`} aria-label={t('backToMainMenu')}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </button>
                <h2 className={`text-xl font-bold text-center flex-grow ${textColor}`}>{title}</h2>
                <button onClick={onClose} className={`p-2 -mr-2 rounded-full ${hoverBg} transition-colors`} aria-label={t('closeSettings')}>
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
                <SubMenuHeader title={t('interfaceSettingsTitle')} />
                <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-4 pt-2 custom-scrollbar">
                <div>
                    <label className={`block text-sm font-medium ${secondaryTextColor} mb-2`}>{t('language')}</label>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`flex-1 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${language === 'en' ? (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white') : (isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300')}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setLanguage('ru')}
                            className={`flex-1 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${language === 'ru' ? (isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white') : (isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300')}`}
                        >
                            Русский
                        </button>
                    </div>
                </div>
                <hr className={borderColor} />
                <ValueSlider 
                    label={t('panelOpacity')}
                    value={panelOpacity}
                    onChange={(v) => onSettingChange('panelOpacity', v)}
                    min={20} max={100} step={1} isDark={isDark}
                    displaySuffix="%"
                />
                <ValueSlider 
                    label={t('panelBlur')}
                    value={panelBlur}
                    onChange={(v) => onSettingChange('panelBlur', v)}
                    min={0} max={40} step={1} isDark={isDark}
                    displaySuffix="px"
                />

                <hr className={borderColor} />
                <div className="flex items-center justify-between p-2 rounded-md">
                    <span className={`text-sm font-medium ${secondaryTextColor}`}>{t('showMetronomeControl')}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={showMetronomeControl} onChange={(e) => onSettingChange('showMetronomeControl', e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                </div>
            </>
            );
        case 'visuals':
            return (
            <>
                <SubMenuHeader title={t('visualSettingsTitle')} />
                <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-3 custom-scrollbar">
                
                    <p className={`text-center font-semibold ${secondaryTextColor} mt-2 mb-2`}>{t('speeds')}</p>
                     <ValueSlider 
                        label={t('rotationSpeed')}
                        value={rotationSpeed}
                        onChange={(v) => onSettingChange('rotationSpeed', v)}
                        min={2} max={180} step={1} isDark={isDark}
                        disabled={settings.syncRotationWithMetronome}
                        displaySuffix="s"
                    />
                     <ValueSlider 
                        label={t('breathSpeed')}
                        value={breathSpeed}
                        onChange={(v) => onSettingChange('breathSpeed', v)}
                        min={1} max={180} step={1} isDark={isDark}
                        disabled={syncBreathWithMetronome}
                        displaySuffix="s"
                    />
                    <ValueSlider 
                        label={t('curveSpeed')}
                        value={curveSpeed}
                        onChange={(v) => onSettingChange('curveSpeed', v)}
                        min={1} max={180} step={1} isDark={isDark}
                        disabled={settings.syncCurveWithMetronome}
                        displaySuffix="s"
                    />
                    <ValueSlider 
                        label={t('eyesPulseSpeed')}
                        value={pulseSpeed}
                        onChange={(v) => onSettingChange('pulseSpeed', v)}
                        min={1} max={180} step={1} isDark={isDark}
                        disabled={settings.syncPulseWithMetronome}
                        displaySuffix="s"
                    />
                    <ValueSlider 
                        label={t('inversionSpeed')}
                        value={eyeColorSpeed}
                        onChange={(v) => onSettingChange('eyeColorSpeed', v)}
                        min={1} max={180} step={1} isDark={isDark}
                        disabled={settings.syncEyeColorWithMetronome}
                        displaySuffix="s"
                    />
                    <hr className={`${borderColor} my-3`} />
                    <p className={`text-center font-semibold ${secondaryTextColor} mt-3 mb-2`}>{t('mainSymbol')}</p>
                     <ValueSlider 
                        label={t('borderWidth')}
                        value={borderWidth}
                        onChange={(v) => onSettingChange('borderWidth', v)}
                        min={0} max={5} step={0.1} isDark={isDark}
                        precision={1}
                    />
                     <ValueSlider 
                        label={t('glowSpread')}
                        value={glowSize}
                        onChange={(v) => onSettingChange('glowSize', v)}
                        min={0} max={100} step={1} isDark={isDark}
                        displaySuffix="%"
                    />
                    <hr className={`${borderColor} my-3`} />
                    <p className={`text-center font-semibold ${secondaryTextColor} mt-3 mb-2`}>{t('breathingAnimation')}</p>
                    <RangeSlider
                        label={t('breathSize')}
                        minValue={minBreathPercent}
                        maxValue={maxBreathPercent}
                        onMinChange={handleMinBreathPercentChange}
                        onMaxChange={handleMaxBreathPercentChange}
                        min={10} max={99} step={1} isDark={isDark} displaySuffix="%"
                    />
                    <ValueSlider 
                        label={t('maxCurveRadius')}
                        value={maxCurveRadius}
                        onChange={(v) => onSettingChange('maxCurveRadius', v)}
                        min={25} max={35} step={0.1} isDark={isDark}
                        precision={1}
                    />
                    <hr className={`${borderColor} my-3`} />
                    <p className={`text-center font-semibold ${secondaryTextColor} mt-3 mb-2`}>{t('eyesPulse')}</p>
                    <RangeSlider
                        label={t('eyeRadius')}
                        minValue={minRadius}
                        maxValue={maxRadius}
                        onMinChange={handleMinRadiusChange}
                        onMaxChange={handleMaxRadiusChange}
                        min={1} max={15} step={0.5} isDark={isDark} precision={1}
                    />
                    <ValueSlider 
                        label={t('angleOffset')}
                        value={eyeAngleOffset}
                        onChange={(v) => onSettingChange('eyeAngleOffset', v)}
                        min={-45} max={45} step={1} isDark={isDark}
                        displaySuffix="°"
                    />
                    <ValueSlider 
                        label={t('eyeColorInversion')}
                        value={eyeColorInversion}
                        onChange={(v) => onSettingChange('eyeColorInversion', v)}
                        min={0} max={100} step={1} isDark={isDark}
                        displaySuffix="%"
                    />
                    <div className="pt-2">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={invertPulsePhase}
                                onChange={(e) => onSettingChange('invertPulsePhase', e.target.checked)}
                                className="h-4 w-4 text-slate-600 bg-slate-100 border-slate-300 rounded focus:ring-slate-500 dark:bg-slate-700 dark:border-slate-600 dark:focus:ring-slate-600"
                            />
                            <span className={`text-sm font-medium ${secondaryTextColor}`}>
                                {t('invertPulsePhase')}
                            </span>
                        </label>
                    </div>
                    <hr className={`${borderColor} my-3`} />
                    <p className={`text-center font-semibold ${secondaryTextColor} mt-3 mb-2`}>{t('background')}</p>
                    <GradientSlider
                        label={t('lightness')}
                        value={bgLightness}
                        onChange={(v) => onSettingChange('bgLightness', v)}
                        min={0}
                        max={100}
                        step={1}
                        isDark={isDark}
                        gradientType="lightness"
                    />
                    <GradientSlider
                        label={t('warmth')}
                        value={settings.bgWarmth}
                        onChange={(v) => onSettingChange('bgWarmth', v)}
                        min={0}
                        max={100}
                        step={1}
                        isDark={isDark}
                        gradientType="warmth"
                    />
                </div>
                <div className="pt-4 mt-auto">
                <button
                    onClick={onRestartAnimation}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors ${finalButtonBg}`}
                >
                    {t('restartAnimation')}
                </button>
                </div>
            </>
            );
        case 'metronome':
            const timeToTargetData = metronomeState.calculateTimeToTarget();
            const timeToTargetStr = timeToTargetData ? t('timeToTarget', { minutes: timeToTargetData.minutes, seconds: timeToTargetData.seconds, target: timeToTargetData.target }) : null;
            return (
            <>
                <SubMenuHeader title={t('metronome')} />
                <div className="flex-grow flex flex-col overflow-hidden">
                     {/* Scrollable area for settings */}
                    <div className="flex-grow overflow-y-auto pr-2 -mr-4 space-y-4 custom-scrollbar">
                        {!speedTrainerEnabled && (
                           <BpmSlider 
                                label={t('bpm')} 
                                value={metronomeBPM} 
                                onChange={v => onSettingChange('metronomeBPM', v)} 
                                min={20} 
                                max={400} 
                                step={1} 
                                isDark={isDark}
                            />
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="beats-per-measure" className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                                    {t('beats')}
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
                                    {t('soundKit')}
                                </label>
                                <select
                                    id="metronome-sound"
                                    value={settings.metronomeSoundKit}
                                    onChange={(e) => onSettingChange('metronomeSoundKit', e.target.value as MetronomeSoundKit)}
                                    className={`w-full px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                                >
                                    <option value="click">{t('soundKit_click')}</option>
                                    <option value="beep">{t('soundKit_beep')}</option>
                                    <option value="drum">{t('soundKit_drum')}</option>
                                    <option value="jazz">{t('soundKit_jazz')}</option>
                                    <option value="rock_drums">{t('soundKit_rock_drums')}</option>
                                    <option value="percussion">{t('soundKit_percussion')}</option>
                                    <option value="marimba">{t('soundKit_marimba')}</option>
                                </select>
                            </div>
                        </div>

                        

                        <div>
                            <label className={`block text-sm font-medium ${secondaryTextColor} mb-2`}>{t('accentPattern')}</label>
                            <div className={`grid ${getGridColsClass(beatsPerMeasure)} gap-2`}>
                            {settings.accentPattern.map((accent, index) => (
                                <button
                                key={index}
                                onClick={() => handleAccentChange(index)}
                                className={`relative w-full aspect-square rounded-xl text-white text-xl font-bold transition-all duration-150 flex items-center justify-center
                                                ${ACCENT_CONFIG[accent].color} 
                                                ${metronomeState.currentBeat === index ? `ring-4 ${ACCENT_CONFIG[accent].ringColor}` : 'ring-0'}`}
                                title={t(ACCENT_CONFIG[accent].labelKey)}
                                aria-label={t('beatAriaLabel', { index: index + 1, label: t(ACCENT_CONFIG[accent].labelKey) })}
                                >
                                <span className="drop-shadow-sm">{index + 1}</span>
                                </button>
                            ))}
                            </div>
                        </div>
                        
                        <hr className={borderColor} />

                        <div className="space-y-3">
                            <div>
                                <label htmlFor="glow-flash-trigger" className={`block text-sm font-medium ${secondaryTextColor} mb-1`}>
                                    {t('glowFlashTriggerLabel')}
                                </label>
                                <select
                                    id="glow-flash-trigger"
                                    value={settings.glowFlashTrigger}
                                    onChange={(e) => onSettingChange('glowFlashTrigger', e.target.value as 'none' | 'measure' | 'accent1' | 'accent2')}
                                    className={`w-full px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                                >
                                    <option value="none">{t('trigger_none')}</option>
                                    <option value="measure">{t('trigger_measure')}</option>
                                    <option value="accent1">{t('trigger_accent1')}</option>
                                    <option value="accent2">{t('trigger_accent2')}</option>
                                </select>
                            </div>
                             {settings.glowFlashTrigger !== 'none' && (
                                <>
                                     <ValueSlider 
                                        label={t('flashSize')}
                                        value={settings.glowFlashSize}
                                        onChange={(v) => onSettingChange('glowFlashSize', v)}
                                        min={0} max={100} step={1} isDark={isDark}
                                        displaySuffix="%"
                                    />
                                    <ValueSlider 
                                        label={t('flashDuration')}
                                        value={settings.glowFlashDuration}
                                        onChange={(v) => onSettingChange('glowFlashDuration', v)}
                                        min={0.1} max={2} step={0.1} isDark={isDark}
                                        displaySuffix="s" precision={1}
                                    />
                                </>
                            )}
                        </div>

                        <hr className={borderColor} />
                        
                        <div className="flex items-center justify-between">
                            <label className={`font-medium ${textColor}`}>{t('speedTrainer')}</label>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={speedTrainerEnabled} onChange={(e) => onSettingChange('speedTrainerEnabled', e.target.checked)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {speedTrainerEnabled && ( // Speed Trainer UI
                            <div className={`space-y-3 p-3 rounded-lg ${isDark ? 'bg-slate-500/10' : 'bg-transparent'}`}>
                            <div className="grid grid-cols-2 gap-3">
                                <NumberInput label={t('startBPM')} value={settings.startBPM} onChange={v => onSettingChange('startBPM', v)} min={20} max={400} step={1} isDark={isDark} decreaseAriaLabel={t('decreaseAriaLabel', {label: t('startBPM')})} increaseAriaLabel={t('increaseAriaLabel', {label: t('startBPM')})}/>
                                <NumberInput label={t('targetBPM')} value={settings.targetBPM} onChange={v => onSettingChange('targetBPM', v)} min={20} max={400} step={1} isDark={isDark} decreaseAriaLabel={t('decreaseAriaLabel', {label: t('targetBPM')})} increaseAriaLabel={t('increaseAriaLabel', {label: t('targetBPM')})}/>
                                <NumberInput label={t('increaseBy')} value={settings.increaseBy} onChange={v => onSettingChange('increaseBy', v)} min={1} max={50} step={1} isDark={isDark} decreaseAriaLabel={t('decreaseAriaLabel', {label: t('increaseBy')})} increaseAriaLabel={t('increaseAriaLabel', {label: t('increaseBy')})}/>
                                <NumberInput label={t('everyNMeasures')} value={settings.everyNMeasures} onChange={v => onSettingChange('everyNMeasures', v)} min={1} max={32} step={1} isDark={isDark} decreaseAriaLabel={t('decreaseAriaLabel', {label: t('everyNMeasures')})} increaseAriaLabel={t('increaseAriaLabel', {label: t('everyNMeasures')})}/>
                            </div>
                            {timeToTargetStr && <p className={`text-xs text-center ${mutedTextColor} pt-2`}>{timeToTargetStr}</p>}
                            </div>
                        )}


                        <hr className={borderColor} />
                        
                        <div>
                            <h3 className={`text-md font-semibold ${secondaryTextColor} mb-2`}>{t('animationSync')}</h3>
                            <div className={`space-y-3 p-3 rounded-lg ${isDark ? 'bg-slate-500/10' : 'bg-transparent'}`}>
                                <div>
                                    <SyncControl
                                        label={t('breathing')}
                                        isSynced={settings.syncBreathWithMetronome}
                                        onSyncChange={v => onSettingChange('syncBreathWithMetronome', v)}
                                        multiplier={settings.breathSyncMultiplier}
                                        onMultiplierChange={v => onSettingChange('breathSyncMultiplier', v)}
                                        isDark={isDark}
                                    />
                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${syncBreathWithMetronome ? 'max-h-24 pt-3 space-y-3 pl-6' : 'max-h-0'}`}>
                                        <div className="flex items-center justify-between">
                                            <label className={`font-medium ${textColor} ${!syncBreathWithMetronome ? 'opacity-50' : ''}`}>{t('asymmetricRhythm')}</label>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" checked={asymmetricBreathing} onChange={(e) => onSettingChange('asymmetricBreathing', e.target.checked)} className="sr-only peer" disabled={!syncBreathWithMetronome} />
                                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                            </label>
                                        </div>
                                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${asymmetricBreathing && syncBreathWithMetronome ? 'max-h-12' : 'max-h-0'}`}>
                                            <div className="flex items-center justify-between pl-4">
                                                <label className={`font-medium ${textColor} ${!asymmetricBreathing ? 'opacity-50' : ''}`}>{t('invertAsymmetric')}</label>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" checked={settings.asymmetricBreathingInvert} onChange={(e) => onSettingChange('asymmetricBreathingInvert', e.target.checked)} className="sr-only peer" disabled={!asymmetricBreathing || !syncBreathWithMetronome} />
                                                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <SyncControl label={t('rotation')} isSynced={settings.syncRotationWithMetronome} onSyncChange={v => onSettingChange('syncRotationWithMetronome', v)} multiplier={settings.rotationSyncMultiplier} onMultiplierChange={v => onSettingChange('rotationSyncMultiplier', v)} isDark={isDark} maxMultiplier={64} />
                                <SyncControl label={t('curve')} isSynced={settings.syncCurveWithMetronome} onSyncChange={v => onSettingChange('syncCurveWithMetronome', v)} multiplier={settings.curveSyncMultiplier} onMultiplierChange={v => onSettingChange('curveSyncMultiplier', v)} isDark={isDark} />
                                <SyncControl label={t('eyesPulse')} isSynced={settings.syncPulseWithMetronome} onSyncChange={v => onSettingChange('syncPulseWithMetronome', v)} multiplier={settings.pulseSyncMultiplier} onMultiplierChange={v => onSettingChange('pulseSyncMultiplier', v)} isDark={isDark} />
                                <SyncControl label={t('colorInversion')} isSynced={settings.syncEyeColorWithMetronome} onSyncChange={v => onSettingChange('syncEyeColorWithMetronome', v)} multiplier={settings.eyeColorSyncMultiplier} onMultiplierChange={v => onSettingChange('eyeColorSyncMultiplier', v)} isDark={isDark} />
                            </div>
                        </div>
                    </div>
                    {/* START/STOP BUTTON (at the bottom) */}
                    <div className="pt-4 mt-auto">
                        <button
                            onClick={onToggleMetronome}
                            className={`w-full py-3 rounded-xl text-white text-xl font-bold transition-all duration-150 flex items-center justify-center shadow-lg
                                        ${metronomeEnabled 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-green-600 hover:bg-green-700'}`}
                            aria-label={metronomeEnabled ? t('stopMetronome') : t('startMetronome')}
                        >
                            {metronomeEnabled ? t('stop') : t('start')}
                        </button>
                    </div>
                </div>
            </>
            )
        default: // 'main'
            return (
            <>
                <div className={`flex items-center pb-3 mb-3 border-b ${borderColor}`}>
                    <div className="w-8"></div>
                    <h2 className={`text-xl font-bold text-center flex-grow ${textColor}`}>{t('settingsTitle')}</h2>
                    <button onClick={onClose} className={`p-2 -mr-2 rounded-full ${hoverBg} transition-colors`} aria-label={t('closeSettings')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${closeIconColor}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto pt-2 pr-2 -mr-4 space-y-3 custom-scrollbar">
                    <div>
                    <ul className="space-y-1">
                        <li>
                        <button onClick={() => setPanelView('visuals')} className={`w-full flex justify-between items-center text-left p-3 rounded-lg ${hoverBg} ${subMenuBg} transition-colors`}>
                            <span className={`font-semibold text-base ${secondaryTextColor}`}>{t('visualEffects')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${mutedTextColor}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        </li>
                        <li>
                        <button onClick={() => setPanelView('metronome')} className={`w-full flex justify-between items-center text-left p-3 rounded-lg ${hoverBg} ${subMenuBg} transition-colors`}>
                            <span className={`font-semibold text-base ${secondaryTextColor}`}>{t('metronome')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${mutedTextColor}`} viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        </li>
                        <li>
                        <button onClick={() => setPanelView('interface')} className={`w-full flex justify-between items-center text-left p-3 rounded-lg ${hoverBg} ${subMenuBg} transition-colors`}>
                            <span className={`font-semibold text-base ${secondaryTextColor}`}>{t('interface')}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${mutedTextColor}`} viewBox="0 0 20 20" fill="currentColor">
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
                        {t('loadPreset')}
                        </label>
                        <div className="flex gap-2 items-center">
                        <select
                            id="preset-select"
                            value={selectedPreset}
                            onChange={handlePresetSelect}
                            className={`flex-grow min-w-0 px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                            aria-label={t('loadPreset')}
                        >
                            <option value="">{t('selectPreset')}</option>
                            {defaultPresets.map(p => <option key={p.name} value={`default:${p.name}`}>{p.name}</option>)}
                            {customPresets.length > 0 && (
                            <optgroup label={t('myPresets')}>
                                {customPresets.map(p => <option key={p.name} value={`custom:${p.name}`}>{p.name}</option>)}
                            </optgroup>
                            )}
                        </select>
                        <button 
                            onClick={handleDeleteSelectedPreset} 
                            disabled={!selectedPreset.startsWith('custom:')}
                            title={t('deletePreset')}
                            aria-label={t('deletePreset')}
                            className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                            <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.347-9zm5.48.058a.75.75 0 10-1.499-.058l-.347 9a.75.75 0 001.5.058l.347-9z" clipRule="evenodd" />
                            </svg>
                        </button>
                        </div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <p className={`text-sm font-medium ${secondaryTextColor}`}>{t('saveCurrentSettings')}</p>
                        <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={newPresetName} 
                            onChange={e => setNewPresetName(e.target.value)} 
                            placeholder={t('presetNamePlaceholder')}
                            className={`flex-grow min-w-0 px-3 py-2 ${selectBg} border ${selectBorder} rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none`}
                            aria-label={t('presetNamePlaceholder')}
                        />
                        <button 
                            onClick={handleSavePreset} 
                            disabled={!newPresetName.trim()} 
                            title={t('savePreset')}
                            aria-label={t('savePreset')}
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
                    onClick={onExportHtml}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition-colors ${finalButtonBg}`}
                >
                    {t('exportHTML')}
                </button>
                </div>
            </>
            )
        }
    }

    return (
        <div
            ref={ref}
            className={`fixed z-20 transition-transform duration-500 ease-in-out 
                sm:top-0 sm:left-0 sm:h-full sm:translate-y-0 ${isOpen ? 'sm:translate-x-0' : 'sm:-translate-x-full'}
                bottom-0 left-0 w-full h-[90vh] sm:h-full sm:w-80 md:w-96 rounded-t-3xl sm:rounded-none
                ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        >
            <div
                className="w-full h-full p-4 sm:p-6 border-t sm:border-t-0 sm:border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col"
                style={panelStyle}
            >
                <div className="w-12 h-1.5 bg-slate-400 rounded-full mx-auto mb-3 sm:hidden"></div>
                {renderPanelContent()}
            </div>
        </div>
    );
});