import React from 'react';
import { Cpu, ArrowRight, ShieldCheck, FileText, BellRing, CheckCircle, AlertCircle, Clock, Zap } from 'lucide-react';
import { LyzrPipelineResult } from '../types';

interface LyzrDagVisualizerProps {
  pipelineResult: LyzrPipelineResult | null;
  isProcessing: boolean;
}

export const LyzrDagVisualizer: React.FC<LyzrDagVisualizerProps> = ({
  pipelineResult,
  isProcessing,
}) => {
  const hasTriggered = Boolean(pipelineResult?.triggered);
  const judge = pipelineResult?.judge;
  const synth = pipelineResult?.synthesizer;
  const composer = pipelineResult?.composer;
  const latency = pipelineResult?.latencyMs;

  return (
    <div id="lyzr-dag-visualizer" className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 shadow-lg flex flex-col gap-4">
      {/* Visualizer Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Lyzr Observable 3-Agent DAG Pipeline
              {hasTriggered && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LIVE FIRED
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">
              Distinct, observable agentic reasoning steps (Relevance Judge → Context Synthesizer → Interrupt Composer)
            </p>
          </div>
        </div>

        {latency && (
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Total DAG: {latency.total}ms</span>
          </div>
        )}
      </div>

      {/* DAG Workflow Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
        {/* Agent 1: Relevance Judge */}
        <div
          className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
            judge
              ? judge.isRelevant
                ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
                : 'bg-slate-800/60 border-slate-700'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-[11px] font-mono font-bold flex items-center justify-center border border-slate-700">
                  1
                </span>
                <span className="text-xs font-bold text-white">Relevance Judge</span>
              </div>
              {judge ? (
                judge.isRelevant ? (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    MATCH CONFIRMED
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300">
                    FILTERED OUT
                  </span>
                )
              ) : (
                <span className="text-[10px] font-mono text-slate-500">Idle</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Filters superficial wording echoes from genuine flawed decision patterns.
            </p>

            {judge ? (
              <div className="space-y-1.5 text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Pattern:</span>
                  <span className="font-semibold text-amber-300 text-right truncate max-w-[140px]">
                    {judge.categoryMatch}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Confidence:</span>
                  <span className="font-mono text-slate-200">
                    {(judge.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800/80">
                  "{judge.reasoning}"
                </p>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-slate-600 italic bg-slate-950/30 rounded-lg">
                Awaiting similarity match &gt; threshold
              </div>
            )}
          </div>

          {latency && judge && (
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-400">
              <span>Latency:</span>
              <span className="text-amber-400">{latency.judge}ms</span>
            </div>
          )}
        </div>

        {/* Agent 2: Context Synthesizer */}
        <div
          className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
            synth
              ? 'bg-amber-950/20 border-amber-500/50 shadow-sm'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-[11px] font-mono font-bold flex items-center justify-center border border-slate-700">
                  2
                </span>
                <span className="text-xs font-bold text-white">Context Synthesizer</span>
              </div>
              {synth ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  SYNTHESIZED
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">Idle</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Reconstructs original reasoning + real consequences from Qdrant link.
            </p>

            {synth ? (
              <div className="space-y-1.5 text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[11px]">
                  <span className="text-slate-400">Key Risk Identified:</span>
                  <p className="font-semibold text-red-300 mt-0.5">{synth.keyRisk}</p>
                </div>
                <div className="text-[11px] pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Precedent Summary:</span>
                  <p className="text-slate-200 mt-0.5 leading-relaxed">
                    {synth.precedentSummary}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-slate-600 italic bg-slate-950/30 rounded-lg">
                Awaiting Agent 1 validation
              </div>
            )}
          </div>

          {latency && synth && (
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-400">
              <span>Latency:</span>
              <span className="text-amber-400">{latency.synthesizer}ms</span>
            </div>
          )}
        </div>

        {/* Agent 3: Interrupt Composer */}
        <div
          className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
            composer
              ? 'bg-amber-950/30 border-amber-500 shadow-sm'
              : 'bg-slate-950/60 border-slate-800/80 text-slate-500'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 text-[11px] font-mono font-bold flex items-center justify-center border border-slate-700">
                  3
                </span>
                <span className="text-xs font-bold text-white">Interrupt Composer</span>
              </div>
              {composer ? (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 uppercase">
                  {composer.urgency}
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">Idle</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mb-2">
              Formats the natural spoken gut-check delivered mid-conversation.
            </p>

            {composer ? (
              <div className="space-y-1.5 text-xs bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[11px] flex justify-between">
                  <span className="text-slate-400">Tone:</span>
                  <span className="text-amber-300 font-medium">{composer.tone}</span>
                </div>
                <div className="pt-1 border-t border-slate-800/80">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Output Spoken String:</span>
                  <p className="font-semibold text-white mt-0.5 leading-snug">
                    “{composer.interruptText}”
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-xs text-slate-600 italic bg-slate-950/30 rounded-lg">
                Awaiting Agent 2 context synthesis
              </div>
            )}
          </div>

          {latency && composer && (
            <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-between text-[10px] font-mono text-slate-400">
              <span>Latency:</span>
              <span className="text-amber-400">{latency.composer}ms</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
