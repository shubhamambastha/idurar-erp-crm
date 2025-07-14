import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntegrationModule } from './integration/integration.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [DatabaseModule, IntegrationModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
