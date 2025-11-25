import React, { useState, useEffect } from 'react';
import { Game } from '../../types';
import { libraryService } from '../../services/libraryService';

interface TrackGameButtonProps {
  game: Game;
  onTrack?: (status: string) => void;
}

const TrackGameButton: React.FC<TrackGameButtonProps> = ({ game, onTrack }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    checkTrackingStatus();
  }, [game._id]);

  const checkTrackingStatus = async () => {
    try {
      const response = await libraryService.getGameTracking(game._id);
      if (response.data.gameTracking) {
        setIsTracking(true);
        setCurrentStatus(response.data.gameTracking.status);
      }
    } catch (error) {
      // Game is not being tracked, which is fine
      setIsTracking(false);
      setCurrentStatus('');
    }
  };

  const handleTrackGame = async (status: string) => {
    setLoading(true);
    try {
      if (isTracking) {
        await libraryService.updateGameTracking(game._id, { status });
        setCurrentStatus(status);
      } else {
        await libraryService.trackGame(game._id, status);
        setIsTracking(true);
        setCurrentStatus(status);
      }
      onTrack?.(status);
      setShowDropdown(false);
    } catch (error) {
      console.error('Error tracking game:', error);
      alert('Failed to track game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = () => {
    if (!isTracking) return 'Add to Library';
    
    const statusMap: { [key: string]: string } = {
      'planning': 'Planning to Play',
      'playing': 'Currently Playing',
      'completed': 'Completed',
      'paused': 'Paused',
      'dropped': 'Dropped'
    };
    
    return statusMap[currentStatus] || 'Tracking';
  };

  const getStatusColor = () => {
    const colorMap: { [key: string]: string } = {
      'planning': '#6c757d',
      'playing': '#28a745',
      'completed': '#007bff',
      'paused': '#ffc107',
      'dropped': '#dc3545'
    };
    
    return colorMap[currentStatus] || '#6c757d';
  };

  return (
    <div className="track-game-button">
      <button 
        className="track-button"
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={loading}
        style={{ 
          backgroundColor: isTracking ? getStatusColor() : '#667eea',
          borderColor: isTracking ? getStatusColor() : '#667eea'
        }}
      >
        {loading ? '...' : getStatusDisplay()}
      </button>

      {showDropdown && (
        <div className="tracking-dropdown">
          <div className="dropdown-arrow"></div>
          <div className="dropdown-content">
            <h4>Track Game</h4>
            {[
              { value: 'planning', label: 'Planning to Play', color: '#6c757d' },
              { value: 'playing', label: 'Currently Playing', color: '#28a745' },
              { value: 'completed', label: 'Completed', color: '#007bff' },
              { value: 'paused', label: 'Paused', color: '#ffc107' },
              { value: 'dropped', label: 'Dropped', color: '#dc3545' }
            ].map(option => (
              <button
                key={option.value}
                className={`tracking-option ${currentStatus === option.value ? 'active' : ''}`}
                onClick={() => handleTrackGame(option.value)}
                style={{ 
                  backgroundColor: currentStatus === option.value ? option.color : 'transparent',
                  color: currentStatus === option.value ? 'white' : option.color,
                  borderColor: option.color
                }}
              >
                {option.label}
              </button>
            ))}
            
            {isTracking && (
              <button 
                className="tracking-option remove"
                onClick={async () => {
                  try {
                    await libraryService.removeFromLibrary(game._id);
                    setIsTracking(false);
                    setCurrentStatus('');
                    setShowDropdown(false);
                  } catch (error) {
                    console.error('Error removing from library:', error);
                    alert('Failed to remove from library. Please try again.');
                  }
                }}
              >
                Remove from Library
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackGameButton;