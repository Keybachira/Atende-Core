import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { UsersService } from "./users.service";
import { RequirePermissions } from "../auth/permissions.decorator";

class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller("users")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Post()
  @RequirePermissions("users.manage")
  create(@Req() req: any, @Body() dto: CreateUserDto) {
    return this.users.create(req.user?.org, dto);
  }

  @Get()
  @RequirePermissions("users.manage")
  list(@Req() req: any) {
    return this.users.list(req.user?.org);
  }
}
