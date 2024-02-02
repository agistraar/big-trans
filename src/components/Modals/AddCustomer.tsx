import {
  Button,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import React, { FormEventHandler } from 'react';
import Swal from 'sweetalert2';
import { regionsType } from '../Tables/CustomersTable';

interface AddCustomerParams {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  region: regionsType[];
  refresh: () => Promise<void>;
}

const AddCustomer = ({ open, setOpen, region, refresh }: AddCustomerParams) => {
  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = data.get('name');
    const phone = data.get('phone');
    const address = data.get('address');
    const type = data.get('type');
    const nominal = data.get('nominal');
    const duedate = data.get('duedate');
    const region = data.get('region');

    Swal.fire({
      title: 'Tambahkan Pelanggan?',
      showDenyButton: true,
      confirmButtonText: 'Tambah',
      icon: 'question',
      denyButtonText: `Batal`,
      customClass: {
        container: 'swal-overlay',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            phone,
            address,
            type,
            nominal,
            duedate,
            region,
          }),
        });

        if (res.ok) {
          refresh();
          setOpen(false);
          Swal.fire('Pelanggan Berhasil Ditambahkan', '', 'success');
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

  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      className='flex items-center justify-center'
    >
      <form
        onSubmit={onSubmit}
        className='w-1/4 h-[95%] bg-white rounded-xl px-3 py-4 flex flex-col justify-between'
      >
        <Typography variant='h5'>Input Data Pelanggan</Typography>
        <div className='py-4 flex flex-col w-full space-y-2'>
          <TextField label='Nama Pelanggan' id='name' name='name' />
          <TextField label='Nomor HP' id='phone' name='phone' />
          <TextField
            label='Alamat'
            multiline
            rows={3}
            id='address'
            name='address'
          />
          <Select
            labelId='type-label'
            id='type'
            name='type'
            defaultValue={'ANALOG'}
          >
            {typeList.map((val, index) => (
              <MenuItem key={'statusFilter' + index} value={val.value}>
                {val.label}
              </MenuItem>
            ))}
          </Select>
          <Select
            labelId='region-label'
            id='region'
            name='region'
            defaultValue={'P'}
          >
            {region.map((val, index) => (
              <MenuItem key={'statusFilter' + index} value={val.id}>
                {val.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label='Jumlah Tagihan'
            id='nominal'
            name='nominal'
            type='number'
          />
          <TextField
            type='date'
            label='Tanggal Bayar'
            id='duedate'
            name='duedate'
            InputLabelProps={{ shrink: true }}
          />
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
            Tambah
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddCustomer;
