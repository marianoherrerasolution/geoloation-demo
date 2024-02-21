export interface WidgetSelect {
  id: string;
  name: string;
}

export interface WidgetForm extends WidgetSelect {
  client_id: number;
  product_ids: Array<number>;
  restriction_ids: Array<number>;
  restriction_type: string;
  active: boolean;
  token: string;
}

export interface Widget extends WidgetForm {
  client_name: string;
  created_at: Date;
  updated_at: Date;
  creator_type: string;
  creator_id: number;
}
