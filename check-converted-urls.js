const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkConvertedUrls() {
  try {
    const users = await prisma.user.findMany({
      where: { imageUrl: { not: null } },
      select: { name: true, imageUrl: true },
      take: 5
    });
    
    console.log('=== URLs CONVERTIDAS ===');
    users.forEach(user => {
      console.log(`${user.name}:`);
      console.log(`  ${user.imageUrl}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkConvertedUrls();