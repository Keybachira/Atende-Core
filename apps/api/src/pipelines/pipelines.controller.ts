import { Body, Controller, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { PipelinesService } from "./pipelines.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreatePipelineDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

class CreateDealDto {
  @IsString()
  pipelineId!: string;

  @IsString()
  stageId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

class MoveDealDto {
  @IsString()
  toStageId!: string;
}

@Controller("pipelines")
export class PipelinesController {
  constructor(private readonly pipelines: PipelinesService) {}

  @Get()
  @RequirePermissions("pipeline.write")
  list(@Req() req: any) {
    return this.pipelines.list(req.user.org);
  }

  @Post()
  @RequirePermissions("pipeline.write")
  create(@Req() req: any, @Body() dto: CreatePipelineDto) {
    return this.pipelines.create(req.user.org, dto.name);
  }

  @Get(":id")
  @RequirePermissions("pipeline.write")
  get(@Req() req: any, @Param("id") id: string) {
    return this.pipelines.get(req.user.org, id);
  }

  @Post("deals")
  @RequirePermissions("pipeline.write")
  createDeal(@Req() req: any, @Body() dto: CreateDealDto) {
    return this.pipelines.createDeal(req.user.org, req.user.sub, dto);
  }

  @Patch("deals/:id/move")
  @RequirePermissions("pipeline.write")
  move(@Req() req: any, @Param("id") id: string, @Body() dto: MoveDealDto) {
    return this.pipelines.moveDeal(req.user.org, req.user.sub, id, dto.toStageId);
  }
}
