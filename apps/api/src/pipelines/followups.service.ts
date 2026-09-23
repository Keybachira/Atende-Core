import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class FollowUpsService {
  constructor(private readonly prisma: PrismaService) {}

  listPending(organizationId: string) {
    return this.prisma.followUp.findMany({
      where: { organizationId, doneAt: null },
      include: { customer: true },
      orderBy: { dueAt: "asc" },
      take: 100,
    });
  }

  create(organizationId: string, input: { customerId?: string; title?: string; reason?: string; dueAt: string; ownerId?: string }) {
    return this.prisma.followUp.create({
      data: { organizationId, ...input, dueAt: new Date(input.dueAt) },
    });
  }

  async complete(organizationId: string, id: string) {
    const fu = await this.prisma.followUp.findFirst({ where: { id, organizationId } });
    if (!fu) throw new NotFoundException("Follow-up não encontrado.");
    return this.prisma.followUp.update({ where: { id }, data: { doneAt: new Date() } });
  }

  async reopen(organizationId: string, id: string, dueAt: string) {
    const fu = await this.prisma.followUp.findFirst({ where: { id, organizationId } });
    if (!fu) throw new NotFoundException("Follow-up não encontrado.");
    return this.prisma.followUp.update({ where: { id }, data: { doneAt: null, dueAt: new Date(dueAt) } });
  }
}
