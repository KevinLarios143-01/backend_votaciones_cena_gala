const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyPhotos() {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'PARTICIPANT' },
      select: { name: true, imageUrl: true }
    });
    
    console.log('=== USUARIOS CON FOTOS ===');
    users.forEach(user => {
      console.log(`${user.name}: ${user.imageUrl ? '✓ TIENE FOTO' : '✗ SIN FOTO'}`);
    });
    
    const withPhotos = users.filter(u => u.imageUrl).length;
    const withoutPhotos = users.filter(u => !u.imageUrl).length;
    
    console.log(`\nResumen: ${withPhotos} con foto, ${withoutPhotos} sin foto`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPhotos();