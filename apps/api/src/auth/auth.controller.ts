import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';
import { CurrentUser } from './current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly svc: AuthService) {}

  /** Register a new user account. Open endpoint. */
  @Public()
  @Post('register')
  register(@Body() body: { email: string; password: string; name: string; role?: string }) {
    return this.svc.register(body);
  }

  /** Login and receive a JWT access token. Open endpoint. */
  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.svc.login(body);
  }

  /** Return the authenticated user's profile. */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: { id: string }) {
    return this.svc.me(user.id);
  }

  /** Change password for the authenticated user. */
  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(
    @CurrentUser() user: { id: string },
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    return this.svc.changePassword(user.id, body.currentPassword, body.newPassword);
  }
}
