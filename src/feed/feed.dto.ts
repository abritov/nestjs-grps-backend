export interface ImageDto {
  title: string;
  link: string;
  media: {
    m: string;
  };
  date_taken: Date;
  description: string;
  published: Date;
  author: string;
  author_id: string;
  tags: string;
}

export interface FeedDto {
  title: string;
  link: string;
  description: string;
  modified: Date;
  generator: string;
  items: ImageDto[];
}
