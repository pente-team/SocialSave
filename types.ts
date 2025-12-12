export interface SocialPost {
  id: string;
  url: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'facebook' | 'unknown';
  author?: string;
  content?: string;
  hashtags?: string[];
  mediaType: 'video' | 'image' | 'text' | 'unknown';
  mediaUrl?: string; // Direct link if found
  thumbnailUrl?: string;
  likes?: string;
  timestamp?: string;
  analysis?: string; // AI summary
}

export interface AnalysisState {
  loading: boolean;
  error: string | null;
  data: SocialPost | null;
}

export enum Platform {
  Twitter = 'twitter',
  Instagram = 'instagram',
  TikTok = 'tiktok',
  YouTube = 'youtube',
  LinkedIn = 'linkedin',
  Facebook = 'facebook',
  Unknown = 'unknown'
}
