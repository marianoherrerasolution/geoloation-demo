import { ActionType, ProColumns, ProTable, RequestData } from "@ant-design/pro-components";
import { WidgetUsage } from "../../interfaces/models/widget_usage";
import { Card, Col, Input, Row, Tag } from "antd";
import titleize from "titleize";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
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
import { OverviewAnalytic } from "../../interfaces/models/analytic";
import Title from "antd/es/typography/Title";
import { Line } from "@ant-design/plots";
import LineChart from "@ant-design/plots/es/components/line";


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
  const [overview, setOverview] = useState<OverviewAnalytic>()
  const [lineCharts, setLineCharts] = useState<any>(<></>)
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      if (props.restrictionID) {
        prepareMap()
      }
    }
  });


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

  const prepareMap = () => {
    defaultHttp
      .get(`${widgetsURL()}/${props.restrictionID}/analytic`)
      .then((response) => {
        setOverview(response.data.overview)
        setShowMap(false)
        let markers:Marker[] = []
        const totalMarker = response.data.markers.length
        for(let i = 0; i < totalMarker; i += 1) {
          let marker = response.data.markers[i]
          markers.push({
            point: new Point(fromLonLat([marker.lon, marker.lat])),
            icon: marker.allow == 1 ? GreenPin : RedPin
          })
        }
        setMapMarkers(markers)
        setTimeout(() => {
          setShowMap(true)
        }, 500)

        let uniqDaily:any = []
        let acceptedDaily:any = []
        let hitDaily:any = []
        let totalDaily = response.data.daily.length
        for(let i = 0; i < totalDaily; i += 1) {
          let item = response.data.daily[i]
          uniqDaily.push({date: item.date, total: item.total_uniq})
          acceptedDaily.push({date: item.date, total: item.total_allow})
          hitDaily.push({date: item.date, total: item.total_hit})
        }
        let lines:any = []
        lines.push(<Col span={8} style={{marginBottom: "50px"}} >
          <Row gutter={24}>
            <Col span={24}><Title style={{marginTop: "50px"}} level={3}>Daily Uniq Access</Title></Col>
            <Col span={24}><LineChart {...chartConfig(uniqDaily)} /></Col>
          </Row>
        </Col>)
        lines.push(<Col span={8} style={{marginBottom: "50px"}} >
          <Row gutter={24}>
            <Col span={24}><Title style={{marginTop: "50px"}} level={3}>Daily Accepted Access</Title></Col>
            <Col span={24}><LineChart {...chartConfig(acceptedDaily)} /></Col>
          </Row>
        </Col>)
        lines.push(<Col span={8} style={{marginBottom: "50px"}} >
          <Row gutter={24}>
            <Col span={24}><Title style={{marginTop: "50px"}} level={3}>Daily Hits</Title></Col>
            <Col span={24}><LineChart {...chartConfig(hitDaily)} /></Col>
          </Row>
        </Col>)
        setLineCharts(lines)

      })
      .catch((error) => {
        handleErrorResponse(error);
      })

       
    
  }

  const chartConfig = (data: any) => {
    return {
      data,
      xField: 'date',
      yField: 'total',
      label: {},
      point: {
        size: 5,
        shape: 'diamond',
        style: {
          fill: 'white',
          stroke: '#5B8FF9',
          lineWidth: 2,
        },
      },
      tooltip: {
        showMarkers: false,
      },
      state: {
        active: {
          style: {
            shadowBlur: 4,
            stroke: '#000',
            fill: 'red',
          },
        },
      },
      interactions: [
        {
          type: 'marker-active',
        },
      ],
    };
  }

  
  return (
    <Row gutter={24}>
      <Col span={24}><Title style={{marginTop: "20px"}} level={3}>Overview in 30 days</Title></Col>
      <Col span={6}>
        <Card title="Access Allowed">
          <Title level={3} className="text-center">{overview?.total_allow || "..."}</Title>
        </Card>
      </Col>
      <Col span={6}>
        <Card title="Access Denied">
          <Title level={3} className="text-center">{overview?.total_deny || "..."}</Title>
        </Card>
      </Col>
      <Col span={6}>
        <Card title="Total Hits">
          <Title level={3} className="text-center">{overview?.total_hit || "..."}</Title>
        </Card>
      </Col>
      <Col span={6}>
        <Card title="Uniq Access">
          <Title level={3} className="text-center">{overview?.total_uniq || "..."}</Title>
        </Card>
      </Col>
      { lineCharts }
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