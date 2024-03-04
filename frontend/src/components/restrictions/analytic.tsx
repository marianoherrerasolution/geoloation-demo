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
import GeoMap from "../geomap";
import { Coordinate } from "ol/coordinate";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";
import GreenPin from "./pin_correct2.png"
import RedPin from "./pin_wrong2.png"
import { Marker } from "../../interfaces/models/marker";


export interface AnalyticProps {
  restrictionID: string,
  centerLat: number;
  centerLon: number;
  fillColor: string;
  strokeColor: string;
  polygon: Coordinate[][];
}

const googleMap:string = "https://www.google.com/maps/search"

const AnalyticRestriction = (props: AnalyticProps) => {
  const admin = useSelector((state: RootState) => state.admin);
  const actionRef = useRef<ActionType>();
  const [keyword, setKeyword] = useState<string>("");
  const [showMap, setShowMap] = useState<boolean>(false);
  const [mapMarkers, setMapMarkers] = useState<Array<Marker>>([])
  const [pageSize, setPageSize] = useState<number>(10)

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

  const widgetsURL = () => (admin ? apiURL.restrictions : apiURL.user.restrictions);

  const prepareUniqMarkers = (histories: [WidgetUsage]) => {
    setShowMap(false)    
    let uniqMarkers:any = {}
    let markers:Marker[] = []
    const totalHistories = histories.length
    for(let i = 0; i < totalHistories; i += 1) {
      let history = histories[i]
      if (history.latitude != 0 && history.longitude != 0) {
        let coordinateKey = `${history.latitude.toFixed(8)}_${history.longitude.toFixed(8)}`
        if (!uniqMarkers[coordinateKey]) {
          uniqMarkers[coordinateKey] = true
          markers.push({
            point: new Point(fromLonLat([history.longitude, history.latitude])),
            icon: history.allow == 1 ? GreenPin : RedPin
          })
        }
      }
    }
    setMapMarkers(markers)
    setTimeout(() => {
      setShowMap(true)
    }, 500)
  }
  
  return (
    <Row gutter={24}>
      {
        showMap ? <Col span={24}>
        <GeoMap lat={props.centerLat} lon={props.centerLon} 
          strokeColor={props.strokeColor}
          fillColor={props.fillColor}
          polygonCoordinates={props.polygon}
          markers={mapMarkers}
        /></Col> : <></>
      }
      
      <Col span={24}>
        <ProTable
          columns={columns}
          cardBordered={false}
          headerTitle={
            <>
              <h5>Histories</h5>
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
            pageSize: pageSize,
          }}
          actionRef={actionRef}
          request={(params) => {
            if (params.pageSize && params.pageSize != pageSize) {
              setPageSize(params.pageSize)
            }
            return defaultHttp
              .get(`${widgetsURL()}/${props.restrictionID}/histories`, {
                params: {
                  keyword,
                  page: params.current,
                  per_page: params.pageSize,
                },
              })
              .then((response) => {
                const histories: [WidgetUsage] = response.data.data;
                prepareUniqMarkers(histories)
                return {
                  data: histories,
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
export default AnalyticRestriction;