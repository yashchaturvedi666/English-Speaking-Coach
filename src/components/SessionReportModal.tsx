import React, { useState, useEffect } from 'react';
import { Scenario, Message, SessionDiagnostic } from '../types';
import {
  X,
  Award,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  BookOpen,
  Calendar,
  Download,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { generateSessionDiagnostic } from '../services/apiService';
import { speechService } from '../services/speechService';

interface SessionReportModalProps {
  scenario: Scenario;
  messages: Message[];
  isOpen: boolean;
  onClose: () => void;
  onRestartScenario: () => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  scenario,
  messages,
  isOpen,
  onClose,
  onRestartScenario,
}) => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SessionDiagnostic | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && messages.length > 0) {
      loadDiagnostic();
    }
  }, [isOpen]);

  const loadDiagnostic = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateSessionDiagnostic(scenario, messages);
      setReport(data);
    } catch (err: any) {
      console.error('Failed to generate session diagnostic:', err);
      setError(err.message || 'Could not compile diagnostic report.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!report) return;
    const content = `ARTICULATE SPEAKING COACH - DIAGNOSTIC REPORT
Scenario: ${scenario.title}
Date: ${new Date().toLocaleDateString()}
CEFR Assessment: ${report.overallCefrScore}

METRICS:
- Fluency & Coherence: ${report.fluencyScore}/100
- Grammatical Accuracy: ${report.grammarScore}/100
- Lexical Resource: ${report.vocabularyScore}/100
- Pronunciation & Intonation: ${report.pronunciationScore}/100

KEY STRENGTHS:
${report.keyStrengths.map((s) => `• ${s}`).join('\n')}

GROWTH AREAS:
${report.growthAreas.map((g) => `• ${g}`).join('\n')}

RECOMMENDED VOCABULARY:
${report.recommendedVocabularyList.map((v) => `• ${v.term}: ${v.definition}\n  Example: "${v.example}"`).join('\n')}

ACTION PLAN:
${report.personalizedActionPlan.map((p, i) => `${i + 1}. ${p}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `articulate-session-${scenario.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
                Speaking Assessment
              </span>
              <h2 className="text-xl font-bold text-stone-100">
                Session Diagnostic & CEFR Evaluation
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-stone-200">
              Assessing speech rhythm, grammar frequency, and vocabulary richness...
            </p>
            <p className="text-xs text-stone-500">
              Synthesizing your CEFR fluency profile from your dialogue turns.
            </p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-3">
            <p className="text-rose-400 text-sm font-medium">{error}</p>
            <button
              onClick={loadDiagnostic}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs"
            >
              Retry Diagnostic
            </button>
          </div>
        ) : report ? (
          <div className="space-y-6">
            {/* Overall CEFR Score Banner */}
            <div className="p-6 bg-gradient-to-br from-amber-500/15 via-stone-900 to-stone-900 border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                  Assessed CEFR Competence
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-100">
                  {report.overallCefrScore}
                </div>
                <p className="text-xs text-stone-400">
                  Based on speech accuracy, lexical diversity, and dialogue turn structure.
                </p>
              </div>

              {/* Score Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                <div className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-center">
                  <span className="text-[10px] text-stone-400 uppercase">Fluency</span>
                  <div className="text-base font-bold text-amber-400">{report.fluencyScore}%</div>
                </div>
                <div className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-center">
                  <span className="text-[10px] text-stone-400 uppercase">Grammar</span>
                  <div className="text-base font-bold text-emerald-400">{report.grammarScore}%</div>
                </div>
                <div className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-center">
                  <span className="text-[10px] text-stone-400 uppercase">Lexicon</span>
                  <div className="text-base font-bold text-cyan-400">{report.vocabularyScore}%</div>
                </div>
                <div className="p-2.5 bg-stone-950/70 border border-stone-800 rounded-xl text-center">
                  <span className="text-[10px] text-stone-400 uppercase">Phonetics</span>
                  <div className="text-base font-bold text-purple-400">{report.pronunciationScore}%</div>
                </div>
              </div>
            </div>

            {/* Strengths & Growth Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Key Communication Strengths</span>
                </span>
                <ul className="space-y-2 text-xs text-stone-300">
                  {report.keyStrengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">✓</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Growth Areas */}
              <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" />
                  <span>Priority Growth Areas</span>
                </span>
                <ul className="space-y-2 text-xs text-stone-300">
                  {report.growthAreas.map((g, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0">→</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended High-Impact Vocabulary */}
            {report.recommendedVocabularyList?.length > 0 && (
              <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Target Topic Vocabulary To Adopt</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.recommendedVocabularyList.map((vocab, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-stone-900 border border-stone-800/80 rounded-xl space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-300">{vocab.term}</span>
                        <button
                          onClick={() => speechService.playCoachAudio(vocab.term)}
                          className="text-stone-400 hover:text-amber-400"
                        >
                          <Volume2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-stone-400 text-[11px]">{vocab.definition}</p>
                      <p className="text-stone-300 italic text-[11px]">"{vocab.example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personalized Action Plan */}
            <div className="p-5 bg-stone-950 border border-stone-800 rounded-2xl space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>Personalized 3-Step Speaking Plan</span>
              </span>
              <div className="space-y-2 text-xs text-stone-300">
                {report.personalizedActionPlan.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 bg-stone-900/60 rounded-xl">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-800">
              <button
                onClick={handleDownloadReport}
                className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Export Report (.txt)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onRestartScenario();
                  }}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Scenario</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Back to Practice
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
