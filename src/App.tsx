import React, { useState, useEffect } from 'react';
import {
  Scenario,
  CefrLevel,
  CoachPersona,
  SavedVocabularyItem,
  Message,
} from './types';
import { DEFAULT_SCENARIOS } from './data/scenarios';
import { Header } from './components/Header';
import { ConversationArena } from './components/ConversationArena';
import { PronunciationClinic } from './components/PronunciationClinic';
import { MistakeVault } from './components/MistakeVault';
import { FluencyAnalytics } from './components/FluencyAnalytics';
import { ScenarioSelectorModal } from './components/ScenarioSelectorModal';
import { SettingsModal } from './components/SettingsModal';
import { SessionReportModal } from './components/SessionReportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<'conversation' | 'pronunciation' | 'vault' | 'analytics'>('conversation');
  const [currentScenario, setCurrentScenario] = useState<Scenario>(DEFAULT_SCENARIOS[0]);
  const [targetLevel, setTargetLevel] = useState<CefrLevel>('B2');
  const [coachPersona, setCoachPersona] = useState<CoachPersona>('warm_encouraging');
  const [autoPlaySpeech, setAutoPlaySpeech] = useState<boolean>(true);
  const [coachVoice, setCoachVoice] = useState<string>('Kore');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Modals state
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);

  // Persistent Mistake Vault items
  const [savedItems, setSavedItems] = useState<SavedVocabularyItem[]>(() => {
    try {
      const stored = localStorage.getItem('articulate_saved_vault');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
    }
    // Seed with 2 realistic initial examples
    return [
      {
        id: 'seed-1',
        term: 'I am agree with you',
        category: 'grammar',
        context: 'I am agree with you about the design.',
        correctionOrAlternative: 'I agree with you / I completely agree',
        notes: 'Verb Usage: "Agree" is already an active verb in English; do not add the auxiliary verb "am".',
        addedAt: Date.now() - 86400000,
        timesPracticed: 2,
        mastered: false,
      },
      {
        id: 'seed-2',
        term: 'very good',
        category: 'vocabulary',
        context: 'The presentation was very good.',
        correctionOrAlternative: 'exceptional, compelling, remarkable',
        notes: 'Vocabulary Upgrade: In business meetings, use "compelling" or "exceptional" instead of "very good".',
        addedAt: Date.now() - 43200000,
        timesPracticed: 1,
        mastered: true,
      },
    ];
  });

  // Save to localStorage whenever savedItems changes
  useEffect(() => {
    try {
      localStorage.setItem('articulate_saved_vault', JSON.stringify(savedItems));
    } catch (e) {
      console.warn('Could not write to localStorage:', e);
    }
  }, [savedItems]);

  const handleSaveToVault = (item: {
    term: string;
    category: 'grammar' | 'vocabulary' | 'pronunciation';
    context: string;
    correctionOrAlternative: string;
    notes: string;
  }) => {
    // Avoid duplicate terms
    if (savedItems.some((s) => s.term.toLowerCase() === item.term.toLowerCase())) {
      return;
    }

    const newItem: SavedVocabularyItem = {
      id: `vault-${Date.now()}`,
      term: item.term,
      category: item.category,
      context: item.context,
      correctionOrAlternative: item.correctionOrAlternative,
      notes: item.notes,
      addedAt: Date.now(),
      timesPracticed: 0,
      mastered: false,
    };

    setSavedItems((prev) => [newItem, ...prev]);
  };

  const handleRemoveFromVault = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggleMastered = (id: string) => {
    setSavedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, mastered: !i.mastered } : i))
    );
  };

  // Change Scenario
  const handleSelectScenario = (sc: Scenario) => {
    setCurrentScenario(sc);
    setMessages([]);
    setIsScenarioModalOpen(false);
    setActiveTab('conversation');
  };

  // Restart scenario conversation
  const handleRestartScenario = () => {
    setMessages([]);
    setIsReportModalOpen(false);
  };

  // Saved term set for instant lookup
  const savedTermsSet = new Set(savedItems.map((i) => i.term));

  // Compute session statistics
  const userMessages = messages.filter((m) => m.role === 'user');
  const totalWordsSpoken = userMessages.reduce((acc, m) => acc + m.text.split(' ').length, 0);
  const totalTurns = userMessages.length;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500 selection:text-stone-950">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        targetLevel={targetLevel}
        setTargetLevel={setTargetLevel}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        vaultCount={savedItems.length}
      />

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeTab === 'conversation' && (
          <ConversationArena
            scenario={currentScenario}
            onChangeScenario={() => setIsScenarioModalOpen(true)}
            targetLevel={targetLevel}
            coachPersona={coachPersona}
            autoPlaySpeech={autoPlaySpeech}
            coachVoice={coachVoice}
            playbackSpeed={playbackSpeed}
            onOpenReport={() => setIsReportModalOpen(true)}
            onSaveToVault={handleSaveToVault}
            savedTerms={savedTermsSet}
            messages={messages}
            setMessages={setMessages}
          />
        )}

        {activeTab === 'pronunciation' && (
          <PronunciationClinic coachVoice={coachVoice} />
        )}

        {activeTab === 'vault' && (
          <MistakeVault
            savedItems={savedItems}
            onRemoveItem={handleRemoveFromVault}
            onToggleMastered={handleToggleMastered}
          />
        )}

        {activeTab === 'analytics' && (
          <FluencyAnalytics
            targetLevel={targetLevel}
            totalWordsSpoken={totalWordsSpoken}
            totalTurns={totalTurns}
            savedItems={savedItems}
            onStartPractice={() => setActiveTab('conversation')}
          />
        )}
      </main>

      {/* Scenario Selector Modal */}
      <ScenarioSelectorModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        activeScenarioId={currentScenario.id}
        onSelectScenario={handleSelectScenario}
      />

      {/* Settings & Persona Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        coachPersona={coachPersona}
        setCoachPersona={setCoachPersona}
        targetLevel={targetLevel}
        setTargetLevel={setTargetLevel}
        autoPlaySpeech={autoPlaySpeech}
        setAutoPlaySpeech={setAutoPlaySpeech}
        coachVoice={coachVoice}
        setCoachVoice={setCoachVoice}
        playbackSpeed={playbackSpeed}
        setPlaybackSpeed={setPlaybackSpeed}
      />

      {/* Session Diagnostic & CEFR Report Modal */}
      <SessionReportModal
        scenario={currentScenario}
        messages={messages}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onRestartScenario={handleRestartScenario}
      />
    </div>
  );
}
