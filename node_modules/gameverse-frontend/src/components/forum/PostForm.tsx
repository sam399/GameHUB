import React, { useState } from 'react';
import { CreatePostData, ForumPost } from '../../types';

interface PostFormProps {
  threadId: string;
  parentPost?: ForumPost;
  onSubmit: (data: CreatePostData) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({
  threadId,
  parentPost,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      content,
      parentPost: parentPost?._id
    });
    setContent('');
  };

  return (
    <div className="post-form">
      <h4>{parentPost ? `Reply to ${parentPost.author.username}` : 'Write a Reply'}</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={parentPost ? `Reply to ${parentPost.author.username}...` : 'Write your reply...'}
            required
            rows={4}
            maxLength={2000}
          />
          <span className="char-count">{content.length}/2000</span>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button type="button" onClick={onCancel} disabled={loading}>
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting...' : parentPost ? 'Reply' : 'Post Reply'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostForm;