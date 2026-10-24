import React from 'react';

interface LoaderProps {
  size?: number;
  thickness?: number;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 64, thickness = 8, className = '' }) => {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`} 
      style={{ width: size, height: size }}
    >
      {/* 
        Modern Spin Container 
        - We apply the anticlockwise spin here so BOTH the ring and the dot revolve together.
      */}
      <div 
        className="absolute inset-0 animate-spin"
        style={{ animationDirection: 'reverse' }}
      >
        {/* Rotating Gradient Ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
            WebkitMask: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`,
            mask: `radial-gradient(farthest-side, transparent calc(100% - ${thickness}px), #000 calc(100% - ${thickness}px))`,
          }}
        />
        
        {/* The white dot at the bottom of the ring */}
        <div 
          className="absolute rounded-full bg-white shadow-sm"
          style={{
            width: thickness + 2,
            height: thickness + 2,
            bottom: -1,
            left: '50%',
            transform: 'translateX(-50%)', // Centers the dot horizontally
          }}
        />
      </div>
    </div>
  );
};

export default Loader;