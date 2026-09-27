import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import BlogCard, { SkeletonCard } from '../components/BlogCard';
import postService from '../services/postService';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Technology', 'Programming', 'Travel', 'Lifestyle', 'Education', 'Food', 'Photography', 'Other'];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');

  const doSearch = useCallback(async (q, category) => {
    setLoading(true); setError(''); setSearched(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (category && category !== 'All') params.category = category;
      const data = await postService.searchPosts(params);
      setResults(data.posts || []);
    } catch (err) { setError(err.message || 'Search failed'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setInputVal(q);
    doSearch(q, activeCategory);
  }, [searchParams, activeCategory, doSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ q: inputVal.trim() });
  };

  const q = searchParams.get('q') || '';

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem' }}>
          <FiArrowLeft /> Back
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)' }}>
          Search Results
        </h1>
        {searched && !loading && (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            <strong style={{ color: 'var(--text-secondary)' }}>{results.length}</strong> result{results.length !== 1 ? 's' : ''}
            {q && <> for <strong style={{ color: 'var(--text-secondary)' }}>"{q}"</strong></>}
          </p>
        )}
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', maxWidth: '640px', background: '#fff', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <input id="search-input" type="text" placeholder="Search articles…"
            value={inputVal} onChange={(e) => setInputVal(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', border: 'none', outline: 'none', fontSize: '0.95rem', fontFamily: 'var(--font-main)', color: 'var(--text-main)', background: 'transparent' }}
          />
          <button type="submit" id="search-submit-btn" style={{
            padding: '0 1.25rem', background: 'var(--accent-gradient)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '1.1rem',
          }}>
            <FiSearch />
          </button>
        </div>
      </form>

      {/* Category filter */}
      <div className="cat-filter-bar">
        {CATEGORIES.map((cat) => (
          <button key={cat} className={`cat-btn${activeCategory === cat ? ' active' : ''}`} onClick={() => setActiveCategory(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && <div className="alert alert-error"><FiAlertCircle style={{ flexShrink: 0 }} />{error}</div>}

      {/* Results */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !searched ? null : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>No Results Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
            {q ? `No articles match "${q}"${activeCategory !== 'All' ? ` in "${activeCategory}"` : ''}.` : 'Try a search term above.'}
          </p>
          <Link to="/" className="btn btn-secondary"><FiArrowLeft /> Browse All Articles</Link>
        </div>
      ) : (
        <div id="search-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.5rem' }}>
          {results.map((post, i) => <BlogCard key={post._id} post={post} index={i} />)}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
