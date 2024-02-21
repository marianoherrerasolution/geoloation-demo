import {
  ActionType,
  ProTable,
  ProColumns,
  RequestData,
  TableDropdown,
  ProDescriptions,
} from '@ant-design/pro-components';
import { BreadcrumbProps, Modal, Select, Space, Button, Input, Tag } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { CiCircleMore } from 'react-icons/ci';
import { Link } from 'react-router-dom';
import { Widget, WidgetForm } from '../../interfaces/models/widget';
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
import { ClientForm } from '../../interfaces/models/client';
import titleize  from 'titleize';
import { SelectTag } from '../../interfaces/models/select';
import { BiSolidPackage } from 'react-icons/bi';
import FormWidget from './form';
import FormClient from '../clients/form';

enum ActionKey {
  DELETE = 'delete',
  EDIT = 'edit'
}

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: adminRoutes.widgets,
      title: <Link to={adminRoutes.widgets}>Widgets</Link>,
    },
  ],
};

const Widgets = () => {
  const actionRef = useRef<ActionType>();
  const [modal, modalContextHolder] = Modal.useModal();
  const [alertTableTheme, setAlertTableTheme] = useState<string>("");
  const [alertTableMessage, setAlertTableMessage] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [clientIDs, setClienttIDs] = useState<Array<number>>([]);
  const [formData, setFormData] = useState<WidgetForm>({} as WidgetForm);
  const [formDataClient, setFormDataClient] = useState<ClientForm>({} as ClientForm);
  const [showEdit, setShowEdit] = useState<boolean>(false);
  const [showClient, setShowClient] = useState<boolean>(false);
 
  const mounted = useRef(false);
  const [selectClients, setSelectClients] = useState<Array<SelectTag>>([])

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      getClients();
    }
  })

  const getClients = () => {
    defaultHttp.get(`${apiURL.clients}/select`)
    .then(({data}) => {
      let clientForOptions = [{value: "", label: "Create New Client"}]
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
      render: (_, row: Widget) => row.id
    },
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => row.name ? titleize(row.name) : ""
    },
    {
      title: 'Type',
      dataIndex: 'restriction_type',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => row.restriction_type ? titleize(row.restriction_type) : ""
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => <>{ 
        row.client_name ? <a onClick={() => filterByClient(row.client_id)} >{titleize(row.client_name)}</a> : <></>
      }</>
    },
    {
      title: 'Status',
      dataIndex: 'active',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: Widget) => row.active < 2 ? <Tag color="lime">Active</Tag> : <Tag color="gray">Inactive</Tag>
    },
    {
      title: 'Action',
      align: 'center',
      key: 'option',
      fixed: 'right',
      render: (_, row: Widget) => [
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

  const handleActionOnSelect = (key: string, widget: Widget) => {
    switch(key) {
      case ActionKey.DELETE:
        return showDeleteConfirmation(widget)
      case ActionKey.EDIT:
        return showEditModal(widget)
      default:
        return
    }
  };

  const showEditModal = (record: WidgetForm) => {
    setFormData(record)
    setAlertTable("")
    setShowEdit(true)
  }

  const showNewWidget = () =>{
    let record:WidgetForm = {} as WidgetForm
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

  const showDeleteConfirmation = (widget: Widget) => {
    modal.confirm({
      title: 'Are you sure to delete this Widget?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <ProDescriptions column={1} title=" ">
          <ProDescriptions.Item valueType="text" label="ID">{ widget.id }</ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Name">
            {titleize(widget.name || "")}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Client">
            {titleize(widget.client_name || "")}
          </ProDescriptions.Item>
          <ProDescriptions.Item valueType="text" label="Restriction Type">
            {titleize(widget.restriction_type || "")}
          </ProDescriptions.Item>
        </ProDescriptions>
      ),
      okButtonProps: {
        className: 'bg-primary',
      },
      onOk: () => {
        return defaultHttp
          .delete(`${apiURL.widgets}/${widget.id}`)
          .then(() => {
            setAlertTable("success", `Widget ID ${widget.id} is deleted successfully.`)
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

  const changedClientForm = (e: any) => {
    console.log(e)
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
            <h5>Widgets</h5>
            <Input placeholder='Search widget name' className='mr-4 ml-4' onChange={searchByKeyword} style={{width: 200}} />
            <Select
              mode='multiple'
              showSearch
              allowClear
              maxTagCount={1}
              style={{ width: 200 }}
              placeholder="Select a client"
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
          pageSize: 10,
        }}
        actionRef={actionRef}
        request={(params) => {
          return defaultHttp
            .get(apiURL.widgets, {
              params: {
                keyword,
                client_ids: clientIDs.join(","),
                page: params.current,
                per_page: params.pageSize,
              },
            })
            .then((response) => {
              const widgets: [Widget] = response.data.data;
              return {
                data: widgets,
                success: true,
                total: response.data.total,
              } as RequestData<Widget>;
            })
            .catch((error) => {
              handleErrorResponse(error);

              return {
                data: [],
                success: false,
              } as RequestData<Widget>;
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
            <Button onClick={() => showNewWidget()} key="show" type="primary" icon={<BiSolidPackage />} style={{background: "#4150e8"}}>
              New Widget
            </Button>
          ]
        }}
      />
      {modalContextHolder}
      {
        showEdit ? <FormWidget
          show={showEdit} 
          onClose={() => setShowEdit(false)} 
          clientOptions={selectClients} 
          onError={onSubmitError}
          onSubmit={onSubmitForm}
          onSuccess={onSubmitSuccess}
          onShowClient={showClientForm}
          formData={formData}
        /> : ""
      }
      {
        showClient ? <FormClient
          show={showClient} 
          onClose={() => setShowClient(false)} 
          onError={onClientError}
          onSubmit={onSubmitForm}
          onSuccess={onClientSuccess}
          formData={formDataClient}
        /> : ""
      }
      
    </BasePageContainer>
  );
};

export default Widgets;
