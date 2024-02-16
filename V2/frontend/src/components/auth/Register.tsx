import { Button, Form, Input } from 'antd';
import { Fragment, useEffect, useState } from 'react';
import { apiRoutes } from '../../routes/api';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentUser } from '../../store/slices/userSlice';
import { RootState } from '../../store';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { webRoutes } from '../../routes/web';
import { setPageTitle } from '../../utils';
import { FormUser, User } from '../../interfaces/models/user';
import { defaultHttp } from '../../utils/http';
import AlertBadge from '../alert';
import { errorCallback } from '../../utils/userHTTPCallback';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || webRoutes.lookup;
  const user = useSelector((state: RootState) => state.user);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertTheme, setAlertTheme] = useState<string>("");

  useEffect(() => {
    setPageTitle('Login');
  }, []);

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user]);

  const onSubmit = (values: FormUser) => {
    setLoading(true);
    setAlertTheme("")
    defaultHttp
      .post(apiRoutes.signup, values)
      .then((response) => {
        setAlertMessage("Your account is successfully registered.")
        setAlertTheme("success")
        const user: User = response.data;
        dispatch(setCurrentUser(user));
      })
      .catch(({response}) => {
        if (!response) { return }
        const {data} = response;
        if (data) {
          errorCallback(data, setAlertMessage)
        }
        setLoading(false);
        setAlertTheme("error");
      });
  };

  return (
    <Fragment>
      <h1 className="text-xl font-bold leading-tight tracking-tight text-primary-900 md:text-2xl text-center text-opacity-30 tracking-wide">
        Member Sign-Up
      </h1>
      {
        alertTheme != "" ? <AlertBadge message={alertMessage} theme={alertTheme} /> : ""
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
            name="fName"
            label={
              <p className="block text-sm font-medium text-gray-900">First Name</p>
            }
            rules={[
              {
                required: true,
                message: 'first name should be filled',
              },
            ]}
          >
            <Input
              placeholder="please enter first name"
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>
        <div>
          <Form.Item
            name="lName"
            label={
              <p className="block text-sm font-medium text-gray-900">Last Name</p>
            }
            rules={[
              {
                required: true,
                message: 'last name should be filled',
              },
            ]}
          >
            <Input
              placeholder="please enter last name"
              className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
            />
          </Form.Item>
        </div>
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
              visibilityToggle={true}
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
            Register
          </Button>
          <span>Already has account?</span>
          <Link to={webRoutes.login} className="text-blue-500 ms-1 font-bold">Login</Link>
        </div>
      </Form>
    </Fragment>
  );
};

export default Register;
