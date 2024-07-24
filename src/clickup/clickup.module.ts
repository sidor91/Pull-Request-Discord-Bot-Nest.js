import { Module } from '@nestjs/common';
import { ClickupService } from './clickup.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ClickupService],
  exports: [ClickupService],
})
export class ClickupModule {}
