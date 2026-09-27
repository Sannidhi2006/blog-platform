import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit3, FiUserPlus, FiFilter, FiX, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import BlogCard, { SkeletonCard } from '../components/BlogCard';
import postService from '../services/postService';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All', 'Technology', 'Programming', 'Travel', 'Lifestyle', 'Education', 'Food', 'Photography', 'Other'];

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');

  const fetchPosts = useCallback(async (category) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (category && category !== 'All') params.category = category;
      const data = await postService.getPosts(params);
      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts(activeCategory);
  }, [activeCategory, fetchPosts]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) navigate(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <main>
      {/* ── Hero Banner ─────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #f9a8d4 0%, #ec4899 50%, #db2777 100%)',
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          {isAuthenticated && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
              borderRadius: '999px', padding: '0.35rem 1rem',
              color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.25rem',
            }}>
              👋 Welcome back, <strong>{user?.name}</strong>
            </div>
          )}

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontWeight: 800, letterSpacing: '-0.03em',
            color: '#fff', lineHeight: 1.15, marginBottom: '1rem',
          }}>
            Ideas worth{' '}
            <span style={{ color: '#fce7ef' }}>sharing</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.82)',
            maxWidth: '560px', margin: '0 auto 2rem', lineHeight: 1.65,
          }}>
            A developer-first blog platform with real MongoDB persistence,
            JWT auth, and multipart image uploads — MERN Stack end to end.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', width: '100%', maxWidth: '520px', background: '#fff', borderRadius: 'var(--radius-md)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
              <input
                id="home-search-input"
                type="text"
                placeholder="Search articles, topics…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1, padding: '0.8rem 1.1rem', border: 'none', outline: 'none',
                  fontSize: '0.95rem', color: 'var(--text-main)', background: 'transparent',
                  fontFamily: 'var(--font-main)',
                }}
              />
              <button type="submit" id="home-search-btn" style={{
                padding: '0 1.25rem', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: '1.1rem',
              }}>
                <FiSearch />
              </button>
            </div>
          </form>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated ? (
              <Link to="/create" id="hero-write-btn" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                background: '#fff', color: 'var(--accent-primary)',
                padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-md)',
                fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
              }}>
                <FiEdit3 /> Write an Article
              </Link>
            ) : (
              <>
                <Link to="/register" id="hero-register-btn" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  background: '#fff', color: 'var(--accent-primary)',
                  padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-md)',
                  fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
                }}>
                  <FiUserPlus /> Get Started Free
                </Link>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                  background: 'rgba(255,255,255,0.18)', color: '#fff',
                  padding: '0.7rem 1.5rem', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, fontSize: '0.95rem', border: '1px solid rgba(255,255,255,0.35)',
                }}>
                  Sign In <FiArrowRight />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Posts Section ────────────────────────────── */}
      <div className="page-container">
        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiTrendingUp style={{ color: 'var(--accent-primary)', fontSize: '1.15rem' }} />
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>
              {activeCategory !== 'All' ? `${activeCategory} Articles` : 'Latest Articles'}
            </h2>
          </div>
          {!loading && posts.length > 0 && (
            <span style={{ fontSize: '0.82rem', color: 'var(--text-dim)', fontWeight: 500 }}>
              {posts.length} post{posts.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Category Filter */}
        <div className="cat-filter-bar" id="category-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-btn-${cat.toLowerCase()}`}
              className={`cat-btn${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
          {activeCategory !== 'All' && (
            <button className="cat-btn" onClick={() => setActiveCategory('All')}
              style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <FiX /> Clear
            </button>
          )}
        </div>

        {/* Error */}
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {/* Loading */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem 2rem',
            background: '#fff', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-main)' }}>
              {activeCategory !== 'All' ? `No posts in "${activeCategory}" yet` : 'No Articles Yet'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.75rem' }}>
              {isAuthenticated ? 'Be the first to publish!' : 'Register and start writing today.'}
            </p>
            {isAuthenticated ? (
              <Link to="/create" className="btn btn-primary"><FiEdit3 /> Write First Post</Link>
            ) : (
              <Link to="/register" className="btn btn-primary"><FiUserPlus /> Join & Write</Link>
            )}
          </div>
        ) : (
          <div id="posts-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: '1.5rem',
          }}>
            {posts.map((post, i) => <BlogCard key={post._id} post={post} index={i} />)}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
