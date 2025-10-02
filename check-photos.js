const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPhotos() {
  try {
    const participants = await prisma.participant.findMany({
      where: {
        tenant: { slug: 'jni-pros' }
      },
      select: {
        name: true,
        imageUrl: true
      },
      take: 5
    });
    
    console.log('=== PARTICIPANTES CON FOTOS ===');
    participants.forEach(p => {
      console.log(`${p.name}: ${p.imageUrl || 'SIN FOTO'}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPhotos();