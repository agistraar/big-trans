import type { NextAuthOptions, User } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const options: NextAuthOptions = {
  providers: [
    Credentials({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'Email' },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Password',
        },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password)
          throw new Error(
            'Credential Error, silahkan coba dalam beberapa saat lagi'
          );

        const params = {
          method: 'POST',
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
          headers: {
            'Content-Type': 'application/json',
          },
        };

        const response = await fetch(
          process.env.NEXT_PUBLIC_API_URL + '/login',
          params
        );

        if (response.status === 500) {
          throw new Error(
            'Server Error, silahkan coba dalam beberapa saat lagi'
          );
        }

        const user = await response.json();
        if (!response.ok) {
          throw new Error(user.message);
        }

        // If no error and we have user data, return it
        if (response.ok && user) {
          return user;
        }

        // Return null if user data could not be retrieved
        return null;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET as string,
  pages: {
    signIn: '../../../Login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 60 * 60 * 24,
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) token = user as unknown as { [key: string]: any };
      return Promise.resolve(token);
    },
    session: async ({ session, token, user }) => {
      session.user = token.user as unknown as User;
      return Promise.resolve(session);
    },
  },
};
