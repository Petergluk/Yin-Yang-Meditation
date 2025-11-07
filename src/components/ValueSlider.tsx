import React, { useRef, useCallback, useState, useEffect } from 'react';

// This combines the user's new slider with the old one's props and theming.

interface ValueSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    isDark: boolean;
    disabled?: boolean;
    displaySuffix?: string;
    precision?: number;
}

const ModernButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isDark: boolean }> = ({ children, isDark, ...props }) => {
    const theme = {
        bg: isDark ? 'bg-slate-800' : 'bg-slate-100',
        hoverBg: isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-200',
        text: isDark ? 'text-slate-300' : 'text-slate-600',
    };
    return (
        <button
            {...props}
            className={`w-8 h-8 flex-shrink-0 flex items-center justify-center ${theme.bg} ${theme.hoverBg} ${theme.text} font-bold text-lg rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 shadow-sm`}
        >
            {children}
        </button>
    );
};

export const ValueSlider: React.FC<ValueSliderProps> = ({ label, value, onChange, min, max, step, isDark, disabled = false, displaySuffix = '', precision = 0 }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value.toFixed(precision)));
  const inputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value.toFixed(precision)));
    }
  }, [value, isEditing, precision]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

    useEffect(() => {
    const calculateVisualProgress = () => {
      if (trackRef.current && thumbRef.current) {
        const trackWidth = trackRef.current.offsetWidth;
        const thumbWidth = thumbRef.current.offsetWidth;
        if (trackWidth === 0 || thumbWidth === 0 || max <= min) {
            setVisualProgress(0);
            return;
        }

        const thumbWidthRatio = thumbWidth / trackWidth;
        const baseProgress = ((value - min) / (max - min)) * 100;
        
        const scaledProgress = baseProgress * (1 - thumbWidthRatio) + (thumbWidthRatio / 2) * 100;
        
        setVisualProgress(Math.max(0, Math.min(100, scaledProgress)));
      }
    };

    calculateVisualProgress();
    
    const trackElement = trackRef.current;
    const thumbElement = thumbRef.current;
    if (!trackElement || !thumbElement) return;

    const resizeObserver = new ResizeObserver(calculateVisualProgress);
    resizeObserver.observe(trackElement);
    resizeObserver.observe(thumbElement);

    return () => {
      if (trackElement) resizeObserver.unobserve(trackElement);
      if (thumbElement) resizeObserver.unobserve(thumbElement);
    };
  }, [value, min, max]);

  const updateValueFromPosition = useCallback((clientX: number) => {
    if (!trackRef.current || !thumbRef.current || disabled) return;

    const trackRect = trackRef.current.getBoundingClientRect();
    const thumbWidth = thumbRef.current.offsetWidth;
    const trackWidth = trackRect.width;

    if (trackWidth <= thumbWidth) return;

    const startOffset = thumbWidth / 2;
    const endOffset = trackWidth - thumbWidth / 2;
    const travelDistance = endOffset - startOffset;
    
    const relativeX = clientX - trackRect.left;
    const clampedX = Math.max(startOffset, Math.min(relativeX, endOffset));
    
    const percentage = travelDistance > 0 ? (clampedX - startOffset) / travelDistance : 0;

    const rawValue = min + (max - min) * percentage;
    const steppedValue = Math.round(rawValue / step) * step;
    const clampedValue = Math.max(min, Math.min(max, parseFloat(steppedValue.toFixed(10))));

    onChange(clampedValue);
  }, [min, max, step, onChange, disabled]);


  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    if ((e.target as HTMLElement).closest('.slider-thumb')) {
      return;
    }
    updateValueFromPosition(e.clientX);
  };

  const handleThumbMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing || disabled) return;
    e.preventDefault();
    isDraggingRef.current = false;
    document.body.style.cursor = 'grabbing';
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      isDraggingRef.current = true;
      updateValueFromPosition(moveEvent.clientX);
    };

    const handleMouseUp = () => {
      document.body.style.cursor = 'default';
      if (!isDraggingRef.current) {
        setIsEditing(true);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, [updateValueFromPosition, isEditing, disabled]);

  const handleCommit = () => {
    let num = parseFloat(editValue);
    if (isNaN(num)) num = value;
    const clampedValue = Math.max(min, Math.min(max, Math.round(num / step) * step));
    onChange(clampedValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleCommit();
    else if (e.key === 'Escape') {
      setEditValue(String(value.toFixed(precision)));
      setIsEditing(false);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    if (target.closest('.slider-thumb')) {
      // Logic for thumb touch start
      const handleTouchMove = (moveEvent: TouchEvent) => {
        updateValueFromPosition(moveEvent.touches[0].clientX);
      };
      const handleTouchEnd = () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    } else {
      // Logic for track touch start
      updateValueFromPosition(e.touches[0].clientX);
    }
  };

  const increment = () => !disabled && onChange(Math.min(max, value + step));
  const decrement = () => !disabled && onChange(Math.max(min, value - step));

  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
  
  const theme = {
    labelColor: isDark ? 'text-slate-200' : 'text-slate-700',
    trackBg: isDark ? 'bg-slate-800' : 'bg-slate-200',
    progressBg: 'bg-slate-500',
    thumbBg: 'bg-slate-600',
    thumbText: isDark ? 'text-slate-50' : 'text-white',
  };

  return (
    <div className={`space-y-2 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <label className={`block text-xs font-medium ${theme.labelColor}`}>{label}</label>
        <div className="w-full flex items-center justify-center gap-3">
            <ModernButton onClick={decrement} disabled={value <= min} isDark={isDark}>-</ModernButton>
            <div className="w-full">
                <div 
                    ref={trackRef}
                    className={`w-full h-1 ${theme.trackBg} rounded-full relative cursor-pointer`}
                    onMouseDown={handleTrackMouseDown}
                    onTouchStart={handleTouchStart}
                    role="slider"
                    tabIndex={disabled ? -1 : 0}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                >
                    <div 
                        className={`absolute top-0 left-0 h-full ${theme.progressBg} rounded-full pointer-events-none`}
                        style={{ width: `${progress}%` }}
                    />
                    <div
                        ref={thumbRef}
                        className={`slider-thumb w-14 h-8 ${theme.thumbBg} rounded-lg flex items-center justify-center text-sm font-mono ${theme.thumbText} shadow-md cursor-grab active:cursor-grabbing absolute top-1/2`}
                        style={{ left: `${visualProgress}%`, transform: 'translate(-50%, -50%)' }}
                        onMouseDown={handleThumbMouseDown}
                    >
                        {isEditing ? (
                        <input
                            ref={inputRef}
                            type="text"
                            inputMode="numeric"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCommit}
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-center outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        ) : (
                        <span>{value.toFixed(precision)}{displaySuffix}</span>
                        )}
                    </div>
                </div>
            </div>
            <ModernButton onClick={increment} disabled={value >= max} isDark={isDark}>+</ModernButton>
        </div>
    </div>
  );
};