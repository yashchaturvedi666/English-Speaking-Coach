import React, { useState } from 'react';
import { PRONUNCIATION_DRILLS } from '../data/pronunciationDrills';
import { PronunciationDrill, PronunciationEvaluation } from '../types';
import {
  Volume2,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { speechService } from '../services/speechService';
import { evaluatePronunciationAttempt, requestCoachTts } from '../services/apiService';

interface PronunciationClinicProps {
  coachVoice: string;
}

export const PronunciationClinic: React.FC<PronunciationClinicProps> = ({ coachVoice }) => {
  const [selectedDrill, setSelectedDrill] = useState<PronunciationDrill>(PRONUNCIATION_DRILLS[0]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isListening, setIsListening] = useState(false);
  const [userTranscript, setUserTranscript] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<PronunciationEvaluation | null>(null);
  const [isPlayingModel, setIsPlayingModel] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Drills' },
    { id: 'minimal_pairs', label: 'Minimal Pairs' },
    { id: 'tricky_clusters', label: 'Consonant Clusters' },
    { id: 'connected_speech', label: 'Connected Speech' },
    { id: 'tongue_twisters', label: 'Tongue Twisters' },
  ];

  const filteredDrills =
    activeCategory === 'all'
      ? PRONUNCIATION_DRILLS
      : PRONUNCIATION_DRILLS.filter((d) => d.category === activeCategory);

  const handlePlayModelAudio = async (text: string) => {
    setIsPlayingModel(true);
    const audioBase64 = (await requestCoachTts(text, coachVoice)) || undefined;
    await speechService.playCoachAudio(text, audioBase64, 0.9, () => {
      setIsPlayingModel(false);
    });
  };

  const handleStartRecording = () => {
    setErrorMessage(null);
    setEvaluation(null);
    setUserTranscript('');

    const started = speechService.startListening(
      (transcript: string, isFinal: boolean) => {
        setUserTranscript(transcript);
        if (isFinal) {
          speechService.stopListening();
          setIsListening(false);
          runEvaluation(transcript);
        }
      },
      (err: string) => {
        setErrorMessage(err);
        setIsListening(false);
      },
      (listening: boolean) => {
        setIsListening(listening);
      }
    );

    if (!started && !speechService.isSpeechRecognitionSupported()) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome.');
    }
  };

  const handleStopRecording = () => {
    speechService.stopListening();
    setIsListening(false);
    if (userTranscript.trim()) {
      runEvaluation(userTranscript.trim());
    }
  };

  const runEvaluation = async (transcript: string) => {
    setIsEvaluating(true);
    setErrorMessage(null);
    try {
      const evalResult = await evaluatePronunciationAttempt(
        selectedDrill.targetPhrase,
        transcript,
        selectedDrill.focusSound
      );
      setEvaluation(evalResult);
    } catch (err: any) {
      console.error('Pronunciation evaluation error:', err);
      setErrorMessage(err.message || 'Failed to analyze pronunciation.');
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Title & Intro */}
      <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
            Acoustic & Phonetic Training
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-100 font-sans tracking-tight">
            Pronunciation & Accent Clinic
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed">
            Master the most challenging English phonemes, minimal vowel contrasts, consonant clusters, and linked cadence with instant mouth mechanics feedback.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 mt-6 pt-5 border-t border-stone-800">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'bg-stone-800/80 hover:bg-stone-800 text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Clinic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Drill Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-400 px-1">
            Practice Exercises ({filteredDrills.length})
          </h2>

          <div className="space-y-2">
            {filteredDrills.map((drill) => {
              const isSelected = selectedDrill.id === drill.id;
              return (
                <div
                  key={drill.id}
                  onClick={() => {
                    setSelectedDrill(drill);
                    setEvaluation(null);
                    setUserTranscript('');
                    setErrorMessage(null);
                  }}
                  className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-stone-900 border-amber-500/50 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-stone-900/60 border-stone-800/80 hover:bg-stone-900 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-amber-400 font-medium">
                      {drill.focusSound.split(' ')[0]}
                    </span>
                    <span className="text-stone-500">{drill.difficulty}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-stone-200 line-clamp-1">
                    {drill.title}
                  </h3>
                  <p className="text-xs text-stone-400 font-mono mt-1 truncate">
                    {drill.targetPhrase}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Drill Interactive Workbench */}
        <div className="lg:col-span-8 bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Header of Active Drill */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-stone-800">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Sound Target: {selectedDrill.focusSound}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
                {selectedDrill.title}
              </h2>
            </div>

            <button
              onClick={() => handlePlayModelAudio(selectedDrill.targetPhrase)}
              disabled={isPlayingModel}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-750 text-amber-400 hover:text-amber-300 border border-amber-500/20 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isPlayingModel ? 'Playing Audio...' : 'Listen to Native Pronunciation'}</span>
            </button>
          </div>

          {/* Target Phrase Display */}
          <div className="bg-stone-950/70 border border-stone-800 rounded-2xl p-6 space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              Read Aloud Target:
            </span>
            <p className="text-xl sm:text-2xl font-serif text-stone-100 leading-snug">
              "{selectedDrill.targetPhrase}"
            </p>
            <div className="flex items-center gap-2 font-mono text-xs sm:text-sm text-amber-400/90 pt-1">
              <span>IPA:</span>
              <span className="bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                {selectedDrill.phoneticIpa}
              </span>
            </div>
          </div>

          {/* Physical Mouth / Tongue Mechanics Guide */}
          <div className="bg-stone-950/40 border border-cyan-500/20 rounded-2xl p-4 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs sm:text-sm text-stone-300 leading-relaxed">
              <strong className="text-cyan-300">Anatomical Placement Tip:</strong>{' '}
              {selectedDrill.instruction}
            </div>
          </div>

          {/* Recording & Input Action */}
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 bg-stone-950/60 border border-stone-800 rounded-2xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-semibold text-stone-300">
                  Ready to test your pronunciation?
                </span>
                <p className="text-xs text-stone-500">
                  Click the microphone, read the sentence clearly at a natural pace.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {isListening ? (
                  <button
                    onClick={handleStopRecording}
                    className="px-5 py-3 bg-rose-500 text-stone-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-rose-500/20 animate-pulse"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>Stop & Evaluate</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    disabled={isEvaluating}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Speak to Test</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live speech feedback display */}
            {isListening && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-1">
                <span className="text-xs font-semibold text-amber-400">
                  Listening to your voice...
                </span>
                <p className="text-sm font-medium text-stone-100">
                  {userTranscript || 'Speak now into your microphone...'}
                </p>
              </div>
            )}

            {isEvaluating && (
              <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl flex items-center gap-3 text-xs text-amber-400">
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Comparing phonetic waveforms and consonant fidelity...</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Evaluation Results Card */}
          {evaluation && (
            <div className="p-6 bg-stone-950 border border-amber-500/30 rounded-2xl space-y-5 shadow-xl animate-in fade-in duration-300">
              {/* Score header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                    Diagnostic Pronunciation Score
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-amber-400 font-mono">
                      {evaluation.matchScore}%
                    </span>
                    <span className="text-xs text-stone-400">
                      {evaluation.matchScore >= 85
                        ? '🌟 Excellent Native Clarity'
                        : evaluation.matchScore >= 70
                        ? '👍 Understandable, minor phonetic deviation'
                        : '🔄 Needs tongue placement adjustment'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartRecording}
                    className="px-3.5 py-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </button>
                </div>
              </div>

              {/* Phonetic Breakdown */}
              <div className="space-y-1 text-xs">
                <strong className="text-stone-300 uppercase tracking-wider text-[11px]">
                  Waveform & Syllable Comparison:
                </strong>
                <p className="text-stone-300 bg-stone-900/80 p-3 rounded-xl border border-stone-800/80 leading-relaxed font-mono">
                  {evaluation.phoneticBreakdown}
                </p>
              </div>

              {/* Mouth & Tongue Tip */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Physical Tongue & Jaw Calibration:</span>
                </div>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  {evaluation.mouthAndTongueTip}
                </p>
              </div>

              {/* Audio Drill Words */}
              {evaluation.audioDrillWords?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                    Isolated Reinforcement Words:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {evaluation.audioDrillWords.map((word, wIdx) => (
                      <button
                        key={wIdx}
                        onClick={() => handlePlayModelAudio(word)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-850 border border-stone-800 text-stone-200 rounded-lg text-xs font-medium transition-colors"
                      >
                        <span>{word}</span>
                        <Volume2 className="w-3 h-3 text-amber-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Motivational encouragement */}
              <p className="text-xs text-stone-400 italic pt-1">
                "{evaluation.encouragement}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
