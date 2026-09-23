import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { IsOptional, IsString, MinLength } from "class-validator";
import { MessagingService } from "./messaging.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class ReplyDto {
  @IsString()
  @MinLength(1)
  body!: string;
}

class StartConversationDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

@Controller("conversations")
export class ConversationsController {
  constructor(private readonly messaging: MessagingService) {}

  @Get()
  @RequirePermissions("conversations.read")
  list(@Req() req: any) {
    return this.messaging.listConversations(req.user.org);
  }

  @Post()
  @RequirePermissions("conversations.reply")
  start(@Req() req: any, @Body() dto: StartConversationDto) {
    return this.messaging.startConversation(req.user.org, req.user.sub, dto);
  }

  @Get(":id/messages")
  @RequirePermissions("conversations.read")
  messages(@Req() req: any, @Param("id") id: string) {
    return this.messaging.listMessages(req.user.org, id);
  }

  @Post(":id/reply")
  @RequirePermissions("conversations.reply")
  reply(@Req() req: any, @Param("id") id: string, @Body() dto: ReplyDto) {
    return this.messaging.reply(req.user.org, id, dto.body);
  }
}
