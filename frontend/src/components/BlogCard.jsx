import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiUser, FiImage, FiArrowRight, FiHeart, FiMessageSquare } from 'react-icons/fi';

const BACKEND_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const getImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith('http')) return filename;
  return `${BACKEND_URL}/uploads/${filename}`;
};

export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

/** Image with graceful fallback */
export const PostImage = ({ src, alt, height = '200px', style = {} }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div style={{
        width: '100%', height, background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#94a3b8', flexDirection: 'column', gap: '0.5rem',
        ...style,
      }}>
        <FiImage style={{ fontSize: '2rem' }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>No Image</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || 'Post cover'}
      style={{ width: '100%', height, objectFit: 'cover', display: 'block', ...style }}
      onError={() => setFailed(true)}
    />
  );
};

/** Skeleton card */
export const SkeletonCard = () => (
  <div style={{
    background: '#fff', border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-lg)', overflow: 'hidden',
    boxShadow: 'var(--shadow-card)',
  }}>
    <div className="skeleton" style={{ height: '200px', borderRadius: 0 }} />
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="skeleton" style={{ height: '13px', width: '28%' }} />
      <div className="skeleton" style={{ height: '18px', width: '82%' }} />
      <div className="skeleton" style={{ height: '13px', width: '95%' }} />
      <div className="skeleton" style={{ height: '13px', width: '65%' }} />
    </div>
  </div>
);

/** Blog card */
const BlogCard = ({ post, index = 0 }) => {
  const imgUrl = getImageUrl(post.image);

  return (
    <Link
      to={`/post/${post._id}`}
      className="blog-card"
      style={{ textDecoration: 'none', animationDelay: `${index * 0.05}s` }}
    >
      <PostImage src={imgUrl} alt={post.title} height="200px" />

      <div className="blog-card-body">
        <div className="blog-card-meta">
          <span className="badge">{post.category}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: 'var(--text-dim)', fontSize: '0.78rem' }}>
            {post.likesCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} title={`${post.likesCount} likes`}>
                <FiHeart style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fill: 'var(--accent-primary)' }} />
                {post.likesCount}
              </span>
            )}
            {post.commentCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }} title={`${post.commentCount} comments`}>
                <FiMessageSquare style={{ fontSize: '0.75rem' }} />
                {post.commentCount}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FiClock style={{ fontSize: '0.75rem' }} />
              {formatDate(post.createdAt)}
            </span>
          </div>
        </div>
        <h3 className="blog-card-title">{post.title}</h3>
        <p className="blog-card-excerpt">{post.content}</p>
        <div className="blog-card-footer">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <FiUser style={{ fontSize: '0.75rem' }} />
            {post.author?.name || 'Anonymous'}
          </span>
          <span style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.82rem',
          }}>
            Read More <FiArrowRight style={{ fontSize: '0.75rem' }} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
