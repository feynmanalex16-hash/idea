import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Sparkles, Quote, Calendar, Hash } from 'lucide-react';
import { Capsule } from '../types';
import { COLOR_THEMES } from '../constants/colors';
import { getTimeIntervalLabel, formatDateTime } from '../utils/time';

interface PosterModalProps {
  capsule: Capsule | null;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export const PosterModal: React.FC<PosterModalProps> = ({
  capsule,
  onClose,
  onCopy,
}) => {
  if (!capsule) return null;

  const theme = COLOR_THEMES[capsule.color] || COLOR_THEMES.purple;
  const timeInfo = getTimeIntervalLabel(capsule.createdAt);

  const formattedShareText = `「灵感胶囊」\n\n"${capsule.content}"\n\n📅 记录于: ${formatDateTime(capsule.createdAt)} (${timeInfo.label})\n✨ 空间: ${capsule.spaceCode}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-4 text-xs font-mono text-amber-400">
            <Sparkles className="w-4 h-4" />
            <span>灵感海报卡片</span>
          </div>

          {/* Renderable Poster Canvas Card */}
          <div className={`relative rounded-3xl bg-slate-950 border ${theme.borderClass} ${theme.glowClass} p-7 sm:p-8 overflow-hidden shadow-2xl`}>
            {/* Background glowing aura */}
            <div
              className="absolute -inset-2 rounded-3xl blur-2xl opacity-35 pointer-events-none"
              style={{
                background: `radial-gradient(circle, ${theme.accentHex}77 0%, transparent 70%)`,
              }}
            />

            {/* Decorative Quote Icon */}
            <Quote className={`w-8 h-8 ${theme.badgeText} opacity-40 mb-3`} />

            {/* Main Content Quote */}
            <p className="relative z-10 text-slate-100 text-lg sm:text-xl font-medium leading-relaxed whitespace-pre-wrap break-words tracking-wide my-2">
              {capsule.content}
            </p>

            {/* Tags */}
            {capsule.tags && capsule.tags.length > 0 && (
              <div className="relative z-10 flex flex-wrap gap-1.5 my-4">
                {capsule.tags.map((t) => (
                  <span
                    key={t}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Watermark & Time Footer */}
            <div className="relative z-10 pt-5 mt-6 border-t border-slate-800/80 flex items-end justify-between text-xs text-slate-400">
              <div>
                <p className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-amber-200">
                  灵感胶囊 · Inspiration Capsule
                </p>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono mt-0.5">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDateTime(capsule.createdAt)}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
                  空间: {capsule.spaceCode}
                </span>
              </div>
            </div>
          </div>

          {/* Share Actions */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => onCopy(formattedShareText)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-600 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:brightness-110 transition"
            >
              <Copy className="w-4 h-4" />
              <span>复制排版长文案</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
