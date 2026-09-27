import API from './api';

export const commentService = {
  /**
   * Get all comments for a post
   * @param {string} postId
   */
  async getComments(postId) {
    const response = await API.get(`/comments/${postId}`);
    return response.data;
  },

  /**
   * Create a new comment on a post
   * @param {string} postId
   * @param {string} content
   */
  async createComment(postId, content) {
    const response = await API.post(`/comments/${postId}`, { content });
    return response.data;
  },

  /**
   * Delete a comment by ID (protected, author only)
   * @param {string} commentId
   */
  async deleteComment(commentId) {
    const response = await API.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default commentService;
