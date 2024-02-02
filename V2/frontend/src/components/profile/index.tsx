import { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BasePageContainer from '../layout/PageContainer';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import {
  Row,
  Col,
  Input,
  Form,
  BreadcrumbProps,
  Button,
} from 'antd';
import AlertBadge from '../alert';
import { defaultHttp } from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import { RootState } from '../../store';
import { setCurrentUser } from '../../store/slices/userSlice';
import { User } from '../../interfaces/models/user';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.lookup,
      title: <Link to={webRoutes.lookup}>Lookup</Link>,
    },
    {
      key: webRoutes.editProfile,
      title: <Link to={webRoutes.editProfile}>Edit Profile</Link>,
    },
  ],
};

interface ProfileForm {
  fName: string;
  lName: string;
  email: string;
  password: string;
}

const EditProfile = () => {
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertTheme, setAlertTheme] = useState<string>("");
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const mounted = useRef(false);
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const fieldToLabel = (field: string) => {
    switch(field) {
      case "fName":
        return "first name";
      case "lName":
        return "last name";
      default:
        return field;
    }
  }
  
  const onSubmit = () => {
    setLoading(true);
    defaultHttp
      .put(`${apiRoutes.users}/${user?.id}`, form.getFieldsValue())
      .then(response => {
        console.log(response.data)
        setAlertMessage("Profile is updated successfully")
        setAlertTheme("success")
        setLoading(false)
      })
      .catch(({ response }) => {
        const {data} = response
        switch (data?.error) {
          case "exist":
            setAlertMessage(`The ${data?.field} is already taken`)
            break;
          case "empty":
            setAlertMessage(`The ${fieldToLabel(data?.field || "field")} should be filled.`)
            break;
          case "invalid":
            setAlertMessage(`The ${fieldToLabel(data?.field || "field")} is invalid.`)
            break;
          case "not_found":
            setAlertMessage(`The account is not exist.`)
            break;
          case "internal_server":
            setAlertMessage(`Sorry, there's internal error`)
            break;
          default:
            setAlertMessage(`${data.error}`)
        }
        setLoading(false)
        setAlertTheme("error")
      })
  }

  const getCurrentUser = () => {
    setLoading(true)
    defaultHttp.get(`${apiRoutes.users}/${user?.id}`)
    .then((response) => {
      const user: User = response.data;
      dispatch(setCurrentUser(user));
      form.setFieldsValue(response.data);
      form.setFieldValue("password", "");
      setLoading(false);
    })
    .catch(err => {
      setAlertMessage(err);
      setAlertTheme("error");
      setLoading(false);
    })
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      form.setFieldsValue(user)
      form.setFieldValue("password", "")
      getCurrentUser()
    }
  })

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <div className="m-5">
        <article>
          <header className="mb-9 space-y-1">
            <h1 className="font-display text-3xl tracking-tight text-slate-900">
              Edit Profile
            </h1>
          </header>

          {
            alertTheme != "" ? <AlertBadge message={alertMessage} theme={alertTheme} /> : ""
          }
          <Form
            className="space-y-4 md:space-y-6"
            form={form}
            name="editProfile"
            onFinish={onSubmit}
            layout={'inline'}
            requiredMark={false}
          >
            <Row style={{width: "100%"}}>
              <Col span="12" className="mb-4">
                <Form.Item
                  name="fName"
                  rules={[
                    {
                      required: true,
                      message: 'first name should be filled',
                    },
                  ]}
                >
                  <Input
                    prefix={<b className="mr-2">First Name : </b>}
                    placeholder="Please enter first name"
                    className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                  />
                </Form.Item>
              </Col>
              <Col span="12" className="mb-4">
                <Form.Item
                  name="lName"
                  rules={[
                    {
                      required: true,
                      message: 'last name should be filled',
                    },
                  ]}
                >
                  <Input
                    prefix={<b className="mr-2">Last Name : </b>}
                    placeholder="Please enter last name"
                    className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                  />
                </Form.Item>
              </Col>
              <Col span="12" className="mb-4">
                <Form.Item
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'email should be filled',
                    },
                    {
                      type: 'email',
                      message: 'Invalid email address',
                    },
                  ]}
                >
                  <Input
                    prefix={<b className="mr-2">Email : </b>}
                    placeholder="Please enter email"
                    className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                  />
                </Form.Item>
              </Col>
              <Col span="12" className="mb-4">
                <Form.Item
                  name="password"
                >
                <Input.Password
                  prefix={<b className="mr-2">Change Password : </b>}
                  visibilityToggle={true}
                  className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                />
                </Form.Item>
              </Col>
              <Col xl={24} lg={24} md={24} sm={24} xs={24} className="mb-4">
                <div className="text-center">
                  <Button
                    className="mt-4 bg-primary mb-4"
                    loading={loading}
                    type="primary"
                    size="large"
                    htmlType={'submit'}
                  >
                    Save
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </article>
      </div>
    </BasePageContainer>
  );
};

export default EditProfile;
