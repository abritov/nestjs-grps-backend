import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedEntity } from './feed.entity';
import { ImageEntity } from './image.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FeedEntity, ImageEntity])],
})
export class FeedModule {}
