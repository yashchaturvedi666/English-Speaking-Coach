import React, { useState } from 'react';
import { LanguageFeedback, GrammarCorrection, VocabularyUpgrade, PronunciationTip } from '../types';
import { CheckCircle2, AlertCircle, ArrowUpRight, BookmarkPlus, ChevronDown, ChevronUp, Sparkles, Volume2, BookmarkCheck } from 'lucide-react';
import { speechService } from '../services/speechService';

interface FeedbackCardProps {
  feedback: LanguageFeedback;
  userSpeech: string;
  onSaveToVault?: (item: {
    term: string;
    category: 'grammar' | 'vocabulary' | 'pronunciation';
    context: string;
    correctionOrAlternative: string;
    notes: string;
  }) => void;
  onPracticePhrase?: (phrase: string) => void;
  savedTerms?: Set<string>;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({
  feedback,
  userSpeech,
  onSaveToVault,
  onPracticePhrase,
  savedTerms = new Set(),
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  const hasGrammarIssues = feedback.grammarCorrections && feedback.grammarCorrections.length > 0;
  const hasVocabUpgrades = feedback.vocabularyUpgrades && feedback.vocabularyUpgrades.length > 0;
  const hasPronunciationTips = feedback.pronunciationTips && feedback.pronunciationTips.length > 0;

  const handlePlayWord = async (word: string) => {
    setPlayingWord(word);
    await speechService.playCoachAudio(word, undefined, 0.9, () => {
      setPlayingWord(null);
    });
  };

  return (
    <div className="mt-3 border border-stone-800 bg-stone-900/90 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Card Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3 bg-stone-900/95 hover:bg-stone-850 border-b border-stone-800 flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-stone-200">
            Coach Language Diagnostic
          </span>
          <span className="text-stone-500 text-xs">·</span>
          <span className="text-xs font-medium text-amber-400/90">
            {feedback.cefrRating || 'Evaluated'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {hasGrammarIssues ? (
            <span className="text-[11px] font-medium text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-md border border-rose-400/20">
              {feedback.grammarCorrections.length} correction{feedback.grammarCorrections.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Accurate grammar
            </span>
          )}

          <button
            aria-label="Toggle feedback"
            className="p-1 text-stone-400 hover:text-stone-200 rounded"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-5 text-sm">
          {/* Overall Encouragement & Fluency Note */}
          <div className="bg-stone-950/60 border border-stone-800/80 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-start gap-2 text-stone-300 text-xs leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>{feedback.overallEncouragement}</span>
            </div>
            {feedback.fluencyAdvice && (
              <div className="text-xs text-stone-400 pl-5.5 leading-relaxed">
                <span className="text-stone-300 font-medium">Fluency Tip: </span>
                {feedback.fluencyAdvice}
              </div>
            )}
          </div>

          {/* Section 1: Grammar & Accuracy Corrections */}
          {hasGrammarIssues && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Grammar & Natural Phrasing</span>
              </div>

              <div className="space-y-2">
                {feedback.grammarCorrections.map((corr, idx) => {
                  const isSaved = savedTerms.has(corr.original);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* Strike-through original */}
                          <span className="line-through text-rose-300/80 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            {corr.original}
                          </span>
                          <span className="text-stone-500">→</span>
                          {/* Corrected phrasing */}
                          <span className="font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {corr.corrected}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5">
                          {onPracticePhrase && (
                            <button
                              onClick={() => onPracticePhrase(corr.corrected)}
                              className="text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                              title="Practice speaking this correction"
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              <span>Practice</span>
                            </button>
                          )}

                          {onSaveToVault && (
                            <button
                              onClick={() =>
                                onSaveToVault({
                                  term: corr.original,
                                  category: 'grammar',
                                  context: userSpeech,
                                  correctionOrAlternative: corr.corrected,
                                  notes: `${corr.rule}: ${corr.explanation}`,
                                })
                              }
                              className={`text-[11px] px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                                isSaved
                                  ? 'text-emerald-400 bg-emerald-400/10'
                                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                              }`}
                              title={isSaved ? 'Saved in Mistake Vault' : 'Save to Mistake Vault'}
                            >
                              {isSaved ? (
                                <>
                                  <BookmarkCheck className="w-3 h-3" />
                                  <span>Saved</span>
                                </>
                              ) : (
                                <>
                                  <BookmarkPlus className="w-3 h-3" />
                                  <span>Save</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Explanation */}
                      <p className="text-xs text-stone-400 leading-relaxed">
                        <strong className="text-stone-300">{corr.rule}:</strong> {corr.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 2: Vocabulary Upgrades & Idioms */}
          {hasVocabUpgrades && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Vocabulary Upgrades & Native Collocations</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {feedback.vocabularyUpgrades.map((vocab, idx) => {
                  const isSaved = savedTerms.has(vocab.originalWord);
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-stone-400">
                            Instead of{' '}
                            <span className="font-medium text-stone-200 underline decoration-stone-600">
                              "{vocab.originalWord}"
                            </span>
                          </span>
                          {onSaveToVault && (
                            <button
                              onClick={() =>
                                onSaveToVault({
                                  term: vocab.originalWord,
                                  category: 'vocabulary',
                                  context: userSpeech,
                                  correctionOrAlternative: vocab.betterAlternatives.join(', '),
                                  notes: vocab.contextExplanation,
                                })
                              }
                              className={`p-1 rounded transition-colors ${
                                isSaved
                                  ? 'text-emerald-400'
                                  : 'text-stone-500 hover:text-stone-300'
                              }`}
                              title={isSaved ? 'Saved to Vault' : 'Save to Vault'}
                            >
                              {isSaved ? (
                                <BookmarkCheck className="w-3.5 h-3.5" />
                              ) : (
                                <BookmarkPlus className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* Better Alternatives */}
                        <div className="flex flex-wrap gap-1.5 my-2">
                          {vocab.betterAlternatives.map((alt, aIdx) => (
                            <button
                              key={aIdx}
                              onClick={() => handlePlayWord(alt)}
                              className="group flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-1 rounded-md border border-amber-500/20 transition-colors"
                              title="Listen to pronunciation"
                            >
                              <span>{alt}</span>
                              <Volume2 className="w-2.5 h-2.5 text-amber-400 group-hover:scale-110 transition-transform" />
                            </button>
                          ))}
                        </div>

                        <p className="text-[11px] text-stone-400 leading-relaxed mt-1">
                          {vocab.contextExplanation}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Pronunciation & Phonetics Guide */}
          {hasPronunciationTips && (
            <div className="space-y-2.5">
              <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Pronunciation & Mouth Mechanics</span>
              </div>

              <div className="space-y-2">
                {feedback.pronunciationTips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-100 text-xs sm:text-sm">
                          {tip.word}
                        </span>
                        <span className="font-mono text-cyan-300 text-xs bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                          {tip.phoneticIpa}
                        </span>
                      </div>

                      <button
                        onClick={() => handlePlayWord(tip.word)}
                        disabled={playingWord === tip.word}
                        className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 px-2 py-1 rounded transition-colors"
                      >
                        <Volume2 className="w-3 h-3" />
                        <span>{playingWord === tip.word ? 'Playing...' : 'Listen'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-stone-400 leading-relaxed">
                      <strong className="text-stone-300">Tip:</strong> {tip.tip}{' '}
                      {tip.stressNote && (
                        <span className="text-stone-500 text-[11px]">
                          ({tip.stressNote})
                        </span>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
