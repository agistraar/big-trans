import { paymentListParams } from '@/app/api/payment/route';
import {
  EditOutlined,
  KeyboardArrowDownOutlined,
  KeyboardArrowUpOutlined,
  PaidOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Role } from '@prisma/client';
import moment from 'moment';
import 'moment/locale/id';
import React from 'react';
import { UpdateModalData } from '../CustomersTable';
import Swal from 'sweetalert2';
import { getAbsoluteMonths } from '@/utils/DateUtils';

const HandlePay = async (
  nominal: number,
  invoice: number,
  user: number,
  total: number,
  payed: number,
  refresh: () => Promise<void>
) => {
  const isLunas = payed + nominal >= total ? 1 : 0;

  Swal.fire({
    title: 'Lakukan Pembayaran?',
    showDenyButton: true,
    confirmButtonText: 'Bayar',
    icon: 'question',
    denyButtonText: `Batal`,
    customClass: {
      container: 'swal-overlay',
    },
  }).then(async (result) => {
    if (result.isConfirmed) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment`, {
        method: 'POST',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nominal: nominal,
          user: user,
          invoice: invoice,
          isLunas: isLunas,
        }),
      });

      if (res.ok) {
        Swal.fire('Pembayaran Berhasil', '', 'success');
        refresh();
      } else {
        Swal.fire(
          'Server mengalami kendala, silahkan coba dalam beberapa saat lagi',
          '',
          'error'
        );
      }
    }
  });
};

const CustomerPayRow = React.memo(function CustomerPayRow({
  row,
  userId,
  role,
  setShowUpdate,
  setModalData,
  refresh,
}: {
  row: paymentListParams;
  userId: number;
  role: Role;
  setShowUpdate: React.Dispatch<React.SetStateAction<boolean>>;
  setModalData: (data: UpdateModalData) => void;
  refresh: () => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [nominalToPay, setNominalToPay] = React.useState<number>(0);

  const payed = row.transaksi.reduce((total, item) => total + item.nominal, 0);

  let status: JSX.Element = <Chip />;
  if (row.status) {
    status = <Chip label='Lunas' color='success' />;
  } else if (
    !row.status &&
    moment().isAfter(moment(row.payDueDate).add({ days: 1 }))
  ) {
    status = <Chip label='Menunggak' color='error' />;
  } else {
    status = <Chip label='Belum Lunas' color='warning' />;
  }

  const start = getAbsoluteMonths(moment(row.payDueDate));
  let nominal = row.nominalPay;
  let end = getAbsoluteMonths(moment(new Date(Date.now())));
  const startDate = moment(row.payDueDate).date();

  if (
    !row.status &&
    moment().isAfter(moment(row.payDueDate).add({ days: 1 }))
  ) {
    const endDate = moment(new Date(Date.now())).date();
    if (endDate > startDate && end - start !== 0) {
      end += 1;
    }
    const multiplesBy = end - start === 0 ? end - start + 1 : end - start;
    nominal = row.nominalPay + multiplesBy * row.nominalPay;
  } else if (
    row.status &&
    moment(row.updatedAt).isAfter(moment(row.payDueDate).add({ days: 1 }))
  ) {
    let newEnd = getAbsoluteMonths(moment(row.updatedAt));
    const newEndDate = moment(row.updatedAt).date();
    if (newEndDate > startDate && newEnd - start !== 0) {
      newEnd += 1;
    }
    const multiplesBy =
      newEnd - start === 0 ? newEnd - start + 1 : newEnd - start;
    nominal = row.nominalPay + multiplesBy * row.nominalPay;
  }

  const jumlahTunggakan = end - start === 0 ? end - start + 1 : end - start;

  return (
    <React.Fragment>
      <TableRow className={`${open && 'bg-gray-50'}`}>
        <TableCell>
          <IconButton onClick={() => setOpen(!open)}>
            <KeyboardArrowDownOutlined
              className={`transition-all transform  ${open && 'rotate-180'}`}
            />
          </IconButton>
        </TableCell>
        <TableCell>{row.customer.name}</TableCell>
        <TableCell>{row.customer.phone}</TableCell>
        <TableCell className='max-w-[22rem]'>{row.customer.address}</TableCell>
        <TableCell>{row.customer.region.name}</TableCell>
        <TableCell>{row.customer.type}</TableCell>
        <TableCell align='right'>
          {Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(nominal)}
        </TableCell>
        <TableCell align='right'>
          {Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(payed)}
        </TableCell>
        <TableCell>
          {String(moment(row.payDueDate).format('DD MMMM YYYY'))}
        </TableCell>
        {row.status && (
          <TableCell>
            {String(moment(row.updatedAt).format('DD MMMM YYYY'))}
          </TableCell>
        )}
        <TableCell align='center'>{status}</TableCell>
        {!row.status &&
          moment().isAfter(moment(row.payDueDate).add({ days: 1 })) && (
            <TableCell align='center'>{jumlahTunggakan + ' Bulan'}</TableCell>
          )}
      </TableRow>
      <TableRow className={`${open && 'bg-gray-50'}`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant='h6' gutterBottom component='div'>
                Detail Transaksi Pembayaran
              </Typography>
              <div className='flex w-full justify-between items-end'>
                <Table size='small' aria-label='detail' sx={{ width: '70%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Kasir</TableCell>
                      <TableCell>Tanggal</TableCell>
                      <TableCell>Waktu</TableCell>
                      <TableCell align='right'>Jumlah Bayar</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.transaksi.length !== 0 ? (
                      row.transaksi.map((transactionRow) => (
                        <TableRow key={transactionRow.id}>
                          <TableCell component='th' scope='row'>
                            {transactionRow.user.name}
                          </TableCell>
                          <TableCell>
                            {String(
                              moment(transactionRow.createdAt).format(
                                'DD MMMM YYYY'
                              )
                            )}
                          </TableCell>
                          <TableCell>
                            {String(
                              moment(transactionRow.createdAt).format('HH:MM')
                            )}
                          </TableCell>
                          <TableCell align='right'>
                            {Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              maximumFractionDigits: 0,
                            }).format(transactionRow.nominal)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align='center'>
                          <p className='text-lg font-bold py-2'>
                            Belum Ada Pembayaran
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <div className='flex flex-col space-y-2 items-end'>
                  {!row.status && (
                    <>
                      {nominalToPay > 0 && (
                        <div className='w-full px-1'>
                          <Typography variant='h6'>
                            {Intl.NumberFormat('id-ID', {
                              style: 'currency',
                              currency: 'IDR',
                              maximumFractionDigits: 0,
                            }).format(nominalToPay)}
                          </Typography>
                        </div>
                      )}
                      <TextField
                        size='small'
                        label='Nominal Bayar'
                        value={nominalToPay}
                        onChange={(e) =>
                          !isNaN(Number(e.target.value)) &&
                          setNominalToPay(Number(e.target.value))
                        }
                      />
                    </>
                  )}
                  <div className='space-x-2'>
                    {role === 'SUPERADMIN' && (
                      <Button
                        variant='contained'
                        className='h-fit'
                        color='warning'
                        onClick={() => {
                          setModalData({ data: row, total: nominal });
                          setShowUpdate(true);
                        }}
                        startIcon={<EditOutlined />}
                      >
                        Edit
                      </Button>
                    )}
                    {!row.status && (
                      <Button
                        onClick={() =>
                          nominalToPay! > 0 &&
                          HandlePay(
                            nominalToPay!,
                            row.id,
                            userId,
                            nominal,
                            payed,
                            refresh
                          )
                        }
                        variant='contained'
                        className='h-fit'
                        startIcon={<PaidOutlined />}
                      >
                        Bayar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
});

export default CustomerPayRow;
