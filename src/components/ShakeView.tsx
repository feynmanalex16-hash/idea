import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Dices, Copy, Sparkles, Heart, RefreshCw, Calendar, Clock, Share2, Layers, History } from 'lucide-react';
import { Capsule } from '../types';
import { COLOR_THEMES } from '../constants/colors';
import { getTimeIntervalLabel, formatDateTime } from '../utils/time';
import { soundEffects } from '../utils/audio';

interface ShakeViewProps {
  capsules: Capsule[];
  onFavorite: (id: string) => void;
  onCopy: (text: string) => void;
  onOpenPoster: (capsule: Capsule) => void;
  onSwitchTabToLibrary: () => void;
}

export const ShakeView: React.FC<ShakeViewProps> = ({
  capsules,
  onFavorite,
  onCopy,
  onOpenPoster,
  onSwitchTabToLibrary,
}) => {
  const [selectedCapsule, setSelectedCapsule] = useState<Capsule | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [drawHistory, setDrawHistory] = useState<Capsule[]>([]);

  // Draw random capsule function
  const drawRandomCapsule = useCallback(() => {
    if (capsules.length === 0) return;

    setIsFlipping(true);
    soundEffects.playShake();

    setTimeout(() => {
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

      setDrawHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== randomItem.id);
        return [randomItem, ...filtered].slice(0, 5);
      });

      // Confetti burst
      try {
        confetti({
          particleCount: 35,
          spread: 70,
          origin: { y: 0.45 },
          colors: ['#a855f7', '#3b82f6', '#10b981', '#f59e0b'],
        });
      } catch {
        // Ignore canvas confetti failure
      }
    }, 380);
  }, [capsules, selectedCapsule]);

  // Initial auto draw on mount if capsules exist and none selected
  useEffect(() => {
    if (capsules.length > 0 && !selectedCapsule) {
      drawRandomCapsule();
    }
  }, [capsules, selectedCapsule, drawRandomCapsule]);

  const theme = selectedCapsule ? COLOR_THEMES[selectedCapsule.color] : COLOR_THEMES.purple;
  const timeInfo = selectedCapsule ? getTimeIntervalLabel(selectedCapsule.createdAt) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Top Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>时光胶囊 · 随机偶遇</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-slate-100 to-amber-200">
          🎲 摇一摇 / 灵感抽卡
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
          点击或按 Enter 摇动时光抽卡机，重温过往写下的每一个闪念金句
        </p>
      </div>

      {capsules.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto py-16 px-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-200 mb-2">当前空间暂无胶囊</h3>
          <p className="text-xs text-slate-400 mb-6">
            快去“灵感时光库”记录你的第一条闪念吧！记录后即可随时在这里抽卡重温。
          </p>
          <button
            onClick={onSwitchTabToLibrary}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-lg hover:brightness-110 transition cursor-pointer"
          >
            去记录闪念
          </button>
        </div>
      ) : (
        /* Stage with 3D Card */
        <div className="flex flex-col items-center">
          {/* Main Card Stage */}
          <div className="w-full max-w-xl relative">
            {/* Glowing Backdrop Aura */}
            <div
              className="absolute -inset-2 rounded-3xl blur-2xl opacity-30 pointer-events-none transition-all duration-500"
              style={{
                background: `radial-gradient(circle, ${theme.accentHex}77 0%, transparent 70%)`,
              }}
            />

            <motion.div
              animate={isFlipping ? { rotateY: 180, scale: 0.94 } : { rotateY: 0, scale: 1 }}
              transition={{ duration: 0.38 }}
              className={`relative rounded-3xl bg-slate-900/90 border ${theme.borderClass} ${theme.glowClass} p-6 sm:p-8 min-h-[260px] flex flex-col justify-between shadow-2xl backdrop-blur-xl`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold shadow-md">
                  <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>{timeInfo?.label || '重温闪念'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[11px] px-2.5 py-0.5 rounded-full border ${theme.badgeBg}`}>
                    {theme.name}
                  </span>
                  {selectedCapsule && (
                    <button
                      onClick={() => onFavorite(selectedCapsule.id)}
                      title={selectedCapsule.isFavorite ? '取消收藏' : '收藏'}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        selectedCapsule.isFavorite
                          ? 'text-rose-400 bg-rose-500/15'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          selectedCapsule.isFavorite ? 'fill-rose-500 text-rose-500' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* Capsule Main Content */}
              <div className="my-4">
                <p className="text-slate-100 text-lg sm:text-xl leading-relaxed whitespace-pre-wrap font-normal break-words">
                  {selectedCapsule?.content}
                </p>
              </div>

              {/* Tags */}
              {selectedCapsule?.tags && selectedCapsule.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 my-2">
                  {selectedCapsule.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{selectedCapsule ? formatDateTime(selectedCapsule.createdAt) : ''}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => selectedCapsule && onCopy(selectedCapsule.content)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700/70 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制</span>
                  </button>

                  <button
                    onClick={() => selectedCapsule && onOpenPoster(selectedCapsule)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/70 transition cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>海报</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Core Big "Shake Again" Action Button */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={drawRandomCapsule}
              disabled={isFlipping}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-purple-950/60 border border-purple-400/30 cursor-pointer hover:brightness-110 transition"
            >
              <Dices className={`w-5 h-5 text-purple-200 ${isFlipping ? 'animate-spin' : ''}`} />
              <span>摇一摇 · 随机抽取下一颗</span>
            </motion.button>

            <button
              onClick={onSwitchTabToLibrary}
              className="px-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs sm:text-sm font-medium transition cursor-pointer"
            >
              返回完整列表
            </button>
          </div>

          {/* Draw History List */}
          {drawHistory.length > 1 && (
            <div className="w-full max-w-xl mt-12 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3 font-semibold">
                <History className="w-4 h-4 text-purple-400" />
                <span>本次抽取历史纪录 ({drawHistory.length}):</span>
              </div>
              <div className="space-y-2">
                {drawHistory.map((item, idx) => {
                  const itemTheme = COLOR_THEMES[item.color] || COLOR_THEMES.purple;
                  return (
                    <motion.div
                      key={item.id + idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      onClick={() => setSelectedCapsule(item)}
                      className={`p-3 rounded-xl bg-slate-900/60 border ${
                        item.id === selectedCapsule?.id
                          ? 'border-purple-500/50 bg-slate-900'
                          : 'border-slate-800/80 hover:border-slate-700'
                      } cursor-pointer flex items-center justify-between gap-3 text-xs text-slate-300 transition`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${itemTheme.dotBg}`}></span>
                        <span className="truncate text-slate-200">{item.content}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono shrink-0">
                        {item.dateStr}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
