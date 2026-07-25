import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers, Dices, ArrowRight, Clock, Heart, ShieldCheck, UserCheck, UserPlus } from 'lucide-react';
import { Capsule, CapsuleColor, AuthUser } from '../types';
import { InputArea } from './InputArea';

interface InputViewProps {
  spaceCode: string;
  capsules: Capsule[];
  currentUser: AuthUser | null;
  onSubmit: (content: string, color: CapsuleColor, tags: string[]) => void;
  onSwitchTab: (tab: 'library' | 'shake') => void;
  onOpenAuthModal: () => void;
}

export const InputView: React.FC<InputViewProps> = ({
  spaceCode,
  capsules,
  currentUser,
  onSubmit,
  onSwitchTab,
  onOpenAuthModal,
}) => {
  const totalCount = capsules.length;
  const favoriteCount = capsules.filter((c) => c.isFavorite).length;
  const latestCapsule = capsules.length > 0 ? capsules[0] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Title Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
          <span>极速灵感录入</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          ✍️ 记录此刻灵感胶囊
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          无需思考排版，随手写下闪念、金句与顿悟，随时封存入库
        </p>

        {/* Mode Status Indicator Banner */}
        <div className="mt-4 flex items-center justify-center">
          {currentUser ? (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>当前记录归仓于账号: <strong className="font-bold text-emerald-200">{currentUser.username}</strong></span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
              <span>纯净访客模式: 直接记录归属于本设备</span>
              <button
                onClick={onOpenAuthModal}
                className="text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer ml-1 flex items-center gap-0.5"
              >
                <UserPlus className="w-3 h-3" />
                <span>登录/注册账号同步</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Input Form Component */}
      <InputArea spaceCode={spaceCode} onSubmit={onSubmit} />

      {/* Overview Cards & Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {/* Card 1: 时光时光库 入口 */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onSwitchTab('library')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/40 transition cursor-pointer flex flex-col justify-between shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 group-hover:text-blue-300 transition">
                时光时光库
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
              {totalCount} 颗
            </span>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            {latestCapsule
              ? `最新录入：“${latestCapsule.content}”`
              : '查看全部历史灵感网格，支持搜索、筛选与精美海报生成'}
          </p>

          <div className="flex items-center justify-between text-xs text-blue-400 font-semibold pt-2 border-t border-slate-800/80">
            <span>浏览历史闪念卡片</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: 摇一摇抽卡 入口 */}
        <motion.div
          whileHover={{ y: -3 }}
          onClick={() => onSwitchTab('shake')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition cursor-pointer flex flex-col justify-between shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Dices className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 group-hover:text-amber-300 transition">
                摇一摇 / 灵感抽卡
              </h3>
            </div>
            {favoriteCount > 0 && (
              <span className="text-xs text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                {favoriteCount}
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 line-clamp-2 mb-4">
            进入摇一摇抽卡，随机重温过往记录的每一条金句与灵感 Spark
          </p>

          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold pt-2 border-t border-slate-800/80">
            <span>开启随机抽卡重温</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};
