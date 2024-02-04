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
import { Location } from '../../interfaces/models/location';
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
import GeoMap from '../geomap';

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
      key: adminRoutes.locations,
      title: <Link to={adminRoutes.locations}>Locations</Link>,
    },
  ],
};

const Locations = () => {
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
      dataIndex: 'gid',
      align: 'center',
      sorter: false,
      render: (_, row: Location) => row.gid
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      sorter: false,
      align: 'left',
      ellipsis: true
    },
    {
      title: 'Country',
      dataIndex: 'country',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'City',
      dataIndex: 'city',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Zipcode',
      dataIndex: 'zipcode',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Latitude',
      dataIndex: 'lat',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Longitude',
      dataIndex: 'lon',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: Location) => [
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
                  Show
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

  const handleActionOnSelect = (key: string, user: Location) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(user)
      case ActionKey.EDIT:
        return showEditModal(user)
      default:
        return
    }
  };

  const showEditModal = (accLoc: Location) => {
    form.setFieldsValue(accLoc)
    setAlertTable("")
    setAlertEdit("")
    setEditTitle(`Location ID: ${accLoc.gid}`)
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

  const onUpdate = (accLoc: Location) => {
    setLoading(true);
    setAlertTable("")
    defaultHttp
      .put(`${apiRoutes.adminLocations}/${accLoc.gid}`, accLoc)
      .then(() => {
        setLoading(false)
        setAlertEdit("success", `Location ID ${accLoc.gid} is updated successfully.`)
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

  const showDeleteConfirmation = (accLoc: Location) => {
    modal.confirm({
      title: 'Are you sure to delete this location?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ accLoc.gid }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Location">
            {accLoc.city}, {accLoc.country}, {accLoc.zipcode}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Lat/Lon">
            {accLoc.lat}, {accLoc.lon}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${apiRoutes.adminLocations}/${accLoc.gid}`)
          .then(() => {
            setAlertTable("success", `Location ID ${accLoc.gid} is deleted successfully.`)
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

  const searchLocationKeyword = (e:any) => {
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
            <h5>Locations</h5>
            <Input placeholder='Search ip, city, country' className='ml-4' onChange={searchLocationKeyword} />
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
            .get(apiRoutes.adminLocations, {
              params: {
                keyword,
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const locations: [Location] = response.data.data;

              return {
                data: locations,
                success: true,
                total: response.data.total,
              } as RequestData<Location>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<Location>;
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
                name="gid"
                style={{display:"none"}}
              >
              <Input
                type='hidden'
              />
            </Form.Item>
            <Form.Item
              name="ip"
              label={
                <p className="block text-sm font-medium text-gray-900">IP Address</p>
              }
              rules={[
                {
                  required: true,
                  message: 'ip address should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter ip address"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="city"
              label={
                <p className="block text-sm font-medium text-gray-900">City</p>
              }
              rules={[
                {
                  required: true,
                  message: 'city should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter city"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="country"
              label={
                <p className="block text-sm font-medium text-gray-900">Country</p>
              }
              rules={[
                {
                  required: true,
                  message: 'country should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter country"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="lat"
              label={
                <p className="block text-sm font-medium text-gray-900">Latitude</p>
              }
              rules={[
                {
                  required: true,
                  message: 'latitude should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter latitude"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="lon"
              label={
                <p className="block text-sm font-medium text-gray-900">Longitude</p>
              }
              rules={[
                {
                  required: true,
                  message: 'longitude should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter longitude"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </div>
          <div>
            <Form.Item
              name="lon"
              label={
                <p className="block text-sm font-medium text-gray-900">Map</p>
              }
            >
              <GeoMap lat={form.getFieldValue("lat")} lon={form.getFieldValue("lon")} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </BasePageContainer>
  );
};

export default Locations;
