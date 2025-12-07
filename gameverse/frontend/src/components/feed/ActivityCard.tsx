import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface ActivityProps {
  activity: any; // Define strict interface based on your types
}

const ActivityCard: React.FC<ActivityProps> = ({ activity }) => {
  const getMessage = () => {
    switch (activity.type) {
      case 'ACHIEVEMENT_UNLOCKED':
        return <span>unlocked the <strong>{activity.data.achievementName}</strong> achievement in</span>;
      case 'GAME_REVIEWED':
        return <span>reviewed ({activity.data.reviewRating}/5)</span>;
      case 'NEW_HIGHSCORE':
        return <span>set a new high score of {activity.data.score} in</span>;
      default:
        return <span>played</span>;
    }
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-4 flex items-start gap-4 border border-gray-700">
      <img 
        src={activity.user.avatar || '/default-avatar.png'} 
        alt={activity.user.username} 
        className="w-10 h-10 rounded-full object-cover"
      />
      <div>
        <p className="text-gray-200 text-sm">
          <Link to={`/profile/${activity.user._id}`} className="font-bold text-blue-400 hover:underline">
            {activity.user.username}
          </Link>
          {' '}
          {getMessage()}
          {' '}
          <Link to={`/game/${activity.data.gameId}`} className="font-bold text-white hover:underline">
            {activity.data.gameName}
          </Link>
        </p>
        <span className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
};

export default ActivityCard;