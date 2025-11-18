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