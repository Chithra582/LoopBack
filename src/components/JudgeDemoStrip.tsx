import React, { useState } from 'react';
import { Sparkles, Play, RotateCcw, Volume2, Search, CheckCircle2, ArrowRight, Database, ShieldAlert, Cpu } from 'lucide-react';
import { LyzrPipelineResult } from '../types';

interface JudgeDemoStripProps {
  onExecuteScriptStep: (stepNumber: number) => Promise<void>;
  isRunningStep: boolean;
  currentInterrupt: LyzrPipelineResult | null;
  onOpenWalkthroughModal: () => void;
  onSpeakAgain: () => void;
  onInspectDag: () => void;
  isSpeaking: boolean;
}

export const JudgeDemoStrip: React.FC<JudgeDemoStripProps> = ({
  onExecuteScriptStep,
  isRunningStep,
  currentInterrupt,
  onOpenWalkthroughModal,
  onSpeakAgain,
  onInspectDag,
  isSpeaking,
}) => {
  const [step1Done, setStep1Done] = useState(true);

  return (
    <section
      id="judge-demo-strip"
      aria-label="Hackathon Evaluation Strip"
      className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3.5 sm:p-4 shadow-xl backdrop-blur-md relative overflow-hidden"
    >
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 relative z-10">
        {/* Left: Judge flow label and context */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide uppercase">
                Judge Demo Script
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                1-Click Proof Point
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Run the exact 3-step live interrupt scenario from Page 4 of the Brief:
            </p>
          </div>
        </div>

        {/* Center: 3-Step Interactive Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 max-w-3xl">
          {/* Step 1 */}
          <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="font-semibold text-slate-200 truncate text-[11px]">
                  Seed Memory
                </span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block pl-5">
                Vendor A price trap
              </span>
            </div>
            <button
              disabled={isRunningStep}
              onClick={async () => {
                await onExecuteScriptStep(1);
                setStep1Done(true);
              }}
              title="Ensure Vendor A past decision and outcome are seeded"
              className="px-2.5 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-[11px] font-semibold transition-all shrink-0 active:scale-95"
            >
              {step1Done ? '✓ Seeded' : 'Seed'}
            </button>
          </div>

          {/* Step 2 */}
          <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="font-semibold text-slate-200 truncate text-[11px]">
                  Repeat Trap
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono truncate block pl-5">
                "Go with cheapest again"
              </span>
            </div>
            <button
              disabled={isRunningStep}
              onClick={() => onExecuteScriptStep(2)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-[11px] font-bold transition-all shadow-sm shrink-0 active:scale-95"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>{isRunningStep ? 'Streaming...' : 'Stream'}</span>
            </button>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs gap-2 transition-all ${
              currentInterrupt?.triggered
                ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                : 'bg-slate-950/50 border-slate-800 text-slate-400'
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-slate-800 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="font-semibold truncate text-[11px]">
                  {currentInterrupt?.triggered ? 'Interrupt Spoken' : 'Live Payoff'}
                </span>
              </div>
              <span className="text-[10px] truncate block pl-5 text-slate-400">
                {currentInterrupt?.triggered ? 'Grounded warning' : 'Awaiting stream'}
              </span>
            </div>

            {currentInterrupt?.triggered ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onSpeakAgain}
                  disabled={isSpeaking}
                  title="Replay spoken audio"
                  className="p-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onInspectDag}
                  title="Inspect DAG trace"
                  className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40"
                >
                  <Search className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <span className="text-[10px] font-mono text-slate-500">Wait Step 2</span>
            )}
          </div>
        </div>

        {/* Right: Detailed Walkthrough Modal CTA */}
        <button
          onClick={onOpenWalkthroughModal}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shrink-0 whitespace-nowrap"
        >
          <span>Walkthrough Guide</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
