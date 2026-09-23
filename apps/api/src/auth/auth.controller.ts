import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { IsEmail, IsString, MinLength } from "class-validator";
import { AuthService } from "./auth.service";
import { Public } from "./public.decorator";

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  organizationId!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("login")
  @Public()
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password, dto.organizationId);
  }

  @Get("me")
  me(@Req() req: any) {
    return this.auth.me(req.user.sub);
  }
}
