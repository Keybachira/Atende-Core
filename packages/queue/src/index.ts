// Motor da fila (doc 03 §9). A pontuação é sempre explicável:
// cada fator gera um "reason" { label, points } persistido no QueueItem.
export type PriorityLevel = "CRITICA" | "ALTA" | "NORMAL" | "BAIXA";
export type ManualPriority = PriorityLevel;
export type LeadTemperature = "FRIO" | "MORNO" | "QUENTE";

export interface ScoreInput {
  waitingMinutes: number;
  manual?: ManualPriority;
  temperature?: LeadTemperature;
  slaMinutesTotal?: number;
}

export interface ScoreReason {
  label: string;
  points: number;
}

export interface ScoreResult {
  score: number;
  level: PriorityLevel;
  reasons: ScoreReason[];
}

const MANUAL_POINTS: Record<ManualPriority, number> = {
  BAIXA: 0,
  NORMAL: 5,
  ALTA: 15,
  CRITICA: 30,
};

const TEMPERATURE_POINTS: Record<LeadTemperature, number> = {
  FRIO: 0,
  MORNO: 8,
  QUENTE: 15,
};

export function computeScore(input: ScoreInput): ScoreResult {
  const reasons: ScoreReason[] = [];
  const waitingMinutes = Math.max(0, input.waitingMinutes);

  const waitingPoints = Math.min(30, Math.floor(waitingMinutes / 3));
  if (waitingPoints > 0) {
    reasons.push({ label: `aguardando há ${waitingMinutes}min`, points: waitingPoints });
  }

  const manual = input.manual ?? "NORMAL";
  reasons.push({ label: `prioridade manual ${manual}`, points: MANUAL_POINTS[manual] });

  if (input.temperature) {
    reasons.push({ label: `lead ${input.temperature.toLowerCase()}`, points: TEMPERATURE_POINTS[input.temperature] });
  }

  const slaTotal = input.slaMinutesTotal ?? 60;
  const remaining = slaTotal - waitingMinutes;
  if (remaining <= 0) {
    reasons.push({ label: "SLA estourado", points: 25 });
  } else if (remaining <= 15) {
    reasons.push({ label: "SLA próximo do limite", points: 20 });
  } else if (remaining <= slaTotal / 2) {
    reasons.push({ label: "SLA na metade", points: 10 });
  }

  const score = reasons.reduce((acc, r) => acc + r.points, 0);
  const level: PriorityLevel = score >= 45 ? "CRITICA" : score >= 25 ? "ALTA" : score >= 10 ? "NORMAL" : "BAIXA";
  return { score, level, reasons };
}

export type DistributionStrategy = "ROUND_ROBIN" | "LEAST_ACTIVE" | "MANUAL";

// Round-robin: próximo da lista após o último atribuído.
export function pickRoundRobin(agentIds: string[], lastAssignedId?: string): string | null {
  if (agentIds.length === 0) return null;
  if (!lastAssignedId) return agentIds[0];
  const idx = agentIds.indexOf(lastAssignedId);
  return agentIds[(idx + 1) % agentIds.length];
}

// Least-active: agente com menos atendimentos abertos.
export function pickLeastActive(openByAgent: Record<string, number>): string | null {
  const entries = Object.entries(openByAgent);
  if (entries.length === 0) return null;
  entries.sort((a, b) => a[1] - b[1]);
  return entries[0][0];
}
