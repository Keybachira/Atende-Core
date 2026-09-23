import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(organizationId: string) {
    const since = new Date(Date.now() - 7 * 24 * 3600_000);
    const [
      novosLeads,
      emAtendimento,
      fila,
      followUpsPendentes,
      conversoes,
      valorConvertido,
      valorPotencial,
      porOrigem,
      queueTop,
    ] = await Promise.all([
      this.prisma.customer.count({ where: { organizationId, createdAt: { gte: since } } }),
      this.prisma.conversation.count({ where: { organizationId, status: "OPEN" } }),
      this.prisma.queueItem.count({ where: { organizationId, status: { in: ["WAITING", "ASSIGNED"] } } }),
      this.prisma.followUp.count({ where: { organizationId, doneAt: null } }),
      this.prisma.deal.count({ where: { organizationId, stage: { isWon: true } } }),
      this.prisma.deal.aggregate({ where: { organizationId, stage: { isWon: true } }, _sum: { value: true } }),
      this.prisma.deal.aggregate({ where: { organizationId, stage: { isWon: false, isLost: false } }, _sum: { value: true } }),
      this.prisma.customer.groupBy({ by: ["origin"], where: { organizationId }, _count: true }),
      this.prisma.queueItem.findMany({
        where: { organizationId, status: { in: ["WAITING", "ASSIGNED"] } },
        include: { conversation: { include: { customer: true } } },
        orderBy: { score: "desc" },
        take: 5,
      }),
    ]);

    const firstResponse = await this.prisma.$queryRaw<{ avg_min: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM (o."createdAt" - i."createdAt")) / 60) AS avg_min
      FROM "messages" i JOIN "messages" o
        ON o."conversation_id" = i."conversation_id" AND o."direction" = 'OUT'
      WHERE i."organization_id" = ${organizationId} AND i."direction" = 'IN'
        AND o."createdAt" = (
          SELECT MIN("createdAt") FROM "messages"
          WHERE "conversation_id" = i."conversation_id" AND "direction" = 'OUT'
        )
        AND i."createdAt" >= ${since}`;

    return {
      stats: {
        novosLeads,
        emAtendimento,
        naFila: fila,
        followUpsPendentes,
        conversoes,
        valorConvertido: valorConvertido._sum.value ?? 0,
        valorPotencial: valorPotencial._sum.value ?? 0,
        tempoMedioPrimeiraRespostaMin: firstResponse[0]?.avg_min ? Math.round(firstResponse[0].avg_min) : null,
      },
      porOrigem: porOrigem.map((o) => ({ origem: o.origin ?? "—", total: o._count })),
      filaTop: queueTop.map((q) => ({
        id: q.id,
        nome: q.conversation.customer?.name ?? "—",
        score: Math.round(q.score),
        level: q.level,
      })),
    };
  }
}
