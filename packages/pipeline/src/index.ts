// Pipeline padrão (doc 01 §7.4). Cada empresa pode configurar o próprio.
export const DEFAULT_STAGES = [
  { name: "NOVO", position: 0 },
  { name: "EM ATENDIMENTO", position: 1 },
  { name: "QUALIFICADO", position: 2 },
  { name: "PROPOSTA", position: 3 },
  { name: "NEGOCIAÇÃO", position: 4 },
  { name: "CONVERTIDO", position: 5, isWon: true },
  { name: "SEM RESPOSTA", position: 6, isLost: true },
  { name: "ADIADO", position: 7 },
  { name: "PERDIDO", position: 8, isLost: true },
] as const;

// Render de variáveis das respostas rápidas (doc 01 §7.7).
export function renderQuickReply(
  body: string,
  vars: { cliente?: string; empresa?: string; vendedor?: string },
): string {
  return body
    .replaceAll("{{cliente.nome}}", vars.cliente ?? "")
    .replaceAll("{{empresa.nome}}", vars.empresa ?? "")
    .replaceAll("{{vendedor.nome}}", vars.vendedor ?? "");
}
