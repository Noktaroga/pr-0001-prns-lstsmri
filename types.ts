export interface Video {
  id: string;
  title: string;
  duration: string;
  category: string;
  views: number;
  rating: number;
  comments: number;
  sources: { quality: string; url: string }[];
  thumbnail?: string;
}

export interface Category {
  label: string;
  value: string;
}
