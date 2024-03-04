import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { Avatar, BreadcrumbProps, Modal, Space, Button, Form, Input, Select } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { User } from '../../interfaces/models/user';
import { apiURL } from '../../routes/api';
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
import FormClient from '../clients/form';
import { ClientForm } from '../../interfaces/models/client';
import titleize from 'titleize';
import { SelectTag } from '../../interfaces/models/select';

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
  const [clientIDs, setClienttIDs] = useState<Array<number>>([]);
  const [selectClients, setSelectClients] = useState<Array<SelectTag>>([]);
  const [formDataClient, setFormDataClient] = useState<ClientForm>({} as ClientForm);
  const [showClient, setShowClient] = useState<boolean>(false);
  const [pageSize, setPageSize] = useState<number>(10)
 
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      getClients();
    }
  })

  const getClients = () => {
    defaultHttp.get(`${apiURL.clients}/select`)
    .then(({data}) => {
      let clientForOptions = [{value: "0", label: "Select a client"}, {value: "", label: "Create New Client"}]
      let totalData = data.length
      for (let i = 0; i < totalData; i += 1) {
        clientForOptions.push({value: data[i].id, label: titleize(data[i].company)})
      }
      setSelectClients(clientForOptions)
    })
    .catch(({response}) => {
      setAlertTable("error", "Client list can not be loaded.")
    });
  }

  const filterByClient = (clientID: number) => {
    setClienttIDs([clientID])
    actionRef.current?.reload(true);
  }

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
      title: 'Client',
      dataIndex: 'client_name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: User) => <>{ 
        row.client_name ? <a onClick={() => filterByClient(row.client_id)} >{titleize(row.client_name)}</a> : <></>
      }</>
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

  const showEditModal = (record: User) => {
    record.password = ""
    if (!record.client_id) {
      record.client_id = "0"
    }
    form.setFieldsValue(record)
    setAlertTable("")
    setAlertEdit("")
    setEditTitle(`Edit User ID: ${record.id}`)
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
    setLoading(true);
    setAlertTable("")
    defaultHttp
      .put(`${apiURL.users}/${user.id}`, user)
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
          .delete(`${apiURL.users}/${user.id}`)
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


  const searchByClient = (ids: any) => {
    setClienttIDs(ids.filter( (a:any) => Number(a) > 0))
    actionRef.current?.reload(true);
  }

  const onSelectClient = (val: number) => {
    if (val < 1) {
      showClientForm()
    }
  }

  const showClientForm = () => {
    setShowClient(true)
    setFormDataClient({} as ClientForm)
  }

  const onClientError = () => {

  }

  const onClientSuccess = () => {
    getClients()
  }

  const onClientSubmit = () => {

  }

  const onSelectedClient = (val:string) => {
    if (val == "") {
      showClientForm()
    }
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
            <Input placeholder='Search name or email' className='ml-4 mr-4' onChange={searchUserKeyword} />
            <Select
              mode='multiple'
              showSearch
              allowClear
              maxTagCount={1}
              style={{ width: 200 }}
              placeholder="Select by client"
              value={clientIDs}
              options={selectClients}
              onChange={(e) => searchByClient(e)}
              onSelect={(e) => onSelectClient(e)}
            />
          </>
        }
        bordered={true}
        showSorterTooltip={false}
        scroll={{ x: true }}
        tableLayout={'fixed'}
        rowSelection={false}
        pagination={{
          showQuickJumper: true,
          pageSize: pageSize,
        }}
        actionRef={actionRef}
        request={(params) => {
          if (params.pageSize && params.pageSize != pageSize) {
            setPageSize(params.pageSize)
          }
          return defaultHttp
            .get(apiURL.users, {
              params: {
                keyword,
                client_ids: clientIDs.join(","),
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
              name="client_id"
              label={
                <p className="block text-sm font-medium text-gray-900">Client</p>
              }
            > 
              <Select
                showSearch
                allowClear
                placeholder="Select a client"
                onSelect={(e) => onSelectedClient(e)}
                options={selectClients}
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
      {
        showClient ? <FormClient
          show={showClient} 
          onClose={() => setShowClient(false)} 
          onError={onClientError}
          onSubmit={onClientSubmit}
          onSuccess={onClientSuccess}
          formData={formDataClient}
        /> : ""
      }
    </BasePageContainer>
  );
};

export default Users;
