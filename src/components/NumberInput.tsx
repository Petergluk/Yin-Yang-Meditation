import React, { useState, useEffect, useRef } from 'react';

export const NumberInput: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    isDark: boolean;
    decreaseAriaLabel: string;
    increaseAriaLabel: string;
}> = ({ label, value, onChange, min, max, step, isDark, decreaseAriaLabel, increaseAriaLabel }) => {
    const [inputValue, setInputValue] = useState(String(value));
    const intervalRef = useRef<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

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

    // Add cleanup effect for when the component unmounts
    useEffect(() => {
        return () => {
            stopCounter();
        };
    }, []);

    const valueRef = useRef(value);
    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    const handleChange = (newValue: number) => {
        const clampedValue = Math.max(min, Math.min(max, newValue));
        if (clampedValue !== valueRef.current) {
            onChange(clampedValue);
        }
        return clampedValue;
    };
    
    const startCounter = (increment: boolean) => {
        stopCounter();
        const nextValue = valueRef.current + (increment ? step : -step);
        handleChange(nextValue);
        
        timeoutRef.current = window.setTimeout(() => {
            intervalRef.current = window.setInterval(() => {
                const currentVal = valueRef.current;
                const nextVal = currentVal + (increment ? step : -step);
                const clampedVal = handleChange(nextVal);
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
            onChange(clampedValue);
            setInputValue(String(clampedValue));
        } else {
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
    const bgColor = isDark ? 'bg-slate-700' : 'bg-white/60';
    const buttonBgColor = isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-200 hover:bg-slate-300';
    const borderColor = isDark ? 'border-transparent' : 'border-slate-300';
    const inputTextColor = isDark ? 'text-slate-100' : 'text-slate-800';


    return (
        <div className="space-y-1">
            <label htmlFor={`input-${label}`} className={`block text-sm font-medium ${textColor}`}>{label}</label>
            <div className={`flex items-center justify-between p-1 ${bgColor} rounded-lg border ${borderColor}`}>
                <button 
                    onMouseDown={() => startCounter(false)} 
                    onMouseUp={stopCounter} 
                    onMouseLeave={stopCounter}
                    onTouchStart={(e) => { e.preventDefault(); startCounter(false); }}
                    onTouchEnd={stopCounter}
                    className={`px-3 py-1 rounded-md ${buttonBgColor} transition-colors select-none touch-manipulation`}
                    aria-label={decreaseAriaLabel}
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
                    aria-label={increaseAriaLabel}
                >+</button>
            </div>
        </div>
    );
};
