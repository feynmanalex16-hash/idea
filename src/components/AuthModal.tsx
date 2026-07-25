import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Lock, Eye, EyeOff, LogIn, UserPlus, LogOut, Sparkles, ShieldCheck, KeyRound } from 'lucide-react';
import { AuthUser } from '../types';
import { loginUser, registerUser } from '../services/api';
import { soundEffects } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  onLoginSuccess: (user: AuthUser) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('请输入用户名');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('请输入密码');
      return;
    }

    setLoading(true);
    soundEffects.playFlip();

    try {
      if (mode === 'register') {
        const res = await registerUser(username.trim(), password.trim());
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          setUsername('');
          setPassword('');
          onClose();
        } else {
          setErrorMessage(res.error || '注册失败，请稍后重试');
        }
      } else {
        const res = await loginUser(username.trim(), password.trim());
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          setUsername('');
          setPassword('');
          onClose();
        } else {
          setErrorMessage(res.error || '登录失败，请核对用户名和密码');
        }
      }
    } catch {
      setErrorMessage('请求异常，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = (newMode: 'login' | 'register') => {
    soundEffects.playFlip();
    setMode(newMode);
    setErrorMessage('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden z-10"
        >
          {/* Top Decorative Glow */}
          <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* User Already Logged In view */}
          {currentUser ? (
            <div className="text-center py-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 via-indigo-600/30 to-purple-600/30 border border-purple-500/40 flex items-center justify-center mx-auto mb-4 text-purple-300 shadow-lg">
                <User className="w-8 h-8" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>已验证云端账号</span>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-1">
                {currentUser.username}
              </h3>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-purple-300 mb-6">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                <span>专属空间: {currentUser.spaceCode}</span>
              </div>

              <p className="text-xs text-slate-400 mb-8 max-w-xs mx-auto">
                您的灵感胶囊正实时归仓于该账号下，在任意设备登录相同用户名和密码即可跨屏同步。
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition cursor-pointer"
                >
                  继续使用
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="py-3 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>退出登录</span>
                </button>
              </div>
            </div>
          ) : (
            /* Login / Register Form View */
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-extrabold text-slate-100">
                  {mode === 'login' ? '账号登录' : '注册专属账号'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                输入简单的用户名和密码，随时随地跨设备重温你的闪念金句
              </p>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800/80 mb-6">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    mode === 'login'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>登录账号</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    mode === 'register'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>注册新账号</span>
                </button>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {errorMessage}
                </div>
              )}

              {/* Form inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    用户名
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="请输入用户名 (如: Alex16)"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    密码
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-600 text-xs sm:text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 border border-purple-400/30 cursor-pointer transition disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : mode === 'login' ? (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>立即登录账号</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>创建并同步账号</span>
                    </>
                  )}
                </button>
              </form>

              <div className="mt-5 text-center text-[11px] text-slate-500">
                {mode === 'login' ? (
                  <span>
                    还没有账号？{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('register')}
                      className="text-purple-400 hover:underline cursor-pointer"
                    >
                      点击这里免费注册
                    </button>
                  </span>
                ) : (
                  <span>
                    已有账号？{' '}
                    <button
                      type="button"
                      onClick={() => handleSwitchMode('login')}
                      className="text-purple-400 hover:underline cursor-pointer"
                    >
                      直接登录
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
