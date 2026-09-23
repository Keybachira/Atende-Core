import { Injectable, NotFoundException } from "@nestjs/common";
import { DEFAULT_STAGES } from "@atende/pipeline";
import { PrismaService } from "../prisma/prisma.service";
import { AutomationService } from "../automations/automation.service";

@Injectable()
export class PipelinesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automation: AutomationService,
  ) {}

  list(organizationId: string) {
    return this.prisma.pipeline.findMany({
      where: { organizationId },
      include: { stages: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async create(organizationId: string, name: string, withDefaults = true) {
    const pipeline = await this.prisma.pipeline.create({ data: { organizationId, name } });
    if (withDefaults) {
      await this.prisma.stage.createMany({
        data: DEFAULT_STAGES.map((s) => ({
          organizationId,
          pipelineId: pipeline.id,
          name: s.name,
          position: s.position,
          isWon: (s as { isWon?: boolean }).isWon ?? false,
          isLost: (s as { isLost?: boolean }).isLost ?? false,
        })),
      });
    }
    return this.get(organizationId, pipeline.id);
  }

  get(organizationId: string, id: string) {
    return this.prisma.pipeline.findFirstOrThrow({
      where: { id, organizationId },
      include: {
        stages: { orderBy: { position: "asc" } },
        deals: { include: { customer: true }, orderBy: { createdAt: "desc" } },
      },
    });
  }

  async createDeal(organizationId: string, actorId: string, input: { pipelineId: string; stageId: string; title: string; value?: number; customerId?: string; ownerId?: string }) {
    const stage = await this.prisma.stage.findFirst({
      where: { id: input.stageId, pipelineId: input.pipelineId, organizationId },
    });
    if (!stage) throw new NotFoundException("Estágio não encontrado.");
    const deal = await this.prisma.deal.create({ data: { organizationId, ...input } });
    await this.prisma.stageHistory.create({
      data: { organizationId, dealId: deal.id, toStageId: stage.id, actorId },
    });
    return deal;
  }

  async moveDeal(organizationId: string, actorId: string, dealId: string, toStageId: string) {
    const deal = await this.prisma.deal.findFirst({ where: { id: dealId, organizationId } });
    if (!deal) throw new NotFoundException("Negócio não encontrado.");
    const toStage = await this.prisma.stage.findFirst({
      where: { id: toStageId, pipelineId: deal.pipelineId, organizationId },
    });
    if (!toStage) throw new NotFoundException("Estágio de destino inválido.");
    const updated = await this.prisma.deal.update({ where: { id: dealId }, data: { stageId: toStageId } });
    await this.prisma.stageHistory.create({
      data: { organizationId, dealId, fromStageId: deal.stageId, toStageId, actorId },
    });
    await this.prisma.auditLog.create({
      data: { organizationId, actorId, action: "DEAL_MOVED", resource: "deal", resourceId: dealId, metadata: { from: deal.stageId, to: toStageId } },
    });
    if (toStage.isWon) {
      await this.automation.run(organizationId, "CONVERTIDO", { dealId, customerId: deal.customerId ?? undefined });
    }
    return updated;
  }
}
