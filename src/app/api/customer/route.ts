import { getServerSession } from 'next-auth';
import prisma from '../db';
import { NextResponse } from 'next/server';
import { options } from '../auth/[...nextauth]/options';

export async function GET() {
  const session = await getServerSession(options);

  if (!session)
    return NextResponse.json(
      { message: 'Unauthorized, silahkan login terlebih dahulu' },
      { status: 401 }
    );
  try {
    const sale = await prisma.customer.findMany();

    return NextResponse.json({ sales: sale }, { status: 201 });
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

    const { name, phone, address, type, nominal, duedate, region } = body;

    const createCustomer = await prisma.customer.create({
      data: {
        name: name,
        phone: phone,
        address: address,
        type: type,
        regionId: region,
        invoice: {
          create: {
            nominalPay: Number(nominal),
            payDueDate: new Date(duedate),
          },
        },
      },
    });

    return NextResponse.json(
      {
        invoice: createCustomer,
        message: 'Penambahan Pelanggan Berhasil',
      },
      { status: 201 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
