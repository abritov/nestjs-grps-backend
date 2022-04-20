export interface Item {
  title: string;
  link: string;
  media: string;
  date_taken: Date;
  description: string;
  published: Date;
  author: string;
  author_id: string;
  tags: string;
}

export interface FeedEntity {
  title: string;
  link: string;
  description: string;
  modified: Date;
  generator: string;
  items: Item[];
}
