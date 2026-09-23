import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import { IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { CrmService } from "./crm.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsNumber()
  value?: number;
}

class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  origin?: string;

  @IsOptional()
  @IsNumber()
  value?: number;

  @IsOptional()
  @IsString()
  ownerId?: string;
}

class NoteDto {
  @IsString()
  @MinLength(1)
  body!: string;
}

class TagDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;
}

@Controller("customers")
export class CrmController {
  constructor(private readonly crm: CrmService) {}

  @Get()
  @RequirePermissions("customers.read")
  list(@Req() req: any, @Query("search") search?: string) {
    return this.crm.listCustomers(req.user.org, search);
  }

  @Post()
  @RequirePermissions("customers.write")
  create(@Req() req: any, @Body() dto: CreateCustomerDto) {
    return this.crm.createCustomer(req.user.org, req.user.sub, dto);
  }

  @Patch(":id")
  @RequirePermissions("customers.write")
  update(@Req() req: any, @Param("id") id: string, @Body() dto: UpdateCustomerDto) {
    return this.crm.updateCustomer(req.user.org, id, dto);
  }

  @Post(":id/notes")
  @RequirePermissions("customers.write")
  addNote(@Req() req: any, @Param("id") id: string, @Body() dto: NoteDto) {
    return this.crm.addNote(req.user.org, id, req.user.sub, dto.body);
  }

  @Post(":id/tags")
  @RequirePermissions("customers.write")
  addTag(@Req() req: any, @Param("id") id: string, @Body() dto: TagDto) {
    return this.crm.addTag(req.user.org, id, req.user.sub, dto.name, dto.color);
  }

  @Get(":id/activities")
  @RequirePermissions("customers.read")
  activities(@Req() req: any, @Param("id") id: string) {
    return this.crm.listActivities(req.user.org, id);
  }

  @Get(":id/notes")
  @RequirePermissions("customers.read")
  notes(@Req() req: any, @Param("id") id: string) {
    return this.crm.listNotes(req.user.org, id);
  }

  @Get(":id")
  @RequirePermissions("customers.read")
  get(@Req() req: any, @Param("id") id: string) {
    return this.crm.getFull(req.user.org, id);
  }
}
