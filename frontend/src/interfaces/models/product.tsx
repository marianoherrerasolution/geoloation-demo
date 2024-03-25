export interface ProductSelect {
  id: string;
  name: string;
}

export interface ProductForm extends ProductSelect {
  client_id: number;
  app_type: string;
}

export interface Product extends ProductForm {
  client_name: string;
  created_at: Date;
  updated_at: Date;
}
