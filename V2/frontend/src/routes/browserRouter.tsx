import { createBrowserRouter } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import ErrorPage from '../components/errorPage';
import Layout from '../components/layout';
import Redirect from '../components/layout/Redirect';
import NotFoundPage from '../components/notfoundPage';
import { adminRoutes, webRoutes } from './web';
import loadable from '@loadable/component';
import ProgressBar from '../components/loader/progressBar';
import RequireAuth from './requireAuth';
import Login from '../components/auth/Login';
import Lookup from '../components/lookup';
import EditProfile from '../components/profile';
import Register from '../components/auth/Register';
import RequireAdmin from './requireAdmin';
import Admins from '../components/admins';
import Locations from '../components/locations';
import Geoips from '../components/geoips';

const errorElement = <ErrorPage />;
const fallbackElement = <ProgressBar />;

const Users = loadable(() => import('../components/users'), {
  fallback: fallbackElement,
});

export const browserRouter = createBrowserRouter([
  {
    path: webRoutes.home,
    element: <Redirect />,
    errorElement: errorElement,
  },

  // auth routes
  {
    element: <AuthLayout />,
    errorElement: errorElement,
    children: [
      {
        path: webRoutes.login,
        element: <Login />,
      },
      {
        path: webRoutes.register,
        element: <Register />,
      },
      {
        path: adminRoutes.login,
        element: <Login />,
      },
    ],
  },

  // protected member routes
  {
    element: (
      <RequireAuth>
        <Layout />
      </RequireAuth>
    ),
    errorElement: errorElement,
    children: [
      {
        path: webRoutes.lookup,
        element: <Lookup />,
      },
      {
        path: webRoutes.editProfile,
        element: <EditProfile />,
      },
    ],
  },

  // protected admin routes
  {
    element: (
      <RequireAdmin>
        <Layout />
      </RequireAdmin>
    ),
    errorElement: errorElement,
    children: [
      {
        path: adminRoutes.users,
        element: <Users />,
      },{
        path: adminRoutes.admins,
        element: <Admins />,
      },{
        
        path: adminRoutes.locations,
        element: <Locations />,
      },{
        path: adminRoutes.geoips,
        element: <Geoips />,
      },{
        path: adminRoutes.home,
        element: <Admins />,
      }
    ],
  },

  // 404
  {
    path: '*',
    element: <NotFoundPage />,
    errorElement: errorElement,
  },
]);
