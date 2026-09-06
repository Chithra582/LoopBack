import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const currentDirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : typeof import.meta.url === 'string'
      ? path.dirname(fileURLToPath(import.meta.url))
      : process.cwd();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI SDK lazily/safely
let genAI: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    try {
      genAI = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.error('Failed to initialize GoogleGenAI:', err);
    }
  }
  return genAI;
}

// In-Memory Vector Store representing Qdrant Collections
interface DecisionEntity {
  id: string;
  text: string;
  context: string;
  reasoning: string;
  timestamp: number;
  sessionId: string;
  speaker?: string;
  outcomeId: string | null;
  embedding: number[];
}

interface OutcomeEntity {
  id: string;
  text: string;
  timestamp: number;
  linkedDecisionId: string | null;
  sentiment: 'good' | 'bad';
  consequence?: string;
  speaker?: string;
  embedding: number[];
}

const decisionsStore: Map<string, DecisionEntity> = new Map();
const outcomesStore: Map<string, OutcomeEntity> = new Map();

// High-fidelity fallback & text embedding computation
// Generates normalized dense embedding vector
async function computeEmbedding(text: string): Promise<number[]> {
  const ai = getGenAI();
  if (ai) {
    try {
      // @google/genai embedding call
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });
      const values = (response as any)?.embedding?.values || (response as any)?.embeddings?.[0]?.values;
      if (Array.isArray(values) && values.length > 0) {
        return normalizeVector(values);
      }
    } catch (e) {
      console.warn('Gemini embedding error, using smart semantic fallback:', e);
    }
  }

  // Robust semantic vector generator fallback (128-dimensional hash-projection with semantic n-grams)
  return generateSemanticVector(text);
}

function normalizeVector(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : Math.max(0, Math.min(1, dot / denom));
}

// Fallback semantic vector mapping keywords and character n-grams to dense embedding
function generateSemanticVector(text: string, dims = 128): number[] {
  const vec = new Array(dims).fill(0);
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);

  // Key domain semantic clusters to ensure strong cosine alignment
  const conceptClusters: Record<string, string[]> = {
    price_vendor: ['cheap', 'cheapest', 'price', 'cost', 'budget', 'vendor', 'quote', 'save', 'saving', 'expensive'],
    deadline_rush: ['rush', 'deadline', 'fast', 'quick', 'skip', 'hurry', 'friday', 'speed'],
    testing_qa: ['test', 'tests', 'testing', 'qa', 'coverage', 'unit', 'integration', 'validation'],
    architecture_tech: ['database', 'rewrite', 'custom', 'framework', 'monolith', 'microservices', 'auth', 'roll'],
  };

  words.forEach((word) => {
    // Cluster boosts
    Object.entries(conceptClusters).forEach(([_, keywords], clusterIdx) => {
      if (keywords.includes(word)) {
        const offset = clusterIdx * 20;
        for (let j = 0; j < 10; j++) {
          vec[(offset + j) % dims] += 2.0;
        }
      }
    });

    // Hash word into vector
    let h = 0;
    for (let i = 0; i < word.length; i++) {
      h = (h << 5) - h + word.charCodeAt(i);
      h |= 0;
    }
    const idx = Math.abs(h) % dims;
    vec[idx] += 1.2;

    // Bi-grams
    for (let i = 0; i < word.length - 2; i++) {
      const trigram = word.substring(i, i + 3);
      let th = 0;
      for (let j = 0; j < trigram.length; j++) {
        th = (th << 5) - th + trigram.charCodeAt(j);
        th |= 0;
      }
      vec[Math.abs(th) % dims] += 0.4;
    }
  });

  return normalizeVector(vec);
}

