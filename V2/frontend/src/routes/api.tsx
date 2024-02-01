import { API_URL } from '../utils';

export const apiRoutes = {
  login: `${API_URL}/v2/signin`,
  signup: `${API_URL}/v2/signup`,
  lookup: `${API_URL}/v2/lookup`,
  logout: `${API_URL}/logout`,
  users: `${API_URL}/users`,
  reviews: `${API_URL}/unknown`,
};
