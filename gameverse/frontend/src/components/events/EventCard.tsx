import React from 'react';
import axios from 'axios';
import { format } from 'date-fns';

interface EventCardProps {
  event: any;
  refreshEvents: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, refreshEvents }) => {
  
  const handleJoin = async () => {
    try {
      await axios.post(`/api/events/${event._id}/join`);
      alert('Successfully registered!');
      refreshEvents(); // Reload list to update participant count
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error joining event');
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 hover:border-purple-500 transition">
      <div className="bg-purple-900 p-4">
        <h3 className="text-xl font-bold text-white">{event.title}</h3>
        <p className="text-purple-200 text-sm">{event.game.title} • {event.eventType}</p>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-300">
            📅 {format(new Date(event.startTime), 'MMM d, h:mm a')}
          </span>
          <span className="text-gray-300">
            👥 {event.participants.length} / {event.maxParticipants} Players
          </span>
        </div>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{event.description}</p>
        
        <button 
          onClick={handleJoin}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
          disabled={event.participants.length >= event.maxParticipants}
        >
          {event.participants.length >= event.maxParticipants ? 'Full' : 'Join Event'}
        </button>
      </div>
    </div>
  );
};

export default EventCard;