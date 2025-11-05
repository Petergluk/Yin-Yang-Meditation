import React from 'react';

/**
 * Props for the YinYang component.
 */
interface YinYangProps {
  size: number;
  rotationSpeed: number;
  pulseSpeed: number;
  minRadius: number;
  maxRadius: number;
  curveRadius: number;
  invertPulsePhase: boolean;
  eyeAngleOffset: number;
  borderWidth: number;
  darkEyeColor: string;
  lightEyeColor: string;
}

export const YinYang: React.FC<YinYangProps> = ({
  size,
  rotationSpeed,
  pulseSpeed,
  minRadius,
  maxRadius,
  curveRadius,
  invertPulsePhase,
  eyeAngleOffset,
  borderWidth,
  darkEyeColor,
  lightEyeColor,
}) => {
  const rotationStyle = {
    animationDuration: `${rotationSpeed}s`,
  };

  const center = 50;
  const mainRadius = 50 - (borderWidth / 2);

  const pathD = `M${center},${center + mainRadius} A${curveRadius} ${curveRadius} 0 0 0 ${center} ${center} A${curveRadius} ${curveRadius} 0 0 1 ${center} ${center - mainRadius} A${mainRadius} ${mainRadius} 0 0 1 ${center} ${center + mainRadius} Z`;
  
  const eyeCenterYTop = -mainRadius / 2;
  const eyeCenterYBottom = mainRadius / 2;
  
  const minScale = minRadius / maxRadius;

  const basePulseStyle = {
    animationDuration: `${pulseSpeed}s`,
    '--min-scale': minScale,
    '--max-scale': 1,
  } as React.CSSProperties;

  const invertedPulseStyle = invertPulsePhase ? {
    ...basePulseStyle,
    animationDelay: `-${pulseSpeed / 2}s`,
  } : basePulseStyle;

  return (
    <div
      className="animate-spin-continuous"
      style={rotationStyle}
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
                  d={pathD}
                  fill="#ffffff"
              />
              <g transform={`translate(${center} ${center}) rotate(${eyeAngleOffset})`}>
                <circle cx={0} cy={eyeCenterYTop} r={maxRadius} className="animate-pulse-scale" style={{...basePulseStyle, fill: darkEyeColor, transformOrigin: `0px ${eyeCenterYTop}px`}} />
                <circle cx={0} cy={eyeCenterYBottom} r={maxRadius} className="animate-pulse-scale" style={{...invertedPulseStyle, fill: lightEyeColor, transformOrigin: `0px ${eyeCenterYBottom}px`}} />
              </g>
          </svg>
      </div>
    </div>
  );
};
