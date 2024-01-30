import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.region.createMany({
    data: [
      {
        id: 'P',
        name: '28 Oktober',
      },
      {
        id: 'R',
        name: 'RBK',
      },
      {
        id: 'K',
        name: 'Kota Baru',
      },
      {
        id: 'N',
        name: 'Ngabang',
      },
      {
        id: 'S',
        name: 'Sintang',
      },
    ],
  });

  await prisma.user.create({
    data: {
      email: 'superadmin@bigindonesia.site,',
      name: 'Admin',
      password: 'aass1122',
      role: 'SUPERADMIN',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
