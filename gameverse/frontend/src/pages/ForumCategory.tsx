import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ForumCategory, ForumThread } from '../types';
import { forumService } from '../services/forumService';
import { useAuth } from '../contexts/AuthContext';
import ThreadCard from '../components/forum/ThreadCard';
import ThreadForm from '../components/forum/ThreadForm';
import { CreateThreadData } from '../types';

const ForumCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();
  
  const [category, setCategory] = useState<ForumCategory | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showThreadForm, setShowThreadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (categoryId) {
      loadCategoryAndThreads(categoryId);
    }
  }, [categoryId]);

  const loadCategoryAndThreads = async (catId: string) => {
    setLoading(true);
    try {
      const [categoriesResponse, threadsResponse] = await Promise.all([
        forumService.getCategories(),
        forumService.getThreadsByCategory(catId)
      ]);
      
      const foundCategory = categoriesResponse.data.categories.find(
        cat => cat._id === catId
      );
      
      setCategory(foundCategory || null);
      setThreads(threadsResponse.data.threads);
    } catch (error) {
      console.error('Error loading category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (threadData: CreateThreadData) => {
    if (!categoryId) return;
    
    setSubmitting(true);
    try {
      await forumService.createThread(categoryId, threadData);
      await loadCategoryAndThreads(categoryId);
      setShowThreadForm(false);
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Error creating thread. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading category...</div>;
  }

  if (!category) {
    return (
      <div className="error">
        <h2>Category not found</h2>
        <Link to="/forum">Back to Forum</Link>
      </div>
    );
  }

  return (
    <div className="forum-category">
      <div className="category-header">
        <div className="breadcrumb">
          <Link to="/forum">Forum</Link> / <span>{category.name}</span>
        </div>
        
        <div className="category-info">
          <div className="category-icon" style={{ color: category.color }}>
            {category.icon}
          </div>
          <div>
            <h1>{category.name}</h1>
            <p>{category.description}</p>
          </div>
        </div>
        
        <div className="category-stats-large">
          <div className="stat">
            <span className="stat-number">{category.threadCount}</span>
            <span className="stat-label">Threads</span>
          </div>
          <div className="stat">
            <span className="stat-number">{category.postCount}</span>
            <span className="stat-label">Posts</span>
          </div>
        </div>
      </div>

      <div className="category-actions">
        {user && (
          <button 
            className="new-thread-btn"
            onClick={() => setShowThreadForm(true)}
          >
            + New Thread
          </button>
        )}
      </div>

      {showThreadForm && (
        <div className="thread-form-section">
          <ThreadForm
            categoryId={categoryId!}
            onSubmit={handleCreateThread}
            onCancel={() => setShowThreadForm(false)}
            loading={submitting}
          />
        </div>
      )}

      <div className="threads-list">
        {threads.length === 0 ? (
          <div className="no-threads">
            <h3>No threads yet</h3>
            <p>Be the first to start a discussion in this category!</p>
            {user && !showThreadForm && (
              <button 
                onClick={() => setShowThreadForm(true)}
                className="start-discussion-btn"
              >
                Start Discussion
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="threads-header">
              <h2>Threads</h2>
              <span className="threads-count">{threads.length} threads</span>
            </div>
            
            {threads.map(thread => (
              <ThreadCard key={thread._id} thread={thread} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default ForumCategoryPage;