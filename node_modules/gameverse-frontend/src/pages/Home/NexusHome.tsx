import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ParallaxHero } from '../../components/nexus/ParallaxHero';
import { NexusGameCard } from '../../components/games/NexusGameCard';
import api from '../../services/api';
import RecommendedGames from '../../components/home/RecommendedGames';
import { Game } from '../../types';
import './NexusHome.css';

const NexusHome: React.FC = () => {
  const [featuredGame, setFeaturedGame] = useState<Game | null>(null);
  const [trendingGames, setTrendingGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const { data } = await api.get('/games?sort=-rating&limit=12');
      const games = data.games || [];
      
      // Set first featured game or highest rated
      const featured = games.find((g: Game) => g.featured) || games[0];
      setFeaturedGame(featured);
      
      // Set remaining as trending
      setTrendingGames(games.slice(0, 8));
    } catch (error) {
      console.error('Error fetching games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayClick = () => {
    if (featuredGame) {
      navigate(`/games/${featuredGame._id}`);
    }
  };

  if (loading) {
    return (
      <div className="nexus-home-loading">
        <div className="nexus-loading" />
        <p>Initializing Nexus Interface...</p>
      </div>
    );
  }

  return (
    <div className="nexus-home">
      {/* Hero Section with Featured Game */}
      {featuredGame && (
        <ParallaxHero
          game={{
            title: featuredGame.title,
            description: featuredGame.description,
            image: featuredGame.images.banner || featuredGame.images.cover,
            videoUrl: featuredGame.trailerUrl || featuredGame.videoUrl
          }}
          onPlayClick={handlePlayClick}
        />
      )}

      {/* Stats Section */}
      <section className="nexus-stats-section">
        <div className="nexus-container">
          <div className="stats-grid">
            {[
              { label: 'Active Players', value: '10K+', icon: '👥', color: 'cyan' },
              { label: 'Game Library', value: '500+', icon: '🎮', color: 'magenta' },
              { label: 'Live Events', value: '50+', icon: '🏆', color: 'cyan' },
              { label: 'Communities', value: '100+', icon: '💬', color: 'magenta' }
            ].map((stat, idx) => (
              <div key={idx} className={`stat-card stat-card-${stat.color}`}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-glow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Games Section */}
      <section className="nexus-trending-section">
        <div className="nexus-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">🔥</span>
              <span className="title-text">Trending Now</span>
              <div className="title-line" />
            </h2>
            <p className="section-subtitle">
              Discover the hottest games in the nexus
            </p>
          </div>

          <div className="games-carousel">
            <div className="games-grid">
              {trendingGames.map((game) => (
                <NexusGameCard key={game._id} game={game} />
              ))}
            </div>
          </div>

          <div className="section-cta">
            <Link to="/games" className="nexus-button nexus-button-primary">
              <span>Explore Full Library</span>
              <span className="button-arrow">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="nexus-features-section">
        <div className="nexus-container">
          <div className="section-header">
            <h2 className="section-title">
              <span className="title-icon">⚡</span>
              <span className="title-text">Nexus Features</span>
              <div className="title-line" />
            </h2>
          </div>

          <div className="features-grid">
            {[
              {
                icon: '🎯',
                title: 'Smart Matching',
                description: 'AI-powered game recommendations based on your play style',
                color: 'cyan'
              },
              {
                icon: '🌐',
                title: 'Cross-Platform',
                description: 'Play anywhere, on any device, seamlessly',
                color: 'magenta'
              },
              {
                icon: '🏅',
                title: 'Achievements',
                description: 'Unlock badges and climb the global leaderboards',
                color: 'cyan'
              },
              {
                icon: '💬',
                title: 'Live Chat',
                description: 'Connect with gamers in real-time communities',
                color: 'magenta'
              },
              {
                icon: '📰',
                title: 'Activity Feed',
                description: 'Stay updated with friends and trending content',
                color: 'cyan'
              },
              {
                icon: '🎪',
                title: 'Events',
                description: 'Join tournaments and special gaming events',
                color: 'magenta'
              }
            ].map((feature, idx) => (
              <div key={idx} className={`feature-card feature-card-${feature.color}`}>
                <div className="feature-icon-wrapper">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-icon-glow" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-border" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended Games (if user is logged in) */}
      <section className="nexus-recommended-section">
        <div className="nexus-container">
          <RecommendedGames />
        </div>
      </section>

      {/* CTA Section */}
      <section className="nexus-cta-section">
        <div className="nexus-container">
          <div className="cta-content">
            <h2 className="cta-title">
              Ready to Enter the Nexus?
            </h2>
            <p className="cta-description">
              Join thousands of gamers in the ultimate gaming universe
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="nexus-button nexus-button-primary nexus-button-large">
                <span className="button-icon">⚔️</span>
                <span>Create Account</span>
              </Link>
              <Link to="/games" className="nexus-button nexus-button-secondary nexus-button-large">
                <span className="button-icon">🔍</span>
                <span>Browse Games</span>
              </Link>
            </div>
          </div>
          <div className="cta-glow-left" />
          <div className="cta-glow-right" />
        </div>
      </section>
    </div>
  );
};

export default NexusHome;
