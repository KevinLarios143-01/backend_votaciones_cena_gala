const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function convertGoogleDriveUrl(url) {
  if (!url || !url.includes('drive.google.com')) return url;
  
  // Extraer ID del archivo de diferentes formatos de URL de Google Drive
  let fileId = null;
  
  if (url.includes('/open?id=')) {
    fileId = url.split('/open?id=')[1];
  } else if (url.includes('/file/d/')) {
    fileId = url.split('/file/d/')[1].split('/')[0];
  }
  
  if (fileId) {
    // Convertir a URL directa de imagen
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url;
}

async function convertDriveUrls() {
  try {
    console.log('Convirtiendo URLs de Google Drive...');
    
    // Actualizar usuarios
    const users = await prisma.user.findMany({
      where: { imageUrl: { not: null } }
    });
    
    for (const user of users) {
      const newUrl = convertGoogleDriveUrl(user.imageUrl);
      if (newUrl !== user.imageUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { imageUrl: newUrl }
        });
        console.log(`✓ Usuario ${user.name}: URL convertida`);
      }
    }
    
    // Actualizar participantes
    const participants = await prisma.participant.findMany({
      where: { imageUrl: { not: null } }
    });
    
    for (const participant of participants) {
      const newUrl = convertGoogleDriveUrl(participant.imageUrl);
      if (newUrl !== participant.imageUrl) {
        await prisma.participant.update({
          where: { id: participant.id },
          data: { imageUrl: newUrl }
        });
      }
    }
    
    console.log('✓ URLs de Google Drive convertidas a formato directo');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

convertDriveUrls();