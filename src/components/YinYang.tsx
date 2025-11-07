import React, { forwardRef, useImperativeHandle, useRef } from 'react';

export interface YinYangHandle {
  updateCurve: (radius: number) => void;
}

interface YinYangProps {
  size: number;
  maxRadius: number;
  curveRadius: number;
  eyeAngleOffset: number;
  borderWidth: number;
}

export const YinYang = forwardRef<YinYangHandle, YinYangProps>(({
  size,
  maxRadius,
  curveRadius,
  eyeAngleOffset,
  borderWidth,
}, ref) => {
  const pathRef = useRef<SVGPathElement>(null);

  const center = 50;
  const mainRadius = 50 - (borderWidth / 2);
  
  const eyeCenterYTop = -mainRadius / 2;
  const eyeCenterYBottom = mainRadius / 2;

  const pulseStyle = {
    '--max-eye-scale': 1,
  } as React.CSSProperties;

  useImperativeHandle(ref, () => ({
    updateCurve: (newRadius: number) => {
      if (pathRef.current) {
        const pathD = `M${center},${center + mainRadius} A${newRadius} ${newRadius} 0 0 0 ${center} ${center} A${newRadius} ${newRadius} 0 0 1 ${center} ${center - mainRadius} A${mainRadius} ${mainRadius} 0 0 1 ${center} ${center + mainRadius} Z`;
        pathRef.current.setAttribute('d', pathD);
      }
    },
  }));

  const initialPathD = `M${center},${center + mainRadius} A${curveRadius} ${curveRadius} 0 0 0 ${center} ${center} A${curveRadius} ${curveRadius} 0 0 1 ${center} ${center - mainRadius} A${mainRadius} ${mainRadius} 0 0 1 ${center} ${center + mainRadius} Z`;

  const darkEyeStyle: React.CSSProperties = {
    ...pulseStyle,
    transformOrigin: `0px ${eyeCenterYTop}px`,
    animation: `pulse-scale var(--pulse-duration) linear infinite, color-invert-dark-eye var(--eye-color-duration) linear infinite`
  };

  const lightEyeStyle: React.CSSProperties = {
    ...pulseStyle,
    transformOrigin: `0px ${eyeCenterYBottom}px`,
    animation: `pulse-scale var(--pulse-duration) linear var(--pulse-delay) infinite, color-invert-light-eye var(--eye-color-duration) linear infinite`
  };


  return (
    <div
      className="animate-spin-continuous"
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
                  ref={pathRef}
                  d={initialPathD}
                  fill="#ffffff"
              />
              <g transform={`translate(${center} ${center}) rotate(${eyeAngleOffset})`}>
                <circle cx={0} cy={eyeCenterYTop} r={maxRadius} style={darkEyeStyle} />
                <circle cx={0} cy={eyeCenterYBottom} r={maxRadius} style={lightEyeStyle} />
              </g>
          </svg>
      </div>
    </div>
  );
});