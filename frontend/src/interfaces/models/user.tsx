export interface FormLogin {
  email: string;
  password: string;
}

export interface FormUser extends FormLogin{
  fName: string;
  lName: string;
  client_id: any;
}

export interface User extends FormUser {
  id: number;
  client_name: string;
  avatar: string;
  token: string;
}
