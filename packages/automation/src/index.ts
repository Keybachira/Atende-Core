// Motor de automação baseado em eventos (doc 01 §7.8).
export const TRIGGERS = ["NOVO_LEAD", "SEM_RESPOSTA", "CONVERTIDO"] as const;
export type Trigger = (typeof TRIGGERS)[number];

export const TRIGGER_LABELS: Record<Trigger, string> = {
  NOVO_LEAD: "Quando há um novo lead",
  SEM_RESPOSTA: "Quando passa Xh sem resposta",
  CONVERTIDO: "Quando um negócio é convertido",
};

export interface FollowUpAction {
  type: "CRIAR_FOLLOWUP";
  title: string;
  dueInHours: number;
}

export type WorkflowAction = FollowUpAction;

export interface SemRespostaConfig {
  hours: number;
}
