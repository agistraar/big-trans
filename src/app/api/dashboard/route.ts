import { NextResponse } from 'next/server';
import prisma from '../db';
import moment from 'moment';
import 'moment/locale/id';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const dailyPaymentTotal = await prisma.transaction.aggregate({
      _sum: {
        nominal: true,
      },
      where: {
        createdAt: { gte: new Date(moment().format('YYYY-MM-DD')) },
        deleted: null,
      },
    });

    const dailySaleTotal = await prisma.$queryRaw(
      Prisma.raw(
        `SELECT SUM(nominal) as nominal from saleDetail, sale 
        where saleDetail.saleId = sale.id AND DATE(sale.createdAt) = '${moment().format(
          'YYYY-MM-DD'
        )}' AND saleDetail.deleted IS NULL AND sale.deleted IS NULL`
      )
    );

    const typeDailyPaymentTotal = await prisma.$queryRaw(
      Prisma.raw(
        `SELECT SUM(nominal) AS sum,customer.type FROM transaction,invoice,customer 
        where customer.id = invoice.customerId AND invoice.id = transaction.invoiceId 
        AND DATE(transaction.createdAt) = '${moment().format(
          'YYYY-MM-DD'
        )}' AND transaction.deleted IS NULL GROUP BY customer.type`
      )
    );

    const monthlyPaymentTotal = await prisma.transaction.aggregate({
      _sum: {
        nominal: true,
      },
      where: {
        createdAt: {
          gte: new Date(moment().startOf('month').format('YYYY-MM-DD')),
          lte: new Date(moment().endOf('month').format('YYYY-MM-DD')),
        },
        deleted: null,
      },
    });

    const monthlySaleTotal = await prisma.$queryRaw(
      Prisma.raw(
        `SELECT SUM(nominal) as nominal from saleDetail, sale 
        where saleDetail.saleId = sale.id AND DATE(sale.createdAt) >= '${moment()
          .startOf('month')
          .format('YYYY-MM-DD')}' AND DATE(sale.createdAt) <= '${moment()
          .endOf('month')
          .format(
            'YYYY-MM-DD'
          )}' AND saleDetail.deleted IS NULL AND sale.deleted IS NULL`
      )
    );

    const typeMonthlyPaymentTotal = await prisma.$queryRaw(
      Prisma.raw(
        `SELECT SUM(nominal) AS sum,customer.type FROM transaction,invoice,customer 
        where customer.id = invoice.customerId AND invoice.id = transaction.invoiceId 
        AND DATE(transaction.createdAt) >= '${moment()
          .startOf('month')
          .format('YYYY-MM-DD')}' AND DATE(transaction.createdAt) <= '${moment()
          .endOf('month')
          .format(
            'YYYY-MM-DD'
          )}' AND transaction.deleted IS NULL GROUP BY customer.type`
      )
    );

    return NextResponse.json(
      {
        dailyPaymentTotal,
        dailySaleTotal,
        typeDailyPaymentTotal,
        monthlyPaymentTotal,
        monthlySaleTotal,
        typeMonthlyPaymentTotal,
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json({ message: e }, { status: 500 });
  }
}
