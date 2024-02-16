export interface ProductSelect {
  id: string;
  name: string;
}

export interface ProductForm extends ProductSelect {
  client_id: number;
}

export interface Product extends ProductForm {
  client_name: string;
  created_at: Date;
  updated_at: Date;
}
