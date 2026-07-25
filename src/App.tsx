/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, KeyRound, Sparkles } from 'lucide-react';
import { Capsule, CapsuleColor, AuthUser } from './types';
import {
  getStoredSpaceCode,
  setStoredSpaceCode,
  fetchCapsules,
  addCapsule,
  deleteCapsule,
  toggleFavorite,
  getStoredUser,
  clearStoredUser,
} from './services/api';
import { soundEffects } from './utils/audio';

import { Header } from './components/Header';
import { InputArea } from './components/InputArea';
import { InputView } from './components/InputView';
import { CapsuleGrid } from './components/CapsuleGrid';
import { ShakeView } from './components/ShakeView';
import { BottomNav, ActiveTab } from './components/BottomNav';
import { ShakeModal } from './components/ShakeModal';
import { SpaceCodeModal } from './components/SpaceCodeModal';
import { AuthModal } from './components/AuthModal';
import { PosterModal } from './components/PosterModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getStoredUser());
  const [spaceCode, setSpaceCode] = useState<string>(() => getStoredSpaceCode());
  const [capsules, setCapsules] = useState<Capsule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Bottom Navigation Tab: 'input' | 'library' | 'shake'
  const [activeTab, setActiveTab] = useState<ActiveTab>('input');

  // Modals state
  const [isShakeModalOpen, setIsShakeModalOpen] = useState<boolean>(false);
  const [isSpaceModalOpen, setIsSpaceModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [posterCapsule, setPosterCapsule] = useState<Capsule | null>(null);

  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, type: 'success' | 'error' | 'info' = 'success', description?: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth Callbacks
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setSpaceCode(user.spaceCode);
    addToast(`欢迎回来，${user.username}！`, 'success', `已切换至专属账号空间 (${user.spaceCode})`);
  };

  const handleLogout = () => {
    clearStoredUser();
    setCurrentUser(null);
    const newCode = getStoredSpaceCode();
    setSpaceCode(newCode);
    addToast('已退出登录', 'info', '已切换回独立访客空间');
  };

  // Load capsules when spaceCode changes
  const loadSpaceCapsules = useCallback(async (code: string) => {
    setLoading(true);
    try {
      const data = await fetchCapsules(code);
      setCapsules(data);
    } catch (err) {
      console.error('Error loading capsules:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSpaceCapsules(spaceCode);
  }, [spaceCode, loadSpaceCapsules]);

  // Switch space code
  const handleSwitchSpace = (newCode: string) => {
    const saved = setStoredSpaceCode(newCode);
    setSpaceCode(saved);
    addToast(`已成功切换到空间: ${saved}`, 'info', '数据已同步加载');
  };

  // Add new capsule
  const handleSubmitCapsule = async (
    content: string,
    color: CapsuleColor,
    tags: string[]
  ) => {
    try {
      const created = await addCapsule(spaceCode, content, color, tags);
      setCapsules((prev) => [created, ...prev.filter((c) => c.id !== created.id)]);
      addToast('闪念胶囊归仓！', 'success', '已加入当前空间时光库');
    } catch (err) {
      addToast('保存失败，请稍后重试', 'error');
    }
  };

  // Delete capsule
  const handleDeleteCapsule = async (id: string) => {
    const target = capsules.find((c) => c.id === id);
    setCapsules((prev) => prev.filter((c) => c.id !== id));
    await deleteCapsule(spaceCode, id);
    addToast('胶囊已从当前空间删除', 'info', target?.content.substring(0, 16) + '...');
  };

  // Favorite capsule
  const handleToggleFavorite = async (id: string) => {
    setCapsules((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isFavorite: !c.isFavorite } : c))
    );
    const updated = await toggleFavorite(spaceCode, id);
    if (updated) {
      addToast(
        updated.isFavorite ? '已加入收藏 ❤️' : '已取消收藏',
        'info'
      );
    }
  };

  // Copy text helper
  const handleCopyText = (text: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text);
      addToast('已复制内容到剪贴板 📋', 'success');
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      addToast('已复制内容到剪贴板 📋', 'success');
    }
  };

  // Copy Space Code helper
  const handleCopySpaceCode = () => {
    handleCopyText(spaceCode);
    addToast(`已复制空间代号: ${spaceCode}`, 'info', '在任何设备输入此代号即可同步全部灵感');
  };

  // Toggle sound
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundEffects.enabled = nextState;
    if (nextState) soundEffects.playFlip();
  };

  // Handle shake button trigger
  const handleTriggerShake = () => {
    if (capsules.length === 0) {
      addToast('提示: 当前空间尚无胶囊，先记一条闪念吧！', 'info');
    }
    setActiveTab('shake');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-200 antialiased pb-24">
      {/* Background ambient lighting effects */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/15 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-900/15 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-amber-900/10 rounded-full blur-[100px]"></div>
      </div>

      {/* App Header */}
      <Header
        spaceCode={spaceCode}
        totalCapsules={capsules.length}
        currentUser={currentUser}
        onOpenSpaceModal={() => setIsSpaceModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onTriggerShake={handleTriggerShake}
        onCopySpaceCode={handleCopySpaceCode}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {/* Main View divided into 3 primary menu tab views */}
      <main className="relative z-10 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-2" />
            <p className="text-xs font-mono">加载空间灵感库 ({spaceCode})...</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'input' && (
              /* Part 1: 极速录入 (灵感胶囊) */
              <motion.div
                key="tab-input"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <InputView
                  spaceCode={spaceCode}
                  capsules={capsules}
                  currentUser={currentUser}
                  onSubmit={handleSubmitCapsule}
                  onSwitchTab={(tab) => setActiveTab(tab)}
                  onOpenAuthModal={() => setIsAuthModalOpen(true)}
                />
              </motion.div>
            )}

            {activeTab === 'library' && (
              /* Part 2: 时光时光库 (网格流 + 筛选) */
              <motion.div
                key="tab-library"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CapsuleGrid
                  capsules={capsules}
                  onFavorite={handleToggleFavorite}
                  onDelete={handleDeleteCapsule}
                  onCopy={handleCopyText}
                  onOpenPoster={(capsule) => setPosterCapsule(capsule)}
                  onTriggerShake={handleTriggerShake}
                />
              </motion.div>
            )}

            {activeTab === 'shake' && (
              /* Part 3: 摇一摇抽卡 ( Fortune Draw Machine ) */
              <motion.div
                key="tab-shake"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <ShakeView
                  capsules={capsules}
                  onFavorite={handleToggleFavorite}
                  onCopy={handleCopyText}
                  onOpenPoster={(capsule) => setPosterCapsule(capsule)}
                  onSwitchTabToLibrary={() => setActiveTab('library')}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-600 mb-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-slate-400 font-medium">灵感胶囊 Inspiration Capsule</span>
            <span>· 极简无感时光库</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSpaceModalOpen(true)}
              className="text-slate-500 hover:text-purple-300 transition cursor-pointer flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3" />
              <span>当前空间代号: <span className="font-mono text-purple-400">{spaceCode}</span></span>
            </button>
          </div>
        </div>
      </footer>

      {/* 🔻 Fixed Bottom Navigation Menu (Divided into 2 parts) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        totalCapsules={capsules.length}
      />

      {/* 🎲 Shake Modal (Quick Pop-up option if opened from shortcuts) */}
      <ShakeModal
        isOpen={isShakeModalOpen}
        capsules={capsules}
        onClose={() => setIsShakeModalOpen(false)}
        onFavorite={handleToggleFavorite}
        onCopy={handleCopyText}
        onOpenPoster={(capsule) => {
          setIsShakeModalOpen(false);
          setPosterCapsule(capsule);
        }}
      />

      {/* Space Code Modal */}
      <SpaceCodeModal
        isOpen={isSpaceModalOpen}
        currentSpaceCode={spaceCode}
        onClose={() => setIsSpaceModalOpen(false)}
        onSwitchSpace={handleSwitchSpace}
        onCopySpaceCode={handleCopySpaceCode}
      />

      {/* Auth Modal (Login / Register) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Poster Share Modal */}
      <PosterModal
        capsule={posterCapsule}
        onClose={() => setPosterCapsule(null)}
        onCopy={handleCopyText}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
