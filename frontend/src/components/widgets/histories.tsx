import { ActionType, ProColumns, ProTable, RequestData } from "@ant-design/pro-components";
import { WidgetUsage } from "../../interfaces/models/widget_usage";
import { Col, Input, Row, Tag } from "antd";
import titleize from "titleize";
import dayjs from "dayjs";
import { useRef, useState } from "react";
import { RootState } from "../../store";
import { useSelector } from "react-redux";
import { apiURL } from "../../routes/api";
import { defaultHttp } from "../../utils/http";
import { handleErrorResponse } from "../../utils";

export interface HistoryProps {
  widgetID: number,
}

const googleMap:string = "https://www.google.com/maps/search"

const WidgetHistories = (props: HistoryProps) => {
  const admin = useSelector((state: RootState) => state.admin);
  const actionRef = useRef<ActionType>();
  const [keyword, setKeyword] = useState<string>("");

  const columns: ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'center',
      sorter: false,
      render: (_, row: WidgetUsage) => row.id
    },
    {
      title: 'Access',
      dataIndex: 'allow',
      align: 'center',
      sorter: false,
      render: (_, row: WidgetUsage) => row.allow == 1 ? <Tag color="green">allowed</Tag> : <Tag color="red">denied</Tag>
    },
    {
      title: 'Coordinate',
      dataIndex: 'latitude',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => row.latitude ? <a href={`${googleMap}/${row.latitude},${row.longitude}?entry=tts`} target="_blank">Lat: {row.latitude} | Lon: {row.longitude}</a> : ""
    },
    {
      title: 'Params IP',
      dataIndex: 'ip',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => row.ip
    },
    {
      title: 'Remote IP',
      dataIndex: 'remote_ip',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => row.remote_ip
    },
    {
      title: 'Referer',
      dataIndex: 'referer',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => row.referer
    },
    {
      title: 'City',
      dataIndex: 'city',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => row.city ? titleize(row.city) : ""
    },
    {
      title: 'Country',
      dataIndex: 'country',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => row.country ? titleize(row.country) : ""
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      sorter: false,
      align: 'left',
      ellipsis: true,
      render: (_, row: WidgetUsage) => dayjs(row.created_at).format("DD-MM-YYYY HH:mm")
    }
  ];
  
  const searchByKeyword = (e: any) => {
    setKeyword(e.target.value);
    actionRef.current?.reload(true);
  };

  const widgetsURL = () => (admin ? apiURL.widgets : apiURL.user.widgets);

  return (
    <Row gutter={24}>
      <Col span={24}>
        <ProTable
          columns={columns}
          cardBordered={false}
          headerTitle={
            <>
              <h5>Usages</h5>
              <Input placeholder='Search ip, referrer, country, city' className='mr-4 ml-4' onChange={searchByKeyword} style={{width: 200}} />
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
              .get(`${widgetsURL()}/${props.widgetID}/usages`, {
                params: {
                  keyword,
                  page: params.current,
                  per_page: params.pageSize,
                },
              })
              .then((response) => {
                const usages: [WidgetUsage] = response.data.data;
                return {
                  data: usages,
                  success: true,
                  total: response.data.total,
                } as RequestData<WidgetUsage>;
              })
              .catch((error) => {
                handleErrorResponse(error);
                return {
                  data: [],
                  success: false,
                } as RequestData<WidgetUsage>;
              });
          }}
          dateFormatter="string"
          search={false}
          rowKey="id"
          options={{
            search: false,
          }}
        />
      </Col>
    </Row>
  )
}
export default WidgetHistories;