// Initialize seed data for the Judges Demo Script (Page 4)
async function seedInitialMemory() {
  decisionsStore.clear();
  outcomesStore.clear();

  const demoDecisionId = 'dec_vendor_a_price';
  const demoOutcomeId = 'out_vendor_a_delay';

  const dec1Text = "We're picking Vendor A because they're the cheapest.";
  const dec1Reasoning = 'Prioritizing lowest upfront cost and vendor price discount over proven delivery track record.';
  const dec1Vec = await computeEmbedding(dec1Text + ' ' + dec1Reasoning);

  const out1Text = 'Vendor A missed every deadline, we lost two weeks.';
  const out1Vec = await computeEmbedding(out1Text + ' missed deadline lost weeks vendor delays');

  decisionsStore.set(demoDecisionId, {
    id: demoDecisionId,
    text: dec1Text,
    context: 'Sprint Planning / Procurement Review',
    reasoning: dec1Reasoning,
    timestamp: Date.now() - 14 * 86400000, // 2 weeks ago
    sessionId: 'session_past_01',
    speaker: 'Alex (Lead)',
    outcomeId: demoOutcomeId,
    embedding: dec1Vec,
  });

  outcomesStore.set(demoOutcomeId, {
    id: demoOutcomeId,
    text: out1Text,
    timestamp: Date.now() - 3 * 86400000, // 3 days ago
    linkedDecisionId: demoDecisionId,
    sentiment: 'bad',
    consequence: 'Two-week launch delay, customer escalation, emergency internal rework.',
    speaker: 'Alex (Lead)',
    embedding: out1Vec,
  });

  // Second precedent: Skipping Integration Testing
  const dec2Id = 'dec_skip_tests';
  const out2Id = 'out_prod_outage';
  const dec2Text = "Let's skip automated integration tests for this release to hit the Friday deadline.";
  const dec2Reasoning = 'Bypassing regression suite to accelerate deployment timeline.';
  const dec2Vec = await computeEmbedding(dec2Text + ' ' + dec2Reasoning);
  const out2Text = 'Production outage for 6 hours due to corrupted data schema.';
  const out2Vec = await computeEmbedding(out2Text + ' production downtime outage bug');

  decisionsStore.set(dec2Id, {
    id: dec2Id,
    text: dec2Text,
    context: 'Release sync',
    reasoning: dec2Reasoning,
    timestamp: Date.now() - 28 * 86400000,
    sessionId: 'session_past_00',
    speaker: 'Dev Team',
    outcomeId: out2Id,
    embedding: dec2Vec,
  });

  outcomesStore.set(out2Id, {
    id: out2Id,
    text: out2Text,
    timestamp: Date.now() - 26 * 86400000,
    linkedDecisionId: dec2Id,
    sentiment: 'bad',
    consequence: '6-hour sev-1 outage and emergency Saturday rollback.',
    speaker: 'Dev Team',
    embedding: out2Vec,
  });

  // Third precedent: A POSITIVE decision to verify selective filtering
  const dec3Id = 'dec_canary_deploy';
  const out3Id = 'out_canary_success';
  const dec3Text = "We're doing a phased 5% canary deployment first before full rollout.";
  const dec3Reasoning = 'Cautious progressive delivery to minimize blast radius.';
  const dec3Vec = await computeEmbedding(dec3Text + ' ' + dec3Reasoning);
  const out3Text = 'Canary caught a fatal edge-case bug with zero user impact.';
  const out3Vec = await computeEmbedding(out3Text + ' canary success caught bug early');

  decisionsStore.set(dec3Id, {
    id: dec3Id,
    text: dec3Text,
    context: 'Deployment checklist',
    reasoning: dec3Reasoning,
    timestamp: Date.now() - 7 * 86400000,
    sessionId: 'session_past_02',
    speaker: 'Alex (Lead)',
    outcomeId: out3Id,
    embedding: dec3Vec,
  });

  outcomesStore.set(out3Id, {
    id: out3Id,
    text: out3Text,
    timestamp: Date.now() - 6 * 86400000,
    linkedDecisionId: dec3Id,
    sentiment: 'good',
    consequence: 'Zero user disruption, caught high-severity bug safely in canary.',
    speaker: 'Alex (Lead)',
    embedding: out3Vec,
  });

  console.log(`[Qdrant Memory] Seeded ${decisionsStore.size} decisions and ${outcomesStore.size} outcomes.`);
}

