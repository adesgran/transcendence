import { Module } from '@nestjs/common';
import { LadderService } from './ladder.service';
import { LadderController } from './ladder.controller';

@Module({
  providers: [LadderService],
  controllers: [LadderController]
})
export class LadderModule {}
