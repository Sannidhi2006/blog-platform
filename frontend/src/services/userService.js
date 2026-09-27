import API from './api';

export const userService = {
  /**
   * Fetch user details by ID
   * @param {string} id
   */
  async getUserById(id) {
    const response = await API.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Fetch all posts created by a specific user
   * @param {string} id
   */
  async getUserPosts(id) {
    const response = await API.get(`/users/${id}/posts`);
    return response.data;
  },
};

export default userService;
