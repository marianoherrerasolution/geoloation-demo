import { Button, Form, Input } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { apiURL } from '../../routes/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../../store/slices/userSlice';
import { RootState } from '../../store';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { adminRoutes, webRoutes } from '../../routes/web';
import { setPageTitle } from '../../utils';
import { FormLogin, User } from '../../interfaces/models/user';
import http, { defaultHttp } from '../../utils/http';
import AlertBadge from '../alert';
import { setCurrentAdmin } from '../../store/slices/adminSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.user);
  const admin = useSelector((state: RootState) => state.admin);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<boolean>(false);
  const [form] = Form.useForm();
  const isAdmin = window.location.pathname == "/admin/login"

  useEffect(() => {
    setPageTitle('Login');
  }, []);

  useEffect(() => {
    if (user || admin) {
      navigate(fromPath(), { replace: true });
    }
  });

  const fromPath = () => {
    if (!!admin) {
      return location.state?.from?.pathname || adminRoutes.users;
    } else {
      return location.state?.from?.pathname || webRoutes.lookup;
    }
  }

  const loginURL = () => {
    if (isAdmin) {
      return apiURL.admin.login
    }
    return apiURL.user.signin
  }

  const onSubmit = (values: FormLogin) => {
    setLoading(true);
    http
      .post(loginURL(), {
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        if (isAdmin) {
          dispatch(setCurrentAdmin(response.data));
          dispatch(setCurrentUser(null));
        } else {
          dispatch(setCurrentUser(response.data));
          dispatch(setCurrentAdmin(null));
        }
      })
      .catch((error) => {
        // handleErrorResponse(error);
        setLoading(false);
        setLoginError(true);
      });
  };

  return (
    <Fragment>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-primary-900 md:text-2xl text-center text-opacity-30 tracking-wide">
        {isAdmin ? "Admin" : "Member"} Access
      </h1>
      {
        loginError ? <AlertBadge message="Invalid email or password" theme="error" /> : ""
      }
      <Form
        className="space-y-4 md:space-y-6"
        form={form}
        name="login"
        onFinish={onSubmit}
        layout={'vertical'}
        requiredMark={false}
      >
        <div>
          <Form.Item
            name="email"
            label={
              <p className="block text-sm font-medium text-gray-900">Email</p>
            }
            rules={[
              {
                required: true,
                message: 'Please enter your email',
              },
              {
                type: 'email',
                message: 'Invalid email address',
              },
            ]}
          >
            <Input
              placeholder="name@example.com"
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            name="password"
            label={
              <p className="block text-sm font-medium text-gray-900">
                Password
              </p>
            }
            rules={[
              {
                required: true,
                message: 'Please enter your password',
              },
            ]}
          >
            <Input.Password
              placeholder="••••••••"
              visibilityToggle={false}
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>

        <div className="text-center">
          <Button
            className="mt-4 bg-primary mb-4"
            block
            loading={loading}
            type="primary"
            size="large"
            htmlType={'submit'}
          >
            Login
          </Button>
          {
            isAdmin ? "" : <>
              <span>Dont have account?</span>
              <Link to={webRoutes.register} className="text-blue-500 ms-1 font-bold">Register</Link>
            </>
          }
          
        </div>
      </Form>
    </Fragment>
  );
};

export default Login;
