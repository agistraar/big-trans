import LoginForm from '@/components/Auth/LoginForm';
import { Typography } from '@mui/material';
import { getServerSession } from 'next-auth';
import React from 'react';
import { options } from '../api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';

const Login = async () => {
  const session = await getServerSession(options);

  if (session) {
    redirect('Home');
  }
  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='w-1/3 bg-white shadow-lg rounded-2xl px-4 py-6 space-y-8'>
        <Typography variant='h4' className='text-center'>
          Login
        </Typography>
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
