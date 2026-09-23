import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { IsIn, IsOptional, IsString } from "class-validator";
import { QueueService } from "./queue.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class AssignDto {
  @IsString()
  toUserId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

class PriorityDto {
  @IsIn(["BAIXA", "NORMAL", "ALTA", "CRITICA"])
  manualPriority!: "BAIXA" | "NORMAL" | "ALTA" | "CRITICA";
}

@Controller("queue")
export class QueueController {
  constructor(private readonly queue: QueueService) {}

  @Get()
  @RequirePermissions("conversations.read")
  list(@Req() req: any) {
    return this.queue.list(req.user.org);
  }

  @Post("recalculate")
  @RequirePermissions("leads.assign")
  recalculate(@Req() req: any) {
    return this.queue.recalculate(req.user.org);
  }

  @Patch(":id/priority")
  @RequirePermissions("leads.assign")
  setPriority(@Req() req: any, @Param("id") id: string, @Body() dto: PriorityDto) {
    return this.queue.setManualPriority(req.user.org, id, dto.manualPriority);
  }

  @Post(":id/assign")
  @RequirePermissions("leads.assign")
  assign(@Req() req: any, @Param("id") id: string, @Body() dto: AssignDto) {
    return this.queue.assign(req.user.org, req.user.sub, id, dto.toUserId, dto.reason);
  }
}
