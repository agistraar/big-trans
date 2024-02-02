'use client';
import React, { Suspense } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { paymentListParams } from '@/app/api/payment/route';
import {
  Button,
  MenuItem,
  Select,
  TablePagination,
  TextField,
} from '@mui/material';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { useSession } from 'next-auth/react';
import { Add } from '@mui/icons-material';
import AddCustomer from '../Modals/AddCustomer';
import UpdateCustomer from '../Modals/UpdateCustomer';
import CustomerPayRow from './Rows/CustomerPayRow';

export interface UpdateModalData {
  data: paymentListParams;
  total: number;
}

export interface regionsType {
  id: string;
  name: string;
}

export default function CustomerTable({ regions }: { regions: regionsType[] }) {
  const [data, setData] = React.useState<paymentListParams[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [count, setCount] = React.useState(0);
  const [filter, setFilter] = React.useState(0);
  const [type, setType] = React.useState('0');
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [region, setRegion] = React.useState('semua');
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [modalData, setModalData] = React.useState<UpdateModalData>();

  const user = useSession().data?.user;

  const regionList: regionsType[] = [
    {
      id: 'semua',
      name: 'semua',
    },
    ...regions,
  ];

  const statusFilter = [
    {
      label: 'Belum Lunas',
      value: 0,
    },
    {
      label: 'Lunas',
      value: 1,
    },
    {
      label: 'Menunggak',
      value: 2,
    },
  ];

  const typeList = [
    {
      label: 'Semua',
      value: '0',
    },
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

  const query = React.useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_URL +
      `/payment?take=${rowsPerPage}&skip=${
        page * rowsPerPage
      }&filter=${filter}&filtertype=${type}&region=${region}`,
    [filter, page, region, rowsPerPage, type]
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(query);
      const parsed = await res.json();
      setData(parsed.payments);
      setCount(parsed.count);
    };
    fetchData();
  }, [query]);

  const debounced = useDebouncedCallback(
    // function
    (value) => {
      handleSearch(value);
    },
    // delay in ms
    1000
  );

  const handleSearch = async (val: string) => {
    if (val === '') {
      const res = await fetch(query);
      const parsed = await res.json();
      setData(parsed.payments);
      setCount(parsed.count);
    } else {
      const encodedSearchQuery = encodeURI(val);
      const res = await fetch(
        encodedSearchQuery === ''
          ? query
          : query + `&search=${encodedSearchQuery}`
      );
      const resData = await res.json();
      setData(resData.payments);
      setCount(resData.payments.length);
    }
  };

  const refresh = async () => {
    const res = await fetch(query);
    const parsed = await res.json();
    setData(parsed.payments);
    setCount(parsed.count);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  return (
    <TableContainer component={Paper}>
      <div className='flex justify-between px-3 py-4 items-end'>
        <div className=' space-x-4 flex items-end'>
          <div className='flex flex-col'>
            <Typography variant='subtitle2'>Pencarian</Typography>
            <TextField
              defaultValue={''}
              placeholder='Cari'
              size='small'
              onChange={(e) => {
                debounced(e.target.value);
              }}
            />
          </div>
          <div className='flex flex-col'>
            <Typography variant='subtitle2'>Status</Typography>
            <Select
              labelId='status-filter-label'
              id='statusFilter'
              defaultValue={0}
              size='small'
              onChange={(event) => setFilter(Number(event.target.value))}
            >
              {statusFilter.map((val, index) => (
                <MenuItem key={'statusFilter' + index} value={val.value}>
                  {val.label}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className='flex flex-col'>
            <Typography variant='subtitle2'>Tipe</Typography>
            <Select
              labelId='type-filter-label'
              id='typeFilter'
              name='typeFilter'
              size='small'
              defaultValue={'0'}
              onChange={(event) => setType(event.target.value)}
            >
              {typeList.map((val, index) => (
                <MenuItem key={'typeFilter' + index} value={val.value}>
                  {val.label}
                </MenuItem>
              ))}
            </Select>
          </div>
          <div className='flex flex-col'>
            <Typography variant='subtitle2'>Wilayah</Typography>
            <Select
              labelId='region-filter-label'
              id='regionFilter'
              name='regionFilter'
              size='small'
              defaultValue={'semua'}
              onChange={(event) => setRegion(event.target.value)}
            >
              {regionList &&
                regionList.map((val, index) => (
                  <MenuItem key={'regionFilter' + index} value={val.id}>
                    {val.name}
                  </MenuItem>
                ))}
            </Select>
          </div>
        </div>
        <Button
          startIcon={<Add />}
          variant='outlined'
          onClick={() => setShowAddModal(!showAddModal)}
          className='h-fit'
        >
          Tambah Pelanggan
        </Button>
      </div>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Nama Pelanggan</TableCell>
            <TableCell>No HP</TableCell>
            <TableCell>Alamat</TableCell>
            <TableCell>Wilayah</TableCell>
            <TableCell>Tipe</TableCell>
            <TableCell align='right'>Jumlah Tagihan</TableCell>
            <TableCell align='right'>Jumlah Terbayar</TableCell>
            <TableCell>Tenggat Waktu</TableCell>
            {filter === 1 && <TableCell>Tanggal Lunas</TableCell>}
            <TableCell align='center'>Status</TableCell>
            {filter === 2 && <TableCell align='center'>Tunggakan</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {data ? (
            data.map((val) => (
              <CustomerPayRow
                key={val.id}
                row={val}
                userId={user?.id!}
                role={user?.role!}
                setShowUpdate={setShowUpdateModal}
                setModalData={setModalData}
                refresh={refresh}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} align='center'>
                Data Tidak Tersedia
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component='div'
        count={count}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {showAddModal && (
        <AddCustomer
          open={showAddModal}
          setOpen={setShowAddModal}
          region={regions}
          refresh={refresh}
        />
      )}
      {showUpdateModal && (
        <UpdateCustomer
          open={showUpdateModal}
          setOpen={setShowUpdateModal}
          data={modalData?.data!}
          total={modalData?.total!}
          refresh={refresh}
        />
      )}
    </TableContainer>
  );
}

const SearchBar = () => {
  return <TextField placeholder='Cari' size='small' />;
};
