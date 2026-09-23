// RBAC inicial (doc 03 §8). Permissões verificadas no backend.
export const ALL_PERMISSIONS = [
  "customers.read",
  "customers.write",
  "conversations.read",
  "conversations.reply",
  "leads.assign",
  "pipeline.write",
  "reports.read",
  "users.manage",
  "settings.manage",
  "audit.read",
  "exports.create",
] as const;

export type Permission = (typeof ALL_PERMISSIONS)[number];

export const rolePermissions: Record<string, Permission[]> = {
  ADMIN: [...ALL_PERMISSIONS],
  MANAGER: [
    "customers.read",
    "customers.write",
    "conversations.read",
    "conversations.reply",
    "leads.assign",
    "pipeline.write",
    "reports.read",
    "audit.read",
    "exports.create",
  ],
  SUPERVISOR: [
    "customers.read",
    "conversations.read",
    "conversations.reply",
    "leads.assign",
    "pipeline.write",
    "reports.read",
  ],
  AGENT: ["customers.read", "conversations.read", "conversations.reply", "pipeline.write"],
  ANALYST: ["customers.read", "conversations.read", "reports.read", "audit.read"],
};
