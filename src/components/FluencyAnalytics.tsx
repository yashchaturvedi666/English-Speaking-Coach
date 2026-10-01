import React from 'react';
import { CefrLevel, SavedVocabularyItem } from '../types';
import {
  TrendingUp,
  BarChart3,
  Award,
  Zap,
  Target,
  Sparkles,
  BookOpen,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface FluencyAnalyticsProps {
  targetLevel: CefrLevel;
  totalWordsSpoken: number;
  totalTurns: number;
  savedItems: SavedVocabularyItem[];
  onStartPractice: () => void;
}

export const FluencyAnalytics: React.FC<FluencyAnalyticsProps> = ({
  targetLevel,
  totalWordsSpoken,
  totalTurns,
  savedItems,
  onStartPractice,
}) => {
  const masteredCount = savedItems.filter((i) => i.mastered).length;
  const grammarMistakes = savedItems.filter((i) => i.category === 'grammar').length;
  const vocabUpgrades = savedItems.filter((i) => i.category === 'vocabulary').length;
  const pronunciationItems = savedItems.filter((i) => i.category === 'pronunciation').length;

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Analytics Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Fluency Diagnostics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 font-sans">
            Speaking Progress & Mastery
          </h1>
          <p className="text-sm text-stone-400">
            Track your lexical range, fluency trajectory, and conquered grammar patterns.
          </p>
        </div>

        <button
          onClick={onStartPractice}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Jump into Conversation</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Words Spoken</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
            {totalWordsSpoken}
          </div>
          <span className="text-[11px] text-stone-500">
            ~{Math.round(totalWordsSpoken / Math.max(totalTurns, 1))} words/turn average
          </span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Dialogue Turns</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
            {totalTurns}
          </div>
          <span className="text-[11px] text-stone-500">
            Spontaneous voice interactions
          </span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Target CEFR</span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
            {targetLevel}
          </div>
          <span className="text-[11px] text-stone-500">
            {targetLevel === 'C1' || targetLevel === 'C2' ? 'Advanced / Fluent' : 'Intermediate Mastery'}
          </span>
        </div>

        <div className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span>Mastered Items</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
            {masteredCount}
          </div>
          <span className="text-[11px] text-stone-500">
            {savedItems.length} total logged in vault
          </span>
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Knowledge Vault Categorization */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              Error & Vocabulary Catalog
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                <span>Grammar & Syntax Rules</span>
                <span className="font-semibold text-rose-300">{grammarMistakes}</span>
              </div>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all"
                  style={{
                    width: `${savedItems.length ? (grammarMistakes / savedItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                <span>Native Collocations & Upgrades</span>
                <span className="font-semibold text-amber-300">{vocabUpgrades}</span>
              </div>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${savedItems.length ? (vocabUpgrades / savedItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                <span>Pronunciation Targets</span>
                <span className="font-semibold text-cyan-300">{pronunciationItems}</span>
              </div>
              <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all"
                  style={{
                    width: `${savedItems.length ? (pronunciationItems / savedItems.length) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3 Core Fluency Pillars */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-3xl space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-stone-200 uppercase tracking-wider">
              Recommended Daily Speaking Habits
            </h3>
          </div>

          <div className="space-y-3 text-xs text-stone-300">
            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-1">
              <span className="font-semibold text-amber-300">
                1. Shadowing Practice (5 mins/day)
              </span>
              <p className="text-stone-400">
                Listen to the Coach's audio reply at 0.8x or 1.0x, pause after each sentence, and speak it aloud mimicking intonation.
              </p>
            </div>

            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-1">
              <span className="font-semibold text-cyan-300">
                2. STAR Behavioral Framework
              </span>
              <p className="text-stone-400">
                In interview scenarios, structure thoughts using Situation, Task, Action, and Result to eliminate filler words ("um", "like").
              </p>
            </div>

            <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-1">
              <span className="font-semibold text-emerald-300">
                3. Conquering Minimal Pairs
              </span>
              <p className="text-stone-400">
                Spend 2 minutes in the Pronunciation Clinic drilling the /θ/ sound and lax /ɪ/ vs tense /iː/ vowels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
