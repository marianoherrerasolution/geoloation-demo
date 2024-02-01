import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { webRoutes } from '../../routes/web';
import { RootState } from '../../store';

const Redirect = () => {
  const user = useSelector((state: RootState) => state.user);

  return (
    <Navigate to={user ? webRoutes.lookup : webRoutes.login} replace />
  );
};

export default Redirect;
