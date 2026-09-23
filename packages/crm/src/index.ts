// Domínio CRM (doc 01 §7.3). Tipos partilhados entre API e jobs.
export const CUSTOMER_ORIGINS = [
  "whatsapp",
  "indicacao",
  "site",
  "instagram",
  "telefone",
  "presencial",
  "outro",
] as const;

export type CustomerOrigin = (typeof CUSTOMER_ORIGINS)[number];

export const ACTIVITY_TYPES = [
  "created",
  "note_added",
  "tag_added",
  "assigned",
  "stage_changed",
  "message_received",
  "message_sent",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];
