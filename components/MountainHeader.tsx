import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Logo } from './Logo';

interface MountainHeaderProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const MountainHeader: React.FC<MountainHeaderProps> = ({ isDarkMode, toggleTheme }) => {
  return (
    <div className="max-w-4xl mx-auto mb-8 px-4 md:px-6">
        <div className="w-full bg-[#fdfbf7] dark:bg-neutral-900 border border-[#e8e4d9] dark:border-neutral-800 py-4 px-6 relative transition-colors duration-300 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between">
                {/* Logo Section */}
                <div className="flex items-center">
                    <Logo className="h-8 md:h-10 text-stone-800 dark:text-white" textClassName="text-2xl md:text-3xl text-stone-800 dark:text-white" />
                </div>

                {/* Theme Toggle */}
                <button 
                onClick={toggleTheme}
                className="p-3 rounded-full bg-[#f4f1ea] dark:bg-neutral-800 text-stone-500 hover:text-stone-900 dark:hover:text-white transition-colors border border-transparent hover:border-[#e8e4d9] dark:hover:border-neutral-700"
                >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>
        </div>
    </div>
  );
};

export default MountainHeader;