import { Button, Form, Input } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { apiRoutes } from '../../routes/api';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../store/slices/userSlice';
import { RootState } from '../../store';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { webRoutes } from '../../routes/web';
import { setPageTitle } from '../../utils';
import { User } from '../../interfaces/models/user';
import { defaultHttp } from '../../utils/http';

interface FormValues {
  email: string;
  password: string;
}

interface AlertProps {
  error: boolean;
}

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

  const onSubmit = (values: FormValues) => {
    setLoading(true);

    defaultHttp
      .post(apiRoutes.login, {
        email: values.email,
        password: values.password,
      })
      .then((response) => {
        const user: User = {
          token: response.data.token,
          firstName: response.data.fName,
          lastName: response.data.lName,
          password: '',
          email: response.data.email,
        };
        dispatch(login(user));
      })
      .catch((error) => {
        // handleErrorResponse(error);
        setLoading(false);
        setLoginError(true);
      });
  };

  const ErrorAlert = (props: AlertProps) => {
    if (!props.error) {
      return null
    }
    return (
      <div className="flex bg-red-100 rounded-lg p-4 mb-4 text-sm text-red-700 items-center" role="alert">
        Invalid email or password.
      </div>
    )
  }

  return (
    <Fragment>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-primary-900 md:text-2xl text-center text-opacity-30 tracking-wide">
        GeoIPLocation
      </h1>
      <ErrorAlert error={loginError} />
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
          <Link to="/" className="text-blue-500 ms-1 font-bold">Signup</Link>
        </div>
      </Form>
    </Fragment>
  );
};

export default Login;
