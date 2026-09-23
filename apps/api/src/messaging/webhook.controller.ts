import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { MessagingService } from "./messaging.service";
import { Public } from "../auth/public.decorator";
import { WebhookThrottleGuard } from "./webhook-throttle.guard";

@Controller("webhooks/whatsapp")
export class WebhookController {
  constructor(private readonly messaging: MessagingService) {}

  @Post()
  @Public()
  @UseGuards(WebhookThrottleGuard)
  receive(@Body() payload: unknown) {
    return this.messaging.ingestWebhook(payload);
  }
}
