import { tableSalesData } from '@/app/api/sales/route';
import {
  DeleteOutline,
  EditOutlined,
  KeyboardArrowDownOutlined,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Role } from '@prisma/client';
import moment from 'moment';
import 'moment/locale/id';
import React from 'react';
import Swal from 'sweetalert2';

interface salesDataRowParams {
  row: tableSalesData;
  role: Role;
  setData: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        saleId: number;
        name: string;
        quantity: number;
        nominal: number;
        deleted: Date | null;
      }[]
    >
  >;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => Promise<void>;
}

const SalesDataRow = React.memo(function SalesDataRow({
  row,
  setData,
  role,
  setModalOpen,
  refresh,
}: salesDataRowParams) {
  const [open, setOpen] = React.useState(false);

  const items = row.saleDetail.map((val) => val.name);
  const amount = row.saleDetail.reduce(
    (total, item) => total + item.nominal * item.quantity,
    0
  );

  const onDelete = (id: number) => {
    Swal.fire({
      title: 'Yakin ingin menghapus penjualan ini?',
      showDenyButton: true,
      confirmButtonText: 'Hapus',
      icon: 'warning',
      denyButtonText: `Batal`,
      customClass: {
        container: 'swal-overlay',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: id,
          }),
        });

        if (res.ok) {
          refresh();
          Swal.fire('Penjualan Berhasil Dihapus', '', 'success');
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
        <TableCell>{row.user.name}</TableCell>
        <TableCell>
          {String(moment(row.createdAt).format('DD MMMM YYYY'))}
        </TableCell>
        <TableCell>{String(moment(row.createdAt).format('HH:MM'))}</TableCell>
        <TableCell>{items.toString()}</TableCell>
        <TableCell align='right'>
          {Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(amount)}
        </TableCell>
        <TableCell align='right'>
          <IconButton onClick={() => onDelete(row.id)}>
            <DeleteOutline />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow className={`${open && 'bg-gray-50'}`}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant='h6' gutterBottom component='div'>
                Detail Transaksi Penjualan
              </Typography>
              <div className='flex w-full justify-between items-end'>
                <Table size='small' aria-label='detail' sx={{ width: '70%' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>Barang</TableCell>
                      <TableCell align='right'>Harga Satuan</TableCell>
                      <TableCell align='center'>Jumlah</TableCell>
                      <TableCell align='right'>Subtotal Harga</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.saleDetail.map((sales, index) => (
                      <TableRow key={sales.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell scope='row'>{sales.name}</TableCell>
                        <TableCell align='right'>
                          {Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          }).format(sales.nominal)}
                        </TableCell>
                        <TableCell align='center'>{sales.quantity}</TableCell>
                        <TableCell align='right'>
                          {Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            maximumFractionDigits: 0,
                          }).format(sales.nominal * sales.quantity)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableRow>
                    <TableCell colSpan={4}>
                      <p className='font-bold text-lg'>Total</p>
                    </TableCell>
                    <TableCell align='right'>
                      <p className='font-bold text-lg'>
                        {Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(amount)}
                      </p>
                    </TableCell>
                  </TableRow>
                </Table>
                <div className='flex flex-col space-y-2 items-end'>
                  <div className='space-x-2'>
                    {role === 'SUPERADMIN' && (
                      <Button
                        variant='contained'
                        className='h-fit'
                        color='warning'
                        onClick={() => {
                          setData(row.saleDetail);
                          setModalOpen(true);
                        }}
                        startIcon={<EditOutlined />}
                      >
                        Edit
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

export default SalesDataRow;
