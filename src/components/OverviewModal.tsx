import React from 'react';
import { X, CheckCircle, Radio, Database, Cpu, Award } from 'lucide-react';

interface OverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OverviewModal: React.FC<OverviewModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-950/60 via-slate-900 to-indigo-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Loopback: Project Architecture & Brief</h3>
              <p className="text-xs text-slate-400">
                Stop Prompting. Code Solo Agents — HiDevs / Lyzr × Qdrant × Omi Hackathon
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300 leading-relaxed">
          {/* Pitch */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-amber-300 mb-1">1. The One-Line Pitch</h4>
            <p className="text-slate-200">
              While a user is talking through a decision out loud, Loopback listens ambiently, recognizes when the current decision echoes a past decision that led to a bad outcome, and interrupts in the moment — live, mid-conversation — with specific past context and what actually happened. Not a retrospective weekly review; a real-time gut-check grounded in the user's own remembered history.
            </p>
          </div>

          {/* Honest Novelty */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-2xl">
            <h4 className="text-sm font-bold text-amber-300 mb-1">2. Honest Novelty Note (Section 10)</h4>
            <p className="text-slate-200">
              Decision journals already correlate decisions with outcomes retrospectively. Loopback's specific differentiation is the <strong>real-time, voice-triggered interrupt mechanic</strong> during an unrelated new conversation. The hackathon weights working software and observable agentic reasoning at 60%+, prioritizing an end-to-end loop over unverifiable claims.
            </p>
          </div>

          {/* Tech Stack Breakdown */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-white">3. Hackathon Tech Stack Integration</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                  <Radio className="w-4 h-4" />
                  <span>Omi Voice</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Real-time streaming transcript chunks via webhooks and live ambient mic capture.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
                  <Database className="w-4 h-4" />
                  <span>Qdrant</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Two linked collections (`decisions` and `outcomes`) with bidirectional semantic link search.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                  <Cpu className="w-4 h-4" />
                  <span>Lyzr 3-DAG</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Observable agent pipeline: Relevance Judge → Context Synthesizer → Interrupt Composer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
