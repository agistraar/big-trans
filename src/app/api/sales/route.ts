import { getServerSession } from 'next-auth';
import prisma from '../db';
import { NextResponse } from 'next/server';
import { options } from '../auth/[...nextauth]/options';

export type tableSalesData = {
  user: {
    name: string;
  };
  saleDetail: {
    id: number;
    saleId: number;
    name: string;
    quantity: number;
    nominal: number;
    deleted: Date | null;
  }[];
} & {
  id: number;
  userId: number;
  createdAt: Date;
};

export async function GET() {
  const session = await getServerSession(options);

  if (!session)
    return NextResponse.json(
      { message: 'Unauthorized, silahkan login terlebih dahulu' },
      { status: 401 }
    );
  try {
    const sale = await prisma.sale.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        saleDetail: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(
      { sales: sale, count: sale.length },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(options);

  if (!session)
    return NextResponse.json(
      { message: 'Unauthorized, silahkan login terlebih dahulu' },
      { status: 401 }
    );
  try {
    const body = await req.json();

    const { user, items } = body;

    const saleTransaction = await prisma.$transaction(async () => {
      const sale = await prisma.sale.create({
        data: {
          userId: user,
        },
      });

      const saleItems = items.map((data: any) => ({
        saleId: sale.id,
        name: data.item,
        nominal: data.price,
        quantity: data.qty,
      }));

      const saleDetail = await prisma.saleDetail.createMany({
        data: saleItems,
      });

      return [sale, saleDetail];
    });

    return NextResponse.json(
      {
        invoice: saleTransaction,
        message: 'Pembayaran Lunas',
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(options);

  if (!session)
    return NextResponse.json(
      { message: 'Unauthorized, silahkan login terlebih dahulu' },
      { status: 401 }
    );

  try {
    const body = await req.json();

    const { items, deleted } = body;

    await prisma.$transaction(async () => {
      items.map(async (val: any) => {
        await prisma.saleDetail.update({
          data: {
            name: val.name,
            nominal: val.nominal,
            quantity: val.quantity,
          },
          where: {
            id: val.id,
          },
        });
      });

      deleted &&
        deleted.map(async (val: any) => {
          await prisma.saleDetail.delete({
            where: {
              id: val,
            },
          });
        });
    });
    return NextResponse.json(
      {
        message: 'Data Penjualan Berhasil Diupdate',
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();

    const { id } = body;

    await prisma.saleDetail.deleteMany({ where: { saleId: id } });
    await prisma.sale.delete({ where: { id: id } });

    return NextResponse.json(
      {
        message: 'Data Penjualan Berhasil Dihapus',
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json(
      {
        message: e,
      },
      { status: 500 }
    );
  }
}
