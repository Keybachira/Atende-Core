import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { computeScore, ManualPriority } from "@atende/queue";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class QueueService {
  constructor(private readonly prisma: PrismaService) {}

  async list(organizationId: string) {
    const [items, users] = await Promise.all([
      this.prisma.queueItem.findMany({
        where: { organizationId, status: { in: ["WAITING", "ASSIGNED"] } },
        include: { conversation: { include: { customer: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } } } },
        orderBy: { score: "desc" },
        take: 100,
      }),
      this.prisma.user.findMany({ where: { organizationId }, select: { id: true, name: true } }),
    ]);
    const names = new Map(users.map((u) => [u.id, u.name]));
    return items.map((i) => ({ ...i, assignedToName: i.assignedToId ? (names.get(i.assignedToId) ?? null) : null }));
  }

  // Recalcula a fila a partir das conversas OPEN (doc 03 §9).
  async recalculate(organizationId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: { organizationId, status: "OPEN" },
      orderBy: { lastMessageAt: "asc" },
    });
    const now = Date.now();
    for (const conv of conversations) {
      const waitingMinutes = conv.lastMessageAt
        ? Math.floor((now - conv.lastMessageAt.getTime()) / 60000)
        : 0;
      const existing = await this.prisma.queueItem.findUnique({
        where: { conversationId: conv.id },
      });
      const { score, level, reasons } = computeScore({
        waitingMinutes,
        manual: (existing?.manualPriority as ManualPriority) ?? "NORMAL",
      });
      const reasonsJson = reasons as unknown as Prisma.InputJsonValue;
      await this.prisma.queueItem.upsert({
        where: { conversationId: conv.id },
        create: {
          organizationId,
          conversationId: conv.id,
          score,
          level,
          reasons: reasonsJson,
          status: existing?.status ?? "WAITING",
          assignedToId: existing?.assignedToId,
        },
        update: { score, level, reasons: reasonsJson },
      });
    }
    return this.list(organizationId);
  }

  async setManualPriority(organizationId: string, id: string, manualPriority: ManualPriority) {
    const item = await this.prisma.queueItem.findFirst({ where: { id, organizationId } });
    if (!item) throw new NotFoundException("Item da fila não encontrado.");
    await this.prisma.queueItem.update({ where: { id }, data: { manualPriority } });
    return this.recalculate(organizationId);
  }

  async assign(organizationId: string, actorId: string, id: string, toUserId: string, reason?: string) {
    const item = await this.prisma.queueItem.findFirst({
      where: { id, organizationId },
      include: { conversation: true },
    });
    if (!item) throw new NotFoundException("Item da fila não encontrado.");
    const target = await this.prisma.user.findFirst({ where: { id: toUserId, organizationId, active: true } });
    if (!target) throw new NotFoundException("Atendente não encontrado.");
    const updated = await this.prisma.queueItem.update({
      where: { id },
      data: { status: "ASSIGNED", assignedToId: toUserId },
    });
    await this.prisma.assignment.create({
      data: {
        organizationId,
        queueItemId: id,
        conversationId: item.conversationId,
        fromUserId: item.assignedToId ?? actorId,
        toUserId,
        reason,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId,
        actorId,
        action: "QUEUE_ASSIGNED",
        resource: "queue_item",
        resourceId: id,
        metadata: { toUserId, conversationId: item.conversationId },
      },
    });
    return updated;
  }
}
