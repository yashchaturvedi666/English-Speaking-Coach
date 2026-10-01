import React, { useState } from 'react';
import { Scenario, CefrLevel } from '../types';
import { DEFAULT_SCENARIOS } from '../data/scenarios';
import {
  X,
  Briefcase,
  Coffee,
  Clock,
  Hotel,
  GraduationCap,
  HeartPulse,
  Sparkles,
  Plus,
  Check,
  Search,
  Target,
} from 'lucide-react';

interface ScenarioSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeScenarioId: string;
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioSelectorModal: React.FC<ScenarioSelectorModalProps> = ({
  isOpen,
  onClose,
  activeScenarioId,
  onSelectScenario,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);

  // Custom scenario form state
  const [customTitle, setCustomTitle] = useState('');
  const [customRole, setCustomRole] = useState('Conversational Partner');
  const [customUserRole, setCustomUserRole] = useState('Myself');
  const [customLevel, setCustomLevel] = useState<CefrLevel>('B2');
  const [customObjective, setCustomObjective] = useState('');
  const [customStarter, setCustomStarter] = useState('');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Scenarios' },
    { id: 'interview', label: 'Job Interviews' },
    { id: 'workplace', label: 'Business & Office' },
    { id: 'social', label: 'Social & Café' },
    { id: 'travel', label: 'Travel & Daily' },
    { id: 'ielts', label: 'IELTS / Academic' },
  ];

  const filteredScenarios = DEFAULT_SCENARIOS.filter((s) => {
    const matchesCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-5 h-5" />;
      case 'Target':
        return <Target className="w-5 h-5" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5" />;
      case 'Clock':
        return <Clock className="w-5 h-5" />;
      case 'Hotel':
        return <Hotel className="w-5 h-5" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const newScenario: Scenario = {
      id: `custom-${Date.now()}`,
      title: customTitle.trim(),
      category: 'custom',
      role: customRole.trim() || 'Conversation Partner',
      userRole: customUserRole.trim() || 'English Learner',
      level: customLevel,
      description: customObjective.trim() || 'Custom conversation practice.',
      objective: customObjective.trim() || 'Practice spontaneous speaking.',
      initialCoachMessage:
        customStarter.trim() ||
        `Hello! I'm happy to chat about ${customTitle.trim()}. Where shall we begin?`,
      suggestedPrompts: [
        `Let's start by discussing the key challenges...`,
        `I wanted to share my perspective on this...`,
        `Could you give me your opinion regarding...`,
      ],
      icon: 'Sparkles',
    };

    onSelectScenario(newScenario);
    setIsCreatingCustom(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div>
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-widest">
              Real-World English Immersion
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100">
              Select Speaking Scenario
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingCustom(!isCreatingCustom)}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-750 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreatingCustom ? 'Browse Scenarios' : 'Custom Scenario'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CUSTOM SCENARIO BUILDER */}
        {isCreatingCustom ? (
          <form onSubmit={handleCreateCustom} className="space-y-4">
            <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-stone-200">
                Create Tailored Conversation Simulation
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Scenario Title *</label>
                  <input
                    type="text"
                    required
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Negotiating a used car purchase"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Target Level</label>
                  <select
                    value={customLevel}
                    onChange={(e) => setCustomLevel(e.target.value as CefrLevel)}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 focus:outline-none focus:border-amber-500/50"
                  >
                    {(['A2', 'B1', 'B2', 'C1', 'C2'] as CefrLevel[]).map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl} Level
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Coach Role</label>
                  <input
                    type="text"
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="e.g. Car Salesperson, Professor, Neighbor"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-stone-400">Your Role</label>
                  <input
                    type="text"
                    value={customUserRole}
                    onChange={(e) => setCustomUserRole(e.target.value)}
                    placeholder="e.g. Buyer, Graduate Student, Resident"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-400">Learning Objective & Context</label>
                <textarea
                  value={customObjective}
                  onChange={(e) => setCustomObjective(e.target.value)}
                  placeholder="e.g. Practice polite bargaining, asking for maintenance records, and counter-offering prices."
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-stone-400">Coach's Opening Message (Optional)</label>
                <input
                  type="text"
                  value={customStarter}
                  onChange={(e) => setCustomStarter(e.target.value)}
                  placeholder="e.g. Welcome to the dealership! See anything you like?"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingCustom(false)}
                className="px-4 py-2 bg-stone-800 text-stone-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors"
              >
                Start Custom Session
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scenarios..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>

              <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl w-full sm:w-auto overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                      activeCategory === cat.id
                        ? 'bg-amber-500 text-stone-950 font-semibold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Scenario Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredScenarios.map((sc) => {
                const isActive = sc.id === activeScenarioId;
                return (
                  <div
                    key={sc.id}
                    onClick={() => {
                      onSelectScenario(sc);
                      onClose();
                    }}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isActive
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-950/60 border-stone-800/80 hover:bg-stone-950 hover:border-stone-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-amber-400">
                          {getIcon(sc.icon)}
                          <span className="font-semibold">{sc.role}</span>
                        </div>
                        <span className="bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-[11px] font-mono text-stone-300">
                          {sc.level} Level
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-stone-100">
                        {sc.title}
                      </h3>

                      <p className="text-xs text-stone-400 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-500">
                      <span className="truncate max-w-[200px]">
                        Target: {sc.objective}
                      </span>
                      {isActive && (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
