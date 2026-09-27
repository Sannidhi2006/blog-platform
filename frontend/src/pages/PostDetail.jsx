import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiEdit3, FiTrash2, FiArrowLeft, FiUser, FiClock, FiAlertCircle,
  FiMessageSquare, FiSend, FiX, FiTag, FiCheckCircle, FiHeart, FiEye, FiShare2
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';
import commentService from '../services/commentService';
import { getImageUrl, PostImage, formatDate } from '../components/BlogCard';

/* ── Confirm Dialog ───────────────────────────────── */
const ConfirmDialog = ({ title, message, onConfirm, onCancel, confirming }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 9999,
    background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    animation: 'fadeIn 0.15s ease',
  }}>
    <div style={{
      background: '#fff', borderRadius: 'var(--radius-lg)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      padding: '2rem', maxWidth: '440px', width: '100%',
      border: '1px solid var(--border-color)',
    }}>
      <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>🗑️</div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', marginBottom: '0.6rem', color: 'var(--text-main)' }}>
        {title || 'Confirm Deletion'}
      </h3>
      <p style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.55 }}>
        {message}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={onCancel}
          disabled={confirming}
          id="confirm-cancel-btn"
        >
          <FiX /> Cancel
        </button>
        <button
          className="btn btn-danger"
          style={{ flex: 1 }}
          onClick={onConfirm}
          disabled={confirming}
          id="confirm-delete-btn"
        >
          <FiTrash2 /> {confirming ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

/* ── Comment Item ─────────────────────────────────── */
const CommentItem = ({ comment, currentUser, onDelete, isDeleting }) => {
  const isCommentAuthor =
    currentUser &&
    (comment.author?._id === currentUser._id ||
      comment.author?._id === currentUser.id ||
      comment.author === currentUser._id ||
      comment.author === currentUser.id);

  const authorUsername = comment.author?.username || 'user';
  const authorName = comment.author?.name || authorUsername;

  return (
    <div
      id={`comment-${comment._id}`}
      style={{
        padding: '1.1rem 1.25rem',
        background: '#fff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-xs)',
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.45rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#fff',
              textTransform: 'uppercase',
              flexShrink: 0,
            }}
          >
            {authorName.charAt(0)}
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
            @{authorUsername}
          </span>
          {authorName && authorName !== authorUsername && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ({authorName})
            </span>
          )}
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
            <FiClock style={{ fontSize: '0.75rem' }} />
            {formatDate(comment.createdAt)}
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
          {comment.content}
        </p>
      </div>

      {isCommentAuthor && (
        <button
          className="btn btn-danger"
          id={`delete-comment-${comment._id}`}
          style={{ padding: '0.4rem 0.65rem', fontSize: '0.8rem', flexShrink: 0 }}
          onClick={() => onDelete(comment._id)}
          disabled={isDeleting}
          title="Delete your comment"
          aria-label="Delete comment"
        >
          <FiTrash2 />
        </button>
      )}
    </div>
  );
};

