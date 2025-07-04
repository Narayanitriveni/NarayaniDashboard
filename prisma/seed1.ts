import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data for a clean slate
  

 
  await prisma.enrollment.updateMany({
    where: {
      year: 2025
    },
    data: {
      year: 2082
    }
  });
  

}

main()
  .then(() => {
    console.log('Seeding complete.');
    return prisma.$disconnect();
  })
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  }); 