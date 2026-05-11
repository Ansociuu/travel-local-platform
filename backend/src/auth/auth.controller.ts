import { Controller, Post, Body, Get, UseGuards, Request, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify')
  @ApiOperation({ summary: 'Xác thực Email bằng mã OTP' })
  verifyEmail(@Body() body: { email: string; token: string }) {
    return this.authService.verifyEmail(body.email, body.token);
  }

  @Post('login')
  @ApiOperation({ summary: 'Đăng nhập hệ thống' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Yêu cầu mã khôi phục mật khẩu' })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu mới bằng mã xác thực' })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Lấy thông tin tài khoản hiện tại' })
  async getProfile(@Request() req) {
    const user = await this.authService.getMe(req.user.id);
    return user;
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Đăng nhập bằng Google' })
  async googleAuth(@Req() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Callback xử lý sau khi Google xác thực' })
  async googleAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.googleLogin(req);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userData = encodeURIComponent(JSON.stringify(result.user));
    return res.redirect(`${frontendUrl}/callback?token=${result.access_token}&user=${userData}`);
  }

  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Đăng nhập bằng Facebook' })
  async facebookAuth(@Req() req) {}

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  @ApiOperation({ summary: 'Callback xử lý sau khi Facebook xác thực' })
  async facebookAuthRedirect(@Req() req, @Res() res) {
    const result = await this.authService.facebookLogin(req);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userData = encodeURIComponent(JSON.stringify(result.user));
    return res.redirect(`${frontendUrl}/callback?token=${result.access_token}&user=${userData}`);
  }
}
