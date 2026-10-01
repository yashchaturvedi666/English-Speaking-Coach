import React from 'react';
import { CefrLevel, CoachPersona } from '../types';
import { Mic, Sparkles, BookOpen, Volume2, Settings, ShieldCheck, BarChart3 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'conversation' | 'pronunciation' | 'vault' | 'analytics';
  setActiveTab: (tab: 'conversation' | 'pronunciation' | 'vault' | 'analytics') => void;
  targetLevel: CefrLevel;
  setTargetLevel: (level: CefrLevel) => void;
  onOpenSettings: () => void;
  vaultCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  targetLevel,
  setTargetLevel,
  onOpenSettings,
  vaultCount,
}) => {
  const cefrLevels: CefrLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <header className="border-b border-stone-800 bg-stone-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-stone-950 font-bold">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-lg text-stone-100 font-sans">
                Articulate
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-amber-400/90 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                Speaking Coach
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Real-time voice conversation & constructive language diagnostics
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Functional button controls) */}
        <nav className="flex items-center p-1 bg-stone-900 border border-stone-800 rounded-xl">
          <button
            onClick={() => setActiveTab('conversation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'conversation'
                ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Conversation Arena</span>
            <span className="md:hidden">Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('pronunciation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'pronunciation'
                ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Pronunciation Clinic</span>
            <span className="md:hidden">Clinic</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
              activeTab === 'vault'
                ? 'bg-amber-500 text-stone-950 shadow-sm font-semibold'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mistake Vault</span>
            <span className="md:hidden">Vault</span>
            {vaultCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'vault'
                    ? 'bg-stone-950 text-amber-400'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {vaultCount}
              </span>
            )}
          </button>
        </nav>

        {/* Target Level & Settings */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Target CEFR Level Selector */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-stone-400 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-lg">
            <span className="text-stone-500 text-[11px]">Target:</span>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value as CefrLevel)}
              className="bg-transparent text-amber-400 font-semibold focus:outline-none cursor-pointer"
            >
              {cefrLevels.map((lvl) => (
                <option key={lvl} value={lvl} className="bg-stone-900 text-stone-100">
                  {lvl} Level
                </option>
              ))}
            </select>
          </div>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Settings & Persona"
            className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-900 border border-transparent hover:border-stone-800 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
