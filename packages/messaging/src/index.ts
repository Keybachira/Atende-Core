import { randomUUID } from "crypto";
import { IncomingMessage, MessagingProvider, SendMessageInput, SendMessageResult } from "./provider";

// Payload simplificado aceito pelo mock em POST /api/v1/webhooks/whatsapp.
export interface MockWebhookPayload {
  eventId?: string;
  messageId?: string;
  fromPhone: string;
  fromName?: string;
  body: string;
}

export class MockProvider implements MessagingProvider {
  readonly name = "mock";

  async sendMessage(input: SendMessageInput): Promise<SendMessageResult> {
    return { externalMessageId: `mock-${randomUUID()}` };
  }

  parseWebhook(payload: unknown): IncomingMessage {
    const p = payload as Partial<MockWebhookPayload>;
    if (!p || typeof p.fromPhone !== "string" || typeof p.body !== "string") {
      throw new Error("Payload mock inválido: esperado { fromPhone, body }.");
    }
    return {
      externalEventId: p.eventId ?? `evt-${randomUUID()}`,
      externalMessageId: p.messageId ?? `msg-${randomUUID()}`,
      fromPhone: p.fromPhone,
      fromName: p.fromName,
      body: p.body,
    };
  }
}

export * from "./provider";
