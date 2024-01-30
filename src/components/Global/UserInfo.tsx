'use client';
import { LogoutOutlined } from '@mui/icons-material';
import { IconButton, Typography } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import React from 'react';

const UserInfo = () => {
  const { data } = useSession();
  return (
    <div className='flex items-center space-x-4 text-white'>
      <div className='flex flex-col text-end'>
        <Typography>{data?.user.name}</Typography>
        <Typography>{data?.user.role}</Typography>
      </div>
      <IconButton onClick={() => signOut({ callbackUrl: '/' })}>
        <LogoutOutlined className='text-white' />
      </IconButton>
    </div>
  );
};

export default UserInfo;