/* ── PostDetail ───────────────────────────────────── */
const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingPost, setDeletingPost] = useState(false);

  // Likes & Engagement state
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);

  // Related posts
  const [relatedPosts, setRelatedPosts] = useState([]);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState(null);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await postService.getPostById(id);
        const p = data.post;
        setPost(p);
        const lCount = p.likesCount ?? (Array.isArray(p.likes) ? p.likes.length : 0);
        setLikesCount(lCount);
        if (user && Array.isArray(p.likes)) {
          const uId = (user._id || user.id)?.toString();
          setIsLiked(p.likes.some((item) => (item?._id || item)?.toString() === uId));
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Post not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user]);

  // Fetch related posts from real backend API
  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const data = await postService.getRelatedPosts(id);
        setRelatedPosts(data.posts || []);
      } catch {
        // Non-fatal
      }
    };
    if (id) fetchRelated();
  }, [id]);

  // Fetch comments from real backend API
  useEffect(() => {
    const fetchComments = async () => {
      setCommentsLoading(true);
      try {
        const data = await commentService.getComments(id);
        setComments(data.comments || []);
      } catch {
        // Non-fatal
      } finally {
        setCommentsLoading(false);
      }
    };
    fetchComments();
  }, [id]);

  // Toggle Like handler
  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      toast.info('Please log in to like this post.');
      navigate('/login', { state: { from: { pathname: `/post/${id}` } } });
      return;
    }
    if (liking) return;
    setLiking(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const data = await postService.toggleLike(id);
      setIsLiked(data.liked);
      setLikesCount(data.likesCount);
      toast.success(data.liked ? 'Added to liked posts! ❤️' : 'Removed from liked posts');
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(err.response?.data?.message || 'Failed to update like status');
    } finally {
      setLiking(false);
    }
  };

  // Copy share link
  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  // Delete Post handler
  const handleDeletePost = async () => {
    setDeletingPost(true);
    try {
      await postService.deletePost(id);
      toast.success('Article deleted successfully.');
      navigate('/', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete post';
      setError(msg);
      toast.error(msg);
      setDeleteConfirmOpen(false);
      setDeletingPost(false);
    }
  };

  // Add Comment handler (logged-in only)
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    setCommentError('');
    setCommentSuccess('');
    try {
      const data = await commentService.createComment(id, newComment.trim());
      setComments((prev) => [data.comment, ...prev]);
      setNewComment('');
      toast.success('Comment posted!');
      setCommentSuccess('Comment added successfully!');
      setTimeout(() => setCommentSuccess(''), 2500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to post comment';
      setCommentError(msg);
      toast.error(msg);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Delete Comment handler (author only)
  const handleDeleteComment = async (commentId) => {
    setDeletingCommentId(commentId);
    setCommentError('');
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete comment';
      setCommentError(msg);
      toast.error(msg);
    } finally {
      setDeletingCommentId(null);
    }
  };

  /* Loading State */
  if (loading) {
    return (
      <div className="page-container-sm">
        <div className="skeleton" style={{ height: '380px', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: '32px', width: '70%', marginBottom: '1rem' }} />
        <div className="skeleton" style={{ height: '18px', width: '40%', marginBottom: '2rem' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: '14px', marginBottom: '0.75rem' }} />
        ))}
      </div>
    );
  }

  /* Error State */
  if (error || !post) {
    return (
      <div className="page-container-sm" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>😕</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
          Post Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'This post does not exist.'}</p>
        <Link to="/" className="btn btn-secondary">
          <FiArrowLeft /> Back to Home
        </Link>
      </div>
    );
  }

  const isAuthor = user && (post.author?._id === user._id || post.author?._id === user.id);
  const imgUrl = getImageUrl(post.image);

  return (
    <div className="page-container-sm">
      <Link to="/" className="btn btn-secondary" style={{ marginBottom: '1.5rem', display: 'inline-flex' }}>
        <FiArrowLeft /> Back to Home
      </Link>

      {/* Main Article Card */}
      <div
        style={{
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          marginBottom: '2rem',
        }}
      >
        {/* Cover Image */}
        {imgUrl && <PostImage src={imgUrl} alt={post.title} height="420px" />}

        <div style={{ padding: '2rem' }}>
          {/* Metadata */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className="badge">
              <FiTag style={{ fontSize: '0.7rem', marginRight: '0.3rem' }} />
              {post.category}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <FiClock style={{ fontSize: '0.8rem' }} />
              {formatDate(post.createdAt)}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <FiUser style={{ fontSize: '0.8rem' }} />
              {post.author?.name}
              {post.author?.username && <span>(@{post.author.username})</span>}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>
              <FiEye style={{ fontSize: '0.8rem' }} />
              {post.views || 1} {post.views === 1 ? 'view' : 'views'}
            </span>
          </div>

          {/* Title */}
          <h1
            id="post-title"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              lineHeight: 1.3,
              color: 'var(--text-main)',
              marginBottom: '1.5rem',
            }}
          >
            {post.title}
          </h1>

          {/* Author Controls */}
          {isAuthor && (
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem',
                padding: '0.85rem 1.25rem',
                background: 'var(--accent-light)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(236,72,153,0.15)',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 600, flex: 1 }}>
                ✏️ You are the author of this post
              </span>
              <Link
                to={`/edit/${post._id}`}
                className="btn btn-secondary"
                id="edit-post-btn"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              >
                <FiEdit3 /> Edit
              </Link>
              <button
                className="btn btn-danger"
                id="delete-post-btn"
                style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={deletingPost}
              >
                <FiTrash2 /> {deletingPost ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          )}

          {error && <div className="alert alert-error"><FiAlertCircle />{error}</div>}

          {/* Content */}
          <div
            style={{
              fontSize: '1.05rem',
              lineHeight: 1.85,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-wrap',
              paddingTop: '1.25rem',
              paddingBottom: '1.5rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            {post.content}
          </div>

          {/* Engagement Bar (Like, Comments, Share) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              paddingTop: '1.25rem',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                id="like-post-btn"
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleToggleLike}
                disabled={liking}
                title={isAuthenticated ? (isLiked ? 'Unlike this post' : 'Like this post') : 'Log in to like'}
              >
                <FiHeart style={{ fontSize: '1rem', fill: isLiked ? '#ec4899' : 'transparent', transition: 'all 0.2s' }} />
                <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
              </button>

              <a
                href="#comments-section"
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', borderRadius: '999px' }}
              >
                <FiMessageSquare /> {comments.length} Comments
              </a>
            </div>

            <button
              onClick={handleShare}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem', padding: '0.5rem 0.9rem', borderRadius: '999px' }}
              title="Copy link to clipboard"
            >
              <FiShare2 /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Related Posts Section */}
      {relatedPosts.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>More in {post.category}</span>
            </h3>
            <Link to={`/?category=${encodeURIComponent(post.category)}`} style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              View all →
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {relatedPosts.map((rel) => {
              const relImg = getImageUrl(rel.image);
              return (
                <Link
                  key={rel._id}
                  to={`/post/${rel._id}`}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.2s ease',
                    boxShadow: 'var(--shadow-xs)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
                >
                  {relImg ? (
                    <div style={{ height: '130px', overflow: 'hidden' }}>
                      <img src={relImg} alt={rel.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div style={{ height: '130px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                      No Image
                    </div>
                  )}
                  <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <span className="badge" style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '0.15rem 0.5rem', marginBottom: '0.4rem' }}>
                      {rel.category}
                    </span>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                      {rel.title}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 'auto' }}>
                      By {rel.author?.name || 'Author'} • {formatDate(rel.createdAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div
        id="comments-section"
        style={{
          background: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          padding: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: 'var(--text-main)',
            }}
          >
            <FiMessageSquare style={{ color: 'var(--accent-primary)' }} />
            Comments ({commentsLoading ? '…' : comments.length})
          </h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Real-time Discussion
          </span>
        </div>

        {/* Feedback alerts */}
        {commentError && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            <FiAlertCircle style={{ flexShrink: 0 }} /> {commentError}
          </div>
        )}
        {commentSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            <FiCheckCircle style={{ flexShrink: 0 }} /> {commentSuccess}
          </div>
        )}

        {/* Comment Form for logged-in users only */}
        {isAuthenticated ? (
          <form onSubmit={handleAddComment} style={{ marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <textarea
                id="comment-input"
                className="form-input form-textarea"
                placeholder="Write a constructive comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                style={{ minHeight: '90px', resize: 'vertical' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  id="comment-submit-btn"
                  disabled={submittingComment || !newComment.trim()}
                >
                  {submittingComment ? 'Posting…' : <><FiSend /> Post Comment</>}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div
            style={{
              padding: '1.25rem',
              marginBottom: '1.75rem',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(236,72,153,0.15)',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <span>You must be logged in to participate in comments.</span>
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Log In to Comment
            </Link>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <div className="spinner" />
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '0.95rem' }}>No comments yet. Be the first to start the conversation!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={user}
                onDelete={handleDeleteComment}
                isDeleting={deletingCommentId === comment._id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <ConfirmDialog
          message={`Are you sure you want to permanently delete "${post.title}"? This action cannot be undone and all associated comments will be removed.`}
          onConfirm={handleDeletePost}
          onCancel={() => setDeleteConfirmOpen(false)}
          confirming={deletingPost}
        />
      )}
    </div>
  );
};

export default PostDetail;
