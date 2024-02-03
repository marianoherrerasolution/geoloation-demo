import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { adminRoutes, webRoutes } from '../../routes/web';
import { Dropdown } from 'antd';
import { ProLayout, ProLayoutProps } from '@ant-design/pro-components';
import Icon, { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/userSlice';
import { memo } from 'react';
import { sidebar } from './sidebar';
import { RiShieldUserFill, RiAdminLine } from 'react-icons/ri';
import { RootState } from '../../store';
import { logoutAdmin } from '../../store/slices/adminSlice';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const admin = useSelector((state: RootState) => state.admin);
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
    if (!!admin) {
      dispatch(logoutAdmin());
      navigate(adminRoutes.login, {
        replace: true,
      });
    } else {
      dispatch(logout());
      navigate(webRoutes.login, {
        replace: true,
      });
    }
    
  };

  const editUser = () => {
    if (!!admin) {
      navigate(adminRoutes.admins, {
        replace: true,
      });
    }
    navigate(webRoutes.editProfile, {
      replace: true,
    });
  }

  const getFullname = () => {
    if (admin) {
      return `${admin?.fName} ${admin?.lName}`
    }
    return `${user?.fName} ${user?.lName}`
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
          icon: <Icon component={admin ? RiAdminLine : RiShieldUserFill} />,
          className: 'bg-primary bg-opacity-20 text-primary text-opacity-90',
          size: 'large',
          shape: 'circle',
          title: getFullname(),
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
