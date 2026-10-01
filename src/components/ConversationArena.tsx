import React, { useState, useEffect, useRef } from 'react';
import {
  Scenario,
  Message,
  CefrLevel,
  CoachPersona,
  LanguageFeedback,
  SavedVocabularyItem,
} from '../types';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  FileText,
  CornerDownLeft,
  Keyboard,
  Settings,
  HelpCircle,
  Play,
  Pause,
  AlertCircle,
} from 'lucide-react';
import { FeedbackCard } from './FeedbackCard';
import { speechService } from '../services/speechService';
import { sendUserSpeechToCoach, requestCoachTts } from '../services/apiService';

interface ConversationArenaProps {
  scenario: Scenario;
  onChangeScenario: () => void;
  targetLevel: CefrLevel;
  coachPersona: CoachPersona;
  autoPlaySpeech: boolean;
  coachVoice: string;
  playbackSpeed: number;
  onOpenReport: () => void;
  onSaveToVault: (item: {
    term: string;
    category: 'grammar' | 'vocabulary' | 'pronunciation';
    context: string;
    correctionOrAlternative: string;
    notes: string;
  }) => void;
  savedTerms: Set<string>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const ConversationArena: React.FC<ConversationArenaProps> = ({
  scenario,
  onChangeScenario,
  targetLevel,
  coachPersona,
  autoPlaySpeech,
  coachVoice,
  playbackSpeed,
  onOpenReport,
  onSaveToVault,
  savedTerms,
  messages,
  setMessages,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [isTypingMode, setIsTypingMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(playbackSpeed);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAnalyzing]);

  // Initial coach message if empty
  useEffect(() => {
    if (messages.length === 0 && scenario.initialCoachMessage) {
      const initialMsg: Message = {
        id: 'initial',
        role: 'coach',
        text: scenario.initialCoachMessage,
        timestamp: Date.now(),
      };
      setMessages([initialMsg]);

      if (autoPlaySpeech) {
        handlePlayCoachSpeech(initialMsg.id, initialMsg.text);
      }
    }
  }, [scenario]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      speechService.stopListening();
      speechService.stopPlayback();
    };
  }, []);

  const handleToggleListening = () => {
    setSpeechError(null);

    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      const started = speechService.startListening(
        (transcript: string, isFinal: boolean) => {
          setSpokenText(transcript);
        },
        (error: string) => {
          setSpeechError(error);
          setIsListening(false);
        },
        (listening: boolean) => {
          setIsListening(listening);
        }
      );

      if (!started && !speechService.isSpeechRecognitionSupported()) {
        setIsTypingMode(true);
      }
    }
  };

  const handlePlayCoachSpeech = async (messageId: string, text: string) => {
    if (activePlayingId === messageId) {
      speechService.stopPlayback();
      setActivePlayingId(null);
      return;
    }

    setActivePlayingId(messageId);

    // Find existing audio if stored
    const msg = messages.find((m) => m.id === messageId);
    let base64Audio = msg?.audioBase64;

    if (!base64Audio) {
      base64Audio = (await requestCoachTts(text, coachVoice)) || undefined;
      if (base64Audio) {
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, audioBase64: base64Audio } : m))
        );
      }
    }

    await speechService.playCoachAudio(text, base64Audio, currentSpeed, () => {
      setActivePlayingId(null);
    });
  };

  const handleSubmitSpeech = async (textToSubmit?: string) => {
    const finalUtterance = (textToSubmit || spokenText).trim();
    if (!finalUtterance || isAnalyzing) return;

    // Stop microphone if currently recording
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    }

    const userMessageId = `user-${Date.now()}`;
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      text: finalUtterance,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setSpokenText('');
    setIsAnalyzing(true);
    setSpeechError(null);

    try {
      const response = await sendUserSpeechToCoach(
        scenario,
        updatedMessages,
        finalUtterance,
        coachPersona,
        targetLevel
      );

      // Attach feedback to the user message
      const coachMessageId = `coach-${Date.now()}`;
      const coachMessage: Message = {
        id: coachMessageId,
        role: 'coach',
        text: response.coachReply,
        timestamp: Date.now(),
      };

      setMessages((prev) =>
        prev
          .map((m) => (m.id === userMessageId ? { ...m, feedback: response.feedback } : m))
          .concat(coachMessage)
      );

      // Optional auto-play
      if (autoPlaySpeech) {
        handlePlayCoachSpeech(coachMessageId, response.coachReply);
      }
    } catch (err: any) {
      console.error('Failed to get coach response:', err);
      setSpeechError(err.message || 'Could not communicate with coach server.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get suggested prompts from the latest feedback or scenario
  const latestUserFeedback = [...messages]
    .reverse()
    .find((m) => m.role === 'user' && m.feedback)?.feedback;

  const currentSuggestedResponses =
    latestUserFeedback?.suggestedResponses || scenario.suggestedPrompts || [];

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto w-full px-2 sm:px-4 lg:px-6">
      {/* Scenario Header Bar */}
      <div className="mt-3 py-2.5 px-4 bg-stone-900 border border-stone-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
            {scenario.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-stone-100">
                {scenario.title}
              </h2>
              <span className="text-stone-500 text-xs hidden sm:inline">·</span>
              <span className="text-xs text-stone-400 hidden sm:inline">
                Partner: <strong className="text-stone-300 font-medium">{scenario.role}</strong>
              </span>
            </div>
            <p className="text-xs text-stone-400 truncate max-w-md">
              {scenario.objective}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onChangeScenario}
            className="px-3 py-1.5 text-xs font-medium text-stone-300 hover:text-stone-100 bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 rounded-lg transition-colors"
          >
            Change Scenario
          </button>

          {messages.length > 2 && (
            <button
              onClick={onOpenReport}
              className="px-3 py-1.5 text-xs font-medium text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Diagnostic Report</span>
            </button>
          )}
        </div>
      </div>

      {/* Error alert if any */}
      {speechError && (
        <div className="mt-2 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between gap-2 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{speechError}</span>
          </div>
          <button
            onClick={() => setSpeechError(null)}
            className="text-stone-400 hover:text-stone-200 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto py-4 space-y-5 px-1">
        {messages.map((msg, index) => {
          const isCoach = msg.role === 'coach';
          const isPlayingThis = activePlayingId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isCoach ? 'items-start' : 'items-end'}`}
            >
              {/* Message metadata */}
              <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-stone-400">
                {isCoach ? (
                  <>
                    <span className="font-semibold text-amber-400">
                      Coach ({scenario.role})
                    </span>
                    <span>·</span>
                    <span>Voice Partner</span>
                  </>
                ) : (
                  <>
                    <span>You ({scenario.userRole})</span>
                    <span>·</span>
                    <span>{msg.text.split(' ').length} words</span>
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 sm:p-5 shadow-md ${
                  isCoach
                    ? 'bg-stone-900 border border-stone-800 text-stone-100 rounded-tl-sm'
                    : 'bg-gradient-to-r from-amber-600/90 to-amber-700/90 text-stone-950 font-medium rounded-tr-sm'
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Audio controls for coach bubble */}
                {isCoach && (
                  <div className="mt-3 pt-2.5 border-t border-stone-800 flex items-center justify-between gap-2 text-xs text-stone-400">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePlayCoachSpeech(msg.id, msg.text)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                          isPlayingThis
                            ? 'bg-amber-400 text-stone-950 shadow'
                            : 'bg-stone-800 hover:bg-stone-750 text-stone-300'
                        }`}
                      >
                        {isPlayingThis ? (
                          <>
                            <Pause className="w-3.5 h-3.5" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </>
                        )}
                      </button>

                      {/* Speed toggle */}
                      <button
                        onClick={() => {
                          const speeds = [0.8, 1.0, 1.2];
                          const nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
                          setCurrentSpeed(speeds[nextIdx]);
                        }}
                        className="px-2 py-1 bg-stone-800/80 hover:bg-stone-800 text-stone-400 rounded-lg text-[11px] font-mono"
                        title="Speech rate"
                      >
                        {currentSpeed}x
                      </button>
                    </div>

                    <span className="text-[11px] text-stone-500">
                      Gemini Neural Voice
                    </span>
                  </div>
                )}
              </div>

              {/* Language Feedback Card attached to user messages */}
              {!isCoach && msg.feedback && (
                <div className="w-full max-w-2xl">
                  <FeedbackCard
                    feedback={msg.feedback}
                    userSpeech={msg.text}
                    onSaveToVault={onSaveToVault}
                    savedTerms={savedTerms}
                    onPracticePhrase={(phrase) => {
                      setSpokenText(phrase);
                      if (textInputRef.current) {
                        textInputRef.current.focus();
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}

        {/* Coach analyzing loader */}
        {isAnalyzing && (
          <div className="flex flex-col items-start space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-400">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Coach is listening & analyzing grammar, fluency & vocabulary...</span>
            </div>
            <div className="bg-stone-900 border border-stone-800 rounded-2xl rounded-tl-sm p-4 text-stone-400 text-sm flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce [animation-delay:0.4s]" />
              </div>
              <span className="text-xs text-stone-400">
                Evaluating pronunciation & framing response...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Follow-up Prompt Chips */}
      {currentSuggestedResponses.length > 0 && !isAnalyzing && (
        <div className="py-2 overflow-x-auto flex items-center gap-2 no-scrollbar">
          <span className="text-[11px] font-medium text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Ideas:
          </span>
          {currentSuggestedResponses.slice(0, 3).map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSpokenText(prompt);
                handleSubmitSpeech(prompt);
              }}
              className="shrink-0 text-xs text-stone-300 hover:text-stone-100 bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/40 px-3 py-1.5 rounded-full transition-all text-left max-w-xs truncate"
              title={prompt}
            >
              "{prompt}"
            </button>
          ))}
        </div>
      )}

      {/* Voice Control & Input Dock */}
      <div className="py-3 border-t border-stone-800 bg-stone-950/90">
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3 shadow-xl space-y-3">
          {/* Active Listening / Audio Wave Indicator */}
          {isListening && (
            <div className="flex items-center justify-between px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <span className="w-1 h-3 bg-amber-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                  <span className="w-1 h-5 bg-amber-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                  <span className="w-1 h-2 bg-amber-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite]" />
                  <span className="w-1 h-4 bg-amber-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite]" />
                </div>
                <span className="text-xs font-semibold text-amber-300">
                  Listening to your English... speak naturally!
                </span>
              </div>
              <button
                onClick={handleToggleListening}
                className="text-xs text-amber-400 hover:text-amber-200 underline font-medium"
              >
                Done Speaking
              </button>
            </div>
          )}

          {/* Transcript / Text input area */}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={textInputRef}
                value={spokenText}
                onChange={(e) => setSpokenText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitSpeech();
                  }
                }}
                placeholder={
                  isListening
                    ? "Speaking... (your live transcript appears here)"
                    : "Tap the microphone to speak, or type your response here..."
                }
                rows={spokenText.length > 80 ? 3 : 2}
                className="w-full bg-stone-950/80 border border-stone-800 focus:border-amber-500/60 rounded-xl p-3 text-sm text-stone-100 placeholder-stone-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Mic Toggle Button */}
            <button
              onClick={handleToggleListening}
              className={`p-3.5 rounded-xl font-bold flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-rose-500 text-stone-950 shadow-lg shadow-rose-500/30 scale-105 animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg shadow-amber-500/20'
              }`}
              title={isListening ? 'Stop listening' : 'Start speaking with microphone'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Submit Button */}
            <button
              onClick={() => handleSubmitSpeech()}
              disabled={!spokenText.trim() || isAnalyzing}
              className={`p-3.5 rounded-xl font-bold flex items-center justify-center transition-all ${
                spokenText.trim() && !isAnalyzing
                  ? 'bg-stone-800 hover:bg-stone-700 text-amber-400 border border-amber-500/30 cursor-pointer'
                  : 'bg-stone-800/40 text-stone-600 border border-stone-800 cursor-not-allowed'
              }`}
              title="Submit response to coach"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Quick instructions & toggles */}
          <div className="flex items-center justify-between text-[11px] text-stone-500 px-1">
            <span>
              Tip: Press <strong>Enter</strong> to send. Speak in full sentences to receive deeper CEFR diagnostics.
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSpokenText('')}
                disabled={!spokenText}
                className="hover:text-stone-300 disabled:opacity-40"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
