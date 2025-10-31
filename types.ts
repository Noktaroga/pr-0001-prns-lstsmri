
export interface Video {
  id: string;
  title: string;
  duration: string;
  category: string;
  categoryLabel: string;
  views: number;
  rating: number;
  total_votes: number;
  good_votes: number;
  bad_votes: number;
  sources: { quality: string; url: string }[];
  thumbnail?: string;
}

export interface Category {
  label: string;
  value: string;
}
