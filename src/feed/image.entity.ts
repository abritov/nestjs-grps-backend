import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { FeedEntity } from './feed.entity';

@Entity()
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => FeedEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'feed_id' })
  feed: FeedEntity;
  @Column()
  title: string;
  @Column()
  link: string;
  @Column()
  media: string;
  @Column()
  date_taken: Date;
  @Column()
  description: string;
  @Column()
  published: Date;
  @Column()
  author: string;
  @Column()
  author_id: string;
  @Column()
  tags: string;
}
