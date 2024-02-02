import { Add, DeleteOutline } from '@mui/icons-material';
import {
  Button,
  IconButton,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';
import Swal from 'sweetalert2';

interface AddSalesParams {
  user: number;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => Promise<void>;
}

const AddSales = ({ open, setOpen, user, refresh }: AddSalesParams) => {
  const [itemList, setItemList] = React.useState([
    { item: '', price: 0, qty: 0 },
  ]);

  const totalPrice = React.useMemo(
    () => itemList.reduce((total, item) => total + item.price * item.qty, 0),
    [itemList]
  );

  const onSubmit = () => {
    Swal.fire({
      title: 'Tambahkan Penjualan?',
      showDenyButton: true,
      confirmButtonText: 'Tambah',
      icon: 'question',
      denyButtonText: `Batal`,
      customClass: {
        container: 'swal-overlay',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user,
            items: itemList,
          }),
        });

        if (res.ok) {
          refresh();
          setOpen(false);
          Swal.fire('Penjualan Berhasil Ditambahkan', '', 'success');
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
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className='flex items-center justify-center'
    >
      <form className='w-3/5 h-5/6 bg-white rounded-xl px-3 py-4 flex flex-col justify-between'>
        <Typography variant='h5'>Input Data Penjualan</Typography>
        <div className='py-4 flex flex-col w-full space-y-2 justify-start h-full overflow-y-auto mb-4'>
          {itemList.map((item, i) => (
            <div key={i} className='flex space-x-2 w-full items-center '>
              <Typography variant='subtitle1' className='text-gray-500'>
                {Number(i + 1) + '.'}
              </Typography>
              <TextField
                label={'Barang ' + Number(i + 1)}
                value={item.item}
                className='w-2/5'
                size='small'
                onChange={(e) =>
                  setItemList(
                    itemList.map((data, index) =>
                      index === i
                        ? { ...data, item: String(e.target.value) }
                        : data
                    )
                  )
                }
              />
              <TextField
                label={'Harga ' + Number(i + 1)}
                value={item.price}
                className='w-2/5'
                size='small'
                onChange={(e) =>
                  !isNaN(Number(e.target.value)) &&
                  setItemList(
                    itemList.map((data, index) =>
                      index === i
                        ? { ...data, price: Number(e.target.value) }
                        : data
                    )
                  )
                }
              />
              <TextField
                label={'Jumlah ' + Number(i + 1)}
                value={item.qty}
                className='w-1/5'
                size='small'
                onChange={(e) =>
                  !isNaN(Number(e.target.value)) &&
                  setItemList(
                    itemList.map((data, index) =>
                      index === i
                        ? { ...data, qty: Number(e.target.value) }
                        : data
                    )
                  )
                }
              />
              <IconButton
                onClick={() =>
                  setItemList(
                    itemList.filter((data, index) => {
                      return index !== i;
                    })
                  )
                }
              >
                <DeleteOutline />
              </IconButton>
            </div>
          ))}
          <Button
            variant='contained'
            color='info'
            startIcon={<Add />}
            onClick={() =>
              setItemList((prev) => [...prev, { item: '', price: 0, qty: 0 }])
            }
          >
            Tambah Barang
          </Button>
        </div>
        <div className='w-full flex justify-between items-center'>
          <Typography variant='h6'>
            Total{' '}
            {Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0,
            }).format(totalPrice)}
          </Typography>
          <div className='space-x-3'>
            <Button
              variant='contained'
              color='inherit'
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button variant='contained' onClick={onSubmit}>
              Tambah
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddSales;
