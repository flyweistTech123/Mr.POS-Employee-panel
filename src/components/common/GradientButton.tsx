import React, { type ButtonHTMLAttributes } from 'react';

interface GradientButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => {
  return (
    <button
      className={`w-full py-4 rounded-[14px] text-white font-semibold text-[16px] transition-transform active:scale-[0.98] shadow-md hover:opacity-90 ${className}`}
      style={{
        background: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
        borderImageSource: 'linear-gradient(180deg, #6A1B9A 0%, #D32F2F 100%)',
        borderImageSlice: 1,
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
      {...props} 
    >
      {children}
    </button>
  );
};

export default GradientButton;