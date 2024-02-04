import { API_URL } from '../utils';

export const apiRoutes = {
  signin: `${API_URL}/v2/signin`,
  signup: `${API_URL}/v2/signup`,
  lookup: `${API_URL}/v2/lookup`,
  profile: `${API_URL}/v2/profile`,
  intersectLocation: `${API_URL}/v2/location/intersect`,
  addLocation: `${API_URL}/v2/location/add`,
  logout: `${API_URL}/logout`,
  users: `${API_URL}/users`,
  reviews: `${API_URL}/unknown`,
  adminLogin: `${API_URL}/v2/admin/signin`,
  adminLogout: `${API_URL}/v2/admin/signout`,
  adminUsers: `${API_URL}/v2/users`,
  adminList: `${API_URL}/v2/admins`,
  adminLocations: `${API_URL}/v2/locations`,
  adminGeoips: `${API_URL}/v2/geoips`,
};
