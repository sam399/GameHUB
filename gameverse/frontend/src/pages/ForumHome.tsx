import React, { useState, useEffect } from 'react';
import { ForumCategory } from '../types';
import { forumService } from '../services/forumService';
import CategoryCard from '../components/forum/CategoryCard';

const ForumHome: React.FC = () => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await forumService.getCategories();
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading forum categories...</div>;
  }

  return (
    <div className="forum-home">
      <div className="forum-header">
        <h1>Community Forum</h1>
        <p>Join discussions, share tips, and connect with fellow gamers</p>
      </div>

      <div className="categories-grid">
        {categories.map(category => (
          <CategoryCard key={category._id} category={category} />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="no-categories">
          <h3>No forum categories yet</h3>
          <p>Forum categories will be available soon!</p>
        </div>
      )}
    </div>
  );
};

export default ForumHome;