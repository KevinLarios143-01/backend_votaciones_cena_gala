const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function addPhotosToParticipants() {
  try {
    const usersData = JSON.parse(fs.readFileSync('../usuarios_cena_gala.json', 'utf8'));
    
    // Crear mapa de fotos por nombre
    const photoMap = {};
    usersData.forEach(user => {
      photoMap[user.nombre_completo] = user.foto_url;
    });
    
    // Actualizar participantes con fotos
    const participants = await prisma.participant.findMany({
      include: { tenant: true }
    });
    
    console.log(`Actualizando ${participants.length} participantes con fotos...`);
    
    for (const participant of participants) {
      const photoUrl = photoMap[participant.name];
      if (photoUrl) {
        await prisma.participant.update({
          where: { id: participant.id },
          data: { imageUrl: photoUrl }
        });
        console.log(`✓ ${participant.name}: foto agregada`);
      } else {
        console.log(`⚠️ ${participant.name}: foto no encontrada`);
      }
    }
    
    console.log('✓ Fotos agregadas a participantes');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addPhotosToParticipants();