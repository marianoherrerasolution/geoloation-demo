export interface FormLogin {
  email: string;
  password: string;
}

export interface FormUser extends FormLogin{
  fName: string;
  lName: string;
  client_id: number;
}

export interface User extends FormUser {
  id: number;
  avatar: string;
}
