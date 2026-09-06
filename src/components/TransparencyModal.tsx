import React from 'react';
import { X, Search, ShieldCheck, FileText, BellRing, Database, Cpu, ArrowRight } from 'lucide-react';
import { LyzrPipelineResult } from '../types';

interface TransparencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  interrupt: LyzrPipelineResult | null;
}

export const TransparencyModal: React.FC<TransparencyModalProps> = ({
  isOpen,
  onClose,
  interrupt,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                "Why Am I Seeing This?" Transparency Inspector
              </h3>
              <p className="text-xs text-slate-400">
                Full cryptographic and semantic trace from Qdrant vector retrieval through the 3-Agent Lyzr DAG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {interrupt ? (
            <>
              {/* Step 1: Retrieval & Vector Cosine Matching */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-indigo-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" /> 1. Qdrant Vector Cosine Match
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80 font-mono text-[10px]">
                    Similarity: {(interrupt.similarityScore * 100).toFixed(1)}% (Threshold: 55%)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                      Matched Decision Entity
                    </span>
                    <p className="text-slate-100 font-semibold">"{interrupt.matchedDecision?.text}"</p>
                    <p className="text-slate-400 text-[11px] mt-1">ID: {interrupt.matchedDecision?.id}</p>
                    <p className="text-slate-400 text-[11px]">Context: {interrupt.matchedDecision?.context}</p>
                    <p className="text-slate-400 text-[11px] italic">Reasoning: {interrupt.matchedDecision?.reasoning}</p>
                  </div>

                  <div className="p-3 bg-red-950/30 rounded-xl border border-red-900/50">
                    <span className="text-[10px] uppercase font-mono text-red-400 block mb-1">
                      Linked Negative Outcome Entity
                    </span>
                    <p className="text-red-100 font-semibold">"{interrupt.matchedOutcome?.text}"</p>
                    <p className="text-red-300/80 text-[11px] mt-1">ID: {interrupt.matchedOutcome?.id}</p>
                    <p className="text-red-300/80 text-[11px]">Sentiment: {interrupt.matchedOutcome?.sentiment}</p>
                    <p className="text-red-300/80 text-[11px]">Consequence: {interrupt.matchedOutcome?.consequence}</p>
                  </div>
                </div>
              </div>

              {/* Step 2: Agent 1 Reasoning */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> 2. Agent 1: Relevance Judge
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    Confidence: {((interrupt.judge?.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed font-mono text-[11px]">
                  Pattern Verified: <span className="text-amber-300">{interrupt.judge?.categoryMatch}</span>
                </p>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 italic text-slate-300">
                  "{interrupt.judge?.reasoning}"
                </div>
              </div>

              {/* Step 3: Agent 2 Synthesis */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> 3. Agent 2: Context Synthesizer
                </span>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                  <div>
                    <span className="text-slate-500 font-mono text-[10px]">PRECENT SUMMARY:</span>
                    <p className="text-slate-200 mt-0.5">{interrupt.synthesizer?.precedentSummary}</p>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800">
                    <span className="text-slate-500 font-mono text-[10px]">KEY RISK:</span>
                    <p className="text-red-300 font-medium mt-0.5">{interrupt.synthesizer?.keyRisk}</p>
                  </div>
                </div>
              </div>

              {/* Step 4: Agent 3 Composition */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5" /> 4. Agent 3: Interrupt Composer
                </span>
                <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/40 space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Tone: {interrupt.composer?.tone}</span>
                    <span className="font-bold text-red-400 uppercase">Urgency: {interrupt.composer?.urgency}</span>
                  </div>
                  <p className="text-sm font-bold text-white pt-1 border-t border-slate-800">
                    “{interrupt.composer?.interruptText}”
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    Action: {interrupt.composer?.suggestedAction}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-500">
              No live interrupt has been triggered yet in this session. Run the Judge Demo Script to populate.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
