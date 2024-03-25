import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import {BreadcrumbProps, Modal, Space, Button, Form, Input, Flex } from 'antd';
import { useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { GeoipTable } from '../../interfaces/models/geoip';
import { apiURL } from '../../routes/api';
import { adminRoutes } from '../../routes/web';
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
      title: <Link to={adminRoutes.locations}>Geoips</Link>,
    },
  ],
};

const Geoips = () => {
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
  const [pageSize, setPageSize] = useState<number>(10);

  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      sorter: false,
      render: (_, row: GeoipTable) => row.id
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
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
      title: 'State',
      dataIndex: 'state',
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
      title: 'Latitude',
      dataIndex: 'latitude',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Longitude',
      dataIndex: 'longitude',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      sorter: false,
      align: 'left',
      ellipsis: true,
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: GeoipTable) => [
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

  const handleActionOnSelect = (key: string, user: GeoipTable) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(user)
      case ActionKey.EDIT:
        return showEditModal(user)
      default:
        return
    }
  };

  const showEditModal = (geoip: GeoipTable) => {
    form.setFieldsValue(geoip)
    setAlertTable("")
    setAlertEdit("")
    setEditTitle(`GeoIP ID: ${geoip.id}`)
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

  const onUpdate = (geoip: GeoipTable) => {
    setLoading(true);
    setAlertTable("")
    defaultHttp
      .put(`${apiURL.geoips}/${geoip.id}`, geoip)
      .then(() => {
        setLoading(false)
        setAlertEdit("success", `GeoIP ID ${geoip.id} is updated successfully.`)
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

  const showDeleteConfirmation = (geoip: GeoipTable) => {
    modal.confirm({
      title: 'Are you sure to delete this GeoIP?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ geoip.id }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Address">
            {geoip.city}, {geoip.state}, {geoip.country}, {geoip.zipcode}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Lat/Lon">
            {geoip.latitude}, {geoip.longitude}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${apiURL.geoips}/${geoip.id}`)
          .then(() => {
            setAlertTable("success", `GeoIP ID ${geoip.id} is deleted successfully.`)
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

  const searchGeoipTableKeyword = (e:any) => {
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
            <h5>Geoips</h5>
            <Input placeholder='Search ip, city, state, country, timezone' className='ml-4' onChange={searchGeoipTableKeyword} />
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
            .get(apiURL.geoips, {
              params: {
                keyword,
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const locations: [GeoipTable] = response.data.data;

              return {
                data: locations,
                success: true,
                total: response.data.total,
              } as RequestData<GeoipTable>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<GeoipTable>;
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
              name="ip_address"
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
          <Flex wrap="wrap" gap="large">
              <Form.Item
                className="mb-0"
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
              <Form.Item
                name="state"
                className="mb-0"
                label={
                  <p className="block text-sm font-medium text-gray-900">State</p>
                }
                rules={[
                  {
                    required: true,
                    message: 'state should be filled',
                  },
                ]}
              >
                <Input
                  placeholder="please enter state"
                  className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
                />
              </Form.Item>
          </Flex>
          <Flex wrap="wrap" gap="large">
            <Form.Item
              name="country"
              className="mb-0"
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
            <Form.Item
              name="zipcode"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Zipcode</p>
              }
              rules={[
                {
                  required: true,
                  message: 'zipcode should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter zipcode"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Flex>
          <Flex wrap="wrap" gap="large" className="mt-0">
            <Form.Item
              name="latitude"
              className="mb-0"
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
            <Form.Item
              name="longitude"
              className="mb-0"
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
          </Flex>
          
          <Flex wrap="wrap" gap="large" className="mt-0">
            <Form.Item
              name="timezone"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Timezone</p>
              }
              rules={[
                {
                  required: true,
                  message: 'timezone should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter timezone"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
            <Form.Item
              name="timezone_offset"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Offset</p>
              }
              rules={[
                {
                  required: true,
                  message: 'timezone should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter timezone offset"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Flex>
          <Flex wrap="wrap" gap="large" className="mt-0">
            <Form.Item
              name="currency"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Currency</p>
              }
              rules={[
                {
                  required: true,
                  message: 'currency should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter currency"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
            <Form.Item
              name="currency_symbol"
              className="mb-0"
              label={
                <p className="block text-sm font-medium text-gray-900">Symbol</p>
              }
              rules={[
                {
                  required: true,
                  message: 'currency symbol should be filled',
                },
              ]}
            >
              <Input
                placeholder="please enter currency symbol"
                className="bg-gray-50 text-gray-900 sm:text-sm py-1.5"
              />
            </Form.Item>
          </Flex>
          <div>
            <Form.Item
              name="lon"
              label={
                <p className="block text-sm font-medium text-gray-900">Map</p>
              }
            >
              <GeoMap lat={form.getFieldValue("latitude")} lon={form.getFieldValue("longitude")} />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </BasePageContainer>
  );
};

export default Geoips;
