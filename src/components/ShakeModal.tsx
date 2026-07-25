import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Dices, Copy, X, Sparkles, Heart, RefreshCw, Calendar, Clock, Share2 } from 'lucide-react';
import { Capsule } from '../types';
import { COLOR_THEMES } from '../constants/colors';
import { getTimeIntervalLabel, formatDateTime } from '../utils/time';
import { soundEffects } from '../utils/audio';

interface ShakeModalProps {
  isOpen: boolean;
  capsules: Capsule[];
  onClose: () => void;
  onFavorite: (id: string) => void;
  onCopy: (text: string) => void;
  onOpenPoster: (capsule: Capsule) => void;
}

export const ShakeModal: React.FC<ShakeModalProps> = ({
  isOpen,
  capsules,
  onClose,
  onFavorite,
  onCopy,
  onOpenPoster,
}) => {
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);

  // Pick random capsule with animation & confetti
  const drawRandomCapsule = useCallback(() => {
    if (capsules.length === 0) return;

    setIsFlipping(true);
    soundEffects.playShake();

    setTimeout(() => {
      // Avoid picking identical capsule if more than 1 exists
      let randomItem: Capsule;
      if (capsules.length === 1) {
        randomItem = capsules[0];
      } else {
        const available = selectedCapsule
          ? capsules.filter((c) => c.id !== selectedCapsule.id)
          : capsules;
        randomItem = available[Math.floor(Math.random() * available.length)];
      }

      setSelectedCapsule(randomItem);
      setIsFlipping(false);
      soundEffects.playFlip();

      // Launch subtle celebratory confetti
      try {
        confetti({
          particleCount: 28,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch {
        // Ignore confetti failure if canvas missing
      }
    }, 400);
  }, [capsules, selectedCapsule]);

  // Initial pick when modal opens
  useEffect(() => {
    if (isOpen && capsules.length > 0) {
      drawRandomCapsule();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const theme = selectedCapsule ? COLOR_THEMES[selectedCapsule.color] : COLOR_THEMES.purple;
  const timeInfo = selectedCapsule ? getTimeIntervalLabel(selectedCapsule.createdAt) : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        {/* Modal Content Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          className="relative z-10 w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          {/* Ambient background glow according to card color */}
          <div
            className="absolute -inset-1 rounded-3xl blur-2xl opacity-25 pointer-events-none transition-all duration-500"
            style={{
              background: `radial-gradient(circle, ${theme.accentHex}66 0%, transparent 70%)`,
            }}
          />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded-full transition cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Dices className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>灵感重温 · 抽卡</span>
                <span className="text-xs text-purple-400 font-mono font-normal">
                  ({capsules.length} 颗灵感碎片)
                </span>
              </h3>
              <p className="text-xs text-slate-400">与过往的闪念在这一刻偶遇</p>
            </div>
          </div>

          {/* Flip / Draw Card Container */}
          {capsules.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p>当前空间还没有任何灵感胶囊哦！</p>
              <p className="text-xs text-slate-500 mt-1">请先在主页记录一条闪念吧。</p>
            </div>
          ) : (
            <motion.div
              animate={isFlipping ? { rotateY: 180, scale: 0.95 } : { rotateY: 0, scale: 1 }}
              transition={{ duration: 0.4 }}
              className={`relative rounded-2xl bg-slate-950/90 border ${theme.borderClass} ${theme.glowClass} p-6 sm:p-7 min-h-[200px] flex flex-col justify-between my-2 shadow-inner`}
            >
              {/* Highlight Time Interval Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-md">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{timeInfo?.label || '重温闪念'}</span>
                </div>

                <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                  {theme.name}
                </span>
              </div>

              {/* Main Content */}
              <div className="my-3">
                <p className="text-slate-100 text-base sm:text-lg leading-relaxed whitespace-pre-wrap font-normal break-words">
                  {selectedCapsule?.content}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedCapsule ? formatDateTime(selectedCapsule.createdAt) : ''}</span>
                </div>

                {selectedCapsule && (
                  <button
                    onClick={() => onFavorite(selectedCapsule.id)}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      selectedCapsule.isFavorite
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        selectedCapsule.isFavorite ? 'fill-rose-400 text-rose-400' : ''
                      }`}
                    />
                    <span>{selectedCapsule.isFavorite ? '已收藏' : '收藏'}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          {capsules.length > 0 && selectedCapsule && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
              {/* Shake Again */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={drawRandomCapsule}
                disabled={isFlipping}
                className="col-span-2 sm:col-span-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isFlipping ? 'animate-spin' : ''}`} />
                <span>再摇一次</span>
              </motion.button>

              {/* Copy */}
              <button
                onClick={() => onCopy(selectedCapsule.content)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-medium border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Copy className="w-4 h-4 text-purple-300" />
                <span>一键复制</span>
              </button>

              {/* Poster / Share */}
              <button
                onClick={() => onOpenPoster(selectedCapsule)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs sm:text-sm font-medium border border-slate-700/80 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-amber-400" />
                <span>卡片海报</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
