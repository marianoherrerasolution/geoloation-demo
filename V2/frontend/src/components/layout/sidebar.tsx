import { adminRoutes, webRoutes } from '../../routes/web';
import { BiGlobe, BiMap, BiMapPin, BiSolidUserCheck, BiUser, BiWorld } from 'react-icons/bi';
import Icon from '@ant-design/icons';
export const userSidebar = [
  {
    path: webRoutes.lookup,
    key: webRoutes.lookup,
    name: 'Lookup',
    icon: <Icon component={BiMap} />,
  },
];

export const adminSidebar = [
  {
    path: adminRoutes.users,
    key: adminRoutes.users,
    name: 'Users',
    icon: <Icon component={BiUser} />,
  },
  {
    path: adminRoutes.locations,
    key: adminRoutes.locations,
    name: 'Locations',
    icon: <Icon component={BiGlobe} />,
  },
  {
    path: adminRoutes.geoips,
    key: adminRoutes.geoips,
    name: 'GeoIPs',
    icon: <Icon component={BiMapPin} />,
  },
  {
    path: adminRoutes.admins,
    key: adminRoutes.admins,
    name: 'Admins',
    icon: <Icon component={BiSolidUserCheck} />,
  },
];
