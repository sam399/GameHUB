import React from 'react';
import { Link } from 'react-router-dom';
import { ForumCategory } from '../../types';

interface CategoryCardProps {
  category: ForumCategory;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <div className="category-card">
      <Link to={`/forum/category/${category._id}`}>
        <div className="category-header" style={{ borderLeftColor: category.color }}>
          <div className="category-icon">{category.icon}</div>
          <div className="category-info">
            <h3 className="category-name">{category.name}</h3>
            <p className="category-description">{category.description}</p>
          </div>
        </div>
        
        <div className="category-stats">
          <div className="stat">
            <span className="stat-number">{category.threadCount}</span>
            <span className="stat-label">Threads</span>
          </div>
          <div className="stat">
            <span className="stat-number">{category.postCount}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
        
        <div className="category-footer">
          <span className="view-category">View Discussions →</span>
        </div>
      </Link>
    </div>
  );
};

export default CategoryCard;