export interface User {
  id: number;
  token: string;
  fName: string;
  lName: string;
  email: string;
  password: string;
  avatar: string;
}

export interface FormUser {
  fName: string,
  lName: string,
  email: string;
  password: string;
}

export interface FormLogin {
  email: string;
  password: string;
}
