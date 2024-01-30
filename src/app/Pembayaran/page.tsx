import Header from '@/components/Global/Header';
import CustomersTable from '@/components/Tables/CustomersTable';
import { Typography } from '@mui/material';
import { getServerSession } from 'next-auth';
import React from 'react';
import { options } from '../api/auth/[...nextauth]/options';
import { redirect } from 'next/navigation';

const Pembayaran = async () => {
  const session = await getServerSession(options);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/server');
  }

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/region');
  const parsed = await res.json();

  return (
    <div className='w-full min-h-screen'>
      <Header />
      <div className='w-full'>
        <div className='py-2 px-4 space-y-4'>
          <Typography variant='h4'>Data Pembayaran Pelanggan</Typography>
          <CustomersTable regions={parsed.regions} />
        </div>
      </div>
    </div>
  );
};

export default Pembayaran;
