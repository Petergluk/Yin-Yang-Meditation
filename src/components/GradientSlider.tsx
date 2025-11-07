import React, { useRef, useCallback, useState, useEffect } from 'react';

interface GradientSliderProps {
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    isDark: boolean;
    gradientType: 'lightness' | 'warmth';
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

export const GradientSlider: React.FC<GradientSliderProps> = ({ label, value, onChange, min, max, step, isDark, gradientType }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const isDraggingRef = useRef(false);
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value));
    }
  }, [value, isEditing]);

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
    if (!trackRef.current || !thumbRef.current) return;

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
  }, [min, max, step, onChange]);


  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.slider-thumb')) {
      return;
    }
    updateValueFromPosition(e.clientX);
  };

  const handleThumbMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isEditing) return;
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
  }, [updateValueFromPosition, isEditing]);

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
      setEditValue(String(value));
      setIsEditing(false);
    }
  };
  
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest('.slider-thumb')) {
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
      updateValueFromPosition(e.touches[0].clientX);
    }
  };

  const increment = () => onChange(Math.min(max, value + step));
  const decrement = () => onChange(Math.max(min, value - step));

  const theme = {
    labelColor: isDark ? 'text-slate-200' : 'text-slate-700',
    thumbBg: 'bg-white/90 border border-slate-300 dark:bg-slate-200 dark:border-slate-400',
    thumbText: 'text-slate-700',
  };

  const trackStyle = {
    background: gradientType === 'lightness'
        ? 'linear-gradient(to right, #000000, #ffffff)'
        : 'linear-gradient(to right, #60a5fa, #a1a1aa, #f59e0b)', // blue-400, stone-400, amber-500
  };

  const percent = max > min ? Math.round(((value - min) / (max - min)) * 100) : 0;
  const labelText = `${label} (${percent}%)`;

  return (
    <div className="space-y-2">
        <label className={`block text-xs font-medium ${theme.labelColor}`}>{labelText}</label>
        <div className="w-full flex items-center justify-center gap-3">
            <ModernButton onClick={decrement} disabled={value <= min} isDark={isDark}>-</ModernButton>
            <div className="w-full">
                <div 
                    ref={trackRef}
                    className="w-full h-1 rounded-full relative cursor-pointer"
                    style={trackStyle}
                    onMouseDown={handleTrackMouseDown}
                    onTouchStart={handleTouchStart}
                    role="slider"
                    tabIndex={0}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                >
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
                        <span>{value}%</span>
                        )}
                    </div>
                </div>
            </div>
            <ModernButton onClick={increment} disabled={value >= max} isDark={isDark}>+</ModernButton>
        </div>
    </div>
  );
};