import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { ApiResourcesModule } from './modules/api-resources.module';

@Module({
  imports: [DatabaseModule, ApiResourcesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
