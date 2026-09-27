import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import BlogCard, { SkeletonCard } from '../components/BlogCard';
import {
  FiUser,
  FiMail,
  FiAtSign,
  FiCalendar,
  FiFileText,
  FiLogOut,
  FiPlus,
  FiAlertCircle,
  FiBookOpen,
} from 'react-icons/fi';

export const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = authUser?._id || authUser?.id;

  useEffect(() => {
    if (!userId) return;

    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        // Fetch user info from GET /api/users/:id and posts from GET /api/users/:id/posts
        const [userData, postsData] = await Promise.all([
          userService.getUserById(userId),
          userService.getUserPosts(userId),
        ]);

        setProfileUser(userData.user || authUser);
        setUserPosts(postsData.posts || []);
        setPostCount(postsData.count ?? (postsData.posts ? postsData.posts.length : 0));
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, authUser]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayUser = profileUser || authUser;
  const formattedDate = displayUser?.createdAt
    ? new Date(displayUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently';

  return (
    <div style={{ maxWidth: '1000px', margin: '2.5rem auto', padding: '0 1.5rem' }}>
      {/* Profile Card */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-card)',
          overflow: 'hidden',
          marginBottom: '2.5rem',
        }}
      >
        {/* Banner */}
        <div
          style={{
            height: '140px',
            background: 'var(--accent-gradient)',
            position: 'relative',
          }}
        />

        {/* Profile Content */}
        <div style={{ padding: '0 2rem 2rem', position: 'relative' }}>
          {/* Avatar */}
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fce7ef 0%, #fdf2f8 100%)',
              border: '4px solid #ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--accent-primary)',
              marginTop: '-45px',
              boxShadow: 'var(--shadow-md)',
              textTransform: 'uppercase',
            }}
          >
            {displayUser?.name ? displayUser.name.charAt(0) : 'U'}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginTop: '1.25rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <h1
                id="profile-user-name"
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  letterSpacing: '-0.025em',
                }}
              >
                {displayUser?.name}
              </h1>
              <p
                id="profile-user-handle"
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  marginTop: '0.2rem',
                }}
              >
                @{displayUser?.username}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <Link to="/create" className="btn btn-primary" style={{ fontSize: '0.875rem' }}>
                <FiPlus /> Write Post
              </Link>
              <button
                type="button"
                id="profile-logout-btn"
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.25rem',
                  backgroundColor: 'var(--danger-light)',
                  border: '1px solid #fecaca',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--danger)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <FiLogOut />
                <span>Log Out</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginTop: '1.5rem' }}>
              <FiAlertCircle style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* Details & Stat Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginTop: '1.75rem',
            }}
          >
            {/* Email */}
            <div
              style={{
                padding: '1.1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  fontSize: '1.15rem',
                  flexShrink: 0,
                }}
              >
                <FiMail />
              </div>
              <div style={{ minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    display: 'block',
                  }}
                >
                  Email Address
                </span>
                <p
                  id="profile-user-email"
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '0.15rem',
                  }}
                >
                  {displayUser?.email}
                </p>
              </div>
            </div>

            {/* Total Post Count */}
            <div
              style={{
                padding: '1.1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--accent-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-primary)',
                  fontSize: '1.15rem',
                  flexShrink: 0,
                }}
              >
                <FiFileText />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    display: 'block',
                  }}
                >
                  Total Posts
                </span>
                <p
                  id="profile-total-posts"
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    color: 'var(--accent-primary)',
                    marginTop: '0.1rem',
                  }}
                >
                  {loading ? '…' : postCount}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div
              style={{
                padding: '1.1rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'var(--success-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--success)',
                  fontSize: '1.15rem',
                  flexShrink: 0,
                }}
              >
                <FiCalendar />
              </div>
              <div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                    display: 'block',
                  }}
                >
                  Member Since
                </span>
                <p
                  id="profile-created-at"
                  style={{
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    color: 'var(--text-main)',
                    marginTop: '0.15rem',
                  }}
                >
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Own Posts Section */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
            }}
          >
            <FiBookOpen style={{ color: 'var(--accent-primary)' }} />
            My Articles ({loading ? '…' : userPosts.length})
          </h2>
          <Link to="/my-blogs" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
            Manage in My Blogs &rarr;
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : userPosts.length === 0 ? (
          <div
            id="profile-no-posts"
            style={{
              textAlign: 'center',
              padding: '3.5rem 2rem',
              background: '#fff',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✍️</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
              No Articles Yet
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Share your knowledge and ideas with the community.
            </p>
            <Link to="/create" className="btn btn-primary">
              <FiPlus /> Create Your First Post
            </Link>
          </div>
        ) : (
          <div
            id="profile-posts-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
          >
            {userPosts.map((post, index) => (
              <BlogCard key={post._id} post={post} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
