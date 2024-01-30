import Header from '@/components/Global/Header';
import React from 'react';
import { options } from '../api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import SalesTable from '@/components/Tables/SalesTable';
import prisma from '../api/db';
import { Typography } from '@mui/material';

const page = async () => {
  const session = await getServerSession(options);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/server');
  }

  return (
    <div className='w-full min-h-screen'>
      <Header />
      <div className='w-full'>
        <div className='py-2 px-4 space-y-4'>
          <Typography variant='h4'>Data Penjualan Barang</Typography>
          <SalesTable />
        </div>
      </div>
    </div>
  );
};

export default page;
