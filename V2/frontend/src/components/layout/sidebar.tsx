import { adminRoutes, webRoutes } from '../../routes/web';
import { BiGlobe, BiMap, BiMapPin, BiSolidUserCheck, BiUser, BiWorld } from 'react-icons/bi';
import Icon from '@ant-design/icons';
import { getAdmin } from '../../store/slices/adminSlice';

const userSidebar = [
  {
    path: webRoutes.lookup,
    key: webRoutes.lookup,
    name: 'Lookup',
    icon: <Icon component={BiMap} />,
  },
];

const adminSidebar = [
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

const getSidebar = () => {
  console.log(getAdmin)
  if (!!getAdmin()) {
    return adminSidebar
  }
  return userSidebar
}

export const sidebar = getSidebar()
