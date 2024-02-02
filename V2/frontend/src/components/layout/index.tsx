import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { webRoutes } from '../../routes/web';
import { Dropdown } from 'antd';
import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import Icon, { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/userSlice';
import { memo } from 'react';
import { sidebar } from './sidebar';
import { apiRoutes } from '../../routes/api';
import http from '../../utils/http';
import { handleErrorResponse } from '../../utils';
import { RiShieldUserFill } from 'react-icons/ri';
import { RootState } from '../../store';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const defaultProps: ProLayoutProps = {
    title: CONFIG.appName,
    logo: '/icon.png',
    fixedHeader: true,
    fixSiderbar: true,
    layout: CONFIG.theme.sidebarLayout,
    route: {
      routes: sidebar,
    },
  };

  const logoutUser = () => {
    dispatch(logout());
    navigate(webRoutes.login, {
      replace: true,
    });

    // http.post(apiRoutes.logout).catch((error) => {
    //   handleErrorResponse(error);
    // });
  };

  const editUser = () => {
    navigate(webRoutes.editProfile, {
      replace: true,
    });
  }

  return (
    <div className="h-screen">
      <ProLayout
        {...defaultProps}
        token={{
          sider: {
            colorMenuBackground: 'white',
          },
        }}
        location={location}
        onMenuHeaderClick={() => navigate(webRoutes.dashboard)}
        menuItemRender={(item, dom) => (
          <a
            onClick={(e) => {
              e.preventDefault();
              item.path && navigate(item.path);
            }}
            href={item.path}
          >
            {dom}
          </a>
        )}
        avatarProps={{
          icon: <Icon component={RiShieldUserFill} />,
          className: 'bg-primary bg-opacity-20 text-primary text-opacity-90',
          size: 'small',
          shape: 'square',
          title: user?.firstName,
          render: (_, dom) => {
            return (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: 'editProfile',
                      icon: <UserOutlined />,
                      label: 'Edit Profile',
                      onClick: () => {
                        editUser();
                      },
                    },
                    {
                      key: 'logout',
                      icon: <LogoutOutlined />,
                      label: 'Logout',
                      onClick: () => {
                        logoutUser();
                      },
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}
      >
        <Outlet />
      </ProLayout>
    </div>
  );
};

export default memo(Layout);
