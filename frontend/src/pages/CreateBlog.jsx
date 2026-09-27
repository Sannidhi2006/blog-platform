import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEdit3, FiUploadCloud, FiAlertCircle, FiCheckCircle, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';

const CATEGORIES = ['Technology', 'Programming', 'Travel', 'Lifestyle', 'Education', 'Food', 'Photography', 'Other'];

const CreateBlog = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Post title is required';
    if (!content.trim()) e.content = 'Post content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(''); setSuccess('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('content', content.trim());
      if (imageFile) formData.append('image', imageFile);
      const data = await postService.createPost(formData);
      toast.success('Article published successfully!');
      setSuccess('Post published! Redirecting…');
      setTimeout(() => navigate(`/post/${data.post._id}`), 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to create post';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container-sm">
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiEdit3 style={{ color: 'var(--accent-primary)' }} /> Write a New Post
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
          Publishing as <strong style={{ color: 'var(--text-main)' }}>{user?.name}</strong> (@{user?.username})
        </p>
      </div>

      {serverError && <div className="alert alert-error"><FiAlertCircle style={{ flexShrink: 0 }} />{serverError}</div>}
      {success && <div className="alert alert-success"><FiCheckCircle style={{ flexShrink: 0 }} />{success}</div>}

      <div className="section-card">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="create-title">Post Title</label>
            <input id="create-title" className="form-input" type="text"
              placeholder="e.g. Mastering Async/Await in Modern JavaScript"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: '' })); }}
              style={{ borderColor: errors.title ? 'var(--danger)' : '' }}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="create-category">Category</label>
            <select id="create-category" className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Cover Image Upload */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Cover Image (Optional)</label>
            {imagePreview ? (
              <div style={{ position: 'relative', display: 'inline-block', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                <img src={imagePreview} alt="Preview" style={{ maxHeight: '200px', maxWidth: '100%', objectFit: 'cover', display: 'block' }} />
                <button type="button" onClick={clearImage}
                  style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Remove image">
                  <FiX />
                </button>
              </div>
            ) : (
              <label htmlFor="create-image"
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  padding: '2rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}>
                <FiUploadCloud style={{ fontSize: '2rem', color: 'var(--accent-primary)', marginBottom: '0.5rem' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Click to upload cover image</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>PNG, JPG, WEBP up to 5MB</span>
                <input id="create-image" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="create-content">Article Content</label>
            <textarea
              id="create-content" className="form-input form-textarea"
              placeholder="Share your thoughts, tutorials, or stories…"
              value={content}
              onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors((p) => ({ ...p, content: '' })); }}
              style={{ minHeight: '240px', borderColor: errors.content ? 'var(--danger)' : '' }}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" id="create-publish-btn" className="btn btn-primary"
              disabled={submitting} style={{ padding: '0.75rem 2rem', fontSize: '0.975rem' }}>
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Publishing…
                </span>
              ) : '🚀 Publish Post'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlog;
