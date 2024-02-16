export interface FormAdminLogin {
  email: string;
  password: string;
}

export interface FormAdmin extends FormAdminLogin {
  id: number;
  fName: string;
  lName: string;
}

export interface Admin extends FormAdmin{
  token: string;
  role: string;
}


