import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ApiResourcesModule } from './modules/api-resources.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from './modules/rbac/guards/permissions.guard';
import { OrgScopeModule } from './common/org-scope/org-scope.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { EmailModule } from './modules/email/email.module';
import { PublicModule } from './modules/public/public.module';

@Module({
  imports: [
    DatabaseModule,
    EmailModule,
    AuthModule,
    RbacModule,
    OrgScopeModule,
    ApiResourcesModule,
    PublicModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule {}
