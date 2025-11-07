import React, { useRef, useCallback, useState, useEffect } from 'react';

interface BpmSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  isDark: boolean;
}

export const BpmSlider: React.FC<BpmSliderProps> = ({ label, value, onChange, min = 20, max = 400, step = 1, isDark }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const [visualProgress, setVisualProgress] = useState(50);

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
        if (trackWidth === 0 || thumbWidth === 0 || max <= min) return;

        const thumbWidthRatio = thumbWidth / trackWidth;
        const baseProgress = (value - min) / (max - min);
        
        const scaledProgress = baseProgress * (1 - thumbWidthRatio) + (thumbWidthRatio / 2);
        
        setVisualProgress(Math.max(0, Math.min(1, scaledProgress)) * 100);
      }
    };

    calculateVisualProgress();
    
    const trackElement = trackRef.current;
    if (!trackElement) return;

    const resizeObserver = new ResizeObserver(calculateVisualProgress);
    resizeObserver.observe(trackElement);

    return () => {
      if (trackElement) {
        resizeObserver.unobserve(trackElement);
      }
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
    const clampedValue = Math.max(min, Math.min(max, steppedValue));
    onChange(clampedValue);
  }, [min, max, step, onChange]);


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
  
  const handleTrackMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.slider-thumb')) {
      return;
    }
    updateValueFromPosition(e.clientX);
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

  const handleCommit = () => {
    let num = parseInt(editValue, 10);
    if (isNaN(num)) num = min;
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

  const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;

  const theme = {
    labelColor: isDark ? 'text-slate-200' : 'text-slate-700',
    containerBg: isDark ? 'bg-slate-700' : 'bg-white/60',
    containerBorder: isDark ? 'border-slate-600/50' : 'border-slate-300',
    buttonText: isDark ? 'text-slate-300' : 'text-slate-600',
    buttonHoverBg: isDark ? 'hover:bg-slate-600/70' : 'hover:bg-slate-200',
    trackBg: isDark ? 'bg-slate-800' : 'bg-slate-200',
    progressBg: 'bg-slate-500',
    thumbBg: isDark ? 'bg-slate-600' : 'bg-white',
    thumbBorder: isDark ? 'border-slate-500' : 'border-slate-400',
    thumbText: isDark ? 'text-white' : 'text-slate-800',
  };

  return (
    <div className="space-y-1">
      <label className={`block text-sm font-medium ${theme.labelColor}`}>{label}</label>
      <div className={`w-full flex h-12 border ${theme.containerBorder} rounded-lg overflow-hidden ${theme.containerBg} select-none`}>
        <button
          onClick={decrement}
          disabled={value <= min}
          className={`px-4 text-xl font-bold ${theme.buttonText} ${theme.buttonHoverBg} transition-colors duration-200 disabled:opacity-40 disabled:hover:bg-transparent border-r ${theme.containerBorder}`}
          aria-label={`Decrease ${label}`}
        >
          -
        </button>
        
        <div 
          ref={trackRef}
          className={`flex-grow relative ${theme.trackBg} cursor-pointer`}
          onMouseDown={handleTrackMouseDown}
          onTouchStart={handleTouchStart}
          role="slider"
          tabIndex={-1}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
        >
          <div 
            className={`absolute top-0 left-0 h-full ${theme.progressBg}`}
            style={{ width: `${progress}%` }}
          />
          <div
            ref={thumbRef}
            className={`slider-thumb w-16 h-full ${theme.thumbBg} border-x-2 ${theme.thumbBorder} flex items-center justify-center text-xl font-mono font-semibold ${theme.thumbText} shadow-lg cursor-grab active:cursor-grabbing absolute top-1/2`}
            style={{ left: `${visualProgress}%`, transform: 'translate(-50%, -50%)' }}
            onMouseDown={handleThumbMouseDown}
          >
             {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleCommit}
                onKeyDown={handleKeyDown}
                className={`w-full bg-transparent text-center ${theme.thumbText} outline-none [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
              />
            ) : (
              <span>{value}</span>
            )}
          </div>
        </div>
        
        <button
          onClick={increment}
          disabled={value >= max}
          className={`px-4 text-xl font-bold ${theme.buttonText} ${theme.buttonHoverBg} transition-colors duration-200 disabled:opacity-40 disabled:hover:bg-transparent border-l ${theme.containerBorder}`}
          aria-label={`Increase ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
};
