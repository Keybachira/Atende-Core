import { Injectable } from "@nestjs/common";
import { MockProvider } from "@atende/messaging";
import { PrismaService } from "../prisma/prisma.service";

const DEMO_ORG = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class MessagingService {
  private readonly provider = new MockProvider();

  constructor(private readonly prisma: PrismaService) {}

  // Fluxo webhook (doc 03 §11): persistir evento bruto com idempotência,
  // responder rápido; processamento pesado vai para fila (Fase 6).
  async ingestWebhook(payload: unknown) {
    const incoming = this.provider.parseWebhook(payload);

    const existing = await this.prisma.webhookEvent.findUnique({
      where: { provider_externalEventId: { provider: this.provider.name, externalEventId: incoming.externalEventId } },
    });
    if (existing?.processed) return { received: true, duplicate: true };

    const event =
      existing ??
      (await this.prisma.webhookEvent.create({
        data: {
          organizationId: DEMO_ORG,
          provider: this.provider.name,
          externalEventId: incoming.externalEventId,
          payload: payload as object,
        },
      }));

    const channel = await this.prisma.channel.upsert({
      where: { id: "00000000-0000-0000-0000-000000000003" },
      create: {
        id: "00000000-0000-0000-0000-000000000003",
        organizationId: DEMO_ORG,
        name: "WhatsApp (mock)",
        type: "WHATSAPP_MOCK",
      },
      update: {},
    });

    let customer = await this.prisma.customer.findFirst({
      where: { organizationId: DEMO_ORG, phone: incoming.fromPhone },
    });
    customer ??= await this.prisma.customer.create({
      data: {
        organizationId: DEMO_ORG,
        name: incoming.fromName ?? incoming.fromPhone,
        phone: incoming.fromPhone,
        origin: "whatsapp",
        lastContactAt: new Date(),
      },
    });
    if (customer.lastContactAt === null) {
      await this.prisma.customer.update({ where: { id: customer.id }, data: { lastContactAt: new Date() } });
    }

    let conversation = await this.prisma.conversation.findFirst({
      where: { organizationId: DEMO_ORG, customerId: customer.id, status: "OPEN" },
    });
    conversation ??= await this.prisma.conversation.create({
      data: { organizationId: DEMO_ORG, channelId: channel.id, customerId: customer.id },
    });

    await this.prisma.message.upsert({
      where: { organizationId_providerMessageId: { organizationId: DEMO_ORG, providerMessageId: incoming.externalMessageId } },
      create: {
        organizationId: DEMO_ORG,
        conversationId: conversation.id,
        direction: "IN",
        body: incoming.body,
        providerMessageId: incoming.externalMessageId,
        status: "DELIVERED",
      },
      update: {},
    });
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });
    await this.prisma.queueItem.upsert({
      where: { conversationId: conversation.id },
      create: { organizationId: DEMO_ORG, conversationId: conversation.id },
      update: {},
    });

    await this.prisma.webhookEvent.update({ where: { id: event.id }, data: { processed: true } });
    return { received: true, eventId: event.id };
  }

  listConversations(organizationId: string) {
    return this.prisma.conversation.findMany({
      where: { organizationId },
      include: { customer: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
    });
  }

  async startConversation(organizationId: string, actorId: string, input: { customerId?: string; name?: string; phone?: string }) {
    let customerId = input.customerId;
    if (!customerId) {
      if (!input.phone) throw new Error("Informe o cliente ou o telefone.");
      const found = await this.prisma.customer.findFirst({ where: { organizationId, phone: input.phone } });
      customerId =
        found?.id ??
        (
          await this.prisma.customer.create({
            data: { organizationId, name: input.name ?? input.phone, phone: input.phone, origin: "manual" },
          })
        ).id;
    }
    const channel = await this.prisma.channel.upsert({
      where: { id: "00000000-0000-0000-0000-000000000003" },
      create: { id: "00000000-0000-0000-0000-000000000003", organizationId, name: "WhatsApp (mock)", type: "WHATSAPP_MOCK" },
      update: {},
    });
    const conversation = await this.prisma.conversation.create({
      data: { organizationId, channelId: channel.id, customerId, lastMessageAt: new Date() },
    });
    await this.prisma.queueItem.upsert({
      where: { conversationId: conversation.id },
      create: { organizationId, conversationId: conversation.id },
      update: {},
    });
    await this.prisma.auditLog.create({
      data: { organizationId, actorId, action: "CONVERSATION_STARTED", resource: "conversation", resourceId: conversation.id },
    });
    return conversation;
  }

  listMessages(organizationId: string, conversationId: string) {
    return this.prisma.message.findMany({
      where: { organizationId, conversationId },
      orderBy: { createdAt: "asc" },
      take: 200,
    });
  }

  async reply(organizationId: string, conversationId: string, body: string) {
    const conversation = await this.prisma.conversation.findFirstOrThrow({
      where: { id: conversationId, organizationId },
      include: { customer: true },
    });
    const result = await this.provider.sendMessage({ toPhone: conversation.customer?.phone ?? "", body });
    return this.prisma.message.create({
      data: {
        organizationId,
        conversationId,
        direction: "OUT",
        body,
        providerMessageId: result.externalMessageId,
        status: "SENT",
      },
    });
  }
}
