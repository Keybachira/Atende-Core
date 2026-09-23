import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { IsArray, IsIn, IsOptional, IsString, MinLength } from "class-validator";
import { AutomationService } from "./automation.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreateWorkflowDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsIn(["NOVO_LEAD", "SEM_RESPOSTA", "CONVERTIDO"])
  trigger!: "NOVO_LEAD" | "SEM_RESPOSTA" | "CONVERTIDO";

  @IsOptional()
  config?: Record<string, unknown>;

  @IsArray()
  actions!: { type: "CRIAR_FOLLOWUP"; title: string; dueInHours: number }[];
}

@Controller("automations")
export class AutomationsController {
  constructor(private readonly automation: AutomationService) {}

  @Get("workflows")
  @RequirePermissions("settings.manage")
  list(@Req() req: any) {
    return this.automation.list(req.user.org);
  }

  @Post("workflows")
  @RequirePermissions("settings.manage")
  create(@Req() req: any, @Body() dto: CreateWorkflowDto) {
    return this.automation.create(req.user.org, dto);
  }

  @Patch("workflows/:id")
  @RequirePermissions("settings.manage")
  toggle(@Req() req: any, @Param("id") id: string, @Body() body: { active: boolean }) {
    return this.automation.toggle(req.user.org, id, body.active);
  }

  @Get("workflows/:id/executions")
  @RequirePermissions("settings.manage")
  executions(@Req() req: any, @Param("id") id: string) {
    return this.automation.executions(req.user.org, id);
  }

  @Post("run")
  @RequirePermissions("settings.manage")
  run(@Req() req: any, @Query("trigger") trigger: "NOVO_LEAD" | "SEM_RESPOSTA" | "CONVERTIDO") {
    return this.automation.run(req.user.org, trigger);
  }
}
