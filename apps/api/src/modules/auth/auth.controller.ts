import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Query,
  Patch,
  Post,
  Req,
  Res,
  SetMetadata,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { IS_PUBLIC_KEY, Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleOAuthExceptionFilter } from './filters/google-oauth-exception.filter';
import { AuthService } from './auth.service';
import { resolveGoogleOAuthErrorCode } from './google-profile.utils';
import { decodeOAuthState } from './oauth-state.util';
import { safeOAuthRedirect } from './oauth-redirect.util';
import {
  AuthResponseDto,
  AuthTokensResponseDto,
  LogoutResponseDto,
} from './dto/auth-tokens-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResetPasswordResponseDto } from './dto/reset-password-response.dto';
import { AuthMeDto } from './dto/auth-me.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { VerifyOperationDto } from './dto/verify-operation.dto';

@Public()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseFilters(GoogleOAuthExceptionFilter)
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Start Google OAuth login flow' })
  googleAuth(@Query('next') _next?: string): void {
    // handled by passport redirect
  }

  @Get('google/callback')
  @UseFilters(GoogleOAuthExceptionFilter)
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: 'Google OAuth callback for web login' })
  async googleAuthCallback(
    @Req()
    req: Request & {
      user?: {
        profile: {
          name?: { givenName?: string; familyName?: string };
          emails?: Array<{ value?: string }>;
        };
        state?: string;
      };
    },
    @Res({ passthrough: false }) res: Response,
  ): Promise<void> {
    if (!req.user?.profile) {
      safeOAuthRedirect(res, this.authService.buildWebOAuthErrorUrl(undefined));
      return;
    }

    const { next, webOrigin, context, preferredLanguage } = decodeOAuthState(
      req.user.state,
    );

    try {
      const auth =
        context === 'admin_register'
          ? await this.authService.registerAdminWithGoogleProfile(
              req.user.profile,
              preferredLanguage ? { preferredLanguage } : undefined,
            )
          : await this.authService.loginWithGoogleProfile(req.user.profile);

      if (auth.pendingApproval) {
        safeOAuthRedirect(
          res,
          this.authService.buildAdminRegisterPendingUrl(webOrigin),
        );
        return;
      }

      if (auth.requiresVerification && auth.verificationId) {
        safeOAuthRedirect(
          res,
          this.authService.buildWebVerificationUrl(
            auth.verificationId,
            next,
            webOrigin,
            auth.verificationPurpose,
          ),
        );
        return;
      }
      const redirectUrl = this.authService.buildWebOAuthCallbackUrl(
        next,
        auth.accessToken,
        auth.refreshToken,
        auth.expiresIn,
        webOrigin,
      );
      safeOAuthRedirect(res, redirectUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Google OAuth callback failed: ${message}`,
        err instanceof Error ? err.stack : undefined,
      );
      safeOAuthRedirect(
        res,
        this.authService.buildOAuthErrorUrl(
          next,
          resolveGoogleOAuthErrorCode(err),
          webOrigin,
          context,
        ),
      );
    }
  }

  @Get('me')
  @SetMetadata(IS_PUBLIC_KEY, false)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Current user profile and effective permissions' })
  @ApiOkResponse({ type: AuthMeDto })
  @ApiUnauthorizedResponse()
  me(@CurrentUser() user: AuthUserDto): Promise<AuthMeDto> {
    return this.authService.getAuthMe(user.id);
  }

  @Get('me/organizations')
  @SetMetadata(IS_PUBLIC_KEY, false)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Organizations available to the current user (POS org picker)',
  })
  @ApiUnauthorizedResponse()
  myOrganizations(@CurrentUser() user: AuthUserDto) {
    return this.authService.listMyOrganizations(user.id);
  }

  @Patch('me')
  @SetMetadata(IS_PUBLIC_KEY, false)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse()
  updateMe(
    @CurrentUser() user: AuthUserDto,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    return this.authService.updateProfile(user.id, dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or inactive account' })
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new admin user account' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('register/customer')
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new customer account for the public web app' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email already registered' })
  registerCustomer(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.registerCustomer(dto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtain new access and refresh tokens' })
  @ApiOkResponse({ type: AuthTokensResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current refresh token session' })
  @ApiOkResponse({ type: LogoutResponseDto })
  logout(@Body() dto: RefreshTokenDto): Promise<LogoutResponseDto> {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('forgot-password')
  @UseGuards(ThrottlerGuard)
  @Throttle({ forgotPassword: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request a password reset link' })
  @ApiOkResponse({ type: ForgotPasswordResponseDto })
  forgotPassword(
    @Body() dto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with a valid token' })
  @ApiOkResponse({ type: ResetPasswordResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  resetPassword(@Body() dto: ResetPasswordDto): Promise<ResetPasswordResponseDto> {
    return this.authService.resetPassword(dto);
  }

  @Post('verify-operation')
  @UseGuards(ThrottlerGuard)
  @Throttle({ login: { limit: 10, ttl: 60_000 } })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify email operation code (register, Google signup, booking)',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid or expired verification code' })
  verifyOperation(@Body() dto: VerifyOperationDto): Promise<AuthResponseDto> {
    return this.authService.verifyOperation(dto);
  }
}
