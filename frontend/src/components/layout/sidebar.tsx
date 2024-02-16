import { adminRoutes, webRoutes } from '../../routes/web';
import { BiBuildings, BiGlobe, BiMap, BiMapPin, BiPackage, BiShieldQuarter, BiSolidUserCheck, BiSolidWidget, BiUser, BiWorld } from 'react-icons/bi';
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
    path: adminRoutes.restrictions,
    key: adminRoutes.restrictions,
    name: 'Restrictions',
    icon: <Icon component={BiShieldQuarter} />,
  },
  {
    path: adminRoutes.widgets,
    key: adminRoutes.widgets,
    name: 'Widgets',
    icon: <Icon component={BiSolidWidget } />,
  },
  {
    path: adminRoutes.products,
    key: adminRoutes.products,
    name: 'Products',
    icon: <Icon component={BiPackage } />,
  },
  {
    path: adminRoutes.clients,
    key: adminRoutes.clients,
    name: 'Clients',
    icon: <Icon component={BiBuildings } />,
  }, 
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
