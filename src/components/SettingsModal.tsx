import React from 'react';
import { CoachPersona, CefrLevel } from '../types';
import { X, Volume2, UserCheck, Shield, Sparkles, Sliders } from 'lucide-react';
import { speechService } from '../services/speechService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coachPersona: CoachPersona;
  setCoachPersona: (persona: CoachPersona) => void;
  targetLevel: CefrLevel;
  setTargetLevel: (level: CefrLevel) => void;
  autoPlaySpeech: boolean;
  setAutoPlaySpeech: (auto: boolean) => void;
  coachVoice: string;
  setCoachVoice: (voice: string) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  coachPersona,
  setCoachPersona,
  targetLevel,
  setTargetLevel,
  autoPlaySpeech,
  setAutoPlaySpeech,
  coachVoice,
  setCoachVoice,
  playbackSpeed,
  setPlaybackSpeed,
}) => {
  if (!isOpen) return null;

  const personas: Array<{ id: CoachPersona; title: string; desc: string }> = [
    {
      id: 'warm_encouraging',
      title: 'Warm & Encouraging Mentor',
      desc: 'Patient, positive reinforcement, builds speaking confidence without anxiety.',
    },
    {
      id: 'rigorous_interviewer',
      title: 'Rigorous Executive Interviewer',
      desc: 'Demands concise STAR structure, executive presence, and business precision.',
    },
    {
      id: 'native_casual',
      title: 'Casual Native Friend',
      desc: 'Everyday idioms, light humor, modern colloquial phrasing, and slang awareness.',
    },
    {
      id: 'ielts_examiner',
      title: 'Official IELTS Examiner',
      desc: 'Formal academic testing, advanced discourse markers, and lexical complexity.',
    },
  ];

  const voices = [
    { id: 'Kore', name: 'Kore (Clear & Warm, Balanced Cadence)' },
    { id: 'Zephyr', name: 'Zephyr (Bright, Engaging & Dynamic)' },
    { id: 'Puck', name: 'Puck (Enthusiastic & Playful)' },
    { id: 'Fenrir', name: 'Fenrir (Deep, Authoritative & Articulate)' },
    { id: 'Charon', name: 'Charon (Calm, Measured & Thoughtful)' },
  ];

  const handleTestVoice = (voiceName: string) => {
    speechService.playCoachAudio(
      `Hello! I am your English speaking partner. Let's practice speaking with natural confidence today.`,
      undefined,
      playbackSpeed
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-stone-100">Coach Settings & Persona</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. Coach Persona */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>Coaching Style & Persona</span>
          </span>

          <div className="space-y-2">
            {personas.map((p) => {
              const isSelected = coachPersona === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setCoachPersona(p.id)}
                  className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-sm ring-1 ring-amber-500/20'
                      : 'bg-stone-950 border-stone-800/80 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-200">{p.title}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-amber-400 text-stone-950 px-2 py-0.5 rounded font-bold">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Target CEFR Level */}
        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Shield className="w-4 h-4" />
            <span>Target CEFR Proficiency Level</span>
          </span>
          <p className="text-xs text-stone-400">
            Coach will tailor vocabulary complexity and grammatical strictness to this benchmark.
          </p>

          <div className="grid grid-cols-5 gap-2 pt-1">
            {(['A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setTargetLevel(lvl)}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  targetLevel === lvl
                    ? 'bg-cyan-500 text-stone-950 shadow-sm'
                    : 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Audio & Voice Settings */}
        <div className="space-y-3 pt-2 border-t border-stone-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4" />
            <span>Audio & Speech Synthesis</span>
          </span>

          {/* Auto-play toggle */}
          <div className="flex items-center justify-between p-3.5 bg-stone-950 border border-stone-800 rounded-2xl">
            <div>
              <span className="text-xs font-semibold text-stone-200">
                Auto-play Coach Responses
              </span>
              <p className="text-[11px] text-stone-400">
                Automatically read out the coach reply as soon as received.
              </p>
            </div>
            <button
              onClick={() => setAutoPlaySpeech(!autoPlaySpeech)}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                autoPlaySpeech ? 'bg-emerald-500' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  autoPlaySpeech ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Voice selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="text-stone-300">Neural Coach Voice</label>
              <button
                onClick={() => handleTestVoice(coachVoice)}
                className="text-amber-400 hover:text-amber-300 text-[11px] font-medium flex items-center gap-1"
              >
                <Volume2 className="w-3 h-3" />
                <span>Test Voice Sample</span>
              </button>
            </div>

            <select
              value={coachVoice}
              onChange={(e) => setCoachVoice(e.target.value)}
              className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50 cursor-pointer"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Speed slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-stone-300">
              <span>Speech Playback Speed</span>
              <span className="font-mono text-amber-400">{playbackSpeed}x</span>
            </div>
            <div className="flex items-center gap-2">
              {[0.8, 0.9, 1.0, 1.1, 1.2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                    playbackSpeed === spd
                      ? 'bg-amber-500 text-stone-950 font-bold'
                      : 'bg-stone-950 hover:bg-stone-800 text-stone-400 border border-stone-800'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Done button */}
        <div className="pt-2 border-t border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
