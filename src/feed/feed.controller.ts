import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { FeedService } from './feed.service';
import { Observable } from 'rxjs';
import { bufferCount, map, mergeMap } from 'rxjs/operators';
import { GetImageStreamRequestDto } from './proto/dto';
import { ImageDto } from './feed.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @GrpcStreamMethod('FeedService', 'GetImageStream')
  getImageStream(request: GetImageStreamRequestDto): Observable<ImageDto[]> {
    let data$: Observable<ImageDto[]> = this.feedService.imageUpdates$;
    if (request.tags != '') {
      data$ = data$.pipe(
        map((images) => images.filter((_) => _.tags === request.tags)),
      );
    }
    if (request.limit) {
      data$ = data$.pipe(
        mergeMap((_) => _),
        bufferCount(request.limit),
      );
    }
    return data$;
  }
}
