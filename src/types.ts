export interface BannerStats {
  total: number;
  recent: Array<{
    id: number;
    timestamp: string;
    user_photo_name: string;
    banner_type: string;
  }>;
}

export interface BannerConfig {
  headline: string;
  subHeadline: string;
  accentColor: string;
}
