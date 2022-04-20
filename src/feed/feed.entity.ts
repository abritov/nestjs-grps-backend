import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ImageEntity } from './image.entity';

@Entity()
export class FeedEntity {
  constructor(obj: Partial<FeedEntity>) {
    Object.assign(this, obj);
  }
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  title: string;
  @Column()
  link: string;
  @Column()
  description: string;
  @Column()
  modified: Date;
  @Column()
  generator: string;
  @OneToMany(() => ImageEntity, (image) => image.feed)
  images: ImageEntity[];
}
