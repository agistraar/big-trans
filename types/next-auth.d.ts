import { $Enums } from '@prisma/client';
import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      name: string;
      role: $Enums.Role;
    };
  }
  interface User {
    id: number;
    name: string;
    role: $Enums.Role;
  }
  // interface JWT {
  //   role:
  // }
}
