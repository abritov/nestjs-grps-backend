import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedEntity } from './feed.entity';
import { ImageEntity } from './image.entity';
import { FeedService } from './feed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([FeedEntity, ImageEntity]),
    HttpModule.register({}),
  ],
  providers: [FeedService],
})
export class FeedModule {}
