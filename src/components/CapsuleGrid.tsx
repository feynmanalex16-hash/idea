import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, Sparkles, SlidersHorizontal, ArrowUpDown, Inbox } from 'lucide-react';
import { Capsule, CapsuleColor, SortOrder } from '../types';
import { COLOR_THEMES } from '../constants/colors';
import { CapsuleCard } from './CapsuleCard';

interface CapsuleGridProps {
  capsules: Capsule[];
  onFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  onOpenPoster: (capsule: Capsule) => void;
  onTriggerShake: () => void;
}

export const CapsuleGrid: React.FC<CapsuleGridProps> = ({
  capsules,
  onFavorite,
  onDelete,
  onCopy,
  onOpenPoster,
  onTriggerShake,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState<CapsuleColor | 'all'>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Filtered & sorted capsules list
  const filteredCapsules = useMemo(() => {
    let list = [...capsules];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.content.toLowerCase().includes(q) ||
          (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (colorFilter !== 'all') {
      list = list.filter((c) => c.color === colorFilter);
    }

    if (onlyFavorites) {
      list = list.filter((c) => c.isFavorite);
    }

    if (sortOrder === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortOrder === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortOrder === 'random') {
      // Deterministic shuffle mock for view
      list.sort(() => Math.sin(list.length) - 0.5);
    }

    return list;
  }, [capsules, searchQuery, colorFilter, onlyFavorites, sortOrder]);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
      {/* Header Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pt-4 border-t border-slate-800/80">
        {/* Left Title & Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-base sm:text-lg font-bold text-slate-100">时光时光库</h2>
          </div>
          <span className="text-xs bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full text-slate-300 font-mono">
            {filteredCapsules.length} / {capsules.length} 颗
          </span>
        </div>

        {/* Right Search & Filter Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Box */}
          <div className="relative min-w-[180px] sm:min-w-[220px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索闪念与标签..."
              className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Favorites Filter */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              onlyFavorites
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-medium'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-rose-400 text-rose-400' : ''}`} />
            <span>收藏</span>
          </button>

          {/* Sort Selector */}
          <div className="flex items-center bg-slate-900/80 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-400">
            <ArrowUpDown className="w-3 h-3 text-slate-500 mr-1" />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="newest" className="bg-slate-900 text-slate-200">最新录入</option>
              <option value="oldest" className="bg-slate-900 text-slate-200">最早记录</option>
            </select>
          </div>
        </div>
      </div>

      {/* Color Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
        <button
          onClick={() => setColorFilter('all')}
          className={`px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer shrink-0 ${
            colorFilter === 'all'
              ? 'bg-purple-500/20 border-purple-500/40 text-purple-200'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          全部氛围
        </button>

        {(Object.keys(COLOR_THEMES) as CapsuleColor[]).map((cKey) => {
          const theme = COLOR_THEMES[cKey];
          const isSelected = colorFilter === cKey;
          return (
            <button
              key={cKey}
              onClick={() => setColorFilter(cKey)}
              className={`px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? `${theme.badgeBg} font-semibold`
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${theme.dotBg}`}></span>
              <span>{theme.name}</span>
            </button>
          );
        })}
      </div>

      {/* Grid Display */}
      {filteredCapsules.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mt-2">
          <AnimatePresence mode="popLayout">
            {filteredCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onFavorite={onFavorite}
                onDelete={onDelete}
                onCopy={onCopy}
                onOpenPoster={onOpenPoster}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-12 py-16 text-center rounded-2xl bg-slate-900/40 border border-slate-800/60 p-6 max-w-lg mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-200 mb-1">
            {capsules.length === 0 ? '灵感胶囊库尚空' : '没有找到符合条件的胶囊'}
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-xs mx-auto">
            {capsules.length === 0
              ? '在上方输入框写下你的第一个闪念，它将永久珍藏在当前空间中...'
              : '尝试清除搜索词或重置筛选规则'}
          </p>

          {capsules.length > 0 && (
            <button
              onClick={() => {
                setSearchQuery('');
                setColorFilter('all');
                setOnlyFavorites(false);
              }}
              className="text-xs px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300 border border-slate-700 transition cursor-pointer"
            >
              重置筛选条件
            </button>
          )}

          {capsules.length > 0 && (
            <div className="mt-3">
              <button
                onClick={onTriggerShake}
                className="text-xs text-purple-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> 随机摇一颗试试
              </button>
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
};
