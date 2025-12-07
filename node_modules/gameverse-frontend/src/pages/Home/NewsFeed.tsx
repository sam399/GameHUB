import React, { useEffect, useState } from 'react';
import ActivityCard from '../../components/feed/ActivityCard';
import NewsCard from '../../components/feed/NewsCard';
import { feedService, Activity, NewsItem, FeedResponse } from '../../services/feedService';
import { useSocket } from '../../contexts/SocketContext';
import { toast } from 'react-toastify';

type ActivityType = 'ACHIEVEMENT_UNLOCKED' | 'GAME_REVIEWED' | 'NEW_HIGHSCORE' | 'GAME_ADDED';
type SortBy = 'newest' | 'oldest' | 'friends_only';

const NewsFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<Activity[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('newest');
  const [showFriendsOnly, setShowFriendsOnly] = useState(false);
  
  const { socket } = useSocket();

  const activityTypes: { label: string; value: ActivityType | 'ALL' }[] = [
    { label: 'All Activities', value: 'ALL' },
    { label: 'Achievements', value: 'ACHIEVEMENT_UNLOCKED' },
    { label: 'Reviews', value: 'GAME_REVIEWED' },
    { label: 'Highscores', value: 'NEW_HIGHSCORE' },
    { label: 'Game Posts', value: 'GAME_ADDED' }
  ];

  const fetchFeed = async (currentPage = 1) => {
    try {
      setLoading(true);
      const data = await feedService.getFeed(currentPage, 10);
      
      if (currentPage === 1) {
        setActivities(data.activities);
      } else {
        setActivities(prev => [...prev, ...data.activities]);
      }
      
      setNews(data.news);
      setPage(currentPage);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error("Error fetching feed:", error);
      toast.error('Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...activities];

    // Filter by activity type
    if (selectedActivityType !== 'ALL') {
      result = result.filter(a => a.type === selectedActivityType);
    }

    // Filter by friends only (no visible way to detect in current schema, would need user relationship)
    // This is a placeholder for future enhancement

    // Search by game name or user name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.data.gameName?.toLowerCase().includes(term) ||
        a.user.username?.toLowerCase().includes(term)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    setFilteredActivities(result);
  }, [activities, searchTerm, selectedActivityType, sortBy, showFriendsOnly]);

  useEffect(() => {
    fetchFeed(1);
  }, []);

  // Listen for new activities (real-time updates)
  useEffect(() => {
    if (!socket) return;

    socket.on('activity_created', (newActivity: Activity) => {
      setActivities(prev => [newActivity, ...prev]);
      toast.info(`${newActivity.user.username} just ${newActivity.type.toLowerCase()}`);
    });

    return () => {
      socket.off('activity_created');
    };
  }, [socket]);

  const handleLoadMore = () => {
    fetchFeed(page + 1);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedActivityType('ALL');
    setSortBy('newest');
    setShowFriendsOnly(false);
  };

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="text-gray-400">Loading activities...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Left Column: Social Activity (Friends) */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Community Activity</h2>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-gray-900 p-4 rounded space-y-3">
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by game or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
          />

          {/* Filter Row */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {/* Activity Type Filter */}
            <select
              value={selectedActivityType}
              onChange={(e) => setSelectedActivityType(e.target.value as ActivityType | 'ALL')}
              className="px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 text-sm focus:border-blue-500 focus:outline-none"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="px-2 py-1 bg-gray-800 text-white rounded border border-gray-700 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>

            {/* Reset Button */}
            <button
              onClick={handleResetFilters}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Activities List */}
        {filteredActivities.length > 0 ? (
          <>
            {filteredActivities.map((act) => (
              <ActivityCard key={act._id} activity={act} />
            ))}
            
            {/* Load More Button */}
            {page < totalPages && (
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className="w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded transition"
              >
                {loading ? 'Loading...' : `Load More (${page}/${totalPages})`}
              </button>
            )}
            {page >= totalPages && activities.length > 0 && (
              <p className="text-center text-gray-500 mt-6">No more activities</p>
            )}
          </>
        ) : activities.length > 0 ? (
          <p className="text-center text-gray-400 py-8">No activities match your filters.</p>
        ) : (
          <p className="text-gray-400">No recent activity from friends.</p>
        )}
      </div>

      {/* Right Column: Global Gaming News */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-blue-400 mb-6">Trending News</h2>
        <div className="space-y-4">
          {news.length > 0 ? (
            news.map((item, index) => (
              <NewsCard key={index} news={item} />
            ))
          ) : (
            <p className="text-gray-500 text-sm">No trending news available</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default NewsFeed;