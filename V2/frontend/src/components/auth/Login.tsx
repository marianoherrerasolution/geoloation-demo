import { Button, Form, Input } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { apiRoutes } from '../../routes/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../../store/slices/userSlice';
import { RootState } from '../../store';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { webRoutes } from '../../routes/web';
import { setPageTitle } from '../../utils';
import { FormLogin, User } from '../../interfaces/models/user';
import { defaultHttp } from '../../utils/http';
import AlertBadge from '../alert';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || webRoutes.lookup;
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<boolean>(false);
  const [form] = Form.useForm();

  useEffect(() => {
    setPageTitle('Login');
  }, []);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user]);

  const onSubmit = (values: FormLogin) => {
    setLoading(true);

    defaultHttp
      .post(apiRoutes.signin, {
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        const user: User = response.data;
        dispatch(setCurrentUser(user));
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
        Member Access
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
          <span>Dont have account?</span>
          <Link to={webRoutes.register} className="text-blue-500 ms-1 font-bold">Register</Link>
        </div>
      </Form>
    </Fragment>
  );
};

export default Login;
