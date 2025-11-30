import React from 'react';

interface LogoProps {
  className?: string;
  textClassName?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10", textClassName = "text-2xl", showText = true }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg 
        viewBox="0 0 40 40" 
        fill="none" 
        className={`${className} w-auto`} 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Outline Path - Steps */}
        <path 
          d="M8 28H14V22H20V14H26V8C26 6.89543 26.8954 6 28 6H30C31.1046 6 32 6.89543 32 8V30C32 31.1046 31.1046 32 30 32H8C6.89543 32 6 31.1046 6 30V28Z" 
          stroke="currentColor" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        {/* Floating Dot */}
        <circle cx="18" cy="8" r="3.5" className="fill-emerald-500" />
      </svg>
      
      {showText && (
        <span className={`font-sans font-medium tracking-tight text-black dark:text-white ${textClassName}`}>
          Habitify
        </span>
      )}
    </div>
  );
};