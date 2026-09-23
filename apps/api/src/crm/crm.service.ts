import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AutomationService } from "../automations/automation.service";

@Injectable()
export class CrmService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly automation: AutomationService,
  ) {}

  private async getCustomer(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: { tags: { include: { tag: true } }, notes: { orderBy: { createdAt: "desc" }, take: 20 } },
    });
    if (!customer) throw new NotFoundException("Cliente não encontrado.");
    return customer;
  }

  listCustomers(organizationId: string, search?: string) {
    return this.prisma.customer.findMany({
      where: {
        organizationId,
        ...(search
          ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { phone: { contains: search } }] }
          : {}),
      },
      include: { tags: { include: { tag: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async createCustomer(organizationId: string, actorId: string, input: { name: string; phone?: string; company?: string; origin?: string; value?: number }) {
    const customer = await this.prisma.customer.create({ data: { organizationId, ...input } });
    await this.log(organizationId, customer.id, actorId, "created", "Cliente criado.");
    await this.prisma.auditLog.create({
      data: { organizationId, actorId, action: "CUSTOMER_CREATED", resource: "customer", resourceId: customer.id },
    });
    await this.automation.run(organizationId, "NOVO_LEAD", { customerId: customer.id });
    return customer;
  }

  async updateCustomer(organizationId: string, id: string, input: { name?: string; phone?: string; company?: string; origin?: string; value?: number; ownerId?: string; lastContactAt?: string }) {
    await this.getCustomer(organizationId, id);
    return this.prisma.customer.update({ where: { id }, data: input });
  }

  async addNote(organizationId: string, customerId: string, authorId: string, body: string) {
    await this.getCustomer(organizationId, customerId);
    const note = await this.prisma.note.create({ data: { organizationId, customerId, authorId, body } });
    await this.log(organizationId, customerId, authorId, "note_added", "Nota adicionada.");
    return note;
  }

  async addTag(organizationId: string, customerId: string, actorId: string, name: string, color?: string) {
    await this.getCustomer(organizationId, customerId);
    const tag = await this.prisma.tag.upsert({
      where: { organizationId_name: { organizationId, name } },
      create: { organizationId, name, color },
      update: {},
    });
    await this.prisma.customerTag.upsert({
      where: { customerId_tagId: { customerId, tagId: tag.id } },
      create: { customerId, tagId: tag.id },
      update: {},
    });
    await this.log(organizationId, customerId, actorId, "tag_added", `Etiqueta "${name}" adicionada.`);
    return tag;
  }

  listActivities(organizationId: string, customerId: string) {
    return this.prisma.activity.findMany({
      where: { organizationId, customerId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }

  listNotes(organizationId: string, customerId: string) {
    return this.prisma.note.findMany({
      where: { organizationId, customerId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }

  async getFull(organizationId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, organizationId },
      include: { tags: { include: { tag: true } } },
    });
    if (!customer) throw new NotFoundException("Cliente não encontrado.");
    return customer;
  }

  private log(organizationId: string, customerId: string, actorId: string, type: string, description: string) {
    return this.prisma.activity.create({ data: { organizationId, customerId, actorId, type, description } });
  }
}
