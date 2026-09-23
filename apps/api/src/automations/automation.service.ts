import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Trigger, WorkflowAction } from "@atende/automation";
import { PrismaService } from "../prisma/prisma.service";

interface TriggerContext {
  customerId?: string;
  conversationId?: string;
  dealId?: string;
}

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.workflow.findMany({ where: { organizationId }, orderBy: { createdAt: "asc" } });
  }

  create(organizationId: string, input: { name: string; trigger: Trigger; config?: object; actions: WorkflowAction[] }) {
    return this.prisma.workflow.create({
      data: {
        organizationId,
        name: input.name,
        trigger: input.trigger,
        config: (input.config ?? {}) as unknown as Prisma.InputJsonValue,
        actions: input.actions as unknown as Prisma.InputJsonValue,
      },
    });
  }

  toggle(organizationId: string, id: string, active: boolean) {
    return this.prisma.workflow.updateMany({ where: { id, organizationId }, data: { active } });
  }

  executions(organizationId: string, workflowId: string) {
    return this.prisma.workflowExecution.findMany({
      where: { organizationId, workflowId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  // Dispara workflows de um gatilho. SEM_RESPOSTA varre conversas paradas;
  // os demais usam o contexto do evento que os invocou.
  async run(organizationId: string, trigger: Trigger, ctx: TriggerContext = {}) {
    const workflows = await this.prisma.workflow.findMany({ where: { organizationId, trigger, active: true } });
    const results = [];
    for (const wf of workflows) {
      try {
        if (trigger === "SEM_RESPOSTA") {
          results.push(await this.runSemResposta(organizationId, wf.id, wf.config as { hours?: number }, (wf.actions as unknown as WorkflowAction[])));
        } else {
          await this.applyActions(organizationId, wf.actions as unknown as WorkflowAction[], ctx);
          await this.log(organizationId, wf.id, "OK", `${(wf.actions as unknown[]).length} ação(ões) executada(s).`);
          results.push({ workflowId: wf.id, status: "OK" });
        }
      } catch (err) {
        await this.log(organizationId, wf.id, "ERRO", String(err));
        results.push({ workflowId: wf.id, status: "ERRO" });
      }
    }
    return results;
  }

  private async runSemResposta(organizationId: string, workflowId: string, config: { hours?: number }, actions: WorkflowAction[]) {
    const hours = config?.hours ?? 24;
    const cutoff = new Date(Date.now() - hours * 3600_000);
    const stale = await this.prisma.conversation.findMany({
      where: { organizationId, status: "OPEN", lastMessageAt: { lt: cutoff } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      take: 100,
    });
    let created = 0;
    for (const conv of stale) {
      const last = conv.messages[0];
      if (last?.direction === "OUT") continue;
      const already = await this.prisma.followUp.findFirst({
        where: { organizationId, customerId: conv.customerId ?? undefined, doneAt: null },
      });
      if (already) continue;
      await this.applyActions(organizationId, actions, { customerId: conv.customerId ?? undefined, conversationId: conv.id });
      created++;
    }
    await this.log(organizationId, workflowId, "OK", `${created} follow-up(s) criado(s) em ${stale.length} conversa(s) parada(s).`);
    return { workflowId, status: "OK", created };
  }

  private async applyActions(organizationId: string, actions: WorkflowAction[], ctx: TriggerContext) {
    for (const action of actions) {
      if (action.type === "CRIAR_FOLLOWUP") {
        await this.prisma.followUp.create({
          data: {
            organizationId,
            customerId: ctx.customerId,
            title: action.title,
            reason: "automação",
            dueAt: new Date(Date.now() + action.dueInHours * 3600_000),
          },
        });
      }
    }
  }

  private log(organizationId: string, workflowId: string, status: string, detail: string) {
    return this.prisma.workflowExecution.create({ data: { organizationId, workflowId, status, detail } });
  }
}
