import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Sparkles, Check, Hash, Bookmark } from 'lucide-react';
import { CapsuleColor } from '../types';
import { COLOR_THEMES } from '../constants/colors';
import { getDraft, saveDraft } from '../services/api';
import { soundEffects } from '../utils/audio';

interface InputAreaProps {
  spaceCode: string;
  onSubmit: (content: string, color: CapsuleColor, tags: string[]) => void;
}

const PRESET_TAGS = ['闪念', '创意', '金句', '反思', '项目', '读书'];

export const InputArea: React.FC<InputAreaProps> = ({ spaceCode, onSubmit }) => {
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState<CapsuleColor>('purple');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load draft on spaceCode change
  useEffect(() => {
    const draft = getDraft(spaceCode);
    setContent(draft);
  }, [spaceCode]);

  // Auto save draft on content change
  useEffect(() => {
    saveDraft(spaceCode, content);
    if (content.trim()) {
      setIsDraftSaved(true);
      const timer = setTimeout(() => setIsDraftSaved(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [content, spaceCode]);

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(88, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    soundEffects.playSuccess();
    onSubmit(content.trim(), selectedColor, selectedTags);
    setContent('');
    saveDraft(spaceCode, '');
    setSelectedTags([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const activeTheme = COLOR_THEMES[selectedColor];

  return (
    <div className="relative group max-w-3xl mx-auto my-6 sm:my-8 px-4">
      {/* Ambient glowing backdrop aura matching selected color */}
      <div
        className="absolute -inset-1 rounded-2xl blur-xl opacity-30 transition-all duration-500"
        style={{
          background: `radial-gradient(circle, ${activeTheme.accentHex}44 0%, transparent 70%)`,
        }}
      ></div>

      <div className={`relative rounded-2xl bg-slate-900/90 border ${activeTheme.borderClass} p-4 sm:p-5 shadow-2xl backdrop-blur-xl transition-all duration-300`}>
        {/* Top bar: Draft indicator & Date */}
        <div className="flex items-center justify-between gap-2 mb-3 text-xs text-slate-400 border-b border-slate-800/80 pb-2">
          <div className="flex items-center gap-1.5 font-mono">
            <Sparkles className={`w-3.5 h-3.5 ${activeTheme.badgeText}`} />
            <span>记录闪念</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">{new Date().toISOString().split('T')[0]}</span>
          </div>

          <div className="flex items-center gap-3">
            {isDraftSaved && (
              <motion.span
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] text-emerald-400/90 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> 草稿已自动记忆
              </motion.span>
            )}
            <span className="hidden sm:inline-block text-[11px] font-mono text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              Cmd / Ctrl + Enter 发送
            </span>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="此刻脑海里有什么闪念？随手写下，任何时候都在..."
          className="w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none text-sm sm:text-base leading-relaxed min-h-[88px] font-normal"
        />

        {/* Preset Tags Bar */}
        <div className="flex flex-wrap items-center gap-1.5 my-3 pt-2 border-t border-slate-800/50">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 mr-1">
            <Hash className="w-3 h-3" /> 标签:
          </span>
          {PRESET_TAGS.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={`text-[11px] px-2.5 py-0.5 rounded-full border transition cursor-pointer ${
                  isSelected
                    ? `${activeTheme.badgeBg} font-medium`
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>

        {/* Bottom Bar: Color Selector & Submit Button */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* 4 Theme Color Atmosphere Pills */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-slate-400 hidden xs:inline-block mr-1">氛围:</span>
            {(Object.keys(COLOR_THEMES) as CapsuleColor[]).map(colorKey => {
              const theme = COLOR_THEMES[colorKey];
              const isSelected = selectedColor === colorKey;
              return (
                <button
                  key={colorKey}
                  type="button"
                  onClick={() => setSelectedColor(colorKey)}
                  title={`${theme.name} (${theme.subName})`}
                  className={`relative p-1.5 sm:p-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer border ${
                    isSelected
                      ? `${theme.badgeBg} shadow-md`
                      : 'bg-slate-800/30 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span
                    className={`w-3 h-3 rounded-full ${theme.dotBg} ${
                      isSelected ? 'ring-2 ring-white/30' : 'opacity-70'
                    }`}
                  ></span>
                  <span className={`text-xs font-medium hidden sm:inline-block ${isSelected ? 'text-slate-100' : 'text-slate-400'}`}>
                    {theme.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSubmit()}
            disabled={!content.trim()}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              content.trim()
                ? 'bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500 text-white shadow-lg shadow-purple-950/50 hover:brightness-110'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>胶囊归仓</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};
