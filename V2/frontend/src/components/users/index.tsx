import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { Avatar, BreadcrumbProps, Modal, Space, Button, Form, Input } from 'antd';
import { useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiRoutes } from '../../routes/api';
import { adminRoutes, webRoutes } from '../../routes/web';
import {
  handleErrorResponse,
} from '../../utils';
import BasePageContainer from '../layout/PageContainer';
import Icon, {
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import AlertBadge from '../alert';
import { errorCallback } from '../../utils/userHTTPCallback';
import { defaultHttp } from '../../utils/http';

enum ActionKey {
  DELETE = 'delete',
  EDIT = 'edit'
}

const ColorList = ['#f56a00', '#7265e6', '#ffbf00', '#00a2ae', '#922B3E', '#252850'];
const getColorBadge = () => {
  return ColorList[Math.floor(Math.random()*ColorList.length)]
}
const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.users,
      title: <Link to={adminRoutes.users}>Users</Link>,
    },
  ],
};

const Users = () => {
  const actionRef = useRef<ActionType>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [alertTableTheme, setAlertTableTheme] = useState<string>("");
  const [alertTableMessage, setAlertTableMessage] = useState<string>("");
  const [alertEditTheme, setAlertEditTheme] = useState<string>("");
  const [alertEditMessage, setAlertEditMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("")
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      sorter: false,
      render: (_, row: User) => row.id
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: User) => <>
        <Avatar
          style={{ backgroundColor: getColorBadge(), verticalAlign: 'middle' }}
          shape="circle"
          size="large"
        >
          {`${row.fName.charAt(0).toUpperCase()} ${row.lName.charAt(0).toUpperCase()}`}
        </Avatar>
        <span className="ml-3">{`${row.fName} ${row.lName}`}</span>
      </>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: User) => [
        <TableDropdown
          key="actionGroup"
          onSelect={(key) => handleActionOnSelect(key, row)}
          menus={[
            {
              key: ActionKey.DELETE,
              name: (
                <Space>
                  <DeleteOutlined />
                  Delete
                </Space>
              ),
            },
            {
              key: ActionKey.EDIT,
              name: (
                <Space>
                  <EditOutlined />
                  Edit
                </Space>
              ),
            },
          ]}
        >
          <Icon component={CiCircleMore} className="text-primary text-xl" />
        </TableDropdown>,
      ],
    },
  ];

  const handleActionOnSelect = (key: string, user: User) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(user)
      case ActionKey.EDIT:
        return showEditModal(user)
      default:
        return
    }
  };

  const showEditModal = (user: User) => {
    user.password = ""
    form.setFieldsValue(user)
    setAlertTable("")
    setAlertEdit("")
    setEditTitle(`Edit User ID: ${user.id}`)
    setShowEdit(true)
    setLoading(false);
  }


  const setAlertTable = (theme: string, message?: string) => {
    setAlertTableTheme(theme)
    if (message) { setAlertTableMessage(message) }
  }

  const setAlertEdit = (theme: string, message?: string) => {
    setAlertEditTheme(theme)
    if (message) { setAlertEditMessage(message) }
  }

  const onUpdate = (user: User) => {
    console.log(user)
    setLoading(true);
    setAlertTable("")
    defaultHttp
      .put(`${apiRoutes.adminUsers}/${user.id}`, user)
      .then(() => {
        setLoading(false)
        setAlertEdit("success", `User ID ${user.id} is updated successfully.`)
        actionRef.current?.reload(true);
      })
      .catch(({response}) => {
        if (!response) { return }
        const {data} = response;
        if (data) {
          errorCallback(data, setAlertEditMessage)
        }
        setLoading(false);
        setAlertEdit("error");
      });
  }

  const showDeleteConfirmation = (user: User) => {
    modal.confirm({
      title: 'Are you sure to delete this user?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ user.id }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Name">
            {user.fName} {user.lName}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Email">
            {user.email}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${apiRoutes.adminUsers}/${user.id}`)
          .then(() => {
            setAlertTable("success", `User ID ${user.id} is deleted successfully.`)
            actionRef.current?.reload(true);
          })
          .catch(({response}) => {
            if (!response) { return }
            const {data} = response;
            if (data) {
              errorCallback(data, setAlertTableMessage)
            }
            setAlertTableTheme("error")
          });
      },
    });
  };

  const searchUserKeyword = (e:any) => {
    setKeyword(e.target.value)
    actionRef.current?.reload(true);
  }

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      {
        alertTableTheme == "" ? "" : 
        <AlertBadge message={alertTableMessage} theme={alertTableTheme} />
      }
      <ProTable
        columns={columns}
        cardBordered={false}
        headerTitle={
          <>
            <h5>Users</h5>
            <Input placeholder='Search name or email' className='ml-4' onChange={searchUserKeyword} />
          </>
        }
        bordered={true}
        showSorterTooltip={false}
        scroll={{ x: true }}
        tableLayout={'fixed'}
        rowSelection={false}
        pagination={{
          showQuickJumper: true,
          pageSize: 10,
        }}
        actionRef={actionRef}
        request={(params) => {
          return defaultHttp
            .get(apiRoutes.users, {
              params: {
                keyword,
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const users: [User] = response.data.data;

              return {
                data: users,
                success: true,
                total: response.data.total,
              } as RequestData<User>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<User>;
            });
        }}
        dateFormatter="string"
        search={false}
        rowKey="id"
        options={{
          search: false,
        }}
      />
      {modalContextHolder}
      <Modal title={editTitle} open={showEdit} onCancel={() => setShowEdit(false)} footer="">
        <Form
          className="space-y-4 md:space-y-6"
          form={form}
          name="login"
          onFinish={onUpdate}
          layout={'vertical'}
          requiredMark={false}
        >
          <div>
            {
              alertEditTheme == "" ? "" : 
              <AlertBadge message={alertEditMessage} theme={alertEditTheme} />
            }
            <Form.Item
                name="id"
                style={{display:"none"}}
              >
              <Input
                type='hidden'
              />
            </Form.Item>
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
            >
              <Input.Password
                placeholder="change password"
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
              Update
            </Button>
          </div>
        </Form>
      </Modal>
    </BasePageContainer>
  );
};

export default Users;
