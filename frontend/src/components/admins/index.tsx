import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { Avatar, BreadcrumbProps, Modal, Space, Button, Form, Input, Select } from 'antd';
import { useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { apiURL } from '../../routes/api';
import { adminRoutes } from '../../routes/web';
import {
  handleErrorResponse,
} from '../../utils';
import { defaultHttp } from '../../utils/http';
import BasePageContainer from '../layout/PageContainer';
import Icon, {
  ExclamationCircleOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import AlertBadge from '../alert';
import { errorCallback } from '../../utils/userHTTPCallback';
import { Admin } from '../../interfaces/models/admin';
import { BiUserPlus } from 'react-icons/bi';

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
      key: adminRoutes.admins,
      title: <Link to={adminRoutes.admins}>Admins</Link>,
    },
  ],
};

const Admins = () => {
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
      render: (_, row: Admin) => row.id
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Admin) => <>
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
      title: 'Role',
      dataIndex: 'role',
      sorter: false,
      align: 'left',
      ellipsis: true,
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
      render: (_, row: Admin) => [
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

  const handleActionOnSelect = (key: string, admin: Admin) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(admin)
      case ActionKey.EDIT:
        return showEditModal(admin)
      default:
        return
    }
  };

  const showEditModal = (admin: Admin) => {
    admin.password = ""
    form.setFieldsValue(admin)
    setAlertTable("")
    setAlertEdit("")
    setEditTitle(`Edit Admin ID: ${admin.id}`)
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

  const onSubmit = (admin: Admin) => {
    setLoading(true);
    setAlertTable("")
    const isUpdate = !!admin.id
    const onSuccess = () => {
      setLoading(false)
      setAlertEdit("success", `Admin ${isUpdate ? ['ID',admin.id].join(' ') : ''} is ${isUpdate ? 'updated' : 'created'} successfully.`)
      actionRef.current?.reload(true);
    }
    const onError = ({response}:any) => {
      if (!response) { return }
      const {data} = response;
      if (data) {
        errorCallback(data, setAlertEditMessage)
      }
      setLoading(false);
      setAlertEdit("error");
    }
    if (isUpdate) {
      defaultHttp
        .put(`${apiURL.admins}/${admin.id}`, admin)
        .then(onSuccess)
        .catch(onError);
    } else {
      defaultHttp
        .post(apiURL.admins, admin)
        .then(onSuccess)
        .catch(onError);
    }
    
  }

  const showDeleteConfirmation = (admin: Admin) => {
    modal.confirm({
      title: 'Are you sure to delete this admin?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ admin.id }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Name">
            {admin.fName} {admin.lName}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Email">
            {admin.email}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${apiURL.admins}/${admin.id}`)
          .then(() => {
            setAlertTable("success", `User ID ${admin.id} is deleted successfully.`)
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

  const showNewUser = () =>{
    let admin:Admin = {} as Admin
    form.setFieldsValue(admin)
    setAlertTable("")
    setAlertEdit("")
    setEditTitle("Create New Admin")
    setShowEdit(true)
    setLoading(false);
  }

  const ModalButton = () => (
    <Button
      className="mt-4 bg-primary mb-4"
      block
      loading={loading}
      type="primary"
      size="large"
      htmlType={'submit'}
    >
      { !!form.getFieldValue("id") ? 'Update' : 'Create'}
    </Button>
  )

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
            <h5>Admins</h5>
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
            .get(apiURL.admins, {
              params: {
                keyword,
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const admins: [Admin] = response.data.data;

              return {
                data: admins,
                success: true,
                total: response.data.total,
              } as RequestData<Admin>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<Admin>;
            });
        }}
        dateFormatter="string"
        search={false}
        rowKey="id"
        options={{
          search: false,
        }}
        toolbar={{
          actions: [
            <Button onClick={() => showNewUser()} key="show" type="primary" icon={<BiUserPlus />} style={{background: "#4150e8"}}>
              New Admin
            </Button>
          ]
        }}
      />
      {modalContextHolder}
      <Modal title={editTitle} open={showEdit} onCancel={() => setShowEdit(false)} footer="">
        <Form
          className="space-y-4 md:space-y-6"
          form={form}
          name="login"
          onFinish={onSubmit}
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
              name="role"
              label={
                <p className="block text-sm font-medium text-gray-900">Role</p>
              }
              rules={[
                {
                  required: true,
                  message: 'Please select role',
                },
              ]}
            >
              <Select placeholder="Select Role" allowClear>
                <Select.Option value="readonly">Read-only</Select.Option>
                <Select.Option value="editor">Editor</Select.Option>
                <Select.Option value="super">Superadmin</Select.Option>
              </Select>
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
            <ModalButton />
          </div>
        </Form>
      </Modal>
    </BasePageContainer>
  );
};

export default Admins;
