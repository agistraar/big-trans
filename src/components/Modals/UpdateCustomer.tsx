import { paymentListParams } from '@/app/api/payment/route';
import { DeleteOutlined } from '@mui/icons-material';
import {
  Button,
  IconButton,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, { FormEventHandler } from 'react';
import Swal from 'sweetalert2';

interface UpdateCustomerParams {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: paymentListParams;
  total: number;
  refresh: () => Promise<void>;
}

interface TransactionRowParams {
  index: number;
  val: {
    id: number;
    createdAt: Date;
    nominal: number;
    user: {
      id: number;
      name: string;
    };
  };
  handleDelete: (id: number) => void;
}

const UpdateCustomer = ({
  open,
  setOpen,
  data,
  total,
  refresh,
}: UpdateCustomerParams) => {
  const [deletedId, setDeletedId] = React.useState<number[]>([]);

  const onSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    // Validations first!
    const name = formData.get('name');
    const phone = formData.get('phone');
    const address = formData.get('address');
    const type = formData.get('type');
    const nominal = formData.get('nominal');
    const duedate = formData.get('duedate');
    const newNominals = data.transaksi.map((val) => {
      return {
        ...val,
        nominal: formData.get('transaksi' + val.id),
      };
    });
    const newTransaksi = newNominals.filter(
      (val) => !deletedId.includes(val.id)
    );

    Swal.fire({
      title: 'Edit Data Pelanggan?',
      showDenyButton: true,
      confirmButtonText: 'Edit',
      icon: 'question',
      denyButtonText: `Batal`,
      customClass: {
        container: 'swal-overlay',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer: {
              id: data.customer.id,
              name,
              phone,
              address,
              type,
            },
            invoice: {
              id: data.id,
              nominal,
              duedate,
            },
            transaksi: newTransaksi,
            total: total,
            ...(deletedId.length > 0 ? { deleted: deletedId } : {}),
          }),
        });
        if (res.ok) {
          refresh();
          setOpen(false);
          Swal.fire('Data Pelanggan Berhasil Diedit', '', 'success');
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

  const typeList = [
    {
      label: 'ANALOG',
      value: 'ANALOG',
    },
    {
      label: 'DIGITAL',
      value: 'DIGITAL',
    },
    {
      label: 'INET',
      value: 'INET',
    },
  ];

  const handleDelete = (id: number) => {
    if (deletedId.includes(id)) {
      const newSet = deletedId.filter((val) => val !== id);
      setDeletedId(newSet);
    } else {
      deletedId.push(id);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className='flex items-center justify-center'
    >
      <form
        onSubmit={onSubmit}
        className='w-3/5 h-[94%] bg-white rounded-xl px-3 py-4 flex flex-col justify-between'
      >
        <div className='w-full flex flex-col space-y-3'>
          <Typography variant='h5'>
            Update Data Pelanggan dan Invoice
          </Typography>
          <div className='w-full flex space-x-8'>
            <div className='w-1/2 flex flex-col space-y-3'>
              <Typography className='pl-1'>Data User</Typography>
              <TextField
                label='Nama Pelanggan'
                id='name'
                name='name'
                defaultValue={data.customer.name}
              />
              <TextField
                label='Nomor HP'
                id='phone'
                name='phone'
                defaultValue={data.customer.phone}
              />
              <TextField
                label='Alamat'
                multiline
                rows={3}
                id='address'
                name='address'
                defaultValue={data.customer.address}
              />
              <Select
                labelId='type-label'
                id='type'
                name='type'
                defaultValue={data.customer.type}
              >
                {typeList.map((val, index) => (
                  <MenuItem key={'statusFilter' + index} value={val.value}>
                    {val.label}
                  </MenuItem>
                ))}
              </Select>
              <Typography className='pl-1 pt-3'>Data Invoice</Typography>
              <TextField
                label='Jumlah Tagihan'
                id='nominal'
                name='nominal'
                type='number'
                defaultValue={data.nominalPay}
              />
              <TextField
                type='date'
                label='Tanggal Bayar'
                id='duedate'
                name='duedate'
                defaultValue={moment(data.payDueDate).format('YYYY-MM-DD')}
                InputLabelProps={{ shrink: true }}
              />
            </div>
            <div className='w-1/2 flex flex-col'>
              <Typography>Data Transaksi</Typography>
              <div className='w-full flex flex-col space-y-3 overflow-y-auto py-3'>
                {data.transaksi.map((val, index) => (
                  <TransactionRow
                    key={index}
                    index={index}
                    val={val}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className='space-x-3 w-full flex justify-end'>
          <Button
            variant='contained'
            color='inherit'
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button variant='contained' type='submit'>
            Konfirmasi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const TransactionRow = ({ index, val, handleDelete }: TransactionRowParams) => {
  const [isDeleted, setIsDeleted] = React.useState(false);
  return (
    <div className='flex w-full space-x-2 items-center'>
      <TextField
        label={'Pembayaran ' + (index + 1)}
        id={'transaksi' + val.id}
        name={'transaksi' + val.id}
        type='number'
        className='w-full'
        defaultValue={val.nominal}
        error={isDeleted}
      />
      <IconButton
        onClick={() => {
          handleDelete(val.id);
          setIsDeleted((prev) => !prev);
        }}
      >
        <DeleteOutlined />
      </IconButton>
    </div>
  );
};

export default UpdateCustomer;
