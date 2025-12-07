import api from './api';

export interface Activity {
  _id: string;
  user: {
    _id: string;
    username: string;
    profile: { avatar: string };
  };
  type: 'ACHIEVEMENT_UNLOCKED' | 'GAME_REVIEWED' | 'NEW_HIGHSCORE' | 'GAME_ADDED';
  data: {
    gameId: string;
    gameName: string;
    achievementName?: string;
    reviewRating?: number;
    score?: number;
  };
  visibility: 'PUBLIC' | 'FRIENDS_ONLY' | 'PRIVATE';
  createdAt: string;
}

export interface NewsItem {
  type: 'EXTERNAL_NEWS';
  title: string;
  image: string;
  link: string;
  createdAt: string;
}

export interface FeedResponse {
  success: boolean;
  activities: Activity[];
  news: NewsItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const feedService = {
  async getFeed(page = 1, limit = 10): Promise<FeedResponse> {
    const response = await api.get('/feed', { params: { page, limit } });
    return response.data;
  }
};
