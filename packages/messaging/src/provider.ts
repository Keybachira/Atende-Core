export interface IncomingMessage {
  externalEventId: string;
  externalMessageId: string;
  fromPhone: string;
  fromName?: string;
  body: string;
  timestamp?: Date;
}

export interface SendMessageInput {
  toPhone: string;
  body: string;
}

export interface SendMessageResult {
  externalMessageId: string;
}

// Contrato do canal (doc 03 §20). O domínio nunca fala com a Meta direto;
// toda integração passa por esta interface.
export interface MessagingProvider {
  readonly name: string;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  parseWebhook(payload: unknown): IncomingMessage;
}
