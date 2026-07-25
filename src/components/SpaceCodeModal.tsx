import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, KeyRound, Sparkles, Check, ArrowRight, History, Shield, Copy, QrCode, Smartphone, Share2 } from 'lucide-react';
import { getRecentSpaceCodes, generateRandomSpaceCode } from '../services/api';

interface SpaceCodeModalProps {
  isOpen: boolean;
  currentSpaceCode: string;
  onClose: () => void;
  onSwitchSpace: (newCode: string) => void;
  onCopySpaceCode: () => void;
}

export const SpaceCodeModal: React.FC<SpaceCodeModalProps> = ({
  isOpen,
  currentSpaceCode,
  onClose,
  onSwitchSpace,
  onCopySpaceCode,
}) => {
  const [inputCode, setInputCode] = useState(currentSpaceCode);
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const getDirectSyncUrl = () => {
    if (typeof window === 'undefined') return '';
    const url = new URL(window.location.href);
    url.searchParams.set('space', currentSpaceCode);
    return url.toString();
  };

  const handleCopyDirectLink = () => {
    const link = getDirectSyncUrl();
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  useEffect(() => {
    setInputCode(currentSpaceCode);
    setRecentCodes(getRecentSpaceCodes());
  }, [currentSpaceCode, isOpen]);

  const handleGenerateRandom = () => {
    const randomCode = generateRandomSpaceCode();
    setInputCode(randomCode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    onSwitchSpace(inputCode.trim());
    onClose();
  };

  if (!isOpen) return null;

  const directSyncUrl = getDirectSyncUrl();
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(directSyncUrl)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 15 }}
          className="relative z-10 w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-7 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-100 bg-slate-800/60 hover:bg-slate-800 rounded-full transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">空间代号 (Space Code)</h3>
              <p className="text-xs text-slate-400">跨设备同步与无感存储凭据</p>
            </div>
          </div>

          {/* Mobile Sync Quick Action Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-950 to-indigo-950/40 border border-purple-500/30 text-xs text-slate-300 mb-5 leading-relaxed">
            <div className="flex items-center justify-between font-semibold text-purple-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>手机/多端同步指引</span>
              </span>
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 cursor-pointer bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>{showQr ? '收起二维码' : '显示二维码'}</span>
              </button>
            </div>

            <p className="text-slate-400 text-[11px] leading-normal mb-3">
              多端同步的核心是<strong className="text-purple-200 font-normal">进入同一个空间代号</strong>。在手机端输入代号 <code className="bg-slate-900 text-purple-300 px-1 py-0.5 rounded font-mono font-bold">{currentSpaceCode}</code>，或点击下方直接生成手机端直连链接。
            </p>

            {showQr && (
              <div className="flex flex-col items-center justify-center p-3 my-2 bg-slate-950 rounded-xl border border-slate-800">
                <img
                  src={qrCodeImageUrl}
                  alt="手机扫码同步二维码"
                  className="w-36 h-36 rounded-lg border border-slate-700 bg-white p-1"
                />
                <span className="text-[10px] text-slate-400 mt-2">手机自带相机或微信/浏览器扫码直连此空间</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopyDirectLink}
              className="w-full py-2 px-3 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-medium text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-amber-400" />
              <span>{copiedLink ? '已复制手机直接同步链接！' : '复制手机直接同步链接 (?space=...)'}</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                手动切换或新建空间代号
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="例如: my-ideas-2026"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm text-purple-300 font-mono focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  title="生成随机代号"
                  className="shrink-0 p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs text-slate-300 flex items-center gap-1 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">随机代号</span>
                </button>
              </div>
            </div>

            {/* Current Code Action */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>当前空间: <strong className="text-purple-300 font-mono">{currentSpaceCode}</strong></span>
              <button
                type="button"
                onClick={onCopySpaceCode}
                className="text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3 h-3" /> 复制纯代号
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputCode.trim()}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-600 text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 hover:brightness-110 transition cursor-pointer"
            >
              <span>切换到此空间</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Recent Spaces List */}
          {recentCodes.length > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2.5 font-medium">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>最近访问过的空间:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentCodes.map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => {
                      onSwitchSpace(code);
                      onClose();
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono transition cursor-pointer flex items-center gap-1 ${
                      code === currentSpaceCode
                        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 font-bold'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{code}</span>
                    {code === currentSpaceCode && <Check className="w-3 h-3 text-purple-400" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