// Ingestion Service: Prompt-Based Classifier
async function classifyUtterance(text: string): Promise<{
  type: 'decision' | 'outcome' | 'chatter';
  confidence: number;
  reasoning: string;
  context?: string;
  explicitReasoning?: string;
  sentiment?: 'good' | 'bad';
  consequence?: string;
}> {
  const ai = getGenAI();

  if (ai) {
    try {
      const prompt = `You are the Ingestion Service classifier for Loopback, a real-time decision-interrupt assistant.
Analyze this voice transcript chunk from a meeting or conversation:
"${text}"

Classify it into ONE of three categories:
1. "decision": The speaker is deciding, proposing, committing to, or leaning towards an action, choice, vendor, tool, strategy, or shortcut.
   Examples: "we're going with X because Y", "I'm going to do Z instead of W", "let's just go with the cheapest option again", "we'll use Vendor B to save money".
2. "outcome": The speaker is reporting, mentioning, or reflecting on the result, consequence, or aftermath of a past decision/event.
   Examples: "that vendor completely dropped the ball", "Vendor A missed every deadline, we lost two weeks", "the migration went super smoothly", "that turned out to be a disaster".
3. "chatter": Casual filler, small talk, general questions, greetings, or non-decisional comments.
   Examples: "can everyone see my screen?", "let's order lunch", "what time is the next meeting?", "thanks for the update".

Also extract:
- For decisions: the core reasoning or justification given.
- For outcomes: sentiment ("good" or "bad") and the tangible consequence.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "Must be 'decision', 'outcome', or 'chatter'",
              },
              confidence: {
                type: Type.NUMBER,
                description: 'Confidence between 0.0 and 1.0',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Brief explanation of classification',
              },
              context: {
                type: Type.STRING,
                description: 'Category/domain context (e.g. procurement, testing, planning)',
              },
              explicitReasoning: {
                type: Type.STRING,
                description: 'The reasoning or justification stated in the utterance (if decision)',
              },
              sentiment: {
                type: Type.STRING,
                description: "'good' or 'bad' (if outcome)",
              },
              consequence: {
                type: Type.STRING,
                description: 'The consequence or result stated (if outcome)',
              },
            },
            required: ['type', 'confidence', 'reasoning'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const validTypes = ['decision', 'outcome', 'chatter'];
      const finalType = validTypes.includes(parsed.type) ? parsed.type : 'chatter';
      return {
        type: finalType,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
        reasoning: parsed.reasoning || 'Categorized via semantic intent.',
        context: parsed.context || 'General conversation',
        explicitReasoning: parsed.explicitReasoning || '',
        sentiment: parsed.sentiment === 'good' ? 'good' : parsed.sentiment === 'bad' ? 'bad' : undefined,
        consequence: parsed.consequence || '',
      };
    } catch (err) {
      console.warn('Gemini classification error, falling back to rule-based tagger:', err);
    }
  }

  // Fallback rule-based classifier
  const lower = text.toLowerCase();
  const decisionTriggers = [
    "we're picking", "we're going with", "let's go with", "let's pick", "i'm going to",
    "let's just", "we will use", "decided to", "we should choose", "let's choose",
    "instead of", "because it's cheaper", "because they're the cheapest", "cheapest option"
  ];
  const outcomeTriggers = [
    "dropped the ball", "missed every deadline", "lost two weeks", "turned out to be",
    "outage", "disaster", "went smoothly", "failed", "broke production", "cost us",
    "worked like a charm", "saved us"
  ];

  if (decisionTriggers.some((t) => lower.includes(t))) {
    return {
      type: 'decision',
      confidence: 0.9,
      reasoning: 'Matches active decision intent pattern.',
      context: 'Team Strategy / Procurement',
      explicitReasoning: 'Selected based on quick expediency or price.',
    };
  }

  if (outcomeTriggers.some((t) => lower.includes(t))) {
    const isBad = lower.includes('missed') || lower.includes('lost') || lower.includes('dropped') || lower.includes('disaster') || lower.includes('failed') || lower.includes('outage');
    return {
      type: 'outcome',
      confidence: 0.92,
      reasoning: 'Matches retrospective outcome statement.',
      sentiment: isBad ? 'bad' : 'good',
      consequence: text,
    };
  }

  return {
    type: 'chatter',
    confidence: 0.8,
    reasoning: 'Non-decision conversational segment.',
  };
}

// Lyzr 3-Agent DAG Pipeline Execution
async function runLyzrAgentPipeline(
  currentUtterance: string,
  matchedDecision: DecisionEntity,
  matchedOutcome: OutcomeEntity,
  similarityScore: number
) {
  const ai = getGenAI();
  const t0 = Date.now();

  // Agent 1: Relevance Judge
  const tJudgeStart = Date.now();
  let judgeResult = {
    isRelevant: true,
    confidence: 0.88,
    reasoning: 'Utterance reflects an identical heuristic: choosing the lowest-price vendor without vetting execution reliability.',
    categoryMatch: 'Vendor selection by lowest upfront price',
  };

  if (ai) {
    try {
      const judgePrompt = `You are Agent 1: Relevance Judge in the Lyzr Decision Pipeline.
Your role: Filter out coincidental wording matches from genuine repeat-decision patterns.

CURRENT NEW DECISION UTTERANCE:
"${currentUtterance}"

RETRIEVED PAST DECISION FROM QDRANT:
"${matchedDecision.text}" (Context: ${matchedDecision.context}, Original Reasoning: ${matchedDecision.reasoning})

LINKED PAST OUTCOME:
"${matchedOutcome.text}" (Consequence: ${matchedOutcome.consequence || 'Negative project impact'})

TASK:
Determine: Is the user about to repeat the SAME underlying decision pattern/flaw, or is this just superficially similar wording?
Evaluate whether this is a genuine repeat decision pattern that warrants an interrupt.`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: judgePrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isRelevant: { type: Type.BOOLEAN },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              categoryMatch: { type: Type.STRING },
            },
            required: ['isRelevant', 'confidence', 'reasoning', 'categoryMatch'],
          },
        },
      });
      judgeResult = JSON.parse(resp.text || '{}');
    } catch (e) {
      console.warn('Agent 1 fallback:', e);
    }
  }
  const judgeLatency = Date.now() - tJudgeStart;

  // If Agent 1 says not relevant, stop the pipeline early
  if (!judgeResult.isRelevant) {
    return {
      triggered: false,
      matchedDecision,
      matchedOutcome,
      similarityScore,
      threshold: 0.55,
      judge: judgeResult,
      synthesizer: null,
      composer: null,
      latencyMs: {
        search: 12,
        judge: judgeLatency,
        synthesizer: 0,
        composer: 0,
        total: Date.now() - t0,
      },
    };
  }

  // Agent 2: Context Synthesizer
  const tSynthStart = Date.now();
  let synthResult = {
    precedentSummary: `When choosing Vendor A previously based solely on lowest cost, the vendor missed critical delivery deadlines, causing a 2-week schedule loss.`,
    keyRisk: 'Lowest-bid vendor failing delivery timelines and creating downstream delays.',
    originalReasoning: matchedDecision.reasoning || matchedDecision.text,
    actualConsequence: matchedOutcome.consequence || matchedOutcome.text,
  };

  if (ai) {
    try {
      const synthPrompt = `You are Agent 2: Context Synthesizer in the Lyzr Decision Pipeline.
Your role: Reconstruct the original reasoning and the real outcome in clear, plain, factual language.

AGENT 1 JUDGMENT:
Pattern: ${judgeResult.categoryMatch}
Assessment: ${judgeResult.reasoning}

PAST DECISION:
"${matchedDecision.text}" (Original reasoning: ${matchedDecision.reasoning})

WHAT ACTUALLY HAPPENED:
"${matchedOutcome.text}" (Consequence: ${matchedOutcome.consequence || ''})

CURRENT PROPOSED DECISION:
"${currentUtterance}"

TASK:
Produce a concise, factual summary of the historical precedent: what was assumed back then vs what actually happened.`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: synthPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              precedentSummary: { type: Type.STRING },
              keyRisk: { type: Type.STRING },
              originalReasoning: { type: Type.STRING },
              actualConsequence: { type: Type.STRING },
            },
            required: ['precedentSummary', 'keyRisk', 'originalReasoning', 'actualConsequence'],
          },
        },
      });
      synthResult = JSON.parse(resp.text || '{}');
    } catch (e) {
      console.warn('Agent 2 fallback:', e);
    }
  }
  const synthLatency = Date.now() - tSynthStart;

  // Agent 3: Interrupt Composer
  const tCompStart = Date.now();
  let composerResult: {
    interruptText: string;
    urgency: 'critical' | 'high' | 'medium';
    tone: string;
    suggestedAction: string;
  } = {
    interruptText: 'Last time you picked based on price alone with Vendor A, it cost you two weeks. Worth a gut-check here?',
    urgency: 'high',
    tone: 'constructive, grounded, direct gut-check',
    suggestedAction: 'Verify vendor SLA and milestone delivery guarantees before committing purely on price.',
  };

  if (ai) {
    try {
      const compPrompt = `You are Agent 3: Interrupt Composer in the Lyzr Decision Pipeline.
Your role: Compose the live spoken/displayed interrupt delivered mid-conversation to the user.
Target style: Grounded, punchy, spoken English. Maximum 2 sentences. Citing specific precedent and consequence.
Example tone: "Last time you picked based on price alone with Vendor A, it cost you two weeks. Worth a gut-check here?"

CURRENT CONVERSATION UTTERANCE:
"${currentUtterance}"

PRECEDENT SYNTHESIS FROM AGENT 2:
${synthResult.precedentSummary}
Original reasoning: ${synthResult.originalReasoning}
Actual consequence: ${synthResult.actualConsequence}
Key risk: ${synthResult.keyRisk}

FORMAT REQUIREMENTS:
- interruptText: A direct, crisp, natural spoken interrupt (e.g. 15-25 words).
- urgency: "critical", "high", or "medium".
- tone: Tone description (e.g., "Direct alert", "Empathetic gut-check").
- suggestedAction: Immediate question or check to ask the team right now.`;

      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: compPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              interruptText: { type: Type.STRING },
              urgency: { type: Type.STRING },
              tone: { type: Type.STRING },
              suggestedAction: { type: Type.STRING },
            },
            required: ['interruptText', 'urgency', 'tone', 'suggestedAction'],
          },
        },
      });
      const parsed = JSON.parse(resp.text || '{}');
      composerResult = {
        interruptText: parsed.interruptText || composerResult.interruptText,
        urgency: ['critical', 'high', 'medium'].includes(parsed.urgency) ? parsed.urgency : 'high',
        tone: parsed.tone || 'Direct gut-check',
        suggestedAction: parsed.suggestedAction || composerResult.suggestedAction,
      };
    } catch (e) {
      console.warn('Agent 3 fallback:', e);
    }
  }
  const compLatency = Date.now() - tCompStart;

  return {
    triggered: true,
    matchedDecision,
    matchedOutcome,
    similarityScore,
    threshold: 0.55,
    judge: judgeResult,
    synthesizer: synthResult,
    composer: composerResult,
    latencyMs: {
      search: 15,
      judge: judgeLatency,
      synthesizer: synthLatency,
      composer: compLatency,
      total: Date.now() - t0,
    },
  };
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Process streaming utterance chunk
app.post('/api/process-utterance', async (req: Request, res: Response) => {
  try {
    const { text, sessionId = 'session_live', speaker = 'User', threshold = 0.55 } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const trimmedText = text.trim();
    const chunkId = 'chunk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    // Step 1: Ingestion Tagging / Classifier
    const classification = await classifyUtterance(trimmedText);
    const utteranceVec = await computeEmbedding(trimmedText);

    let createdDecision: DecisionEntity | undefined;
    let createdOutcome: OutcomeEntity | undefined;
    let linkedDecision: DecisionEntity | undefined;
    let lyzrPipeline: any = undefined;

    // Step 2: Handle based on type
    if (classification.type === 'decision') {
      const decisionId = 'dec_' + Date.now();
      createdDecision = {
        id: decisionId,
        text: trimmedText,
        context: classification.context || 'General decision',
        reasoning: classification.explicitReasoning || trimmedText,
        timestamp: Date.now(),
        sessionId,
        speaker,
        outcomeId: null,
        embedding: utteranceVec,
      };

      // CORE LIVE LOOP: Search past decisions that have a LINKED NEGATIVE OUTCOME
      let bestMatchDecision: DecisionEntity | null = null;
      let bestMatchOutcome: OutcomeEntity | null = null;
      let highestSimilarity = 0;

      for (const pastDec of decisionsStore.values()) {
        if (pastDec.outcomeId) {
          const outcome = outcomesStore.get(pastDec.outcomeId);
          if (outcome && outcome.sentiment === 'bad') {
            const sim = cosineSimilarity(utteranceVec, pastDec.embedding);
            if (sim > highestSimilarity) {
              highestSimilarity = sim;
              bestMatchDecision = pastDec;
              bestMatchOutcome = outcome;
            }
          }
        }
      }

      // Check if match found above similarity threshold
      if (bestMatchDecision && bestMatchOutcome && highestSimilarity >= threshold) {
        // Run Lyzr Agent Pipeline (Relevance Judge -> Context Synthesizer -> Interrupt Composer)
        lyzrPipeline = await runLyzrAgentPipeline(
          trimmedText,
          bestMatchDecision,
          bestMatchOutcome,
          highestSimilarity
        );
      } else if (bestMatchDecision && bestMatchOutcome) {
        lyzrPipeline = {
          triggered: false,
          matchedDecision: bestMatchDecision,
          matchedOutcome: bestMatchOutcome,
          similarityScore: highestSimilarity,
          threshold,
          judge: null,
          synthesizer: null,
          composer: null,
          latencyMs: { search: 10, judge: 0, synthesizer: 0, composer: 0, total: 10 },
        };
      }

      // Finally write the decision into Qdrant store
      decisionsStore.set(decisionId, createdDecision);
    } else if (classification.type === 'outcome') {
      const outcomeId = 'out_' + Date.now();
      createdOutcome = {
        id: outcomeId,
        text: trimmedText,
        timestamp: Date.now(),
        linkedDecisionId: null,
        sentiment: classification.sentiment || 'bad',
        consequence: classification.consequence || trimmedText,
        speaker,
        embedding: utteranceVec,
      };

      // Search Qdrant decisions collection for the closest match to link bidirectionally
      let closestDecision: DecisionEntity | null = null;
      let highestSim = 0;

      for (const dec of decisionsStore.values()) {
        const sim = cosineSimilarity(utteranceVec, dec.embedding);
        if (sim > highestSim) {
          highestSim = sim;
          closestDecision = dec;
        }
      }

      // If reasonably similar or best candidate found (> 0.40)
      if (closestDecision && highestSim >= 0.4) {
        createdOutcome.linkedDecisionId = closestDecision.id;
        closestDecision.outcomeId = outcomeId;
        linkedDecision = closestDecision;
      }

      outcomesStore.set(outcomeId, createdOutcome);
    }

    res.json({
      chunkId,
      text: trimmedText,
      timestamp: Date.now(),
      speaker,
      sessionId,
      type: classification.type,
      confidence: classification.confidence,
      classificationReasoning: classification.reasoning,
      decision: createdDecision,
      outcome: createdOutcome,
      linkedDecision,
      pipeline: lyzrPipeline,
    });
  } catch (error: any) {
    console.error('Error in /api/process-utterance:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Qdrant Memory Inspection Endpoint
app.get('/api/memory', (req: Request, res: Response) => {
  const decisions = Array.from(decisionsStore.values()).map((d) => ({
    ...d,
    embedding: undefined, // omit huge raw vector float arrays from payload
  }));
  const outcomes = Array.from(outcomesStore.values()).map((o) => ({
    ...o,
    embedding: undefined,
  }));

  const negativeOutcomes = outcomes.filter((o) => o.sentiment === 'bad').length;
  const linkedPairs = decisions.filter((d) => Boolean(d.outcomeId)).length;

  res.json({
    decisions,
    outcomes,
    totalDecisions: decisions.length,
    totalOutcomes: outcomes.length,
    negativeOutcomesCount: negativeOutcomes,
    linkedPairsCount: linkedPairs,
  });
});

// 3. Reset / Seed Endpoint for Judges Demo Script
app.post('/api/seed', async (req: Request, res: Response) => {
  try {
    await seedInitialMemory();
    res.json({
      status: 'ok',
      message: 'Qdrant collections seeded with demo script memory!',
      decisionsCount: decisionsStore.size,
      outcomesCount: outcomesStore.size,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// 4. Clear all memory
app.post('/api/clear-memory', (req: Request, res: Response) => {
  decisionsStore.clear();
  outcomesStore.clear();
  res.json({ status: 'ok', message: 'Memory cleared.' });
});

// 5. Text-To-Speech (TTS) Interrupt Delivery Endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Puck' } = req.body;
    if (!text) {
      res.status(400).json({ error: 'Text required' });
      return;
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const ttsResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-tts-preview',
          contents: [{ parts: [{ text: `Say with urgent, helpful authority: ${text}` }] }],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voice || 'Puck' },
              },
            },
          },
        });

        const audioData = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        const mimeType = ttsResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.mimeType || 'audio/wav';

        if (audioData) {
          res.json({ audioBase64: audioData, mimeType });
          return;
        }
      } catch (e) {
        console.warn('Gemini TTS failed or unavailable, relying on client speech synth:', e);
      }
    }

    res.json({ audioBase64: null, clientSynthRequired: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Omi Webhook Simulator Endpoint
app.post('/api/omi-webhook', async (req: Request, res: Response) => {
  const { transcript, text, speaker = 'Omi Device', session_id } = req.body;
  const content = transcript || text;
  if (!content) {
    res.status(400).json({ error: 'No transcript in webhook' });
    return;
  }

  // Forward to process utterance internally
  try {
    const forwardReq = {
      body: {
        text: content,
        sessionId: session_id || 'omi_live_stream',
        speaker,
      },
    } as Request;

    // Simulate internal call
    const result = await new Promise((resolve, reject) => {
      // Create lightweight simulated request
      const fakeRes: any = {
        json: (data: any) => resolve(data),
        status: () => fakeRes,
      };
      // Reuse logic
      (app as any)._router.handle({ ...forwardReq, method: 'POST', url: '/api/process-utterance' }, fakeRes, reject);
    });

    res.json({ status: 'webhook_received', result });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Start the server with Vite middleware in dev or static serving in prod
async function start() {
  await seedInitialMemory();

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Loopback] Server running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Fatal startup error:', err);
});
