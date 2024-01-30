import { Button, Typography } from '@mui/material';
import Link from 'next/link';
import React from 'react';
import UserInfo from './UserInfo';

const Header = async () => {
  return (
    <div className='w-full bg-rose-500 flex justify-between items-center text-white px-3 py-4 shadow'>
      <div className='flex items-center space-x-6'>
        <Typography variant='h6'>Manajemen Transaksi BIG</Typography>
        <div className='flex items-center space-x-4'>
          <Link href={'Home'}>Home</Link>
          <Link href={'Pembayaran'}>Pembayaran</Link>
          <Link href={'Penjualan'}>Penjualan</Link>
        </div>
      </div>
      <UserInfo />
    </div>
  );
};

export default Header;
