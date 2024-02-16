export interface ClientSelect {
  id: string;
  company: string;
}

export interface ClientForm extends ClientSelect {
  website: string;
}

export interface Client extends ClientForm {
  created_at: Date;
  updated_at: Date;
}
