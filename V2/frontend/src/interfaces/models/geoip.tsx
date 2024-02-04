export interface GeoCurrency {
  code: string;
  name: string;
  symbol: string;
}

export interface GeoTimezone {
  name: string;
  offset: number;
  offset_with_dst: number;
  current_time: string;
  current_time_unix: number;
  is_dst: boolean;
  dst_savings: number;
}

export interface GeoAddress {
  ip: string;
  continent_code: string;
  continent_name: string;
  country_code2: string;
  country_code3: string;
  country_name: string;
  country_name_official: string;
  country_capital: string;
  state_prov: string;
  state_code: string;
  district: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  calling_code: string;
  country_tld: string;
  languages: string;
  country_flag: string;
  geoname_id: string;
  isp: string;
  connection_type: string;
  organization: string;
  currency: GeoCurrency;
  time_zone: GeoTimezone;
}

export interface VPNResult {
  result: boolean;
  real: string;
  simulated: string;
}

export interface Geoip {
  ip: string;
  address: GeoAddress;
  res: VPNResult
}

export interface GeoipTable {
  id: number;
  ip_address: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  country: string;
  country_code: string;
  organization: string;
  timezone: string;
  timezone_offset: number;
  currency: string;
  currency_symbol: string;
  zipcode: string;
}