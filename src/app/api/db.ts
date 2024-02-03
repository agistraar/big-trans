import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const client = new PrismaClient().$extends({
    model: {
      transaction: {
        async delete({ where }: { where: { id: number } }) {
          return client.transaction.update({
            where: {
              ...where,
            },
            data: {
              deleted: new Date(),
            },
          });
        },
      },
      saleDetail: {
        async delete({ where }: { where: { id: number } }) {
          return client.saleDetail.update({
            where: {
              ...where,
            },
            data: {
              deleted: new Date(),
            },
          });
        },
        async deleteMany({ where }: { where: { saleId: number } }) {
          return client.saleDetail.updateMany({
            where: {
              ...where,
            },
            data: {
              deleted: new Date(),
            },
          });
        },
      },
      sale: {
        async delete({ where }: { where: { id: number } }) {
          return client.sale.update({
            where: {
              ...where,
            },
            data: {
              deleted: new Date(),
            },
          });
        },
      },
    },
  });

  return client;
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
