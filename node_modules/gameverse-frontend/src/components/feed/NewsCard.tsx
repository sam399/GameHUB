import React from 'react';
import { NewsItem } from '../../services/feedService';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  return (
    <a
      href={news.link}
      target="_blank"
      rel="noreferrer"
      className="bg-gray-900 p-3 rounded hover:bg-gray-800 transition cursor-pointer block"
    >
      {news.image && (
        <img
          src={news.image}
          alt={news.title}
          className="w-full h-32 object-cover rounded mb-2"
        />
      )}
      <h3 className="font-semibold text-white text-sm line-clamp-2">{news.title}</h3>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(news.createdAt).toLocaleDateString()}
      </p>
    </a>
  );
};

export default NewsCard;
