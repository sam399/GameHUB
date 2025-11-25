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
// Add these to your existing types

export interface Review {
  _id: string;
  user: {
    _id: string;
    username: string;
    profile: {
      avatar: string;
    };
  };
  game: string | Game;
  rating: number;
  title: string;
  content: string;
  likes: string[];
  dislikes: string[];
  helpful: number;
  isEdited: boolean;
  editedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  ratingDistribution: Array<{
    rating: number;
    count: number;
    percentage: number;
  }>;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface CreateReviewData {
  rating: number;
  title: string;
  content: string;
}

export interface ReviewReaction {
  likes: number;
  dislikes: number;
  helpful: number;
  userReaction: 'like' | 'dislike' | 'none';
}
// Add these to your existing types

export interface ForumCategory {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  order: number;
  isActive: boolean;
  threadCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumThread {
  _id: string;
  title: string;
  content: string;
  category: ForumCategory | string;
  author: User;
  isPinned: boolean;
  isLocked: boolean;
  views: number;
  postCount: number;
  lastPost?: {
    author: User;
    date: string;
  };
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumPost {
  _id: string;
  content: string;
  thread: string | ForumThread;
  author: User;
  parentPost?: ForumPost;
  likes: string[];
  isEdited: boolean;
  editedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumThreadsResponse {
  success: boolean;
  data: {
    threads: ForumThread[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface ForumThreadResponse {
  success: boolean;
  data: {
    thread: ForumThread;
    posts: ForumPost[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface CreateThreadData {
  title: string;
  content: string;
  tags?: string[];
}

export interface CreatePostData {
  content: string;
  parentPost?: string;
}
// Add these to your existing types

export interface Chat {
  _id: string;
  name?: string;
  isGroupChat: boolean;
  participants: User[];
  groupAdmin?: User;
  lastMessage?: Message;
  avatar?: string;
  displayName: string;
  displayAvatar: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: string | Chat;
  readBy: Array<{
    user: string | User;
    readAt: string;
  }>;
  messageType: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    url: string;
    filename: string;
    fileType: string;
    fileSize: number;
  }>;
  replyTo?: Message;
  isEdited: boolean;
  editedAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface CreateMessageData {
  content: string;
  replyTo?: string;
}

export interface SocketMessageData {
  chatId: string;
  message: Message;
  sender: User;
}

export interface TypingUser {
  userId: string;
  isTyping: boolean;
  username: string;
}
// Add these to your existing types

export interface Friend {
  user: User;
  since: string;
}

export interface FriendRequest {
  _id: string;
  from: User;
  to: User;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface FriendshipStatus {
  isFriend: boolean;
  hasPendingRequest: boolean;
  incomingRequest: string | null;
  outgoingRequest: string | null;
}

export interface UserWithFriendship extends User {
  friendshipStatus: FriendshipStatus;
}

export interface FriendsResponse {
  success: boolean;
  data: {
    friends: Friend[];
  };
}

export interface FriendRequestsResponse {
  success: boolean;
  data: {
    incoming: FriendRequest[];
    outgoing: FriendRequest[];
  };
}

export interface UsersSearchResponse {
  success: boolean;
  data: {
    users: UserWithFriendship[];
    totalPages: number;
    currentPage: number;
    total: number;
  };
}

export interface FriendSuggestionsResponse {
  success: boolean;
  data: {
    suggestions: User[];
  };
}
// Add these to your existing types

export interface Notification {
  _id: string;
  user: string;
  type: 'friend_request' | 'friend_request_accepted' | 'new_message' | 'forum_reply' | 'forum_mention' | 'game_recommendation' | 'event_reminder' | 'system_alert';
  title: string;
  message: string;
  data: {
    senderId?: User;
    chatId?: string;
    threadId?: string;
    postId?: string;
    gameId?: string;
    eventId?: string;
    customData?: any;
  };
  isRead: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    totalPages: number;
    currentPage: number;
    total: number;
    unreadCount: number;
  };
}

export interface NotificationStats {
  unreadCount: number;
  todayCount: number;
  totalCount: number;
  typeStats: Array<{
    _id: string;
    count: number;
  }>;
}