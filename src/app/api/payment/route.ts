import { $Enums, Type } from '@prisma/client';
import prisma from '../db';
import { NextRequest, NextResponse } from 'next/server';
import moment from 'moment';
import { getServerSession } from 'next-auth';
import { options } from '../auth/[...nextauth]/options';

export type paymentListParams = {
  customer: {
    region: {
      name: string;
    };
    id: number;
    name: string;
    address: string;
    phone: string;
    type: $Enums.Type;
  };
  transaksi: {
    id: number;
    createdAt: Date;
    nominal: number;
    user: {
      id: number;
      name: string;
    };
  }[];
} & {
  id: number;
  customerId: number;
  nominalPay: number;
  payDueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  status: boolean;
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(options);

  if (!session)
    return NextResponse.json(
      { message: 'Unauthorized, silahkan login terlebih dahulu' },
      { status: 401 }
    );

  try {
    const search = req.nextUrl.searchParams.get('search') as string;
    const take = Number(req.nextUrl.searchParams.get('take') as string);
    const skip = Number(req.nextUrl.searchParams.get('skip') as string);
    const filter =
      Number(req.nextUrl.searchParams.get('filter') as string) === 1;
    const filterType = req.nextUrl.searchParams.get('filtertype') as string;
    const region = req.nextUrl.searchParams.get('region') as string;

    const getPaymentlist = await prisma.invoice.findMany({
      take: take,
      skip: skip,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            type: true,
            region: {
              select: {
                name: true,
              },
            },
          },
        },
        transaksi: {
          select: {
            id: true,
            nominal: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          where: {
            deleted: null,
          },
        },
      },
      where: {
        status: {
          equals: filter,
        },
        customer: {
          ...(region !== 'semua' ? { regionId: region } : {}),
          ...(filterType !== '0'
            ? {
                type: filterType as Type,
              }
            : {}),
          ...(search
            ? {
                OR: [
                  {
                    name: {
                      contains: search,
                    },
                  },
                  {
                    address: {
                      contains: search,
                    },
                  },
                  {
                    phone: {
                      contains: search,
                    },
                  },
                ],
              }
            : {}),
        },
      },
      orderBy: {
        ...(filter ? { updatedAt: 'desc' } : { id: 'desc' }),
      },
    });

    if (Number(req.nextUrl.searchParams.get('filter') as string) === 0) {
      const filteredData = getPaymentlist.filter((items) =>
        moment().isSameOrBefore(moment(items.payDueDate).add({ days: 1 }))
      );

      return NextResponse.json(
        { payments: filteredData, count: filteredData.length },
        { status: 200 }
      );
    } else if (Number(req.nextUrl.searchParams.get('filter') as string) === 2) {
      const filteredData = getPaymentlist.filter((items) =>
        moment().isAfter(moment(items.payDueDate).add({ days: 1 }))
      );

      return NextResponse.json(
        { payments: filteredData, count: filteredData.length },
        { status: 200 }
      );
    }

    const countData = await prisma.invoice.count();

    return NextResponse.json(
      { payments: getPaymentlist, count: countData },
      { status: 200 }
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

    const { customer, invoice, transaksi, deleted, total } = body;

    const updateData = await prisma.$transaction(async () => {
      const customerUpdated = await prisma.customer.update({
        where: {
          id: customer.id,
        },
        data: {
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
          type: customer.type,
        },
      });

      const payed: number = transaksi.reduce(
        (total: any, item: any) => Number(total) + Number(item.nominal),
        0
      );

      transaksi.map(
        async (val: any) =>
          await prisma.transaction.update({
            where: {
              id: val.id,
            },
            data: {
              nominal: Number(val.nominal),
            },
          })
      );

      deleted &&
        deleted.map(async (val: any) => {
          await prisma.transaction.delete({
            where: {
              id: val,
            },
          });
        });

      await prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          nominalPay: Number(invoice.nominal),
          payDueDate: new Date(invoice.duedate),
          ...(Number(total) > payed ? { status: false } : {}),
        },
      });

      return [customerUpdated];
    });

    return NextResponse.json({ updated: updateData }, { status: 200 });
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

    const { nominal, invoice, user, isLunas } = body;

    if (isLunas === 1) {
      const [LunasInvoice] = await prisma.$transaction(async (prisma) => {
        const transactionCreate = await prisma.transaction.create({
          data: {
            userId: user,
            invoiceId: invoice,
            nominal: nominal,
          },
        });
        const invoiceUpdate = await prisma.invoice.update({
          where: {
            id: invoice,
          },
          data: {
            status: true,
          },
        });
        const newDueDate = new Date(
          String(
            moment(invoiceUpdate.payDueDate)
              .add(1, 'month')
              .format('YYYY-MM-DD')
          )
        );
        const alreadyHas = await prisma.invoice.findFirst({
          where: {
            customerId: invoiceUpdate.customerId,
            status: false,
          },
        });
        if (!alreadyHas) {
          await prisma.invoice.create({
            data: {
              customerId: invoiceUpdate.customerId,
              nominalPay: invoiceUpdate.nominalPay,
              payDueDate: newDueDate,
            },
          });
        }

        return [transactionCreate, invoiceUpdate];
      });

      return NextResponse.json(
        {
          invoice: LunasInvoice,
          message: 'Pembayaran Lunas',
        },
        { status: 201 }
      );
    } else {
      const transactionAdd = await prisma.transaction.create({
        data: {
          userId: user,
          invoiceId: invoice,
          nominal: nominal,
        },
      });

      return NextResponse.json(
        {
          transaction: transactionAdd,
          message: 'Transaksi Berhasil',
        },
        { status: 201 }
      );
    }
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
