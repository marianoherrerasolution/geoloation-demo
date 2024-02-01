import { webRoutes } from '../../routes/web';
import { BiMap, BiWorld } from 'react-icons/bi';
import Icon, { UserOutlined, InfoCircleOutlined } from '@ant-design/icons';

export const sidebar = [
  {
    path: webRoutes.lookup,
    key: webRoutes.lookup,
    name: 'Lookup',
    icon: <Icon component={BiMap} />,
  },
];
