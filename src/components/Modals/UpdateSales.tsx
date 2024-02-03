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
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refresh: () => Promise<void>;
  saleItem: {
    id: number;
    saleId: number;
    name: string;
    quantity: number;
    nominal: number;
    deleted: Date | null;
  }[];
}

interface SaleDetailData {
  i: number;
  item: {
    id: number;
    saleId: number;
    name: string;
    quantity: number;
    nominal: number;
    deleted: Date | null;
  };
  handleDelete: (id: number) => void;
  itemList: {
    id: number;
    saleId: number;
    name: string;
    quantity: number;
    nominal: number;
    deleted: Date | null;
  }[];
  setItemList: React.Dispatch<
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
}

const UpdateSales = ({ open, setOpen, saleItem, refresh }: AddSalesParams) => {
  const [itemList, setItemList] = React.useState<
    {
      id: number;
      saleId: number;
      name: string;
      quantity: number;
      nominal: number;
      deleted: Date | null;
    }[]
  >(saleItem);

  const [deletedId, setDeletedId] = React.useState<number[]>([]);

  const totalPrice = React.useMemo(
    () =>
      itemList.reduce((total, item) => total + item.nominal * item.quantity, 0),
    [itemList]
  );

  const handleDelete = (id: number) => {
    if (deletedId.includes(id)) {
      const newSet = deletedId.filter((val) => val !== id);
      setDeletedId(newSet);
    } else {
      deletedId.push(id);
      console.log(deletedId);
    }
  };

  const onSubmit = () => {
    Swal.fire({
      title: 'Update Penjualan?',
      showDenyButton: true,
      confirmButtonText: 'Update',
      icon: 'question',
      denyButtonText: `Batal`,
      customClass: {
        container: 'swal-overlay',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sales`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: itemList,
            ...(deletedId.length > 0 ? { deleted: deletedId } : {}),
          }),
        });

        if (res.ok) {
          refresh();
          setOpen(false);
          Swal.fire('Penjualan Berhasil Diupdate', '', 'success');
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
        <Typography variant='h5'>Update Data Penjualan</Typography>
        <div className='py-4 flex flex-col w-full space-y-2 justify-start h-full overflow-y-auto mb-4'>
          {itemList.map((item, i) => (
            <SaleDetailData
              key={i}
              i={i}
              handleDelete={handleDelete}
              item={item}
              itemList={itemList}
              setItemList={setItemList}
            />
          ))}
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
              Edit
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const SaleDetailData = ({
  handleDelete,
  i,
  item,
  setItemList,
  itemList,
}: SaleDetailData) => {
  const [isDeleted, setIsDeleted] = React.useState(false);

  return (
    <div className='flex space-x-2 w-full items-center '>
      <Typography variant='subtitle1' className='text-gray-500'>
        {Number(i + 1) + '.'}
      </Typography>
      <TextField
        label={'Barang ' + Number(i + 1)}
        value={item.name}
        className='w-2/5'
        size='small'
        error={isDeleted}
        onChange={(e) =>
          setItemList(
            itemList.map((data, index) =>
              index === i ? { ...data, name: String(e.target.value) } : data
            )
          )
        }
      />
      <TextField
        label={'Harga ' + Number(i + 1)}
        value={item.nominal}
        className='w-2/5'
        size='small'
        error={isDeleted}
        onChange={(e) =>
          !isNaN(Number(e.target.value)) &&
          setItemList(
            itemList.map((data, index) =>
              index === i ? { ...data, nominal: Number(e.target.value) } : data
            )
          )
        }
      />
      <TextField
        label={'Jumlah ' + Number(i + 1)}
        value={item.quantity}
        className='w-1/5'
        size='small'
        error={isDeleted}
        onChange={(e) =>
          !isNaN(Number(e.target.value)) &&
          setItemList(
            itemList.map((data, index) =>
              index === i ? { ...data, quantity: Number(e.target.value) } : data
            )
          )
        }
      />
      <IconButton
        onClick={() => {
          handleDelete(item.id);
          setIsDeleted((prev) => !prev);
        }}
      >
        <DeleteOutline />
      </IconButton>
    </div>
  );
};

export default UpdateSales;
