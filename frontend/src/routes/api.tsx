import { API_URL } from '../utils';
const V2Path = `${API_URL}/v2`;
const V2AdminPath = `${V2Path}/admin`;

export const apiURL = {
  logout: `${API_URL}/logout`,
  admin: {
    login: `${V2AdminPath}/signin`,
    logout: `${V2AdminPath}/signout`,
  },
  user: {
    signin: `${V2Path}/signin`,
    signup: `${V2Path}/signup`,
    lookup: `${V2Path}/lookup`,
    profile: `${V2Path}/profile`,
    intersectLocation: `${V2Path}/location/intersect`,
    addLocation: `${V2Path}/location/add`,
  },
  users: `${V2Path}/users`,
  admins: `${V2Path}/admins`,
  locations: `${V2Path}/locations`,
  geoips: `${V2Path}/geoips`,
  products: `${V2Path}/products`,
  clients: `${V2Path}/clients`,
  widgets: `${V2Path}/widgets`,
  restrictions: `${V2Path}/restrictions`,
};
