import { Body, Controller, Post, Query } from '@nestjs/common';
import { DiscordService } from './discord.service';

@Controller('webhook')
export class DiscordController {
  constructor(private readonly discordService: DiscordService) {}

  @Post()
  handleWebhook(
    @Query('discord_wh_id') discord_wh_id: string,
    @Body() payload: any,
  ) {
    this.discordService.sendDiscordMessage(payload, discord_wh_id);
  }
}
