import React from 'react';
import { AlertTriangle, Volume2, ShieldAlert, CheckCircle2, ChevronRight, X, Clock, ExternalLink } from 'lucide-react';
import { LyzrPipelineResult } from '../types';

interface InterruptBannerProps {
  interrupt: LyzrPipelineResult | null;
  onDismiss: () => void;
  onInspectDag: () => void;
  onSpeakAgain: () => void;
  isSpeaking: boolean;
}

export const InterruptBanner: React.FC<InterruptBannerProps> = ({
  interrupt,
  onDismiss,
  onInspectDag,
  onSpeakAgain,
  isSpeaking,
}) => {
  if (!interrupt || !interrupt.triggered || !interrupt.composer) return null;

  const { composer, matchedDecision, matchedOutcome, similarityScore, latencyMs } = interrupt;

  return (
    <div
      id="live-interrupt-banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-950/90 via-slate-900 to-red-950/70 border-2 border-amber-500/80 shadow-2xl shadow-amber-950/50 p-5 transition-all animate-in fade-in slide-in-from-top-4 duration-300"
    >
      {/* Background ambient beacon */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-4">
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950">
                  {composer.urgency} Gut-Check
                </span>
                <span className="text-xs font-mono text-amber-300/80 font-medium">
                  Similarity: {(similarityScore * 100).toFixed(0)}% Match
                </span>
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {latencyMs.total}ms pipeline
                </span>
              </div>
              <h2 className="text-sm font-semibold text-amber-100 mt-0.5">
                Loopback detected an echo of a previous failed decision
              </h2>
            </div>
          </div>

          <button
            id="dismiss-interrupt-btn"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/80 transition-colors"
            title="Dismiss interrupt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* The Spoken Interrupt Quote */}
        <div className="bg-slate-950/80 rounded-xl p-4 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs font-mono text-amber-400/70 uppercase tracking-wider font-semibold mb-1">
              Spoken Voice Interrupt (Agent 3)
            </p>
            <blockquote className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              “{composer.interruptText}”
            </blockquote>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="replay-audio-btn"
              onClick={onSpeakAgain}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isSpeaking ? 'Speaking...' : 'Play Audio'}</span>
            </button>
          </div>
        </div>

        {/* Structured Memory Grounding Citation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* Past Decision */}
          <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
              Matched Past Decision in Qdrant
            </span>
            <p className="text-slate-200 font-medium">
              "{matchedDecision?.text}"
            </p>
            {matchedDecision?.reasoning && (
              <p className="text-[11px] text-slate-400 italic">
                Reasoning: {matchedDecision.reasoning}
              </p>
            )}
          </div>

          {/* Linked Outcome */}
          <div className="bg-red-950/40 rounded-xl p-3 border border-red-900/60 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-red-300 uppercase font-semibold">
                Linked Real Outcome
              </span>
              <span className="px-1.5 py-0.2 rounded bg-red-900/80 text-red-200 text-[10px] font-bold">
                Negative Result
              </span>
            </div>
            <p className="text-red-100 font-semibold">
              "{matchedOutcome?.text}"
            </p>
            {matchedOutcome?.consequence && (
              <p className="text-[11px] text-red-300/80">
                Consequence: {matchedOutcome.consequence}
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-amber-500/20">
          <div className="flex items-center gap-2 text-xs text-amber-300/80">
            <span className="font-semibold">Suggested Check:</span>
            <span>{composer.suggestedAction}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="inspect-dag-btn"
              onClick={onInspectDag}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <span>Why am I seeing this? (Lyzr DAG)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="acknowledge-interrupt-btn"
              onClick={onDismiss}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acknowledge & Re-evaluate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
