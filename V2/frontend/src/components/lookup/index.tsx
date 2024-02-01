import { BreadcrumbProps } from 'antd';
import { useEffect, useState, useRef } from 'react';
import BasePageContainer from '../layout/PageContainer';
import { webRoutes } from '../../routes/web';
import { Link } from 'react-router-dom';
import {
  MdOutlineShareLocation,
  MdOutlineLocationCity,
  MdOutlineSignpost,
  MdVpnLock,
  MdOutlineWatchLater,
  MdOutlineWifi,
  MdLocationPin
} from "react-icons/md";
import frowser from "frowser";
import packageJson from '../../../package.json';
import { setPageTitle, handleErrorResponse } from '../../utils';
import { defaultHttp } from '../../utils/http';
import { apiRoutes } from '../../routes/api';
import { Geoip } from '../../interfaces/models/geoip';
import GeoMap from '../geomap';
import {
  Row,
  Col,
  Card,
} from 'antd';
import ReactCountryFlag from "react-country-flag"
import Loader from '../loader';

const breadcrumb: BreadcrumbProps = {
  items: [
    {
      key: webRoutes.lookup,
      title: <Link to={webRoutes.lookup}>Lookup</Link>,
    },
  ],
};

const getBrowserName = () => frowser.getParser(window.navigator.userAgent).getBrowserName();
const getBrowserVersion = () => frowser.getParser(window.navigator.userAgent).getBrowserVersion();
const Lookup = () => {
  const packageVersion = packageJson.version;
  const [loading, setLoading] = useState<boolean>(false);
  const [geoip, setGeoip] = useState<Geoip>();
  const mounted = useRef(false);

  const checkIPAddress = (ip: string) => {
    defaultHttp
      .post(apiRoutes.lookup, {
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ip
      })
      .then((response) => {
        setGeoip(response.data);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
        handleErrorResponse(err);
      })
  }

  const getIpAddress = () => {
    setLoading(true);
    defaultHttp
      .get("https://api.ipify.org/?format=json")
      .then(response => checkIPAddress(response?.data?.ip))
      .catch(err => {
        console.log(err)
        checkIPAddress("");
      })
  }

  const getLat = () => {
    return Number(geoip?.address?.latitude)
  }

  const getLon = () => {
    return Number(geoip?.address?.longitude)
  }

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setPageTitle('Login');
      getIpAddress();
    }
  })

  return (
    <BasePageContainer breadcrumb={breadcrumb}>
      <div className="m-5">
        <Row gutter={24}>
          <Col xl={6} lg={6} md={6} sm={12} xs={24} className="mb-4">
            <Card
              title={
                <span>
                  <MdOutlineShareLocation className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">IP ADDRESS</span>
                </span>
              }
            >
              <span className="text-xl">{geoip?.ip}</span>
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24} className="mb-4">
            <Card
              title={
                <span>
                  <ReactCountryFlag countryCode={geoip?.address?.country_code2 || ''} className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">COUNTRY</span>
                </span>
              }
            >
              <span className="text-xl">{geoip?.address?.country_name}</span>
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24}  className="mb-4">
            <Card
              title={
                <span>
                  <MdOutlineLocationCity className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">CITY</span>
                </span>
              }
            >
              <span className="text-xl">{geoip?.address?.city}</span>
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24}  className="mb-4">
            <Card
              title={
                <span>
                  <MdOutlineSignpost className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">POSTCODE</span>
                </span>
              }
            >
              <span className="text-xl">{geoip?.address?.zipcode}</span>
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24} className="mb-4">
            <Card
              title={
                <span>
                  <MdVpnLock className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">VPN CONNECTION</span>
                </span>
              }
            >
              {
                (geoip?.res?.result) ? 
                  <span className="text-xl text-gray-400">Disabled</span>
                 : 
                  <span className="text-xl text-green-900">Enabled</span>
              }
              
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24}  className="mb-4">
            <Card
              title={
                <span>
                  <MdOutlineWifi className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">ISP</span>
                </span>
              }
            >
              <span className="text-xl">{geoip?.address?.isp}</span>
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24} className="mb-4">
            <Card
              title={
                <span>
                  <MdOutlineWatchLater className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">TIMEZONE</span>
                </span>
              }
            >
              <span className="text-xl">{geoip?.address?.time_zone?.name} </span>
              {
                (
                  geoip?.address?.time_zone?.offset ? 
                  <span className="text-xl"> (UTC{
                    geoip?.address?.time_zone?.offset > -1 ? '+' : '-'
                  }
                  {geoip?.address?.time_zone?.offset})</span>
                  : ''
                )
              }
            </Card>
          </Col>
          <Col xl={6} lg={6} md={6} sm={12} xs={24}  className="mb-4">
            <Card
              title={
                <span>
                  <MdOutlineWifi className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">BROWSER</span>
                </span>
              }
            >
              <span className="text-xl">{getBrowserName()} {getBrowserVersion()}</span>
            </Card>
          </Col>
          <Col xl={24} lg={24} md={24} sm={24} xs={24} className="mb-4">
            <Card
              title={
                <span>
                  <MdLocationPin className="inline-block mr-2 text-2xl" />
                  <span className="inline-block">MAP</span>
                </span>
              }
            >
              {
                loading ? <Loader /> : <GeoMap lat={getLat()} lon={getLon()} />
              }
            </Card>
          </Col>
        </Row>
      </div>
    </BasePageContainer>
  );
};

export default Lookup;
