import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import RecommendedGames from '../../components/home/RecommendedGames';

interface Game {
  _id: string;
  title: string;
  coverImage: string;
  genre: string;
  rating: number;
}

const CinematicHome: React.FC = () => {
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendingGames();
  }, []);

  const fetchTrendingGames = async () => {
    try {
      const { data } = await api.get('/games?sort=-rating&limit=8');
      setTrendingGames(data.games || []);
    } catch (error) {
      console.error('Error fetching trending games:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black overflow-hidden" style={{ paddingTop: '80px' }}>
      {/* Hero Section - Above the Fold */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-[url('/gaming-bg.jpg')] bg-cover bg-center opacity-20">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/50 to-black"></div>
        </div>
        
        {/* Particle Effect Overlay */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          {/* Glassmorphism Card */}
          <div className="backdrop-blur-xl bg-white/5 rounded-3xl p-12 border border-purple-500/20 shadow-2xl">
            <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Your Universe
            </h1>
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg">
              Your Legacy
            </h2>
            <p className="text-3xl md:text-4xl font-light text-purple-300 mb-12 tracking-wider">
              Press Start
            </p>

            {/* CTA Buttons with Neon Glow */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                to="/register"
                className="px-10 py-5 text-xl font-bold rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:shadow-purple-500/50 hover:scale-110 transition-all duration-300 neon-glow-purple"
                style={{ boxShadow: '0 0 30px #7c3aed, 0 0 60px #7c3aed' }}
              >
                ⚔️ Spawn In
              </Link>
              <Link
                to="/games"
                className="px-10 py-5 text-xl font-bold rounded-full border-2 border-purple-400 text-purple-300 hover:bg-purple-500/20 hover:border-purple-300 hover:scale-110 transition-all duration-300 backdrop-blur-sm"
                style={{ boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)' }}
              >
                🔍 Scout Games
              </Link>
            </div>
          </div>

          {/* Floating Stats HUD */}
          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { label: 'Players', value: '10K+', icon: '👥' },
              { label: 'Games', value: '500+', icon: '🎮' },
              { label: 'Events', value: '50+', icon: '🏆' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="backdrop-blur-md bg-white/10 rounded-xl p-4 border border-purple-500/30 hover:border-purple-400 transition-all duration-300"
                style={{ boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)' }}
              >
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-purple-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-purple-400 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Section 2: "Current Meta" - Trending Games */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4" style={{ textShadow: '0 0 20px #7c3aed' }}>
              🔥 Current Meta
            </h2>
            <p className="text-xl text-purple-300">Trending Games Everyone's Playing</p>
          </div>

          {/* 3D Tilt Game Carousel */}
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-[280px] h-[400px] rounded-2xl bg-gray-800/50 animate-pulse backdrop-blur-sm"
                />
              ))
            ) : (
              trendingGames.map((game) => (
                <Link
                  key={game._id}
                  to={`/game/${game._id}`}
                  className="group relative min-w-[280px] h-[400px] rounded-2xl overflow-hidden transform transition-all duration-500 hover:scale-110 hover:-rotate-2"
                  style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  {/* Game Cover */}
                  <img
                    src={game.coverImage}
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Glassmorphism Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 backdrop-blur-md bg-black/40 border-t border-purple-500/30">
                      <h3 className="text-xl font-bold text-white mb-2">{game.title}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-purple-300">{game.genre}</span>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-white font-bold">{game.rating?.toFixed(1) || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Neon Border Glow */}
                  <div
                    className="absolute inset-0 border-2 border-purple-500 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300"
                    style={{ boxShadow: '0 0 30px #7c3aed' }}
                  ></div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section 3: AI Power Showcase */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="backdrop-blur-xl bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-3xl p-12 border border-purple-500/30 relative overflow-hidden">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #7c3aed 10px, #7c3aed 11px)',
              }}></div>
            </div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              {/* AI Mascot/Visual */}
              <div className="text-center">
                <div className="text-9xl mb-4 animate-bounce">🤖</div>
                <div className="text-6xl animate-pulse">🎮</div>
              </div>

              {/* AI Feature Content */}
              <div>
                <h2 className="text-5xl font-black text-white mb-6" style={{ textShadow: '0 0 20px #ec4899' }}>
                  Neural Engine
                </h2>
                <p className="text-2xl text-purple-200 mb-8 leading-relaxed">
                  Our AI knows what you want to play{' '}
                  <span className="text-pink-400 font-bold">before you do</span>.
                </p>
                <ul className="space-y-4 text-lg text-purple-300">
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">✨</span>
                    <span>Genre-based preference learning</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <span>Personalized recommendations</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="text-2xl">🚀</span>
                    <span>Discover hidden gems</span>
                  </li>
                </ul>
                <Link
                  to="/recommendations"
                  className="inline-block mt-8 px-8 py-4 text-lg font-bold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:scale-110 transition-all duration-300"
                  style={{ boxShadow: '0 0 30px #ec4899' }}
                >
                  🧠 Try Neural Picks
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Games Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <RecommendedGames />
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl font-black text-center text-white mb-16" style={{ textShadow: '0 0 20px #7c3aed' }}>
            ⚡ Power-Ups
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🏆', title: 'Leaderboards', desc: 'Compete globally, dominate locally' },
              { icon: '🎯', title: 'Achievements', desc: 'Unlock badges, earn respect' },
              { icon: '👥', title: 'Social', desc: 'Squad up, level up together' },
              { icon: '💬', title: 'Real-Time Chat', desc: 'No lag, just talk' },
              { icon: '🎪', title: 'Events', desc: 'Tournaments that matter' },
              { icon: '📊', title: 'Track Stats', desc: 'Your journey, visualized' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="backdrop-blur-lg bg-white/5 rounded-2xl p-8 border border-purple-500/20 hover:border-purple-400 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
                style={{ boxShadow: '0 0 20px rgba(124, 58, 237, 0.2)' }}
              >
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-purple-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer - Game Over Screen */}
      <footer className="relative py-12 px-4 border-t border-purple-500/30 backdrop-blur-xl bg-black/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="text-6xl font-black text-purple-400 mb-4 animate-pulse">
            GAME OVER?
          </div>
          <p className="text-2xl text-purple-300 mb-8">No, just the footer.</p>
          
          <div className="flex justify-center gap-8 mb-8">
            <Link to="/about" className="text-purple-400 hover:text-purple-300 transition-colors">
              About
            </Link>
            <Link to="/privacy" className="text-purple-400 hover:text-purple-300 transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="text-purple-400 hover:text-purple-300 transition-colors">
              Terms
            </Link>
            <Link to="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
              Contact
            </Link>
          </div>

          <div className="text-purple-500/50 text-sm">
            © 2025 GameVerse. Built with ❤️ for gamers.
          </div>
        </div>
      </footer>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          height: 8px;
        }
        .scrollbar-thumb-purple-600::-webkit-scrollbar-thumb {
          background-color: #7c3aed;
          border-radius: 4px;
        }
        .scrollbar-track-gray-800::-webkit-scrollbar-track {
          background-color: #1f2937;
        }
      `}</style>
    </div>
  );
};

export default CinematicHome;
