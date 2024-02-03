import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../store';
import { adminRoutes } from './web';

export type RequireAuthProps = {
  children: JSX.Element;
};

const RequireAdmin = ({ children }: RequireAuthProps) => {
  const admin = useSelector((state: RootState) => state.admin);
  const location = useLocation();

  if (!admin) {
    return <Navigate to={adminRoutes.login} state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAdmin;
