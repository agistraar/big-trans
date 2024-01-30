'use client';
import { Button, TextField } from '@mui/material';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { FormEventHandler } from 'react';

const LoginForm = () => {
  const [error, setError] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    setIsLoading(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // Validations first!
    const userEmail = data.get('email');
    const userPassword = data.get('password');
    const res = await signIn('credentials', {
      redirect: false,
      email: userEmail,
      password: userPassword,
    });

    if (res?.error) {
      setError(res.error);
      setIsLoading(false);
    }
    if (res?.ok) {
      router.replace('Home');
    }
  };
  return (
    <form
      onSubmit={onSubmit}
      className='w-full flex flex-col items-center space-y-4'
    >
      {error !== '' && (
        <div
          className='w-full bg-gradient-to-bl from-orange-500 
                    to-red-500 text-white rounded-2xl 
                      font-bold px-4 py-6'
        >
          {error}
        </div>
      )}
      <TextField
        id='email'
        name='email'
        label='Email'
        type='email'
        variant='outlined'
        fullWidth
      />
      <TextField
        id='password'
        name='password'
        label='Password'
        type='password'
        variant='outlined'
        fullWidth
      />
      <Button
        disabled={isLoading}
        variant='contained'
        size='large'
        type='submit'
      >
        Login
      </Button>
    </form>
  );
};

export default LoginForm;
