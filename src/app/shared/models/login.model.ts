

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
