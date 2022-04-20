import { Injectable } from '@nestjs/common';
import { FeedEntity } from './feed.entity';
import { FeedDto } from './feed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { mergeMap, map } from 'rxjs/operators';
import { ImageEntity } from './image.entity';
import { EMPTY, Observable, of } from 'rxjs';

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
    this.getUpdates();
  }

  private async getUpdates() {
    this.getFeed()
      .pipe(
        mergeMap(async (feed) => {
          try {
            console.log('trying to update the feed');
            await this.makeEntityFromDto(feed);
            return EMPTY;
          } catch (err) {
            if (err.code == 23505) {
              // duplicate key error
              const dbFeed = await this.feedRepo.findOne({ title: feed.title });
              console.log('found the feed');
              const images = feed.items.map((item) => {
                const { media, ...rest } = item;
                return new ImageEntity({
                  ...rest,
                  media: media.m,
                  feed: dbFeed,
                });
              });
              const savedImages = await this.imageRepo.save(images);
              console.log(`${savedImages.length} images updated`);

              return of(dbFeed);
            }
          }
        }),
      )
      .subscribe({
        next: () => {
          console.log('feed updated');
        },
        error: (err) => {
          console.error('unable to update feed');
          console.error(err);
        },
        complete: () => {
          console.log('getUpdates');
          setTimeout(() => this.getUpdates(), 60000 * 15);
        },
      });
  }

  private getFeed(): Observable<FeedDto> {
    return this.httpFeed
      .get<string>(
        'https://api.flickr.com/services/feeds/photos_public.gne?format=json',
      )
      .pipe(
        map((resp) =>
          JSON.parse(resp.data.replace('jsonFlickrFeed(', '').slice(0, -1)),
        ),
      );
  }

  private seed() {
    this.getFeed()
      .pipe(mergeMap((feed) => this.makeEntityFromDto(feed)))
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
