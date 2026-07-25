import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Dices, Copy, Edit3, Volume2, VolumeX, ShieldCheck, User } from 'lucide-react';
import { AuthUser } from '../types';
import { soundEffects } from '../utils/audio';

interface HeaderProps {
  spaceCode: string;
  totalCapsules: number;
  currentUser: AuthUser | null;
  onOpenSpaceModal: () => void;
  onOpenAuthModal: () => void;
  onTriggerShake: () => void;
  onCopySpaceCode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  spaceCode,
  totalCapsules,
  currentUser,
  onOpenSpaceModal,
  onOpenAuthModal,
  onTriggerShake,
  onCopySpaceCode,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="relative group cursor-pointer" onClick={onTriggerShake}>
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 opacity-60 blur-md group-hover:opacity-90 transition duration-300"></div>
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-purple-400 shadow-inner">
              <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-slate-100 to-amber-200">
                灵感胶囊
              </h1>
              {currentUser ? (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  云端归仓
                </span>
              ) : (
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  <ShieldCheck className="w-3 h-3 text-purple-400" />
                  免登录/可注册
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden xs:block">随手闪念 · 摇一摇时光重温</p>
          </div>
        </div>

        {/* Center/Right Action Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* User Account Login/Register Button */}
          <button
            onClick={onOpenAuthModal}
            title={currentUser ? `已登录: ${currentUser.username}` : '点击登录或注册账号'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              currentUser
                ? 'bg-purple-950/60 border-purple-500/40 text-purple-200 hover:bg-purple-900/60'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-purple-500/50 hover:text-purple-300'
            }`}
          >
            <User className={`w-3.5 h-3.5 ${currentUser ? 'text-purple-400' : 'text-slate-400'}`} />
            <span className="max-w-[80px] sm:max-w-[110px] truncate">
              {currentUser ? currentUser.username : '登录/注册'}
            </span>
          </button>

          {/* Shake / Random Draw Button (Core Highlight) */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onTriggerShake}
            className="relative group overflow-hidden px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-medium text-xs sm:text-sm shadow-lg shadow-purple-900/30 border border-purple-400/30 flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Dices className="w-4 h-4 text-purple-200 group-hover:rotate-180 transition-transform duration-500" />
            <span className="hidden xs:inline">摇一摇抽卡</span>
            <span className="xs:hidden">抽卡</span>
            {totalCapsules > 0 && (
              <span className="hidden lg:inline-block ml-1 text-[10px] bg-purple-950/60 px-1.5 py-0.5 rounded-full border border-purple-400/20 text-purple-200">
                {totalCapsules}
              </span>
            )}
          </motion.button>

          {/* Space Code Pill */}
          <div className="hidden sm:flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition">
            <button
              onClick={onOpenSpaceModal}
              title="点击切换或修改空间代号"
              className="flex items-center gap-1.5 font-mono text-purple-300 hover:text-purple-200 font-semibold cursor-pointer max-w-[90px] md:max-w-[130px] truncate"
            >
              <span className="text-slate-500 text-[11px]">空间:</span>
              <span>{spaceCode}</span>
              <Edit3 className="w-3 h-3 text-slate-400 hover:text-slate-200 shrink-0" />
            </button>

            <div className="w-[1px] h-3.5 bg-slate-800 mx-2"></div>

            <button
              onClick={onCopySpaceCode}
              title="复制当前空间代号 (用于跨设备同步)"
              className="p-1 text-slate-400 hover:text-purple-300 rounded transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? '音效已开启' : '音效已静音'}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-900/80 border border-slate-800 transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-purple-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
