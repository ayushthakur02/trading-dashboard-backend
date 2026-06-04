export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'trader';
}

export interface UserRecord extends User {
  password: string;
}

export interface TokenPayload {
  userId: string;
  username: string;
  role: string;
}
