import type { UserRecord } from '../types/auth';

export const USERS: UserRecord[] = [
  { id: '1', username: 'trader',  password: 'trade123', name: 'Alex Carter',  role: 'trader' },
  { id: '2', username: 'admin',   password: 'admin123', name: 'System Admin', role: 'admin'  },
];
