import { Module } from '@nestjs/common';
import { DiscordService } from './discord.service';
import { DiscordController } from './discord.controller';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entity/message.entity';
import { ClickupModule } from 'src/clickup/clickup.module';

@Module({
  imports: [HttpModule, ClickupModule, TypeOrmModule.forFeature([Message])],
  controllers: [DiscordController],
  providers: [DiscordService],
})
export class DiscordModule {}
