import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { BreadcrumbProps, Modal, Select, Space, Button, Input } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { Product, ProductForm } from '../../interfaces/models/product';
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
import { Client, ClientForm } from '../../interfaces/models/client';
import titleize  from 'titleize';
import { SelectTag } from '../../interfaces/models/select';
import { BiSolidPackage } from 'react-icons/bi';
import FormClient from './form';

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
      key: adminRoutes.users,
      title: <Link to={adminRoutes.users}>Clients</Link>,
    },
  ],
};

const Clients = () => {
  const actionRef = useRef<ActionType>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [alertTableTheme, setAlertTableTheme] = useState<string>("");
  const [alertTableMessage, setAlertTableMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [formData, setFormData] = useState<ClientForm>({} as ClientForm);
  const [showEdit, setShowEdit] = useState<boolean>(false);
 
  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      sorter: false,
      render: (_, row: Client) => row.id
    },
    {
      title: 'Company',
      dataIndex: 'company',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Client) => row.company ? titleize(row.company) : ""
    },
    {
      title: 'Website',
      dataIndex: 'website',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Client) => row.website ? titleize(row.website) : ""
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: Client) => [
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

  const handleActionOnSelect = (key: string, record: Client) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(record)
      case ActionKey.EDIT:
        return showEditModal(record)
      default:
        return
    }
  };

  const showEditModal = (record: ClientForm) => {
    setFormData(record)
    setAlertTable("")
    setShowEdit(true)
  }

  const showNewRecord = () =>{
    let record:ClientForm = {} as ClientForm
    setFormData(record)
    setAlertTable("")
    setShowEdit(true)
  }

  const setAlertTable = (theme: string, message?: string) => {
    setAlertTableTheme(theme)
    if (message) { setAlertTableMessage(message) }
  }

  const onSubmitForm = () => {
    setAlertTable("")
  }

  const onSubmitSuccess = () => {
    actionRef.current?.reload(true);
  }

  const onSubmitError = () => {

  }

  const showDeleteConfirmation = (client: Client) => {
    modal.confirm({
      title: 'Are you sure to delete this Client?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ client.id }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Company">
            {titleize(client.company || "")}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Website">
            {titleize(client.website || "")}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${apiURL.clients}/${client.id}`)
          .then(() => {
            setAlertTable("success", `Client ID ${client.id} is deleted successfully.`)
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

  const searchByKeyword = (e:any) => {
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
            <h5>Clients</h5>
            <Input placeholder='Search client name' className='mr-4 ml-4' onChange={searchByKeyword} style={{width: 200}} />
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
            .get(apiURL.clients, {
              params: {
                keyword,
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const results: [Client] = response.data.data;
              return {
                data: results,
                success: true,
                total: response.data.total,
              } as RequestData<Client>;
            })
            .catch((error) => {
              handleErrorResponse(error);
              return {
                data: [],
                success: false,
              } as RequestData<Client>;
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
            <Button onClick={() => showNewRecord()} key="show" type="primary" icon={<BiSolidPackage />} style={{background: "#4150e8"}}>
              New Client
            </Button>
          ]
        }}
      />
      {modalContextHolder}
      {
        showEdit ? <FormClient
          show={showEdit} 
          onClose={() => setShowEdit(false)} 
          onError={onSubmitError}
          onSubmit={onSubmitForm}
          onSuccess={onSubmitSuccess}
          formData={formData}
        /> : ""
      }
    </BasePageContainer>
  );
};

export default Clients;
