import React, { useState } from 'react';
import { Sparkles, Play, CheckCircle2, ArrowRight, ShieldAlert, Database, Volume2, X, RotateCcw, Search, Check } from 'lucide-react';
import { LyzrPipelineResult } from '../types';

interface DemoScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteScriptStep: (stepNumber: number) => Promise<void>;
  isRunningStep: boolean;
  currentInterrupt: LyzrPipelineResult | null;
  onInspectDag?: () => void;
  onSpeakAgain?: () => void;
  isSpeaking?: boolean;
}

export const DemoScriptModal: React.FC<DemoScriptModalProps> = ({
  isOpen,
  onClose,
  onExecuteScriptStep,
  isRunningStep,
  currentInterrupt,
  onInspectDag,
  onSpeakAgain,
  isSpeaking = false,
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [step1Completed, setStep1Completed] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700/90 rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-950/50 via-slate-900 to-indigo-950/50 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                  Judge Demo Script Walkthrough
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                  Brief Page 4
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">
                Guaranteed working end-to-end solo agent proof point for hackathon evaluation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 ml-2"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Tabs */}
        <div className="px-4 sm:px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800/80 shrink-0">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center font-semibold transition-all ${
                currentStep === 1
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${
                step1Completed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}>
                {step1Completed ? '✓' : '1'}
              </span>
              <span className="truncate">1. Past Memory</span>
            </button>

            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center font-semibold transition-all ${
                currentStep === 2
                  ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                2
              </span>
              <span className="truncate">2. Repeat Trap</span>
            </button>

            <button
              onClick={() => setCurrentStep(3)}
              className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-center font-semibold transition-all ${
                currentStep === 3
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-4 h-4 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
                3
              </span>
              <span className="truncate">3. Live Payoff</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Step 1: Memory Grounding */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentStep === 1
                ? 'bg-slate-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/20'
                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center border border-slate-700 shrink-0 text-xs">
                  1
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
                  Setup Memory (Past Decision & Outcome)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-800/50 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Database className="w-3 h-3" /> Qdrant Precedent
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-3">
              Verifies the baseline memory recorded from a prior session is present in Qdrant collections:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-950 p-3 rounded-xl border border-slate-800/90 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/40">
                <span className="text-amber-400 font-bold uppercase text-[9px] block mb-1">
                  Historical Decision
                </span>
                <p className="text-amber-100 font-sans">
                  "We're picking Vendor A because they're the cheapest."
                </p>
                <span className="text-slate-500 text-[10px] mt-1 block">Context: Vendor Procurement</span>
              </div>
              <div className="p-2 rounded-lg bg-red-950/20 border border-red-900/40">
                <span className="text-red-400 font-bold uppercase text-[9px] block mb-1">
                  Linked Bad Outcome
                </span>
                <p className="text-red-100 font-sans">
                  "Vendor A missed every deadline, we lost two weeks."
                </p>
                <span className="text-slate-500 text-[10px] mt-1 block">Sentiment: Negative</span>
              </div>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                {step1Completed ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Memory Seeded & Linked in Qdrant
                  </span>
                ) : (
                  'Click to ensure memory collections are freshly seeded'
                )}
              </span>
              <button
                disabled={isRunningStep}
                onClick={async () => {
                  await onExecuteScriptStep(1);
                  setStep1Completed(true);
                  setCurrentStep(2);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all ml-auto shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Verify & Seed Memory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Step 2: Live In Front of Judges */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentStep === 2
                ? 'bg-slate-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/20'
                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center border border-slate-700 shrink-0 text-xs">
                  2
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
                  Live In Front of Judges (The Repeat Trap)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/50 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <ShieldAlert className="w-3 h-3" /> Live Ingestion
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-3">
              The user starts a new conversation and repeats the exact heuristic mistake:
            </p>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/90 flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-emerald-400 font-bold block mb-1">
                  Live Spoken Utterance:
                </span>
                <p className="text-xs sm:text-sm text-emerald-200 font-mono font-medium">
                  "For this new project, let's just go with the cheapest option again."
                </p>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0 hidden sm:inline">Speaker: Alex</span>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
              <p className="text-[11px] text-slate-400">
                Feeds into Omi live stream $\rightarrow$ triggers Qdrant similarity match $\rightarrow$ runs Lyzr DAG
              </p>
              <button
                disabled={isRunningStep}
                onClick={async () => {
                  await onExecuteScriptStep(2);
                  setCurrentStep(3);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all ml-auto shrink-0"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunningStep ? 'Processing Ingestion & DAG...' : 'Stream Repeat Utterance'}</span>
              </button>
            </div>
          </div>

          {/* Step 3: The Payoff */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              currentStep === 3
                ? 'bg-slate-900 border-emerald-500/60 shadow-lg ring-1 ring-emerald-500/20'
                : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start sm:items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-emerald-400 font-bold flex items-center justify-center border border-slate-700 shrink-0 text-xs">
                  3
                </span>
                <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight truncate">
                  The Payoff (Real-time Spoken Interrupt)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/50 flex items-center gap-1 shrink-0 whitespace-nowrap">
                <Volume2 className="w-3 h-3" /> Live Gut-Check
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed mb-3">
              Loopback interrupts within seconds — citing the Vendor A precedent, original reasoning, and real outcome:
            </p>

            {currentInterrupt && currentInterrupt.triggered ? (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-emerald-400 font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Agent 3 Spoken Interruption:
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    Similarity: {(currentInterrupt.similarityScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed">
                  "{currentInterrupt.composer?.interruptText}"
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-400">
                    Action: {currentInterrupt.composer?.suggestedAction}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    {onSpeakAgain && (
                      <button
                        onClick={onSpeakAgain}
                        disabled={isSpeaking}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isSpeaking ? 'Speaking...' : 'Replay Voice'}</span>
                      </button>
                    )}
                    {onInspectDag && (
                      <button
                        onClick={() => {
                          onClose();
                          onInspectDag();
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Inspect DAG Trace</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-slate-400 leading-relaxed text-xs">
                <span className="text-amber-300 font-semibold">Ready to test:</span> Execute Step 2 above to stream the repeat decision trap and hear the live interrupt generated.
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0 text-xs">
          <span className="text-slate-500 font-mono text-[11px] text-center sm:text-left">
            Solo Builder Track · HiDevs / Lyzr × Qdrant × Omi
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
            >
              Close & View Live Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
