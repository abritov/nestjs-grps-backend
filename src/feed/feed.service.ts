import { Injectable } from '@nestjs/common';
import { FeedEntity } from './feed.entity';
import { FeedDto, ImageDto } from './feed.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { mergeMap, map } from 'rxjs/operators';
import { ImageEntity } from './image.entity';
import { BehaviorSubject, EMPTY, from, Observable, of } from 'rxjs';

@Injectable()
export class FeedService {
  imageUpdates$ = new BehaviorSubject<ImageDto[]>(null);

  constructor(
    @InjectRepository(FeedEntity)
    private readonly feedRepo: Repository<FeedEntity>,
    @InjectRepository(ImageEntity)
    private readonly imageRepo: Repository<ImageEntity>,
    private readonly httpFeed: HttpService,
  ) {
    feedRepo.find().then((feeds) => {
      if (feeds.length === 0) {
        this.seed();
      }
      from(feeds)
        .pipe(
          map((feed) =>
            feed.images.map((image) => this.imageEntityIntoDto(image)),
          ),
        )
        .subscribe(this.imageUpdates$);
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
              const dbFeed = await this.feedRepo.findOne(
                { title: feed.title },
                { relations: ['images'] },
              );
              console.log('found the feed');
              const images = feed.items.map((item) => {
                const { media, ...rest } = item;
                return new ImageEntity({
                  ...rest,
                  media: media.m,
                  feedId: dbFeed.id,
                });
              });
              const savedImages = await Promise.all(
                images.map((image) =>
                  this.imageRepo.insert(image).catch((_) => null),
                ),
              );
              if (savedImages.length > 0) {
                of(savedImages.filter((image) => image !== null))
                  .pipe(map((images) => images.map(this.imageEntityIntoDto)))
                  .subscribe(this.imageUpdates$);
              }
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

  imageEntityIntoDto(image: ImageEntity): ImageDto {
    const { id, media, ...rest } = image;
    return { ...rest, media: { m: media } };
  }
  entityIntoDto(feed: FeedEntity): FeedDto {
    const { id, images, ...rest } = feed;
    const dtoImages = images.map((image) => this.imageEntityIntoDto(image));
    return { ...rest, items: dtoImages };
  }

  private async makeEntityFromDto(feedDto: FeedDto): Promise<FeedEntity> {
    const { items, ...rest } = feedDto;

    const feed = new FeedEntity({ ...rest });
    await this.feedRepo.save(feed);

    const images = items.map((item) => {
      const { media, ...rest } = item;
      return new ImageEntity({ ...rest, media: media.m, feed });
    });
    await this.imageRepo.save(images);
    return feed;
  }
}
