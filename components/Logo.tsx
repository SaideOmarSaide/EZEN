
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Shape: Rounded Hexagon */}
      <path 
        d="M50 5L89.1746 27.5V72.5L50 95L10.8254 72.5V27.5L50 5Z" 
        fill="currentColor" 
        fillOpacity="0.1"
      />
      
      {/* Stylized 'E' + Growth Bars */}
      <path 
        d="M35 30H70" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round"
      />
      <path 
        d="M35 50H60" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round"
      />
      <path 
        d="M35 70H75" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round"
      />
      
      {/* Vertical Spine */}
      <path 
        d="M35 30V70" 
        stroke="currentColor" 
        strokeWidth="10" 
        strokeLinecap="round"
      />
      
      {/* Accent Point (Signal/Sync indicator) */}
      <circle cx="75" cy="50" r="6" fill="currentColor" />
    </svg>
  );
};
