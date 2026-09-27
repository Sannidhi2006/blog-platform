import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';
import userService from '../services/userService';
import { getImageUrl, PostImage, formatDate } from '../components/BlogCard';
import {
  FiBookOpen,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiClock,
  FiTag,
  FiAlertCircle,
  FiCheckCircle,
  FiX,
} from 'react-icons/fi';

/* ── Confirm Deletion Modal ───────────────────────── */
const ConfirmDeleteModal = ({ title, onConfirm, onCancel, deleting }) => (
  <div
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      animation: 'fadeIn 0.15s ease',
    }}
  >
    <div
      style={{
        background: '#fff',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
        padding: '2rem',
        maxWidth: '440px',
        width: '100%',
        border: '1px solid var(--border-color)',
      }}
    >
      <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.75rem' }}>🗑️</div>
      <h3
        style={{
          fontSize: '1.2rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.6rem',
          color: 'var(--text-main)',
        }}
      >
        Delete Article
      </h3>
      <p
        style={{
          color: 'var(--text-muted)',
          textAlign: 'center',
          fontSize: '0.9rem',
          marginBottom: '1.75rem',
          lineHeight: 1.55,
        }}
      >
        Are you sure you want to permanently delete <strong>"{title}"</strong>? This will remove the article and all its comments.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          className="btn btn-secondary"
          style={{ flex: 1 }}
          onClick={onCancel}
          disabled={deleting}
          id="cancel-delete-modal-btn"
        >
          <FiX /> Cancel
        </button>
        <button
          className="btn btn-danger"
          style={{ flex: 1 }}
          onClick={onConfirm}
          disabled={deleting}
          id="confirm-delete-modal-btn"
        >
          <FiTrash2 /> {deleting ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

const MyBlogs = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete modal state
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const userId = user?._id || user?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchMyPosts = async () => {
      try {
        setLoading(true);
        setError('');
        // Call GET /api/users/:id/posts
        const data = await userService.getUserPosts(userId);
        setPosts(data.posts || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load your posts');
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, [userId]);

  const handleDeletePost = async () => {
    if (!postToDelete) return;
    setDeleting(true);
    setError('');
    try {
      await postService.deletePost(postToDelete._id);
      setPosts((prev) => prev.filter((p) => p._id !== postToDelete._id));
      toast.success(`"${postToDelete.title}" was deleted.`);
      setSuccessMsg(`"${postToDelete.title}" was deleted successfully.`);
      setPostToDelete(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to delete post';
      setError(msg);
      toast.error(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1
            id="my-blogs-heading"
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
            }}
          >
            <FiBookOpen style={{ color: 'var(--accent-primary)' }} /> My Articles
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            {loading ? 'Loading…' : `${posts.length} article${posts.length !== 1 ? 's' : ''} published by you`}
          </p>
        </div>
        <Link to="/create" id="create-new-blog-btn" className="btn btn-primary">
          <FiPlus /> New Article
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
          <FiAlertCircle style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
      {successMsg && (
        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
          <FiCheckCircle style={{ flexShrink: 0 }} />
          {successMsg}
        </div>
      )}

      {loading ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: '340px', borderRadius: 'var(--radius-lg)' }}
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div
          id="no-blogs-message"
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#fff',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
            No Articles Published Yet
          </h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Ready to share your voice? Create your first blog post now.
          </p>
          <Link to="/create" className="btn btn-primary">
            <FiPlus /> Create First Article
          </Link>
        </div>
      ) : (
        <div
          id="my-blogs-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {posts.map((post) => {
            const imgUrl = getImageUrl(post.image);
            return (
              <div
                key={post._id}
                id={`my-blog-card-${post._id}`}
                style={{
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Cover Image */}
                <Link to={`/post/${post._id}`} style={{ display: 'block' }}>
                  <PostImage src={imgUrl} alt={post.title} height="190px" />
                </Link>

                {/* Body */}
                <div style={{ padding: '1.35rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span className="badge">
                      <FiTag style={{ fontSize: '0.65rem', marginRight: '0.2rem' }} />
                      {post.category}
                    </span>
                    <span
                      style={{
                        fontSize: '0.78rem',
                        color: 'var(--text-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginLeft: 'auto',
                      }}
                    >
                      <FiClock style={{ fontSize: '0.75rem' }} />
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <h2
                    style={{
                      fontSize: '1.15rem',
                      fontWeight: 700,
                      lineHeight: 1.4,
                      marginBottom: '0.6rem',
                    }}
                  >
                    <Link
                      to={`/post/${post._id}`}
                      style={{
                        color: 'var(--text-main)',
                        textDecoration: 'none',
                        transition: 'color 0.15s ease',
                      }}
                    >
                      {post.title}
                    </Link>
                  </h2>

                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-muted)',
                      lineHeight: 1.55,
                      marginBottom: '1.25rem',
                      flex: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {post.content}
                  </p>

                  {/* Quick Edit/Delete Actions */}
                  <div
                    style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                    }}
                  >
                    <Link
                      to={`/post/${post._id}`}
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                      title="View Article"
                    >
                      <FiEye /> View
                    </Link>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/edit/${post._id}`}
                        id={`edit-btn-${post._id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', color: 'var(--accent-primary)' }}
                        title="Edit Article"
                      >
                        <FiEdit3 /> Edit
                      </Link>

                      <button
                        type="button"
                        id={`delete-btn-${post._id}`}
                        className="btn btn-danger"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => setPostToDelete(post)}
                        title="Delete Article"
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {postToDelete && (
        <ConfirmDeleteModal
          title={postToDelete.title}
          onConfirm={handleDeletePost}
          onCancel={() => setPostToDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
};

export default MyBlogs;
