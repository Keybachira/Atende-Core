import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { IsOptional, IsString, MinLength } from "class-validator";
import { QuickRepliesService } from "./quickreplies.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreateQuickReplyDto {
  @IsString()
  @MinLength(1)
  key!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(1)
  body!: string;
}

class RenderDto {
  @IsOptional()
  @IsString()
  cliente?: string;

  @IsOptional()
  @IsString()
  empresa?: string;

  @IsOptional()
  @IsString()
  vendedor?: string;
}

@Controller("quick-replies")
export class QuickRepliesController {
  constructor(private readonly quickReplies: QuickRepliesService) {}

  @Get()
  @RequirePermissions("conversations.reply")
  list(@Req() req: any) {
    return this.quickReplies.list(req.user.org);
  }

  @Post()
  @RequirePermissions("settings.manage")
  create(@Req() req: any, @Body() dto: CreateQuickReplyDto) {
    return this.quickReplies.create(req.user.org, dto);
  }

  @Post(":id/render")
  @RequirePermissions("conversations.reply")
  render(@Req() req: any, @Param("id") id: string, @Body() dto: RenderDto) {
    return this.quickReplies.render(req.user.org, id, dto);
  }
}
