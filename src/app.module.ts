import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DiscordModule } from './discord/discord.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './@config/database.config';
import { ClickupModule } from './clickup/clickup.module';

@Module({
  imports: [
    DiscordModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmConfig),
    ClickupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
