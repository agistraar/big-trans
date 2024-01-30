import React from 'react';
import { options } from '../api/auth/[...nextauth]/options';
import { getServerSession } from 'next-auth';
import { Typography } from '@mui/material';
import Header from '@/components/Global/Header';
import { redirect } from 'next/navigation';
import moment from 'moment';
import 'moment/locale/id';

const Home = async () => {
  const session = await getServerSession(options);

  if (!session) {
    redirect('/api/auth/signin?callbackUrl=/server');
  }

  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + '/dashboard', {
    next: { revalidate: 0 },
  });
  const parsed = await res.json();
  //daily data
  const dailySale = Number(parsed.dailySaleTotal[0].nominal);
  const dailyPayment = Number(parsed.dailyPaymentTotal._sum.nominal);
  const dailyTotal =
    (dailySale ? dailySale : 0) + (dailyPayment ? dailyPayment : 0);
  const dailyInet = parsed.typeDailyPaymentTotal.find(
    (val: any) => val.type == 'INET'
  );
  const dailyDigital = parsed.typeDailyPaymentTotal.find(
    (val: any) => val.type == 'DIGITAL'
  );
  const dailyAnalog = parsed.typeDailyPaymentTotal.find(
    (val: any) => val.type == 'ANALOG'
  );

  //monthly data
  const monthlySale = Number(parsed.monthlySaleTotal[0].nominal);
  const monthlyPayment = Number(parsed.monthlyPaymentTotal._sum.nominal);
  const monthlyTotal =
    (monthlySale ? monthlySale : 0) + (monthlyPayment ? monthlyPayment : 0);
  const monthlyInet = parsed.typeMonthlyPaymentTotal.find(
    (val: any) => val.type == 'INET'
  );
  const monthlyDigital = parsed.typeMonthlyPaymentTotal.find(
    (val: any) => val.type == 'DIGITAL'
  );
  const monthlyAnalog = parsed.typeMonthlyPaymentTotal.find(
    (val: any) => val.type == 'ANALOG'
  );

  return (
    <div className='w-full min-h-screen'>
      <Header />
      <div className='flex w-full mt-6 px-4 flex-col'>
        <div className='w-full flex space-x-4 text-white font-bold'>
          <div className='w-1/2 bg-teal-500 px-3 py-4 flex rounded-2xl shadow items-center justify-between'>
            <div className='flex flex-col space-y-3'>
              <p className='text-2xl'>Pemasukan Bulan Ini</p>
              <p>{moment().format('MMMM YYYY')}</p>
            </div>
            <p className='text-4xl'>
              {Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(monthlyTotal)}
            </p>
          </div>
          <div className='w-1/2 bg-teal-500 px-3 py-4 flex rounded-2xl shadow items-center justify-between'>
            <div className='flex flex-col space-y-3'>
              <p className='text-2xl'>Pemasukan Hari Ini</p>
              <p>{moment().format('dddd, DD MMMM YYYY')}</p>
            </div>
            <p className='text-4xl'>
              {Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                maximumFractionDigits: 0,
              }).format(dailyTotal)}
            </p>
          </div>
        </div>
        <div className='w-full flex space-x-4 font-medium'>
          <div className='w-1/2 flex flex-col px-2 py-4'>
            <Typography variant='h6'>Detail Bulan Ini</Typography>
            <div className='w-full grid grid-cols-2 gap-4'>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow'>
                <p className='text-xl'>Internet</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(monthlyInet ? monthlyInet.sum : 0))}
                </p>
              </div>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow'>
                <p className='text-xl'>TV Analog</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(monthlyAnalog ? monthlyAnalog.sum : 0))}
                </p>
              </div>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow '>
                <p className='text-xl'>TV Digital</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(monthlyDigital ? monthlyDigital.sum : 0))}
                </p>
              </div>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow'>
                <p className='text-xl'>Penjualan Barang</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(monthlySale ? monthlySale : 0))}
                </p>
              </div>
            </div>
          </div>
          <div className='w-1/2 flex flex-col px-2 py-4'>
            <Typography variant='h6'>Detail Hari Ini</Typography>
            <div className='w-full grid grid-cols-2 gap-4'>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow'>
                <p className='text-xl'>Internet</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(dailyInet ? dailyInet.sum : 0))}
                </p>
              </div>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow'>
                <p className='text-xl'>TV Analog</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(dailyAnalog ? dailyAnalog.sum : 0))}
                </p>
              </div>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow '>
                <p className='text-xl'>TV Digital</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(Number(dailyDigital ? dailyDigital.sum : 0))}
                </p>
              </div>
              <div className=' bg-teal-100 flex flex-col space-y-3 px-2 py-3 rounded-xl shadow'>
                <p className='text-xl'>Penjualan Barang</p>
                <p className='text-2xl'>
                  {Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0,
                  }).format(dailySale ? dailySale : 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
