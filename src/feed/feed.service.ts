import { Injectable } from '@nestjs/common';
import { FeedEntity } from './feed.entity';
import { FeedDto } from './feed.dto';

@Injectable()
export class FeedService {
  entityIntoDto(feed: FeedEntity): FeedDto {
    const { items, ...rest } = feed;
    const dtoItems = items.map((item) => {
      const { media, ...rest } = item;
      return { ...rest, media: { m: media } };
    });
    return { ...rest, items: dtoItems };
  }
}
