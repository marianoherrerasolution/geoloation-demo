export interface RestrictionSelect {
  id: string;
  name: string;
}

export interface RestrictionForm extends RestrictionSelect {
  client_id: number;
  product_id: number;
  polygon_coordinates: string;
  address: string;
  address_lat: number;
  address_lon: number;
  networks: string;
  active: number;
  allow: number;
  vpn: number;
  offsets: string;
}

export interface Restriction extends RestrictionForm {
  client_name: string;
  product_name: string;
  created_at: Date;
  updated_at: Date;
}
