export interface Admin {
  id: number;
  token: string;
  fName: string;
  lName: string;
  email: string;
  password: string;
  role: string;
}

export interface FormAdmin {
  fName: string,
  lName: string,
  email: string;
  password: string;
}

export interface FormAdminLogin {
  email: string;
  password: string;
}
