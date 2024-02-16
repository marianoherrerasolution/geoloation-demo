export interface RestrictionSelect {
  id: string;
  name: string;
}

export interface RestrictionForm extends RestrictionSelect {
  client_id: number;
  product_id: number;
  polygon: string;
  networks: string;
  active: boolean;
  allow: boolean;
}

export interface Restriction extends RestrictionForm {
  created_at: Date;
  updated_at: Date;
}
