import React, { useState } from 'react';
import { Database, Link2, Plus, ArrowRight, ShieldCheck, AlertOctagon, CheckCircle, Search, Layers, GitFork } from 'lucide-react';
import { DecisionRecord, OutcomeRecord } from '../types';

interface QdrantMemoryExplorerProps {
  decisions: DecisionRecord[];
  outcomes: OutcomeRecord[];
  onAddCustomPrecedent: (decision: string, reasoning: string, outcome: string, sentiment: 'good' | 'bad') => Promise<void>;
}

export const QdrantMemoryExplorer: React.FC<QdrantMemoryExplorerProps> = ({
  decisions,
  outcomes,
  onAddCustomPrecedent,
}) => {
  const [activeTab, setActiveTab] = useState<'collections' | 'graph'>('collections');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Modal form state
  const [newDecision, setNewDecision] = useState('');
  const [newReasoning, setNewReasoning] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newSentiment, setNewSentiment] = useState<'bad' | 'good'>('bad');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDecision.trim() || !newOutcome.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddCustomPrecedent(newDecision, newReasoning, newOutcome, newSentiment);
      setNewDecision('');
      setNewReasoning('');
      setNewOutcome('');
      setShowAddModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDecisions = decisions.filter(
    (d) =>
      d.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.reasoning?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getLinkedOutcome = (outcomeId: string | null) => {
    if (!outcomeId) return null;
    return outcomes.find((o) => o.id === outcomeId);
  };

  return (
    <div id="qdrant-memory-panel" className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col gap-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Qdrant Vector Memory
              <span className="text-xs font-normal text-slate-400 font-mono">
                ({decisions.length} decisions · {outcomes.length} outcomes)
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Two purpose-built collections linked bidirectionally via embedding search
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Tab switcher */}
          <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'collections'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Collections</span>
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-colors ${
                activeTab === 'graph'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GitFork className="w-3.5 h-3.5" />
              <span>Link Graph</span>
            </button>
          </div>

          <button
            id="add-memory-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Precedent</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter decisions and outcomes across Qdrant vector spaces..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Tab 1: Collections View */}
      {activeTab === 'collections' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Collection 1: Decisions */}
          <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Collection: `decisions`
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {filteredDecisions.length} vectors
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {filteredDecisions.map((dec) => {
                const linkedOutcome = getLinkedOutcome(dec.outcomeId);
                return (
                  <div
                    key={dec.id}
                    className="p-3 rounded-lg bg-slate-900 border border-slate-800/90 text-xs flex flex-col gap-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400 truncate max-w-[120px]">
                        {dec.id}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {dec.context || 'General'}
                      </span>
                    </div>

                    <p className="text-slate-100 font-semibold leading-relaxed">
                      "{dec.text}"
                    </p>

                    {dec.reasoning && (
                      <p className="text-[11px] text-slate-400 italic">
                        Reasoning: {dec.reasoning}
                      </p>
                    )}

                    {/* Outcome Link Badge */}
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Linked Outcome:</span>
                      {linkedOutcome ? (
                        <span
                          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                            linkedOutcome.sentiment === 'bad'
                              ? 'bg-red-950/50 text-red-300 border-red-800/60'
                              : 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                          }`}
                        >
                          <Link2 className="w-3 h-3" />
                          {linkedOutcome.sentiment === 'bad' ? 'Negative Outcome' : 'Good Outcome'}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">Unlinked (outcome: null)</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Collection 2: Outcomes */}
          <div className="bg-slate-950/70 rounded-xl p-3.5 border border-slate-800 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                Collection: `outcomes`
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {outcomes.length} vectors
              </span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {outcomes.map((out) => {
                const parentDec = decisions.find((d) => d.id === out.linkedDecisionId);
                return (
                  <div
                    key={out.id}
                    className={`p-3 rounded-lg border text-xs flex flex-col gap-1.5 transition-colors ${
                      out.sentiment === 'bad'
                        ? 'bg-red-950/15 border-red-900/40'
                        : 'bg-emerald-950/15 border-emerald-900/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-purple-400 truncate max-w-[120px]">
                        {out.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          out.sentiment === 'bad'
                            ? 'bg-red-900/40 text-red-300'
                            : 'bg-emerald-900/40 text-emerald-300'
                        }`}
                      >
                        {out.sentiment} outcome
                      </span>
                    </div>

                    <p className="text-slate-100 font-semibold leading-relaxed">
                      "{out.text}"
                    </p>

                    {out.consequence && (
                      <p className="text-[11px] text-slate-300">
                        Impact: {out.consequence}
                      </p>
                    )}

                    <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Links to Decision:</span>
                      {parentDec ? (
                        <span className="text-slate-300 font-mono text-[10px] truncate max-w-[140px]">
                          {parentDec.id}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic text-[10px]">Unlinked</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Interactive Decision-Outcome Graph */
        <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold">Decision-Outcome Link Memory Graph</span>
            <span className="text-[11px] italic">Red edges feed the live interrupt detector</span>
          </div>

          <div className="space-y-3">
            {decisions.map((dec) => {
              const outcome = getLinkedOutcome(dec.outcomeId);
              return (
                <div
                  key={dec.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs"
                >
                  {/* Left: Decision */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono font-bold text-[10px]">
                        DECISION
                      </span>
                      <span className="text-slate-400 text-[11px] font-mono">{dec.id}</span>
                    </div>
                    <p className="text-white font-semibold">"{dec.text}"</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Rationale: {dec.reasoning}</p>
                  </div>

                  {/* Middle: Link Vector Arrow */}
                  <div className="flex items-center justify-center shrink-0 px-2">
                    <div className="flex items-center gap-1 text-slate-500">
                      <div className="w-4 h-0.5 bg-slate-700"></div>
                      <Link2 className="w-4 h-4 text-indigo-400" />
                      <ArrowRight className="w-4 h-4 text-slate-600" />
                    </div>
                  </div>

                  {/* Right: Outcome */}
                  <div className="flex-1">
                    {outcome ? (
                      <div
                        className={`p-2.5 rounded-lg border ${
                          outcome.sentiment === 'bad'
                            ? 'bg-red-950/30 border-red-900/60 text-red-200'
                            : 'bg-emerald-950/30 border-emerald-900/60 text-emerald-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-mono text-[10px] uppercase font-bold">
                            {outcome.sentiment === 'bad' ? '⚠️ Negative Precedent' : '✅ Positive Precedent'}
                          </span>
                          <span className="text-[10px] text-slate-400">{outcome.id}</span>
                        </div>
                        <p className="font-medium text-xs">"{outcome.text}"</p>
                        {outcome.consequence && (
                          <p className="text-[11px] opacity-80 mt-0.5">{outcome.consequence}</p>
                        )}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-950 border border-dashed border-slate-800 text-slate-500 italic text-center">
                        No outcome linked yet
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add Custom Precedent */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Add Precedent to Qdrant Memory
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Past Decision Statement
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., We're going to build our own custom auth from scratch."
                  value={newDecision}
                  onChange={(e) => setNewDecision(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Original Reasoning / Assumptions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Avoid vendor lock-in and save on user tier costs."
                  value={newReasoning}
                  onChange={(e) => setNewReasoning(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Recorded Outcome / What Happened
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Auth security flaws delayed launch by 2 months and required complete rewrite."
                  value={newOutcome}
                  onChange={(e) => setNewOutcome(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Outcome Sentiment
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sentiment"
                      checked={newSentiment === 'bad'}
                      onChange={() => setNewSentiment('bad')}
                      className="text-red-500"
                    />
                    <span className="text-red-300 font-semibold">Negative (Triggers Live Interrupts)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sentiment"
                      checked={newSentiment === 'good'}
                      onChange={() => setNewSentiment('good')}
                      className="text-emerald-500"
                    />
                    <span className="text-emerald-300 font-semibold">Positive (Success)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  {isSubmitting ? 'Embedding in Qdrant...' : 'Save & Link in Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
