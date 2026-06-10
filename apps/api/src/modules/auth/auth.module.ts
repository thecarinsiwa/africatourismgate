import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Organizations } from '../../entities/generated/organizations.entity';
import { UserRoleAssignments } from '../../entities/generated/rbac.entity';
import {
  PasswordResetTokens,
  Users,
  UserSessions,
} from '../../entities/generated/users.entity';
import { EmailVerificationModule } from '../email-verification/email-verification.module';
import { BookingsModule } from '../resources/bookings/bookings.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { GoogleOAuthExceptionFilter } from './filters/google-oauth-exception.filter';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    EmailVerificationModule,
    forwardRef(() => BookingsModule),
    TypeOrmModule.forFeature([
      Users,
      UserSessions,
      Organizations,
      UserRoleAssignments,
      PasswordResetTokens,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
    ThrottlerModule.forRoot([
      {
        name: 'login',
        ttl: 60_000,
        limit: 5,
      },
      {
        name: 'forgotPassword',
        ttl: 60_000,
        limit: 5,
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    JwtRefreshGuard,
    GoogleAuthGuard,
    GoogleOAuthExceptionFilter,
  ],
  exports: [AuthService, JwtAuthGuard, JwtRefreshGuard, GoogleAuthGuard],
})
export class AuthModule {}
