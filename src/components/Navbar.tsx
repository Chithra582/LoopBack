import React from 'react';
import { Radio, Database, Cpu, Volume2, VolumeX, Sparkles, RefreshCw, Trash2, HelpCircle } from 'lucide-react';

interface NavbarProps {
  isListening: boolean;
  voiceAutoPlay: boolean;
  onToggleVoice: () => void;
  onRunDemoScript: () => void;
  onResetSeed: () => void;
  onClearMemory: () => void;
  onOpenDocOverview: () => void;
  linkedPairsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isListening,
  voiceAutoPlay,
  onToggleVoice,
  onRunDemoScript,
  onResetSeed,
  onClearMemory,
  onOpenDocOverview,
  linkedPairsCount,
}) => {
  return (
    <header id="app-header" className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-4 lg:px-6 py-2.5 sm:py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3">
        {/* Top / Left: Brand & Badges Row */}
        <div className="flex flex-wrap items-center justify-between xl:justify-start gap-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-black text-base sm:text-lg shadow-sm shrink-0">
              ↺
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none">
                  Loopback
                </h1>
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 whitespace-nowrap">
                  Live Decision Interrupt
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block mt-0.5">
                Voice-First, Memory-Backed Agentic Workflow · Omi × Qdrant × Lyzr
              </p>
            </div>
          </div>

          {/* Stack Status Badges */}
          <div className="hidden sm:flex items-center gap-2 text-xs shrink-0">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
              <span className="relative flex h-2 w-2">
                {isListening && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isListening ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
              </span>
              <Radio className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-mono text-[11px]">Omi Voice</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-mono text-[11px]">Qdrant</span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[10px] font-mono border border-indigo-800/60">
                {linkedPairsCount} linked
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-slate-300">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">Lyzr DAG</span>
            </div>
          </div>
        </div>

        {/* Right / Bottom: Action Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 flex-wrap">
          {/* Mobile Badges Row */}
          <div className="flex sm:hidden items-center gap-1.5 text-[11px]">
            <span className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 text-slate-300 font-mono">
              <Database className="w-3 h-3 text-indigo-400" />
              {linkedPairsCount} linked
            </span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* TTS Audio toggle */}
            <button
              id="tts-toggle-btn"
              onClick={onToggleVoice}
              title={voiceAutoPlay ? 'Auto-speak interrupts enabled' : 'Auto-speak disabled'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-colors shrink-0 ${
                voiceAutoPlay
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {voiceAutoPlay ? <Volume2 className="w-3.5 h-3.5 text-amber-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{voiceAutoPlay ? 'Voice: On' : 'Voice: Muted'}</span>
            </button>

            {/* Judges Demo Script Launcher Button */}
            <button
              id="demo-script-btn"
              onClick={onRunDemoScript}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md hover:shadow-lg transition-all shrink-0 whitespace-nowrap active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              <span>Judge Demo Script</span>
            </button>

            {/* Reset Memory */}
            <button
              id="reset-memory-btn"
              onClick={onResetSeed}
              title="Reset to initial Judge demo precedents"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Hackathon Docs & Architecture Overview */}
            <button
              id="doc-overview-btn"
              onClick={onOpenDocOverview}
              title="Architecture & Hackathon Brief Details"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors shrink-0"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
