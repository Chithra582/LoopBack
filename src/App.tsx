import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { InterruptBanner } from './components/InterruptBanner';
import { JudgeDemoStrip } from './components/JudgeDemoStrip';
import { LiveTranscriptStream } from './components/LiveTranscriptStream';
import { LyzrDagVisualizer } from './components/LyzrDagVisualizer';
import { QdrantMemoryExplorer } from './components/QdrantMemoryExplorer';
import { DemoScriptModal } from './components/DemoScriptModal';
import { TransparencyModal } from './components/TransparencyModal';
import { OverviewModal } from './components/OverviewModal';
import { DecisionRecord, OutcomeRecord, ProcessedUtteranceResult, LyzrPipelineResult } from './types';
import { playBase64Audio, speakBrowserTTS, stopSpeaking } from './utils/audio';

export default function App() {
  const [streamLog, setStreamLog] = useState<ProcessedUtteranceResult[]>([]);
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [currentInterrupt, setCurrentInterrupt] = useState<LyzrPipelineResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceAutoPlay, setVoiceAutoPlay] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showTransparencyModal, setShowTransparencyModal] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);
  const [isRunningScriptStep, setIsRunningScriptStep] = useState(false);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Fetch memory on mount
  const fetchMemory = useCallback(async () => {
    try {
      const res = await fetch('/api/memory');
      if (res.ok) {
        const data = await res.json();
        setDecisions(data.decisions || []);
        setOutcomes(data.outcomes || []);
      }
    } catch (e) {
      console.error('Failed to fetch memory from Qdrant store:', e);
    }
  }, []);

  useEffect(() => {
    fetchMemory();
  }, [fetchMemory]);

  // Voice output generator
  const triggerVoiceInterrupt = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (data.audioBase64) {
        await playBase64Audio(data.audioBase64, data.mimeType);
      } else {
        await speakBrowserTTS(text);
      }
    } catch (e) {
      console.warn('TTS fetch error, using browser TTS fallback:', e);
      await speakBrowserTTS(text);
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  // Process incoming utterance chunk
  const handleSendUtterance = async (text: string, speaker = 'Alex (Lead)') => {
    if (!text.trim() || isProcessing) return;
    setIsProcessing(true);

    try {
      const res = await fetch('/api/process-utterance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          speaker,
          sessionId: 'session_live_01',
          threshold: 0.52,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to process chunk');
      }

      const result: ProcessedUtteranceResult = await res.json();
      setStreamLog((prev) => [...prev, result]);

      // Check if Lyzr DAG pipeline triggered an interrupt
      if (result.pipeline?.triggered) {
        setCurrentInterrupt(result.pipeline);
        setNotification('🚨 Interrupt Triggered: Precedent found with linked negative outcome!');
        setTimeout(() => setNotification(null), 5000);

        if (voiceAutoPlay && result.pipeline.composer?.interruptText) {
          triggerVoiceInterrupt(result.pipeline.composer.interruptText);
        }
      }

      // Refresh memory to show any new decisions/outcomes/links
      await fetchMemory();
    } catch (err: any) {
      console.error('Error handling utterance:', err);
      setNotification(`Error: ${err.message}`);
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setIsProcessing(false);
    }
  };

  // Browser Speech Recognition for Omi live mic capture
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type or use the quick speak buttons!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setNotification('🎙️ Omi microphone capture active. Speak your decisions out loud.');
        setTimeout(() => setNotification(null), 3500);
      };

      recognition.onresult = (event: any) => {
        const last = event.results.length - 1;
        const transcript = event.results[last][0].transcript.trim();
        if (transcript.length > 2) {
          handleSendUtterance(transcript, 'Alex (Live Mic)');
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Failed to start speech recognition:', e);
      setIsListening(false);
    }
  };

  // Reset to initial Seed Memory (Judge Demo Script)
  const handleResetSeed = async () => {
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        await fetchMemory();
        setCurrentInterrupt(null);
        setNotification('Qdrant memory restored with official demo script precedents.');
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error('Failed to reset seed:', e);
    }
  };

  // Clear memory
  const handleClearMemory = async () => {
    try {
      await fetch('/api/clear-memory', { method: 'POST' });
      await fetchMemory();
      setStreamLog([]);
      setCurrentInterrupt(null);
      setNotification('Qdrant collections cleared.');
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error('Failed to clear memory:', e);
    }
  };

  // Execute Judge Demo Walkthrough Steps
  const handleExecuteScriptStep = async (stepNumber: number) => {
    setIsRunningScriptStep(true);
    try {
      if (stepNumber === 1) {
        // Step 1: Ensure initial memory is seeded
        await handleResetSeed();
      } else if (stepNumber === 2) {
        // Step 2: Stream the repeat decision trap in front of judges
        await handleSendUtterance(
          "For this new project, let's just go with the cheapest option again.",
          'Alex (Lead)'
        );
      }
    } finally {
      setIsRunningScriptStep(false);
    }
  };

  // Add custom precedent
  const handleAddCustomPrecedent = async (
    decisionText: string,
    reasoning: string,
    outcomeText: string,
    sentiment: 'good' | 'bad'
  ) => {
    // 1. Send decision
    await handleSendUtterance(decisionText, 'Historical User');
    // 2. Send outcome to trigger bidirectional linking
    await handleSendUtterance(outcomeText, 'Historical User');
    await fetchMemory();
    setNotification('Custom precedent added and linked in Qdrant memory.');
    setTimeout(() => setNotification(null), 3000);
  };

  const linkedPairsCount = decisions.filter((d) => Boolean(d.outcomeId)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navbar */}
      <Navbar
        isListening={isListening}
        voiceAutoPlay={voiceAutoPlay}
        onToggleVoice={() => {
          if (voiceAutoPlay && isSpeaking) stopSpeaking();
          setVoiceAutoPlay(!voiceAutoPlay);
        }}
        onRunDemoScript={() => setShowDemoModal(true)}
        onResetSeed={handleResetSeed}
        onClearMemory={handleClearMemory}
        onOpenDocOverview={() => setShowOverviewModal(true)}
        linkedPairsCount={linkedPairsCount}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white shadow-2xl animate-in slide-in-from-bottom-3 flex items-center gap-2">
          <span>{notification}</span>
        </div>
      )}

      {/* Main App Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
        {/* Hackathon Judge Demo Evaluation Strip */}
        <JudgeDemoStrip
          onExecuteScriptStep={handleExecuteScriptStep}
          isRunningStep={isRunningScriptStep}
          currentInterrupt={currentInterrupt}
          onOpenWalkthroughModal={() => setShowDemoModal(true)}
          onSpeakAgain={() => {
            if (currentInterrupt?.composer?.interruptText) {
              triggerVoiceInterrupt(currentInterrupt.composer.interruptText);
            }
          }}
          onInspectDag={() => setShowTransparencyModal(true)}
          isSpeaking={isSpeaking}
        />

        {/* Real-time Interrupt Banner (Displays when Agent 3 Composes an Interrupt) */}
        {currentInterrupt && currentInterrupt.triggered && (
          <InterruptBanner
            interrupt={currentInterrupt}
            onDismiss={() => {
              stopSpeaking();
              setCurrentInterrupt(null);
            }}
            onInspectDag={() => setShowTransparencyModal(true)}
            onSpeakAgain={() => {
              if (currentInterrupt.composer?.interruptText) {
                triggerVoiceInterrupt(currentInterrupt.composer.interruptText);
              }
            }}
            isSpeaking={isSpeaking}
          />
        )}

        {/* 2-Column Split: Ingestion Live Stream on Left, Observable Agent DAG on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Omi Live Voice Capture & Streaming Ingestion Service (5 cols) */}
          <div className="lg:col-span-5 h-[580px]">
            <LiveTranscriptStream
              streamLog={streamLog}
              isProcessing={isProcessing}
              onSendUtterance={handleSendUtterance}
              isListening={isListening}
              onToggleListening={toggleListening}
              onSelectPreset={(text, speaker) => handleSendUtterance(text, speaker)}
            />
          </div>

          {/* Right: Lyzr 3-Agent Observable DAG Pipeline Visualizer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <LyzrDagVisualizer
              pipelineResult={currentInterrupt}
              isProcessing={isProcessing}
            />

            {/* Live Pipeline Flow Explanation */}
            <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 text-xs space-y-2 text-slate-400">
              <span className="font-mono text-[10px] uppercase font-bold text-slate-300">
                Core Demo Mechanic (Page 1-2):
              </span>
              <p className="text-[11px] leading-relaxed">
                1. Voice utterance captured via Omi streaming webhook → 2. Ingestion Service tags as decision/outcome → 3. Dense embedding searched in Qdrant for decisions linked to a NEGATIVE outcome → 4. If similarity &gt; 52%, Lyzr 3-Agent DAG runs (Relevance Judge → Context Synthesizer → Interrupt Composer) → 5. Live audio interrupt delivered before mistake is committed.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Qdrant Vector Memory Collections & Decision-Outcome Link Graph */}
        <QdrantMemoryExplorer
          decisions={decisions}
          outcomes={outcomes}
          onAddCustomPrecedent={handleAddCustomPrecedent}
        />
      </main>

      {/* Modals */}
      <DemoScriptModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        onExecuteScriptStep={handleExecuteScriptStep}
        isRunningStep={isRunningScriptStep}
        currentInterrupt={currentInterrupt}
        onInspectDag={() => setShowTransparencyModal(true)}
        onSpeakAgain={() => {
          if (currentInterrupt?.composer?.interruptText) {
            triggerVoiceInterrupt(currentInterrupt.composer.interruptText);
          }
        }}
        isSpeaking={isSpeaking}
      />

      <TransparencyModal
        isOpen={showTransparencyModal}
        onClose={() => setShowTransparencyModal(false)}
        interrupt={currentInterrupt}
      />

      <OverviewModal
        isOpen={showOverviewModal}
        onClose={() => setShowOverviewModal(false)}
      />
    </div>
  );
}
