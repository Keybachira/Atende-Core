import { Body, Controller, Get, Patch, Post, Req } from "@nestjs/common";
import { IsString, MinLength } from "class-validator";
import { OrganizationsService } from "./organizations.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreateOrgDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly orgs: OrganizationsService) {}

  @Post()
  @RequirePermissions("settings.manage")
  create(@Body() dto: CreateOrgDto) {
    return this.orgs.create(dto.name);
  }

  @Get()
  @RequirePermissions("settings.manage")
  list() {
    return this.orgs.list();
  }

  @Get("current")
  @RequirePermissions("settings.manage")
  current(@Req() req: any) {
    return this.orgs.get(req.user.org);
  }

  @Patch("current")
  @RequirePermissions("settings.manage")
  rename(@Req() req: any, @Body() dto: CreateOrgDto) {
    return this.orgs.rename(req.user.org, dto.name);
  }
}
