import React, { useCallback, useEffect, useRef, useState } from 'react';

// New props to match the call site and theme requirements
interface RangeSliderProps {
    label: string;
    minValue: number;
    maxValue: number;
    onMinChange: (value: number) => void;
    onMaxChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    isDark: boolean;
    displaySuffix?: string;
    precision?: number;
}

export const RangeSlider: React.FC<RangeSliderProps> = ({
    label,
    minValue,
    maxValue,
    onMinChange,
    onMaxChange,
    min = 0,
    max = 100,
    step = 1,
    isDark,
    displaySuffix = '',
    precision = 0,
}) => {
  const range = useRef<HTMLDivElement>(null);
  const [isEditingMin, setIsEditingMin] = useState(false);
  const [isEditingMax, setIsEditingMax] = useState(false);
  const [editMinValue, setEditMinValue] = useState(String(minValue.toFixed(precision)));
  const [editMaxValue, setEditMaxValue] = useState(String(maxValue.toFixed(precision)));
  const minInputRef = useRef<HTMLInputElement>(null);
  const maxInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditingMin) {
      setEditMinValue(String(minValue.toFixed(precision)));
    }
  }, [minValue, isEditingMin, precision]);

  useEffect(() => {
    if (!isEditingMax) {
      setEditMaxValue(String(maxValue.toFixed(precision)));
    }
  }, [maxValue, isEditingMax, precision]);

  useEffect(() => {
    if (isEditingMin && minInputRef.current) {
      minInputRef.current.focus();
      minInputRef.current.select();
    }
  }, [isEditingMin]);

  useEffect(() => {
    if (isEditingMax && maxInputRef.current) {
      maxInputRef.current.focus();
      maxInputRef.current.select();
    }
  }, [isEditingMax]);

  const getPercent = useCallback(
    (val: number) => (max > min ? Math.round(((val - min) / (max - min)) * 100) : 0),
    [min, max]
  );

  useEffect(() => {
    const minPercent = getPercent(minValue);
    const maxPercent = getPercent(maxValue);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minValue, maxValue, getPercent]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinVal = Math.min(Number(e.target.value), maxValue - step);
    onMinChange(newMinVal);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMaxVal = Math.max(Number(e.target.value), minValue + step);
    onMaxChange(newMaxVal);
  };
  
  const handleCommitMin = () => {
    let num = parseFloat(editMinValue);
    if (isNaN(num)) num = min;
    const clampedNum = Math.round(Math.max(min, Math.min(num, maxValue - step)) / step) * step;
    onMinChange(clampedNum);
    setIsEditingMin(false);
  };
  
  const handleCommitMax = () => {
    let num = parseFloat(editMaxValue);
    if (isNaN(num)) num = max;
    const clampedNum = Math.round(Math.min(max, Math.max(num, minValue + step)) / step) * step;
    onMaxChange(clampedNum);
    setIsEditingMax(false);
  };

  const handleKeyDownMin = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCommitMin();
    else if (e.key === 'Escape') {
      setEditMinValue(String(minValue.toFixed(precision)));
      setIsEditingMin(false);
    }
  };
  
  const handleKeyDownMax = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCommitMax();
    else if (e.key === 'Escape') {
      setEditMaxValue(String(maxValue.toFixed(precision)));
      setIsEditingMax(false);
    }
  };

  const minPercent = getPercent(minValue);
  const maxPercent = getPercent(maxValue);
  
  const theme = {
    labelColor: isDark ? 'text-slate-200' : 'text-slate-700',
    trackBg: isDark ? 'bg-slate-800' : 'bg-slate-200',
    rangeBg: 'bg-slate-500',
    thumbColor: '#475569', // slate-600
    thumbBorderColor: isDark ? '#1e293b' : '#ffffff', // slate-800 or white
    valueDisplayBg: isDark ? 'bg-slate-800' : 'bg-slate-100',
    valueDisplayText: isDark ? 'text-slate-200' : 'text-slate-700',
    focusBorder: 'focus:border-slate-500'
  };

  const commonInputStyles = `w-14 text-center text-sm font-mono ${theme.valueDisplayBg} ${theme.valueDisplayText} rounded-md`;
  const displayStyles = `${commonInputStyles} px-2 py-1 cursor-pointer select-none`;
  const inputStyles = `${commonInputStyles} py-0.5 px-1 border-2 border-transparent focus:outline-none ${theme.focusBorder} focus:ring-0`;
  
  return (
    <div className="space-y-1">
        <div className="flex justify-between items-baseline">
            <label className={`block text-xs font-medium ${theme.labelColor}`}>{label}</label>
            <span className={`text-xs font-mono ${theme.labelColor}`}>{minValue.toFixed(precision)}{displaySuffix} &ndash; {maxValue.toFixed(precision)}{displaySuffix}</span>
        </div>
        <div className="w-full flex items-center gap-3">
            {isEditingMin ? (
                <input
                ref={minInputRef}
                type="number"
                value={editMinValue}
                onChange={(e) => setEditMinValue(e.target.value)}
                onBlur={handleCommitMin}
                onKeyDown={handleKeyDownMin}
                className={inputStyles}
                />
            ) : (
                <div className={displayStyles} onClick={() => setIsEditingMin(true)}>
                {minValue.toFixed(precision)}{displaySuffix}
                </div>
            )}
            <div className="relative flex-grow h-6 flex items-center">
                <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={minValue}
                onChange={handleMinChange}
                className="thumb absolute w-full h-1 rounded-lg appearance-none bg-transparent pointer-events-none focus:outline-none"
                style={{ zIndex: 3 }}
                />
                <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={maxValue}
                onChange={handleMaxChange}
                className="thumb absolute w-full h-1 rounded-lg appearance-none bg-transparent pointer-events-none focus:outline-none"
                style={{ zIndex: 4 }}
                />

                <div className="relative w-full h-1">
                <div className={`absolute w-full h-full rounded-lg ${theme.trackBg}`} />
                <div
                    ref={range}
                    className={`absolute h-full rounded-lg ${theme.rangeBg}`}
                    style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
                />
                </div>
            </div>
            {isEditingMax ? (
                <input
                ref={maxInputRef}
                type="number"
                value={editMaxValue}
                onChange={(e) => setEditMaxValue(e.target.value)}
                onBlur={handleCommitMax}
                onKeyDown={handleKeyDownMax}
                className={inputStyles}
                />
            ) : (
                <div className={displayStyles} onClick={() => setIsEditingMax(true)}>
                {maxValue.toFixed(precision)}{displaySuffix}
                </div>
            )}
            <style>{`
                .thumb {
                -webkit-appearance: none;
                -moz-appearance: none;
                appearance: none;
                width: 100%;
                height: 0;
                background: transparent;
                pointer-events: none;
                }

                .thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                pointer-events: all;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: ${theme.thumbColor};
                cursor: pointer;
                border: 4px solid ${theme.thumbBorderColor};
                box-shadow: 0 0 0 1px ${theme.thumbColor};
                }

                .thumb::-moz-range-thumb {
                pointer-events: all;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                background-color: ${theme.thumbColor};
                cursor: pointer;
                border: 4px solid ${theme.thumbBorderColor};
                box-shadow: 0 0 0 1px ${theme.thumbColor};
                }
                
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                -webkit-appearance: none; 
                margin: 0; 
                }
                input[type=number] {
                -moz-appearance: textfield;
                }
            `}</style>
        </div>
    </div>
  );
};