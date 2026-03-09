export type OperationMode = "casual" | "evidence" | "conceptual" | "coaching";
export type ThinkingStepName = "recall" | "verify" | "resolve" | "reason" | "update";
export type ThinkingStepStatus = "running" | "complete" | "skipped";

export interface ThinkingStep {
  step: ThinkingStepName;
  status: ThinkingStepStatus;
  summary: string;
  details: Record<string, unknown>;
  duration_ms: number;
}

export interface ThinkingProcess {
  steps: ThinkingStep[];
  selected_mode: OperationMode;
  mode_reason: string;
  total_duration_ms: number;
}

export interface Source {
  book_id: string;
  book_title?: string;
  chapter: string;
  page: string;
  snippet: string;
}

export interface StoredReaction {
  type: "reaction" | "bookmark" | "critique";
  emotion: EmotionType;
  intensity: number;
  subject: string;
}

export interface Citation {
  id: number;
  book: string;
  chapter: string;
  page: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  thinking?: ThinkingProcess;
  sources?: Source[];
  citations?: Citation[];
  reactions_stored?: StoredReaction[];
  timestamp: Date;
  isGrouped?: boolean;
}

export interface BookInfo {
  book_id: string;
  title: string;
  author: string;
  total_chunks: number;
  domain: string;
  ingested_at: string | null;
}

export interface BookModelCard {
  book_id: string;
  title: string;
  author: string;
  core_thesis: string;
  key_principles: string[];
  author_bias: string;
  worldview: string;
  key_metaphors: string[];
  strategic_patterns: string[];
  domain: string;
}

export interface GraphNode {
  id: string;
  label: string;
  node_type: string;
  book_ids: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  chunk_ids: string[];
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// ── Emotion types ──

export type EmotionType =
  | "surprise"
  | "joy"
  | "sadness"
  | "anger"
  | "fear"
  | "admiration"
  | "disgust"
  | "curiosity"
  | "empathy"
  | "skepticism";

export const EMOTION_LABELS: Record<EmotionType, string> = {
  surprise: "Surprise",
  joy: "Joy",
  sadness: "Sadness",
  anger: "Anger",
  fear: "Fear",
  admiration: "Admiration",
  disgust: "Disgust",
  curiosity: "Curiosity",
  empathy: "Empathy",
  skepticism: "Skepticism",
};

export const EMOTION_EMOJI: Record<EmotionType, string> = {
  surprise: "😲",
  joy: "😊",
  sadness: "😢",
  anger: "😠",
  fear: "😨",
  admiration: "🤩",
  disgust: "😤",
  curiosity: "🤔",
  empathy: "🥺",
  skepticism: "🧐",
};

// ── Unit / Relation type ontology ──

export type UnitType =
  | "Event"
  | "Claim"
  | "Definition"
  | "Fact"
  | "Principle"
  | "Procedure"
  | "Example"
  | "Concept"
  | "Character"
  | "Setting";

export type RelationType =
  | "precedes"
  | "causes"
  | "supports"
  | "contrasts"
  | "defines"
  | "example_of"
  | "part_of"
  | "elaborates"
  | "implies"
  | "symbolizes"
  | "frames"
  | "parallels"
  | "recalls";

export const UNIT_TYPE_LABELS: Record<UnitType, string> = {
  Event: "Event",
  Claim: "Claim",
  Definition: "Definition",
  Fact: "Fact",
  Principle: "Principle",
  Procedure: "Procedure",
  Example: "Example",
  Concept: "Concept",
  Character: "Character",
  Setting: "Setting",
};

export const RELATION_TYPE_LABELS: Record<RelationType, string> = {
  precedes: "Precedes",
  causes: "Causes",
  supports: "Supports",
  contrasts: "Contrasts",
  defines: "Defines",
  example_of: "Example of",
  part_of: "Part of",
  elaborates: "Elaborates",
  implies: "Implies",
  symbolizes: "Symbolizes",
  frames: "Frames",
  parallels: "Parallels",
  recalls: "Recalls",
};

// ── Upload stages ──

export type UploadStage =
  | "parsing"
  | "chunking"
  | "coreference"
  | "embedding"
  | "unit_extraction"
  | "graph_building"
  | "model_card"
  | "complete"
  | "error";

export interface UploadProgress {
  stage: UploadStage;
  status: string;
  current: number;
  total: number;
  elapsed_ms: number;
  avg_ms_per_item: number;
  estimated_remaining_ms: number;
  pipeline_elapsed_ms: number;
  detail?: string;
  message?: string;
  book_id?: string;
  title?: string;
  author?: string;
  total_chunks?: number;
}

export interface UploadingBook {
  tempId: string;
  filename: string;
  progress: UploadProgress | null;
}

export const UPLOAD_STAGE_LABELS: Record<UploadStage, string> = {
  parsing: "Parsing document",
  chunking: "Splitting into chunks",
  coreference: "Resolving coreferences",
  embedding: "Embedding chunks",
  unit_extraction: "Extracting units (6-Pass)",
  graph_building: "Building knowledge graph",
  model_card: "Generating model card",
  complete: "Complete",
  error: "Error",
};

export const UPLOAD_STAGES: UploadStage[] = [
  "parsing",
  "chunking",
  "coreference",
  "embedding",
  "unit_extraction",
  "graph_building",
  "model_card",
];

export const STEP_LABELS: Record<ThinkingStepName, string> = {
  recall: "Recall",
  verify: "Verify",
  resolve: "Resolve",
  reason: "Reason",
  update: "Update",
};

export const STEP_DESCRIPTIONS: Record<ThinkingStepName, string> = {
  recall: "Query decomposition + parallel graph/vector search",
  verify: "Structure post-processing & parent expansion",
  resolve: "2-Lane RRF merge",
  reason: "LLM synthesis reasoning",
  update: "Emotion detection + reflection journal update",
};

export const MODE_LABELS: Record<OperationMode, string> = {
  casual: "Casual",
  evidence: "Evidence Mode",
  conceptual: "Conceptual Mode",
  coaching: "Coaching Mode",
};
