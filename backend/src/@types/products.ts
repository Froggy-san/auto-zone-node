export interface MoreDetail {
  title: string;
  description: string;
  table: { title: string; description: string }[];
}

export interface ProductImage {
  imageUrl: string;
  filename: string;
  isMain: boolean;
}
