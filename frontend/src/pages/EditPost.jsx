import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiUploadCloud, FiAlertCircle, FiCheckCircle, FiX, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import postService from '../services/postService';
import { getImageUrl } from '../components/BlogCard';

const CATEGORIES = ['Technology', 'Programming', 'Travel', 'Lifestyle', 'Education', 'Food', 'Photography', 'Other'];

const EditPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology');
  const [content, setContent] = useState('');
  const [existingImage, setExistingImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await postService.getPostById(id);
        const post = data.post;
        if (user && post.author?._id !== user._id && post.author?._id !== user.id) {
          toast.error('You are not authorized to edit this post');
          navigate('/', { replace: true });
          return;
        }
        setTitle(post.title || '');
        setCategory(post.category || 'Technology');
        setContent(post.content || '');
        setExistingImage(post.image || null);
      } catch (err) {
        setServerError(err.response?.data?.message || err.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id, user, navigate, toast]);

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Title is required';
    if (!content.trim()) e.content = 'Content is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearNewImage = () => {
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
      const data = await postService.updatePost(id, formData);
      toast.success('Article updated successfully!');
      setSuccess('Post updated! Redirecting…');
      setTimeout(() => navigate(`/post/${data.post._id}`), 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update post';
      setServerError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container-sm">
        <div className="skeleton" style={{ height: '36px', width: '40%', marginBottom: '1.5rem' }} />
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: '52px', marginBottom: '1.25rem' }} />)}
      </div>
    );
  }

  return (
    <div className="page-container-sm">
      <div style={{ marginBottom: '1.75rem' }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ marginBottom: '0.75rem' }}>
          <FiArrowLeft /> Back
        </button>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FiSave style={{ color: 'var(--accent-primary)' }} /> Edit Post
        </h1>
      </div>

      {serverError && <div className="alert alert-error"><FiAlertCircle style={{ flexShrink: 0 }} />{serverError}</div>}
      {success && <div className="alert alert-success"><FiCheckCircle style={{ flexShrink: 0 }} />{success}</div>}

      <div className="section-card">
        <form onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Title */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="edit-title">Post Title</label>
            <input id="edit-title" className="form-input" type="text" value={title}
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: '' })); }}
              style={{ borderColor: errors.title ? 'var(--danger)' : '' }}
            />
            {errors.title && <span className="form-error">{errors.title}</span>}
          </div>

          {/* Category */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="edit-category">Category</label>
            <select id="edit-category" className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Image */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Cover Image</label>

            {imagePreview ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ position: 'relative', display: 'inline-block', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img src={imagePreview} alt="New Preview" style={{ maxHeight: '180px', maxWidth: '100%', objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={clearNewImage}
                    style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.65)', border: 'none', borderRadius: '50%', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <FiX />
                  </button>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', marginTop: '0.25rem' }}>New image selected (will replace existing)</p>
              </div>
            ) : existingImage ? (
              <div style={{ marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Current Image:</p>
                <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)', display: 'inline-block' }}>
                  <img src={getImageUrl(existingImage)} alt="Current" style={{ maxHeight: '140px', maxWidth: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              </div>
            ) : null}

            <label htmlFor="edit-image"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '1.25rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)',
                cursor: 'pointer', background: 'var(--bg-secondary)', transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'; }}>
              <FiUploadCloud style={{ fontSize: '1.5rem', color: 'var(--accent-primary)', marginBottom: '0.35rem' }} />
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                {existingImage || imagePreview ? 'Replace Image' : 'Upload Image'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>PNG, JPG, WEBP up to 5MB</span>
              <input id="edit-image" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          </div>

          {/* Content */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="edit-content">Article Content</label>
            <textarea id="edit-content" className="form-input form-textarea" value={content}
              onChange={(e) => { setContent(e.target.value); if (errors.content) setErrors((p) => ({ ...p, content: '' })); }}
              style={{ minHeight: '240px', borderColor: errors.content ? 'var(--danger)' : '' }}
            />
            {errors.content && <span className="form-error">{errors.content}</span>}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" id="edit-save-btn" className="btn btn-primary"
              disabled={submitting} style={{ padding: '0.75rem 2rem', fontSize: '0.975rem' }}>
              {submitting ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} />
                  Saving Changes…
                </span>
              ) : <><FiSave /> Save Changes</>}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(`/post/${id}`)} disabled={submitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPost;
