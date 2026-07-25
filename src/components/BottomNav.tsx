import React from 'react';
import { motion } from 'motion/react';
import { Edit3, Layers, Dices } from 'lucide-react';
import { soundEffects } from '../utils/audio';

export type ActiveTab = 'input' | 'library' | 'shake';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  totalCapsules: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  totalCapsules,
}) => {
  const handleSelect = (tab: ActiveTab) => {
    soundEffects.playFlip();
    onTabChange(tab);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 shadow-[0_-10px_25px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto px-3 py-2">
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-inner">
          {/* Menu Item 1: 极速录入 */}
          <button
            onClick={() => handleSelect('input')}
            className={`relative py-2 px-1.5 xs:px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] xs:text-xs font-semibold transition cursor-pointer ${
              activeTab === 'input'
                ? 'text-purple-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'input' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/30 via-indigo-600/30 to-purple-600/30 border border-purple-500/40 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-1 xs:gap-1.5 whitespace-nowrap">
              <Edit3 className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${activeTab === 'input' ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />
              <span>极速录入</span>
            </div>
          </button>

          {/* Menu Item 2: 时光库 */}
          <button
            onClick={() => handleSelect('library')}
            className={`relative py-2 px-1.5 xs:px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] xs:text-xs font-semibold transition cursor-pointer ${
              activeTab === 'library'
                ? 'text-blue-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'library' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-blue-600/30 border border-blue-500/40 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-1 xs:gap-1.5 whitespace-nowrap">
              <Layers className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${activeTab === 'library' ? 'text-blue-400' : 'text-slate-500'}`} />
              <span>时光灵感库</span>
              {totalCapsules > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeTab === 'library' ? 'bg-blue-500/30 text-blue-200 border border-blue-400/30' : 'bg-slate-800 text-slate-500'
                }`}>
                  {totalCapsules}
                </span>
              )}
            </div>
          </button>

          {/* Menu Item 3: 摇一摇抽卡 */}
          <button
            onClick={() => handleSelect('shake')}
            className={`relative py-2 px-1.5 xs:px-2 rounded-xl flex items-center justify-center gap-1 text-[11px] xs:text-xs font-semibold transition cursor-pointer ${
              activeTab === 'shake'
                ? 'text-amber-200'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'shake' && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-600/30 via-purple-600/30 to-amber-600/30 border border-amber-500/40 shadow-md"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <div className="relative z-10 flex items-center gap-1 xs:gap-1.5 whitespace-nowrap">
              <Dices className={`w-3.5 h-3.5 xs:w-4 xs:h-4 ${activeTab === 'shake' ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'}`} />
              <span>摇一摇抽卡</span>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};
