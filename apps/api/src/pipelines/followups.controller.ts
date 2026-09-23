import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { IsOptional, IsString, MinLength } from "class-validator";
import { FollowUpsService } from "./followups.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreateFollowUpDto {
  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsString()
  dueAt!: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

class ReopenDto {
  @IsString()
  dueAt!: string;
}

@Controller("follow-ups")
export class FollowUpsController {
  constructor(private readonly followUps: FollowUpsService) {}

  @Get("pending")
  @RequirePermissions("customers.read")
  pending(@Req() req: any) {
    return this.followUps.listPending(req.user.org);
  }

  @Post()
  @RequirePermissions("customers.write")
  create(@Req() req: any, @Body() dto: CreateFollowUpDto) {
    return this.followUps.create(req.user.org, dto);
  }

  @Patch(":id/complete")
  @RequirePermissions("customers.write")
  complete(@Req() req: any, @Param("id") id: string) {
    return this.followUps.complete(req.user.org, id);
  }

  @Patch(":id/reopen")
  @RequirePermissions("customers.write")
  reopen(@Req() req: any, @Param("id") id: string, @Body() dto: ReopenDto) {
    return this.followUps.reopen(req.user.org, id, dto.dueAt);
  }
}
