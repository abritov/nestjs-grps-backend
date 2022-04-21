import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedEntity } from './feed.entity';
import { ImageEntity } from './image.entity';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedEntity, ImageEntity]),
    HttpModule.register({}),
  ],
  providers: [FeedService],
  controllers: [FeedController],
})
export class FeedModule {}
