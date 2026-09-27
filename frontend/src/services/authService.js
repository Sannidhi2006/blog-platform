import API, { TOKEN_KEY } from './api';

export const authService = {
  /**
   * Register a new user
   * @param {{ name, username, email, password, confirmPassword }} data
   * @returns {Promise<{ status: string, message: string, token: string, user: object }>}
   */
  async register(data) {
    const response = await API.post('/auth/register', data);
    return response.data;
  },

  /**
   * Login user with email or username + password
   * @param {{ identifier, password }} credentials
   * @returns {Promise<{ status: string, message: string, token: string, user: object }>}
   */
  async login(credentials) {
    const response = await API.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Get currently logged-in user profile (restores session)
   * @returns {Promise<{ status: string, user: object }>}
   */
  async getMe() {
    const response = await API.get('/auth/me');
    return response.data;
  },

  /**
   * Get token from localStorage
   */
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set token into localStorage
   */
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Remove token from localStorage
   */
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
};

export default authService;
