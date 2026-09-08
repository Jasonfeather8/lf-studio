import React from 'react';

interface AnimatedWaveProps {
  percentage: number;
  className?: string;
}

export default function AnimatedWave({ percentage, className = '' }: AnimatedWaveProps) {
  const waterLevel = 100 - percentage;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-[inherit] ${className}`} style={{ borderRadius: 'inherit' }}>
      <div 
        className="absolute w-full h-[800px] left-0"
        style={{ 
          top: `${waterLevel}%`,
          transition: 'top 1.5s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className="water-wave wave-1" />
        <div className="water-wave wave-2" />
        <div className="water-wave wave-3" />
      </div>
      <style>{`
        .water-wave {
          position: absolute;
          width: 800px;
          height: 800px;
          left: 50%;
          margin-left: -400px;
          top: 0;
          margin-top: -30px; 
          background: linear-gradient(744deg, #0a5c4e, #52bfa6 60%, #a7f3d0);
          border-radius: 40%;
          animation: water-wave-spin 55s infinite linear;
          opacity: 0.6;
          transform-origin: 50% 50%;
        }

        .water-wave.wave-2 {
          animation-duration: 50s;
          opacity: 0.4;
          margin-top: -20px;
        }

        .water-wave.wave-3 {
          animation-duration: 45s;
          opacity: 0.2;
          margin-top: -10px;
        }

        @keyframes water-wave-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
