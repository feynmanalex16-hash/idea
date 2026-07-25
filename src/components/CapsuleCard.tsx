import React from 'react';
import { motion } from 'motion/react';
import { Heart, Copy, Trash2, Calendar, Sparkles, Hash } from 'lucide-react';
import { Capsule } from '../types';
import { COLOR_THEMES } from '../constants/colors';
import { getTimeIntervalLabel, formatDate } from '../utils/time';

interface CapsuleCardProps {
  capsule: Capsule;
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  onOpenPoster?: (capsule: Capsule) => void;
}

export const CapsuleCard: React.FC<CapsuleCardProps> = ({
  capsule,
  onFavorite,
  onDelete,
  onCopy,
  onOpenPoster,
}) => {
  const theme = COLOR_THEMES[capsule.color] || COLOR_THEMES.purple;
  const timeInfo = getTimeIntervalLabel(capsule.createdAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25 }}
      className={`group relative rounded-2xl bg-slate-900/80 border ${theme.borderClass} ${theme.glowClass} p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:bg-slate-900/95`}
    >
      {/* Subtle background ambient gradient fill */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.bgGradient} opacity-50 pointer-events-none`}></div>

      {/* Top Header info */}
      <div className="relative z-10 flex items-center justify-between gap-2 mb-3">
        {/* Color Theme pill badge & Relative time tag */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${theme.badgeBg} flex items-center gap-1`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dotBg}`}></span>
            {theme.name}
          </span>
          <span className="text-[11px] text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
            {timeInfo.label}
          </span>
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={() => onFavorite(capsule.id)}
          title={capsule.isFavorite ? '取消收藏' : '收藏这颗胶囊'}
          className={`p-1.5 rounded-lg transition cursor-pointer ${
            capsule.isFavorite
              ? 'text-rose-500 bg-rose-500/10 hover:bg-rose-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${capsule.isFavorite ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Content text */}
      <div className="relative z-10 my-1">
        <p className="text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-normal break-words">
          {capsule.content}
        </p>
      </div>

      {/* Tags if present */}
      {capsule.tags && capsule.tags.length > 0 && (
        <div className="relative z-10 flex flex-wrap gap-1 mt-3">
          {capsule.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] text-slate-400 bg-slate-800/40 border border-slate-700/40 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Footer Info & Action buttons */}
      <div className="relative z-10 flex items-center justify-between border-t border-slate-800/60 pt-3 mt-4 text-xs text-slate-500">
        <div className="flex items-center gap-1 font-mono text-[11px]">
          <Calendar className="w-3 h-3 text-slate-500" />
          <span>{formatDate(capsule.createdAt)}</span>
        </div>

        <div className="flex items-center gap-1">
          {/* Poster button */}
          {onOpenPoster && (
            <button
              onClick={() => onOpenPoster(capsule)}
              title="导出精致卡片海报"
              className="p-1.5 text-slate-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Copy button */}
          <button
            onClick={() => onCopy(capsule.content)}
            title="一键复制文本"
            className="p-1.5 text-slate-400 hover:text-purple-300 hover:bg-slate-800 rounded-lg transition cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>

          {/* Delete button */}
          <button
            onClick={() => onDelete(capsule.id)}
            title="删除此胶囊"
            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
