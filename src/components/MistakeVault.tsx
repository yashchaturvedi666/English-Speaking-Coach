import React, { useState } from 'react';
import { SavedVocabularyItem } from '../types';
import {
  BookOpen,
  CheckCircle2,
  Trash2,
  Volume2,
  Sparkles,
  ArrowRight,
  RotateCw,
  Search,
  Filter,
  Check,
  Mic,
  Copy,
} from 'lucide-react';
import { speechService } from '../services/speechService';

interface MistakeVaultProps {
  savedItems: SavedVocabularyItem[];
  onRemoveItem: (id: string) => void;
  onToggleMastered: (id: string) => void;
}

export const MistakeVault: React.FC<MistakeVaultProps> = ({
  savedItems,
  onRemoveItem,
  onToggleMastered,
}) => {
  const [filterCategory, setFilterCategory] = useState<'all' | 'grammar' | 'vocabulary' | 'pronunciation'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFlashcardMode, setIsFlashcardMode] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredItems = savedItems.filter((item) => {
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesSearch =
      item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.correctionOrAlternative.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.notes.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayText = (text: string) => {
    speechService.playCoachAudio(text, undefined, 1.0);
  };

  const handleCopyNotes = (item: SavedVocabularyItem) => {
    const text = `Original: ${item.term}\nUpgrade/Correction: ${item.correctionOrAlternative}\nNotes: ${item.notes}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentFlashcard = filteredItems[activeCardIndex];

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Vault Header */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Personalized Knowledge Bank
            </span>
            <span className="text-stone-500 text-xs">·</span>
            <span className="text-xs text-stone-400">
              {savedItems.length} items logged
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 font-sans">
            Mistake Vault & Vocabulary Bank
          </h1>
          <p className="text-sm text-stone-400">
            Review your recurring grammar fixes, upgraded native idioms, and pronunciation targets.
          </p>
        </div>

        {/* Flashcard Practice Toggle Button */}
        {savedItems.length > 0 && (
          <button
            onClick={() => {
              setIsFlashcardMode(!isFlashcardMode);
              setIsFlipped(false);
              setActiveCardIndex(0);
            }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-md ${
              isFlashcardMode
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'bg-stone-800 hover:bg-stone-750 text-amber-300 border border-amber-500/20'
            }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>{isFlashcardMode ? 'Exit Flashcards' : 'Launch Flashcard Review'}</span>
          </button>
        )}
      </div>

      {/* FLASHCARD MODE VIEW */}
      {isFlashcardMode && currentFlashcard && (
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-2xl mx-auto space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between text-xs text-stone-400">
            <span className="font-semibold uppercase tracking-wider text-amber-400">
              Card {activeCardIndex + 1} of {filteredItems.length}
            </span>
            <span className="capitalize bg-stone-800 px-2 py-0.5 rounded text-stone-300">
              {currentFlashcard.category}
            </span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[220px] p-8 rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/40 cursor-pointer flex flex-col justify-center items-center text-center transition-all select-none shadow-inner"
          >
            {!isFlipped ? (
              <div className="space-y-3">
                <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold">
                  What you said (or original word)
                </span>
                <p className="text-2xl font-serif text-rose-300 line-through">
                  "{currentFlashcard.term}"
                </p>
                <p className="text-xs text-stone-400 pt-2">
                  (Tap card to reveal the natural English upgrade)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                  Natural English Phrasing
                </span>
                <p className="text-2xl font-serif text-emerald-300 font-medium">
                  "{currentFlashcard.correctionOrAlternative}"
                </p>
                <div className="text-xs text-stone-400 max-w-md mx-auto leading-relaxed pt-1">
                  {currentFlashcard.notes}
                </div>
              </div>
            )}
          </div>

          {/* Controls below card */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => handlePlayText(currentFlashcard.correctionOrAlternative)}
              className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Listen</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onToggleMastered(currentFlashcard.id);
                  if (activeCardIndex < filteredItems.length - 1) {
                    setActiveCardIndex(activeCardIndex + 1);
                    setIsFlipped(false);
                  }
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  currentFlashcard.mastered
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-stone-800 hover:bg-stone-750 text-stone-300'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{currentFlashcard.mastered ? 'Mastered!' : 'Mark Mastered'}</span>
              </button>

              <button
                disabled={activeCardIndex >= filteredItems.length - 1}
                onClick={() => {
                  setActiveCardIndex(activeCardIndex + 1);
                  setIsFlipped(false);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NORMAL VAULT LIST VIEW */}
      {!isFlashcardMode && (
        <div className="space-y-4">
          {/* Search & Category Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mistakes or vocabulary..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-xl w-full sm:w-auto overflow-x-auto">
              {(['all', 'grammar', 'vocabulary', 'pronunciation'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors ${
                    filterCategory === cat
                      ? 'bg-amber-500 text-stone-950 font-semibold'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Items List */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 text-stone-600 mx-auto" />
              <h3 className="text-base font-semibold text-stone-300">
                {savedItems.length === 0 ? 'Your Vault is empty' : 'No matching items found'}
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {savedItems.length === 0
                  ? 'As you practice in the Conversation Arena, click the bookmark icon on any grammar fix or vocabulary upgrade to save it here.'
                  : 'Try adjusting your search query or category filter.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    item.mastered
                      ? 'bg-stone-900/40 border-stone-800/60 opacity-80'
                      : 'bg-stone-900 border-stone-800 shadow-sm'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold uppercase tracking-wider text-amber-400">
                        {item.category}
                      </span>
                      <span className="text-stone-500">
                        {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="line-through text-rose-300/80 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {item.term}
                        </span>
                        <span className="text-stone-500">→</span>
                        <span className="font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.correctionOrAlternative}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed pt-1">
                      {item.notes}
                    </p>
                  </div>

                  {/* Item Footer actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-800/80 text-xs text-stone-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayText(item.correctionOrAlternative)}
                        className="hover:text-amber-300 p-1"
                        title="Listen to pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleCopyNotes(item)}
                        className="hover:text-stone-200 p-1"
                        title="Copy note"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleMastered(item.id)}
                        className={`text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${
                          item.mastered
                            ? 'text-emerald-400 bg-emerald-400/10'
                            : 'text-stone-400 hover:text-stone-200 bg-stone-800'
                        }`}
                      >
                        {item.mastered ? 'Mastered ✓' : 'Mark Done'}
                      </button>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                        title="Delete from vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
