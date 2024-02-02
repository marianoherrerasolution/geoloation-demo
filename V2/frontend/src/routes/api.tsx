import { API_URL } from '../utils';

export const apiRoutes = {
  login: `${API_URL}/v2/signin`,
  signup: `${API_URL}/v2/signup`,
  lookup: `${API_URL}/v2/lookup`,
  intersectLocation: `${API_URL}/v2/location/intersect`,
  addLocation: `${API_URL}/v2/location/add`,
  logout: `${API_URL}/logout`,
  users: `${API_URL}/users`,
  reviews: `${API_URL}/unknown`,
};

export const adminRoutes = {
  login: `${API_URL}/admin/signin`,
  logout: `${API_URL}/admin/signout`,
  users: `${API_URL}/users`,
  locations: `${API_URL}/locations`,
  geoips: `${API_URL}/geoips`,
}
