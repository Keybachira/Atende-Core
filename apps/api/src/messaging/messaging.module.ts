import { Module } from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { WebhookController } from "./webhook.controller";
import { ConversationsController } from "./conversations.controller";

@Module({
  controllers: [WebhookController, ConversationsController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
