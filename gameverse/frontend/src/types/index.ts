export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    avatar: string;
    bio: string;
    gamingPreferences: Array<{
      genre: string;
      platform: string;
    }>;
  };
  connectedAccounts: {
    steam: string;
    epic: string;
    xbox: string;
    playstation: string;
  };
  friends: string[];
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
// Add these to your existing types

export interface Game {
  _id: string;
  title: string;
  description: string;
  genre: string[];
  platforms: string[];
  developer: string;
  publisher: string;
  releaseDate: string;
  rating: {
    average: number;
    count: number;
  };
  images: {
    cover: string;
    screenshots: string[];
  };
  website: string;
  price: number;
  isFree: boolean;
  tags: string[];
  systemRequirements?: {
    minimum: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
    recommended: {
      os: string;
      processor: string;
      memory: string;
      graphics: string;
      storage: string;
    };
  };
  featured: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamesResponse {
  success: boolean;
  data: {
    games: Game[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface GameFilters {
  page?: number;
  limit?: number;
  genre?: string;
  platform?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}