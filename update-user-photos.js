const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function updateUserPhotos() {
  try {
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    
    console.log(`Actualizando fotos de ${usersData.length} usuarios...`);
    
    for (const userData of usersData) {
      const users = await prisma.user.findMany({
        where: { name: userData.nombre_completo }
      });
      
      for (const user of users) {
        await prisma.user.update({
          where: { id: user.id },
          data: { imageUrl: userData.foto_url }
        });
        console.log(`✓ ${user.name}: foto actualizada`);
      }
    }
    
    console.log('✓ Fotos de usuarios actualizadas');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserPhotos();