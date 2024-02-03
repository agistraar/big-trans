'use client';
import { Add } from '@mui/icons-material';
import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
} from '@mui/material';
import AddSales from '../Modals/AddSales';
import React from 'react';
import { useSession } from 'next-auth/react';
import { tableSalesData } from '@/app/api/sales/route';
import SalesDataRow from './Rows/SalesDataRow';
import UpdateSales from '../Modals/UpdateSales';

export default function SalesTable() {
  const [showModal, setShowModal] = React.useState(false);
  const [showUpdateModal, setShowUpdateModal] = React.useState(false);
  const [updateModalData, setUpdateModalData] = React.useState<
    {
      id: number;
      saleId: number;
      name: string;
      quantity: number;
      nominal: number;
      deleted: Date | null;
    }[]
  >([]);
  const [data, setData] = React.useState<tableSalesData[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [count, setCount] = React.useState(0);

  const user = useSession().data?.user;

  const query = React.useMemo(
    () =>
      process.env.NEXT_PUBLIC_API_URL +
      `/sales?take=${rowsPerPage}&skip=${page * rowsPerPage}`,
    [page, rowsPerPage]
  );

  React.useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(query);

      const parsed = await res.json();
      setData(parsed.sales);
      setCount(parsed.count);
    };
    fetchData();
  }, [query]);

  const refresh = async () => {
    const res = await fetch(query);
    const parsed = await res.json();
    setData(parsed.sales);
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
        <Button
          startIcon={<Add />}
          variant='outlined'
          className='h-fit'
          onClick={() => setShowModal(true)}
        >
          Tambah Penjualan
        </Button>
      </div>
      <Table aria-label='collapsible table'>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Kasir</TableCell>
            <TableCell>Tanggal</TableCell>
            <TableCell>Waktu</TableCell>
            <TableCell>Barang</TableCell>
            <TableCell className='max-w-16' align='right'>
              Total Penjualan
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length >= 1 ? (
            data.map((val) => (
              <SalesDataRow
                key={val.id}
                row={val}
                role={user?.role!}
                setData={setUpdateModalData}
                setModalOpen={setShowUpdateModal}
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
      {showModal && (
        <AddSales
          user={user?.id!}
          open={showModal}
          setOpen={setShowModal}
          refresh={refresh}
        />
      )}
      {showUpdateModal && (
        <UpdateSales
          open={showUpdateModal}
          setOpen={setShowUpdateModal}
          saleItem={updateModalData}
          refresh={refresh}
        />
      )}
    </TableContainer>
  );
}
