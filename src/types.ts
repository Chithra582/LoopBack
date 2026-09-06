export type UtteranceType = 'decision' | 'outcome' | 'chatter';
export type OutcomeSentiment = 'good' | 'bad';

export interface DecisionRecord {
  id: string;
  text: string;
  context: string;
  reasoning: string;
  timestamp: number;
  sessionId: string;
  speaker?: string;
  outcomeId: string | null;
  embedding?: number[];
}

export interface OutcomeRecord {
  id: string;
  text: string;
  timestamp: number;
  linkedDecisionId: string | null;
  sentiment: OutcomeSentiment;
  consequence?: string;
  speaker?: string;
  embedding?: number[];
}

export interface AgentJudgeResult {
  isRelevant: boolean;
  confidence: number;
  reasoning: string;
  categoryMatch: string;
}

export interface AgentSynthesizerResult {
  precedentSummary: string;
  keyRisk: string;
  originalReasoning: string;
  actualConsequence: string;
}

export interface AgentComposerResult {
  interruptText: string;
  urgency: 'critical' | 'high' | 'medium';
  tone: string;
  suggestedAction: string;
}

export interface LyzrPipelineResult {
  triggered: boolean;
  matchedDecision: DecisionRecord | null;
  matchedOutcome: OutcomeRecord | null;
  similarityScore: number;
  threshold: number;
  judge: AgentJudgeResult | null;
  synthesizer: AgentSynthesizerResult | null;
  composer: AgentComposerResult | null;
  latencyMs: {
    search: number;
    judge: number;
    synthesizer: number;
    composer: number;
    total: number;
  };
}

export interface ProcessedUtteranceResult {
  chunkId: string;
  text: string;
  timestamp: number;
  speaker: string;
  sessionId: string;
  type: UtteranceType;
  confidence: number;
  classificationReasoning: string;
  decision?: DecisionRecord;
  outcome?: OutcomeRecord;
  linkedDecision?: DecisionRecord;
  pipeline?: LyzrPipelineResult;
  isSimulated?: boolean;
}

export interface MemoryCollections {
  decisions: DecisionRecord[];
  outcomes: OutcomeRecord[];
  totalDecisions: number;
  totalOutcomes: number;
  negativeOutcomesCount: number;
  linkedPairsCount: number;
}
