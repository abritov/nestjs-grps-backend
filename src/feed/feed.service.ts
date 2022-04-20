import { Injectable } from '@nestjs/common';
import { FeedEntity } from './feed.entity';
import { FeedDto } from './feed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { mergeMap, map } from 'rxjs/operators';
import { ImageEntity } from './image.entity';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedEntity)
    private readonly feedRepo: Repository<FeedEntity>,
    @InjectRepository(ImageEntity)
    private readonly imageRepo: Repository<ImageEntity>,
    private readonly httpFeed: HttpService,
  ) {
    feedRepo.count().then((count) => {
      if (count === 0) {
        this.seed();
      }
    });
  }

  private seed() {
    this.httpFeed
      .get<string>(
        'https://api.flickr.com/services/feeds/photos_public.gne?format=json',
      )
      .pipe(
        map((resp) =>
          JSON.parse(resp.data.replace('jsonFlickrFeed(', '').slice(0, -1)),
        ),
        mergeMap((feed) => this.makeEntityFromDto(feed)),
      )
      .subscribe({
        next: () => {
          console.log('feed loaded');
        },
        error: (err) => {
          console.error('unable to feed database');
          console.error(err);
        },
        complete: () => {
          console.log('database initialized');
        },
      });
  }
  entityIntoDto(feed: FeedEntity): FeedDto {
    const { id, images, ...rest } = feed;
    const dtoImages = images.map((item) => {
      const { id, media, ...rest } = item;
      return { ...rest, media: { m: media } };
    });
    return { ...rest, items: dtoImages };
  }

  private async makeEntityFromDto(feedDto: FeedDto): Promise<FeedEntity> {
    const { items, ...rest } = feedDto;

    const feed = new FeedEntity({ ...rest, images: [] });
    await this.feedRepo.save(feed);

    const images = items.map((item) => {
      const { media, ...rest } = item;
      return new ImageEntity({ ...rest, media: media.m, feed });
    });
    await this.imageRepo.save(images);
    return feed;
  }
}
