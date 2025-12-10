import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';

const RecommendedGames = () => {
  const [games, setGames] = useState([]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await api.get('/recommendations');
        setGames(data.data);
        setReason(data.reason);
      } catch (error) {
        console.error("Error fetching recommendations");
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) return <div>Loading AI suggestions...</div>;
  if (games.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-6 mb-8 border border-purple-500 shadow-xl relative overflow-hidden">
      
      {/* Decorative Background Element */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-purple-500 rounded-full blur-3xl opacity-50"></div>

      <div className="flex items-center gap-2 mb-4 relative z-10">
        {/* Sparkle Icon SVG */}
        <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
        </svg>
        <h2 className="text-2xl font-bold text-white">Recommended For You</h2>
      </div>
      
      <p className="text-purple-200 text-sm mb-6 italic">
        {reason}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 relative z-10">
        {games.map((game: any) => (
          <Link to={`/game/${game._id}`} key={game._id} className="group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg shadow-lg">
              <img 
                src={game.coverImage} 
                alt={game.title} 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 text-white font-bold bg-purple-600 px-3 py-1 rounded-full text-sm">
                  View
                </span>
              </div>
            </div>
            <h3 className="text-white text-sm font-semibold mt-2 truncate">{game.title}</h3>
            <span className="text-xs text-gray-400">
              {typeof game.genre === 'string' ? game.genre.split(',')[0] : 
               Array.isArray(game.genre) ? game.genre[0] : 
               game.genre}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecommendedGames;