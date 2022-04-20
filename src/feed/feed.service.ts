import { Injectable } from '@nestjs/common';
import { FeedEntity } from './feed.entity';
import { FeedDto } from './feed.dto';

@Injectable()
export class FeedService {
  entityIntoDto(feed: FeedEntity): FeedDto {
    const { id, images, ...rest } = feed;
    const dtoImages = images.map((item) => {
      const { id, media, ...rest } = item;
      return { ...rest, media: { m: media } };
    });
    return { ...rest, items: dtoImages };
  }
}
