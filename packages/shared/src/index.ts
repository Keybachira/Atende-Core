import { Errors } from "./errors";

export * from "./errors";
export * from "./pagination";

// Regra de isolamento (doc 03 §7): todo acesso a recurso empresarial
// deve ser validado como user -> organization -> resource.
export interface OrgScoped {
  organization_id: string;
}

export function assertSameOrg(userOrgId: string, resource: OrgScoped): void {
  if (resource.organization_id !== userOrgId) {
    throw Errors.forbidden("Recurso pertence a outra empresa.");
  }
}
