import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Index,
} from 'typeorm';
import { FeedEntity } from './feed.entity';

@Entity({ name: 'images' })
export class ImageEntity {
  constructor(obj: Partial<ImageEntity>) {
    Object.assign(this, obj);
  }
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => FeedEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_id' })
  feed: FeedEntity;
  @Column()
  title: string;
  @Column({ unique: true })
  link: string;
  @Column({ unique: true })
  media: string;
  @Column()
  date_taken: Date;
  @Column()
  description: string;
  @Column()
  published: Date;
  @Column()
  @Index()
  author: string;
  @Column()
  @Index()
  author_id: string;
  @Column()
  @Index()
  tags: string;
}
