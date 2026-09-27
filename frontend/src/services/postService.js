import API from './api';

export const postService = {
  /**
   * Fetch paginated list of posts with optional category filter
   * @param {{ page?: number, limit?: number, category?: string }} params
   */
  async getPosts(params = {}) {
    // Strip undefined/null/empty values
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    );
    const response = await API.get('/posts', { params: cleanParams });
    return response.data;
  },

  /**
   * Search posts by title or content
   * @param {string} query
   */
  async searchPosts(queryOrParams) {
    // Accept either a string query or a full params object { q, category }
    const params = typeof queryOrParams === 'string'
      ? { q: queryOrParams }
      : queryOrParams;
    const response = await API.get('/posts/search', { params });
    return response.data;
  },

  /**
   * Fetch a single post by ID
   * @param {string} id
   */
  async getPostById(id) {
    const response = await API.get(`/posts/${id}`);
    return response.data;
  },

  /**
   * Create a new post (supports multipart FormData or JSON)
   * @param {FormData|object} postData
   */
  async createPost(postData) {
    const headers =
      postData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    const response = await API.post('/posts', postData, { headers });
    return response.data;
  },

  /**
   * Update an existing post by ID
   * @param {string} id
   * @param {FormData|object} postData
   */
  async updatePost(id, postData) {
    const headers =
      postData instanceof FormData
        ? { 'Content-Type': 'multipart/form-data' }
        : { 'Content-Type': 'application/json' };

    const response = await API.put(`/posts/${id}`, postData, { headers });
    return response.data;
  },

  /**
   * Delete a post by ID
   * @param {string} id
   */
  async deletePost(id) {
    const response = await API.delete(`/posts/${id}`);
    return response.data;
  },

  /**
   * Fetch all posts created by a specific user
   * @param {string} userId
   */
  async getUserPosts(userId) {
    const response = await API.get(`/users/${userId}/posts`);
    return response.data;
  },

  /**
   * Toggle like on a post (protected)
   * @param {string} id
   */
  async toggleLike(id) {
    const response = await API.post(`/posts/${id}/like`);
    return response.data;
  },

  /**
   * Fetch related posts for a given post
   * @param {string} id
   */
  async getRelatedPosts(id) {
    const response = await API.get(`/posts/${id}/related`);
    return response.data;
  },
};

export default postService;
