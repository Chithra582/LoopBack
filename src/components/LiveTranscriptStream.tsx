import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, MessageSquare, Tag, Terminal, ArrowDownCircle, Check, Loader2 } from 'lucide-react';
import { ProcessedUtteranceResult } from '../types';

interface LiveTranscriptStreamProps {
  streamLog: ProcessedUtteranceResult[];
  isProcessing: boolean;
  onSendUtterance: (text: string, speaker?: string) => Promise<void>;
  isListening: boolean;
  onToggleListening: () => void;
  onSelectPreset: (text: string, speaker?: string) => void;
}

export const LiveTranscriptStream: React.FC<LiveTranscriptStreamProps> = ({
  streamLog,
  isProcessing,
  onSendUtterance,
  isListening,
  onToggleListening,
  onSelectPreset,
}) => {
  const [inputText, setInputText] = useState('');
  const [speaker, setSpeaker] = useState('Alex (Lead)');
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [streamLog, isProcessing]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    const text = inputText;
    setInputText('');
    await onSendUtterance(text, speaker);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'decision':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Decision
          </span>
        );
      case 'outcome':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Outcome
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
            Chatter
          </span>
        );
    }
  };

  return (
    <div id="live-stream-panel" className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Omi Transcript Stream
              {isListening && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse">
                  MIC LIVE
                </span>
              )}
            </h3>
            <p className="text-[11px] text-slate-400">FastAPI Ingestion Classifier tagging incoming chunks</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="toggle-mic-btn"
            onClick={onToggleListening}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              isListening
                ? 'bg-red-500/20 text-red-300 border-red-500/50 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {isListening ? <MicOff className="w-3.5 h-3.5 text-red-400" /> : <Mic className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isListening ? 'Stop Mic' : 'Start Mic'}</span>
          </button>

          <button
            id="webhook-info-btn"
            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200"
            title="View Omi Webhook Integration"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Webhook Guide Accordion */}
      {showWebhookGuide && (
        <div className="p-3 bg-slate-950 border-b border-slate-800 text-xs font-mono text-slate-300 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-1 text-slate-400 font-sans font-semibold text-[11px]">
            <span>Live Omi Webhook Endpoint</span>
            <span className="text-amber-400">POST /api/omi-webhook</span>
          </div>
          <pre className="bg-slate-900 p-2 rounded border border-slate-800 text-[11px] overflow-x-auto text-emerald-400">
{`curl -X POST /api/omi-webhook \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "For this new project, let's just go with the cheapest option again.", "speaker": "Alex"}'`}
          </pre>
        </div>
      )}

      {/* Quick Test Presets */}
      <div className="px-4 py-2.5 bg-slate-950/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar">
        <span className="text-[11px] font-semibold text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Quick Speak:
        </span>
        <button
          id="preset-repeat-decision-btn"
          onClick={() => onSelectPreset("For this new project, let's just go with the cheapest option again.", "Alex (Lead)")}
          className="shrink-0 px-2.5 py-1 rounded-md bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-colors"
        >
          ⚡ Judge Test: Repeat Cheap Decision
        </button>
        <button
          id="preset-outcome-btn"
          onClick={() => onSelectPreset("Vendor A missed every deadline, we lost two weeks.", "Alex (Lead)")}
          className="shrink-0 px-2.5 py-1 rounded-md bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-[11px] font-medium transition-colors"
        >
          🚨 Report Negative Outcome
        </button>
        <button
          id="preset-chatter-btn"
          onClick={() => onSelectPreset("Hey everyone, let's review today's standup agenda and order lunch.", "Sarah")}
          className="shrink-0 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] transition-colors"
        >
          💬 Neutral Chatter
        </button>
      </div>

      {/* Stream Timeline */}
      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3">
        {streamLog.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <MessageSquare className="w-10 h-10 mb-2 stroke-[1.5] text-slate-600" />
            <p className="text-sm font-medium text-slate-400">Waiting for live transcript segments...</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Speak into your microphone or pick a preset above to test the ingestion classification loop.
            </p>
          </div>
        ) : (
          streamLog.map((chunk, index) => (
            <div
              key={chunk.chunkId || index}
              className={`p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-1.5 ${
                chunk.type === 'decision'
                  ? 'bg-amber-950/20 border-amber-500/30'
                  : chunk.type === 'outcome'
                  ? 'bg-purple-950/20 border-purple-500/30'
                  : 'bg-slate-800/40 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-300 text-[11px]">{chunk.speaker}</span>
                  <span className="text-slate-500 text-[10px]">
                    {new Date(chunk.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {getTypeBadge(chunk.type)}
                  <span className="text-[10px] font-mono text-slate-400">
                    {(chunk.confidence * 100).toFixed(0)}% conf
                  </span>
                </div>
              </div>

              <p className="text-slate-100 text-sm font-medium leading-relaxed">
                "{chunk.text}"
              </p>

              {/* Tagging / Classification Note */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                <span className="italic">Tag rationale: {chunk.classificationReasoning}</span>
                {chunk.pipeline?.triggered && (
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40 text-[10px]">
                    🚨 INTERRUPT TRIGGERED
                  </span>
                )}
                {chunk.linkedDecision && (
                  <span className="ml-auto px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 text-[10px]">
                    🔗 LINKED TO DECISION
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {isProcessing && (
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-2.5 text-xs text-amber-300 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
            <span>Ingestion Service classifying chunk & querying Qdrant memory...</span>
          </div>
        )}
      </div>

      {/* Manual Input Footer */}
      <form onSubmit={handleFormSubmit} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
        <select
          value={speaker}
          onChange={(e) => setSpeaker(e.target.value)}
          className="bg-slate-800 text-slate-300 border border-slate-700 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-amber-500 shrink-0"
        >
          <option value="Alex (Lead)">Alex (Lead)</option>
          <option value="Dev Team">Dev Team</option>
          <option value="Sarah (PM)">Sarah (PM)</option>
          <option value="User">User</option>
        </select>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type a live decision, outcome, or chatter..."
          disabled={isProcessing}
          className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="p-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold shrink-0"
          title="Send chunk to Ingestion Service"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
